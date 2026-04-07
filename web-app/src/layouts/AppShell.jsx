import { useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 260;

export default function AppShell({ title, navItems, homePath, variant = "light" }) {
  const dark = variant === "dark";
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: dark ? "#0a0a0a" : undefined }}>
      <Toolbar sx={{ px: 2 }}>
        <Typography
          variant="h6"
          component={Link}
          to={homePath}
          sx={{ color: "inherit", textDecoration: "none", fontWeight: 700 }}
        >
          {title}
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: dark ? "#222" : undefined }} />
      <List sx={{ flexGrow: 1, px: 1, py: 1 }}>
        {navItems.map((item) => {
          const selected = location.pathname === item.to;
          return (
            <ListItemButton
              key={item.to}
              component={Link}
              to={item.to}
              selected={selected}
              onClick={() => setMobileOpen(false)}
              sx={
                dark
                  ? {
                      color: "#e0e0e0",
                      "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.08)" },
                      "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                    }
                  : undefined
              }
            >
              {item.icon ? (
                <ListItemIcon sx={{ minWidth: 40, color: dark ? "#bdbdbd" : undefined }}>{item.icon}</ListItemIcon>
              ) : null}
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider sx={{ borderColor: dark ? "#222" : undefined }} />
      <List sx={{ px: 1, py: 1 }}>
        <ListItemButton component={Link} to="/" onClick={() => setMobileOpen(false)}>
          <ListItemText primary="Về trang công khai" secondary="FCAR" />
        </ListItemButton>
        <ListItemButton onClick={() => logout()}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Đăng xuất" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: dark ? "#111" : undefined,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="subtitle1" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.fullName ? `Xin chào, ${user.fullName}` : title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ cursor: "pointer", opacity: 0.9 }}
            onClick={() => navigate(homePath)}
          >
            Bảng điều khiển
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {isMdUp ? (
          <Drawer
            variant="permanent"
            open
            sx={{
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                bgcolor: dark ? "#0a0a0a" : undefined,
                color: dark ? "#eee" : undefined,
                borderRight: dark ? "1px solid #222" : undefined,
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                bgcolor: dark ? "#0a0a0a" : undefined,
                color: dark ? "#eee" : undefined,
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
