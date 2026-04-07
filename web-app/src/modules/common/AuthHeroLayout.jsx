import { Box } from "@mui/material";

const BG =
  "linear-gradient(135deg, rgba(13,71,161,0.92) 0%, rgba(21,101,192,0.88) 40%, rgba(0,0,0,0.75) 100%), url(https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80)";

/**
 * Nền xe + form Card ở giữa cho các trang Auth.
 */
export default function AuthHeroLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
        background: BG,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {children}
    </Box>
  );
}
