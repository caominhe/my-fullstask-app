import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

export default function MarketingHomePage() {
  const navigate = useNavigate();

  return (
    <Box>
      <Box
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          mb: 4,
          minHeight: { xs: 360, md: 440 },
          backgroundImage:
            "linear-gradient(105deg, rgba(13,71,161,0.92) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.2) 100%), url(https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1920&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, md: 4 } }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.9)", letterSpacing: 3 }}>
                FCAR DEALERSHIP
              </Typography>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: { xs: "2rem", md: "3rem" },
                  lineHeight: 1.15,
                  mb: 2,
                }}
              >
                Lái thử hôm nay — sở hữu xe trong tầm tay
              </Typography>
              <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.92)", fontWeight: 400, mb: 3, maxWidth: 560 }}>
                Khám phá tồn kho, nhận báo giá minh bạch và ưu đãi sự kiện trong một hệ sinh thái duy nhất.
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                <Button variant="contained" color="secondary" size="large" onClick={() => navigate(ROUTES.CARS_PUBLIC)}>
                  Xem danh sách xe
                </Button>
                <Button variant="outlined" color="inherit" size="large" onClick={() => navigate(ROUTES.TEST_DRIVE)} sx={{ borderColor: "rgba(255,255,255,0.8)", color: "#fff" }}>
                  Đăng ký lái thử
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Tồn kho thời gian thực
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dữ liệu GET /cars — cập nhật theo kho tổng &amp; chi nhánh.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Báo giá &amp; hợp đồng số
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Khách xác nhận báo giá, theo dõi thanh toán trên portal cá nhân.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Bảo hành &amp; hậu mãi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sổ bảo hành điện tử và lịch sử xưởng luôn trong Garage của tôi.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
