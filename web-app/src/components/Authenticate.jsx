// web-app/src/components/Authenticate.jsx

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { setToken } from "../services/localStorageService";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function Authenticate() {
  const navigate = useNavigate();

  useEffect(() => {
    const authCodeRegex = /code=([^&]+)/;
    const isMatch = window.location.href.match(authCodeRegex);

    if (isMatch) {
      const authCode = isMatch[1];

      // Gọi API đến backend FCAR
      fetch(
        `http://localhost:8080/api/v1/auth/google/exchange?code=${authCode}`,
        { method: "POST" }
      )
        .then((response) => response.json())
        .then((data) => {
          // Lưu JWT của FCAR
          setToken(data.result?.token);
          
          // Kiểm tra xem backend có yêu cầu Onboard (Tạo mật khẩu/SDT) không?
          if (data.result?.requireOnboard) {
            navigate("/onboard"); // Tạo thêm 1 component Onboard.jsx trong dự án
          } else {
            navigate("/"); // Login thành công
          }
        })
        .catch((err) => {
          console.error("Lỗi xác thực", err);
          navigate("/login");
        });
    }
  }, [navigate]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "30px", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress />
      <Typography>Đang xác thực với FCAR...</Typography>
    </Box>
  );
}