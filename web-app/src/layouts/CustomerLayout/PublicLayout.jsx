import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Avatar,
} from "@mui/material";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { ROLES } from "../../constants/roles";
import { ROUTES } from "../../constants/routes";

function hasRole(user, roleName) {
  return (user?.roles || []).some((r) => r.name === roleName);
}

export default function PublicLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);

  const isCustomer = user && hasRole(user, ROLES.CUSTOMER);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="sticky" sx={{ bgcolor: "primary.main" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ flexWrap: "wrap", gap: 1, py: 1 }}>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{ fontWeight: "bold", color: "inherit", textDecoration: "none", flexGrow: 1 }}
            >
              FCAR AUTO
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
              <Button color="inherit" size="small" onClick={() => navigate("/")}>
                Trang chủ
              </Button>
              <Button color="inherit" size="small" onClick={() => navigate(ROUTES.CARS_PUBLIC)}>
                Danh sách xe
              </Button>
              <Button color="inherit" size="small" onClick={() => navigate(ROUTES.TEST_DRIVE)}>
                Lái thử
              </Button>

              {user && hasRole(user, ROLES.SHOWROOM) && (
                <Button color="inherit" size="small" variant="outlined" onClick={() => navigate(ROUTES.SHOWROOM_HOME)}>
                  Showroom
                </Button>
              )}
              {user && hasRole(user, ROLES.ADMIN) && (
                <Button color="inherit" size="small" variant="outlined" onClick={() => navigate(ROUTES.ADMIN_HOME)}>
                  Quản trị
                </Button>
              )}

              {user ? (
                <>
                  {isCustomer ? (
                    <>
                      <IconButton color="inherit" onClick={(e) => setAnchor(e.currentTarget)} size="small" sx={{ ml: 0.5 }}>
                        <Avatar src={user.avatar} alt={user.fullName} sx={{ width: 36, height: 36 }}>
                          {(user.fullName || user.email || "?").charAt(0)}
                        </Avatar>
                      </IconButton>
                      <Menu anchorEl={anchor} open={open} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                        <MenuItem
                          onClick={() => {
                            setAnchor(null);
                            navigate(ROUTES.PROFILE);
                          }}
                        >
                          Bảng điều khiển cá nhân
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setAnchor(null);
                            navigate(ROUTES.MY_GARAGE);
                          }}
                        >
                          Garage của tôi
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setAnchor(null);
                            navigate(ROUTES.PROMOTIONS);
                          }}
                        >
                          Sự kiện &amp; khuyến mãi
                        </MenuItem>
                        <Divider />
                        <MenuItem
                          onClick={() => {
                            setAnchor(null);
                            logout();
                          }}
                        >
                          Đăng xuất
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <>
                      <Typography variant="body2" sx={{ ml: 1, fontWeight: 600 }}>
                        {user.fullName}
                      </Typography>
                      <Button color="inherit" size="small" onClick={logout}>
                        Thoát
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Button variant="outlined" color="inherit" size="small" onClick={() => navigate(ROUTES.LOGIN)}>
                    Đăng nhập
                  </Button>
                  <Button variant="contained" color="secondary" size="small" onClick={() => navigate(ROUTES.REGISTER)}>
                    Đăng ký
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 4, bgcolor: "background.default" }}>
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>

      <Box component="footer" sx={{ py: 3, bgcolor: "#1a1a1a", color: "grey.300", textAlign: "center" }}>
        <Typography variant="body2">© 2026 FCAR Dealership System. All rights reserved.</Typography>
      </Box>
    </Box>
  );
}
