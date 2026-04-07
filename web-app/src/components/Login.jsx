import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Link,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { OAuthConfig } from "../configurations/configuration";
import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { getToken, setRefreshToken, setToken as saveToken } from "../services/localStorageService";
import { useAuth } from "../contexts/AuthContext";
import { loginWithPassword } from "../services/authApiService";
import { fetchMyInfo } from "../services/userService";
import { getPostLoginPath } from "../utils/authRedirect";
import { ROUTES } from "../constants/routes";
import AuthHeroLayout from "../modules/common/AuthHeroLayout";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleGoogle = () => {
    const callbackUrl = OAuthConfig.redirectUri;
    const authUrl = OAuthConfig.authUri;
    const googleClientId = OAuthConfig.clientId;
    const params = new URLSearchParams({
      redirect_uri: callbackUrl,
      response_type: "code",
      client_id: googleClientId,
      scope: "openid email profile",
      prompt: "select_account",
    });
    window.location.href = `${authUrl}?${params.toString()}`;
  };

  useEffect(() => {
    if (loading) return;
    const token = getToken();
    if (token && user) {
      navigate(getPostLoginPath(user), { replace: true });
    }
  }, [loading, user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!email?.trim() || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    setSubmitting(true);
    try {
      const auth = await loginWithPassword({ email: email.trim(), password });
      saveToken(auth.token);
      if (auth.refreshToken) {
        setRefreshToken(auth.refreshToken);
      }
      const profile = await fetchMyInfo();
      login(auth.token, profile, auth.refreshToken);
      if (profile.status === "PENDING_ONBOARD") {
        navigate(ROUTES.ONBOARD, { replace: true });
      } else {
        navigate(getPostLoginPath(profile), { replace: true });
      }
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const registered = location.state?.registered;
  const oauthError = location.state?.oauthError;
  return (
    <AuthHeroLayout>
      <Card sx={{ minWidth: 280, maxWidth: 420, boxShadow: 6, borderRadius: 2, p: 1, bgcolor: "rgba(255,255,255,0.98)" }}>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom fontWeight={700}>
            Đăng nhập FCAR
          </Typography>
          {registered ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Đăng ký thành công. Vui lòng đăng nhập.
            </Alert>
          ) : null}
          {oauthError ? (
            <Alert severity="warning" sx={{ mb: 2 }} onClose={() => navigate(location.pathname, { replace: true, state: {} })}>
              {oauthError}
            </Alert>
          ) : null}
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email đăng nhập"
              type="email"
              fullWidth
              required
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              helperText="Hệ thống dùng email làm tên đăng nhập (trùng email Google nếu bạn đăng ký qua Google)."
            />
            <TextField
              label="Mật khẩu"
              type="password"
              fullWidth
              required
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 2 }}
              disabled={submitting}
            >
              {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </Box>
        </CardContent>
        <CardActions sx={{ flexDirection: "column", px: 2, pb: 2, pt: 0, gap: 1.5 }}>
          <Button
            type="button"
            variant="outlined"
            color="primary"
            size="large"
            fullWidth
            onClick={handleGoogle}
            startIcon={<GoogleIcon />}
          >
            Tiếp tục với Google
          </Button>
          <Divider flexItem sx={{ width: "100%" }} />
          <Typography variant="body2">
            Chưa có tài khoản?{" "}
            <Link component={RouterLink} to={ROUTES.REGISTER}>
              Đăng ký
            </Link>
          </Typography>
        </CardActions>
      </Card>
    </AuthHeroLayout>
  );
}
