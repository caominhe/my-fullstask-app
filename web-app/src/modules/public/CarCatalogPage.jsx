import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { ROUTES } from "../../constants/routes";
import { portalApi } from "../../services/portalApiService";
import { getCarHeroImage } from "../../utils/carPlaceholderImage";
import EmptyState from "../../components/ui/EmptyState";

function formatPrice(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return new Intl.NumberFormat("vi-VN").format(n) + " ₫";
}

export default function CarCatalogPage({ embedded = false }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await portalApi.getCars({ excludeWithContract: true });
        if (!cancelled) setCars(data?.result || []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Không tải được danh sách xe.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const titleLine = (c) => [c.brand, c.model, c.version].filter(Boolean).join(" ") || "Xe FCAR";

  return (
    <Box>
      {!embedded ? (
        <Box
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            mb: 4,
            position: "relative",
            minHeight: { xs: 200, md: 280 },
            backgroundImage:
              "linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 55%, transparent 100%), url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            px: { xs: 2, md: 6 },
            py: { xs: 3, md: 5 },
          }}
        >
          <Box sx={{ maxWidth: 560 }}>
            <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.85)", letterSpacing: 2 }}>
              FCAR SHOWROOM ONLINE
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              sx={{ color: "#fff", fontWeight: 800, mb: 1, fontSize: { xs: "1.75rem", md: "2.5rem" } }}
            >
              Chọn chiếc xe của bạn
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.9)", mb: 2 }}>
              Danh sách tồn kho cập nhật từ API GET /cars — xem chi tiết cấu hình &amp; đăng ký lái thử.
            </Typography>
            <Button variant="contained" color="secondary" size="large" component={RouterLink} to={ROUTES.TEST_DRIVE}>
              Đăng ký lái thử
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Danh sách xe hiện có
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dữ liệu lấy trực tiếp từ API GET /cars.
          </Typography>
        </Box>
      )}

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {cars.length === 0 ? (
            <Grid item xs={12}>
              <EmptyState
                title="Chưa có xe hiển thị"
                description="Kho đang trống hoặc chưa nhập dữ liệu. Thử lại sau hoặc liên hệ quản trị."
              />
            </Grid>
          ) : (
            cars.map((c) => (
              <Grid item xs={12} sm={6} md={4} key={c.vin}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardActionArea component={RouterLink} to={`/cars/${encodeURIComponent(c.vin)}`}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={getCarHeroImage(c)}
                      alt={titleLine(c)}
                      sx={{ objectFit: "cover" }}
                    />
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">
                        {c.vin}
                      </Typography>
                      <Typography variant="h6" component="h2" gutterBottom fontWeight={700}>
                        {titleLine(c)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Màu {c.color || "—"} · {c.status || "—"}
                      </Typography>
                      <Typography variant="h6" color="primary.main" fontWeight={700}>
                        {formatPrice(c.basePrice)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <Box sx={{ px: 2, pb: 2, display: "flex", gap: 1 }}>
                    <Button fullWidth variant="contained" component={RouterLink} to={`/cars/${encodeURIComponent(c.vin)}`}>
                      Xem chi tiết
                    </Button>
                    <Button fullWidth variant="outlined" component={RouterLink} to={`${ROUTES.TEST_DRIVE}?vin=${encodeURIComponent(c.vin)}`}>
                      Lái thử
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Box>
  );
}
