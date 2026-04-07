import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { ROUTES } from "../../constants/routes";
import { portalApi } from "../../services/portalApiService";
import { getCarHeroImage } from "../../utils/carPlaceholderImage";

function formatPrice(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return new Intl.NumberFormat("vi-VN").format(n) + " ₫";
}

export default function CarDetailPage() {
  const { vin } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!vin) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await portalApi.getCarByVin(vin);
        if (!cancelled) setCar(data?.result || null);
      } catch (e) {
        if (!cancelled) setError(e.message || "Không tải được thông tin xe.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [vin]);

  const title = car ? [car.brand, car.model, car.version].filter(Boolean).join(" ") : "";

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Typography component={RouterLink} to={ROUTES.CARS_PUBLIC} color="inherit" sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
          Danh sách xe
        </Typography>
        <Typography color="text.primary">{vin}</Typography>
      </Breadcrumbs>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : !car ? (
        <Typography>Không tìm thấy xe.</Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Box
              component="img"
              src={getCarHeroImage(car)}
              alt={title}
              sx={{ width: "100%", borderRadius: 2, maxHeight: 420, objectFit: "cover" }}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography variant="overline" color="text.secondary">
              GET /cars/{`{vin}`}
            </Typography>
            <Typography variant="h4" component="h1" fontWeight={800} gutterBottom>
              {title || "Xe FCAR"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
              <Chip label={`VIN: ${car.vin}`} size="small" />
              <Chip label={car.status || "—"} size="small" color="primary" variant="outlined" />
            </Box>
            <Typography variant="h5" color="primary.main" fontWeight={700} gutterBottom>
              {formatPrice(car.basePrice)}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={1}>
              {[
                ["Màu sơn", car.color],
                ["Số máy", car.engineNumber],
                ["Showroom ID", car.showroomId ?? "—"],
                ["Master data ID", car.masterDataId ?? "—"],
              ].map(([k, v]) => (
                <Grid item xs={12} key={k}>
                  <Typography variant="caption" color="text.secondary">
                    {k}
                  </Typography>
                  <Typography>{v}</Typography>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button variant="contained" size="large" component={RouterLink} to={`${ROUTES.TEST_DRIVE}?vin=${encodeURIComponent(car.vin)}`}>
                Đăng ký lái thử
              </Button>
              <Button variant="outlined" component={RouterLink} to={ROUTES.CARS_PUBLIC}>
                Quay lại danh sách
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
