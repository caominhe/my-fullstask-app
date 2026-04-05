import { AppBar, Toolbar, Typography, Button, Box, Container } from "@mui/material";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function PublicLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* NAVBAR */}
      <AppBar position="sticky" sx={{ bgcolor: "#1976d2" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{ fontWeight: "bold", color: "inherit", textDecoration: "none", flexGrow: 1 }}
            >
              FCAR AUTO
            </Typography>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button color="inherit" onClick={() => navigate("/")}>Trang chủ</Button>
              <Button color="inherit" onClick={() => navigate("/cars")}>Danh sách Xe</Button>
              <Button color="inherit" onClick={() => navigate("/test-drive")}>Đăng ký Lái thử</Button>

              {/* Check Auth để hiển thị nút Login hoặc tên User */}
              {user ? (
                <>
                  <Typography variant="body1" sx={{ ml: 2, fontWeight: "bold" }}>
                    Chào, {user.fullName}
                  </Typography>
                  <Button color="error" variant="contained" size="small" sx={{ ml: 2 }} onClick={logout}>
                    Thoát
                  </Button>
                </>
              ) : (
                <Button variant="outlined" color="inherit" sx={{ ml: 2 }} onClick={() => navigate("/login")}>
                  Đăng nhập
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* NỘI DUNG CHÍNH (Sẽ render Home, CarList, TestDrive vào đây) */}
      <Box component="main" sx={{ flexGrow: 1, py: 4, bgcolor: "#f5f5f5" }}>
        <Container maxWidth="xl">
          <Outlet /> 
        </Container>
      </Box>

      {/* FOOTER */}
      <Box component="footer" sx={{ py: 3, bgcolor: "#333", color: "white", textAlign: "center" }}>
        <Typography variant="body2">
          © 2026 FCAR Dealership System. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}