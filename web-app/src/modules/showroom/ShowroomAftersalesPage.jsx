import { useState } from "react";
import { Alert, Box, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import { portalApi } from "../../services/portalApiService";

export default function ShowroomAftersalesPage() {
  const [vin, setVin] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [durationMonths, setDurationMonths] = useState("36");
  const [description, setDescription] = useState("");
  const [totalCost, setTotalCost] = useState("0");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [last, setLast] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async (fn, ok) => {
    setLoading(true);
    setMsg({ type: "", text: "" });
    setLast(null);
    try {
      const res = await fn();
      setMsg({ type: "success", text: ok });
      setLast(res);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Cố vấn dịch vụ &amp; hậu mãi
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Quét VIN khách — kích hoạt bảo hành hoặc lập phiếu tiếp nhận xưởng
      </Typography>
      {msg.text ? (
        <Alert severity={msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Số VIN" value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Biển số" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Thời hạn BH (tháng)" value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Mô tả phiếu xưởng" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Chi phí dự kiến" value={totalCost} onChange={(e) => setTotalCost(e.target.value)} />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button variant="contained" onClick={() => run(() => portalApi.activateWarranty({ carVin: vin, licensePlate, durationMonths: Number(durationMonths) }), "Đã kích hoạt bảo hành.")} disabled={loading}>
              Kích hoạt sổ bảo hành
            </Button>
            <Button variant="outlined" onClick={() => run(() => portalApi.createServiceTicket({ carVin: vin, description, totalCost: Number(totalCost) }), "Đã tạo phiếu tiếp nhận.")} disabled={loading}>
              Lập phiếu tiếp nhận xưởng
            </Button>
          </Box>
        </Grid>
      </Grid>

      {last ? (
        <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: "grey.50" }}>
          <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(last, null, 2)}</pre>
        </Paper>
      ) : null}
    </Box>
  );
}
