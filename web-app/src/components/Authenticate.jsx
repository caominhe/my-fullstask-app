import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setRefreshToken, setToken as saveToken } from "../services/localStorageService";
import { Box, CircularProgress, Typography } from "@mui/material";
import { exchangeGoogleCode } from "../services/authApiService";
import { fetchMyInfo } from "../services/userService";
import { useAuth } from "../contexts/AuthContext";
import { getPostLoginPath } from "../utils/authRedirect";
import { ROUTES } from "../constants/routes";

/**
 * Google authorization code chỉ dùng được một lần. Nếu effect chạy lại (đổi dependency như `login`)
 * hoặc gọi trùng, lần hai sẽ 400 invalid_grant → BE trả GOOGLE_OAUTH_FAILED.
 * Set module-scope để chặn trùng trong cùng phiên tải trang.
 */
const googleAuthCodesConsumed = new Set();

export default function Authenticate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const ranForParamsRef = useRef("");

  const oauthError = searchParams.get("error");
  const code = searchParams.get("code");
  const paramKey = `${oauthError || ""}|${code || ""}`;

  useEffect(() => {
    if (ranForParamsRef.current === paramKey) {
      return;
    }

    if (oauthError) {
      ranForParamsRef.current = paramKey;
      const errorDescription = searchParams.get("error_description");
      const msg =
        oauthError === "access_denied"
          ? "Bạn đã hủy đăng nhập Google."
          : `${oauthError}${errorDescription ? `: ${decodeURIComponent(errorDescription.replace(/\+/g, " "))}` : ""}`;
      navigate(ROUTES.LOGIN, { replace: true, state: { oauthError: msg } });
      return;
    }

    if (!code) {
      ranForParamsRef.current = paramKey;
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: {
          oauthError:
            "Không có mã xác thực từ Google (thiếu tham số code). Kiểm tra Redirect URI trong Google Cloud Console.",
        },
      });
      return;
    }

    if (googleAuthCodesConsumed.has(code)) {
      return;
    }
    googleAuthCodesConsumed.add(code);
    ranForParamsRef.current = paramKey;

    const run = async () => {
      try {
        const result = await exchangeGoogleCode(code);
        if (!result?.token) {
          throw new Error("Không nhận được token từ server.");
        }
        saveToken(result.token);
        if (result.refreshToken) {
          setRefreshToken(result.refreshToken);
        }
        const profile = await fetchMyInfo({ skipRedirectOn401: true });
        login(result.token, profile, result.refreshToken);
        if (result.requireOnboard) {
          navigate(ROUTES.ONBOARD, { replace: true });
          return;
        }
        navigate(getPostLoginPath(profile), { replace: true });
      } catch (err) {
        googleAuthCodesConsumed.delete(code);
        console.error("Lỗi xác thực Google", err);
        navigate(ROUTES.LOGIN, {
          replace: true,
          state: {
            oauthError:
              err.message ||
              "Đăng nhập Google thất bại. Nếu vừa tải lại trang, hãy bấm «Tiếp tục với Google» lại (mã chỉ dùng một lần).",
          },
        });
      }
    };

    run();
    // Chỉ phụ thuộc URL (code / error), không phụ thuộc `login` để tránh chạy lại effect sau khi login() cập nhật context.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <CircularProgress />
      <Typography>Đang xác thực với FCAR...</Typography>
    </Box>
  );
}
