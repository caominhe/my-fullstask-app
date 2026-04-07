import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { portalApi } from "../../services/portalApiService";

export default function ShowroomFinancePage() {
  const [contractNo, setContractNo] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("DEPOSIT");
  const [licensePlate, setLicensePlate] = useState("");
  const [handoverDate, setHandoverDate] = useState("");
  const [vin, setVin] = useState("");
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
        Kế toán chi nhánh
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Thu tiền · lịch bàn giao · chốt đã bán
      </Typography>
      {msg.text ? (
        <Alert severity={msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      ) : null}

      <Typography variant="subtitle1" fontWeight={600}>
        Ghi nhận thu tiền
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3, mt: 0.5 }}>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Số hợp đồng" value={contractNo} onChange={(e) => setContractNo(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField fullWidth label="Số tiền" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField select fullWidth label="Hình thức" value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
            <MenuItem value="DEPOSIT">Cọc</MenuItem>
            <MenuItem value="INSTALLMENT">Trả góp</MenuItem>
            <MenuItem value="FULL">Thanh toán đủ</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button fullWidth sx={{ height: 56 }} variant="contained" onClick={() => run(() => portalApi.processPayment({ contractNo, amount: Number(amount), paymentType }), "Đã ghi nhận.")} disabled={loading}>
            Ghi nhận
          </Button>
        </Grid>
      </Grid>

      <Typography variant="subtitle1" fontWeight={600}>
        Lịch giao xe
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3, mt: 0.5 }}>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Biển số (cập nhật khi giao)" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth type="datetime-local" label="Ngày giao" InputLabelProps={{ shrink: true }} value={handoverDate} onChange={(e) => setHandoverDate(e.target.value)} />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button variant="outlined" onClick={() => run(() => portalApi.initHandover(contractNo), "Đã tạo lịch bàn giao.")} disabled={loading}>
              Lên lịch bàn giao
            </Button>
            <Button variant="outlined" onClick={() => run(() => portalApi.updateHandover(contractNo, { licensePlate, handoverDate: handoverDate ? `${handoverDate}:00` : undefined }), "Đã cập nhật bàn giao.")} disabled={loading}>
              Xác nhận đã giao xe
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => run(() => portalApi.getPaymentsByContract(contractNo), "Đã tải biên lai / lịch sử thu.")} disabled={loading}>
              Xem biên lai (GET payments)
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Typography variant="subtitle1" fontWeight={600}>
        Chốt bán xe
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="VIN chốt đã bán" value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} />
        </Grid>
        <Grid item xs={12} md="auto">
          <Button color="error" variant="contained" onClick={() => run(() => portalApi.sellCar(vin), "Đã cập nhật trạng thái Đã bán.")} disabled={loading || !vin}>
            Đã bán (PUT /cars/{`{vin}`}/sell)
          </Button>
        </Grid>
      </Grid>

      {last ? (
        <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: "grey.50" }}>
          <Typography variant="caption" color="text.secondary">
            Phản hồi gần nhất
          </Typography>
          <Box component="pre" sx={{ m: 0, fontSize: 12, overflow: "auto" }}>
            {JSON.stringify(last, null, 2)}
          </Box>
        </Paper>
      ) : null}
    </Box>
  );
}
