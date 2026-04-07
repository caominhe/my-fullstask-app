import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { getToken } from "../services/localStorageService";
import { onboardUser, fetchMyInfo } from "../services/userService";
import { useAuth } from "../contexts/AuthContext";
import { getPostLoginPath } from "../utils/authRedirect";
import { ROUTES } from "../constants/routes";
import AuthHeroLayout from "../modules/common/AuthHeroLayout";

export default function Onboard() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate(ROUTES.LOGIN);
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!phone || !password) {
      setError("Vui lòng nhập đầy đủ Số điện thoại và Mật khẩu.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    setLoading(true);
    try {
      await onboardUser({ phone, password });
      const token = getToken();
      const profile = await fetchMyInfo();
      login(token, profile);
      navigate(getPostLoginPath(profile), { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || "Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthHeroLayout>
      <Card sx={{ minWidth: 300, maxWidth: 450, boxShadow: 6, borderRadius: 2, p: 1, bgcolor: "rgba(255,255,255,0.98)" }}>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom fontWeight="bold" align="center">
            Hoàn tất thiết lập
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Tài khoản Google của bạn đã được kết nối. Vui lòng thiết lập mật khẩu và số điện thoại để hoàn tất đăng
            ký.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Số điện thoại"
              variant="outlined"
              fullWidth
              margin="normal"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <TextField
              label="Mật khẩu mới"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <TextField
              label="Xác nhận mật khẩu"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Hoàn tất & Đăng nhập"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </AuthHeroLayout>
  );
}
