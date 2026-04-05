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

export default function Onboard() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Kiểm tra xem user có token không, nếu không có thì đẩy về Login
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    // Validate cơ bản
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
    const token = getToken();

    // Gọi API cập nhật thông tin Onboard
    fetch("http://localhost:8080/api/v1/users/onboard", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        phone: phone,
        password: password,
      }),
    })
      .then(async (response) => {
    if (!response.ok) {
      throw new Error("Cập nhật thông tin thất bại!");
    }
    
    // Đọc dữ liệu thô trước
    const text = await response.text(); 
    // Nếu có dữ liệu thì parse JSON, nếu rỗng thì trả về object rỗng
    return text ? JSON.parse(text) : {}; 
  })
      .then((data) => {
        // Cập nhật thành công, chuyển hướng về trang chủ
        console.log("Onboard thành công:", data);
        navigate("/");
      })
      .catch((err) => {
        console.error(err);
        setError("Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor={"#f0f2f5"}
    >
      <Card
        sx={{
          minWidth: 300,
          maxWidth: 450,
          boxShadow: 4,
          borderRadius: 4,
          padding: 4,
        }}
      >
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom fontWeight="bold" align="center">
            Hoàn tất thiết lập
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
            Tài khoản Google của bạn đã được kết nối. Vui lòng thiết lập mật khẩu và số điện thoại để hoàn tất đăng ký.
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
    </Box>
  );
}