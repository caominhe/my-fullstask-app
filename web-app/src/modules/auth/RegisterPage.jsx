import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { registerUser } from "../../services/userService";
import { ROUTES } from "../../constants/routes";
import AuthHeroLayout from "../common/AuthHeroLayout";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password || !fullName) {
      setError("Vui lòng nhập email, họ tên và mật khẩu.");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu ít nhất 8 ký tự.");
      return;
    }
    setLoading(true);
    try {
      await registerUser({ email, password, fullName, phone: phone || undefined });
      navigate(ROUTES.LOGIN, { state: { registered: true } });
    } catch (err) {
      setError(err.message || "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthHeroLayout>
      <Card sx={{ minWidth: 320, maxWidth: 440, p: 2, bgcolor: "rgba(255,255,255,0.98)", boxShadow: 6 }}>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom fontWeight={700}>
            Tạo tài khoản
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Đăng ký tài khoản CUSTOMER — sau đó đăng nhập bằng email và mật khẩu.
          </Typography>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <TextField
              label="Họ và tên"
              fullWidth
              required
              margin="normal"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
            <TextField
              label="Số điện thoại (tuỳ chọn)"
              fullWidth
              margin="normal"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
            <TextField
              label="Mật khẩu"
              type="password"
              fullWidth
              required
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2 }} disabled={loading}>
              {loading ? "Đang gửi..." : "Đăng ký"}
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
            Đã có tài khoản?{" "}
            <Link component={RouterLink} to={ROUTES.LOGIN}>
              Đăng nhập
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </AuthHeroLayout>
  );
}
