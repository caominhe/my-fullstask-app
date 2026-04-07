import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { portalApi } from "../../services/portalApiService";
import EmptyState from "../../components/ui/EmptyState";

export default function ShowroomSalesWorkspace() {
  const [allCars, setAllCars] = useState([]);
  const [vin, setVin] = useState("");
  const [leadId, setLeadId] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [quotationId, setQuotationId] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await portalApi.getCars();
        setAllCars(res?.result || []);
      } catch {
        setAllCars([]);
      }
    })();
  }, []);

  const available = allCars.filter((c) => (c.status || "") === "IN_WAREHOUSE");
  const displayRows = available.length ? available : allCars;

  const run = async (fn, ok) => {
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await fn();
      setMsg({ type: "success", text: ok });
      return res;
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi." });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Kho chi nhánh &amp; chốt sale
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Phần 1: xe AVAILABLE / tồn kho · Phần 2: báo giá → hợp đồng → khóa xe
      </Typography>
      {msg.text ? (
        <Alert severity={msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      ) : null}

      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        1. Tìm xe trong kho (ưu tiên trạng thái sẵn sàng)
      </Typography>
      <Paper variant="outlined" sx={{ mb: 3, overflow: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>VIN</TableCell>
              <TableCell>Xe</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Giá</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ border: 0, p: 0 }}>
                  <EmptyState
                    title="Không có xe trong kho để chọn"
                    description={
                      available.length === 0 && allCars.length > 0
                        ? "Hiện không có xe ở trạng thái IN_WAREHOUSE. Kiểm tra kho tổng hoặc trạng thái xe."
                        : "Chưa có dữ liệu tồn kho. Liên hệ kho tổng để nhập xe."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              displayRows.map((c) => (
                <TableRow key={c.vin} hover selected={c.vin === vin} onClick={() => setVin(c.vin)} sx={{ cursor: "pointer" }}>
                  <TableCell sx={{ fontFamily: "monospace" }}>{c.vin}</TableCell>
                  <TableCell>{[c.brand, c.model, c.version].filter(Boolean).join(" ")}</TableCell>
                  <TableCell>{c.status}</TableCell>
                  <TableCell align="right">{c.basePrice != null ? Number(c.basePrice).toLocaleString("vi-VN") : "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        2. Báo giá &amp; hợp đồng
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <TextField fullWidth label="Lead ID" value={leadId} onChange={(e) => setLeadId(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField fullWidth label="VIN đã chọn" value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField fullWidth label="Mã voucher (tuỳ chọn)" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField fullWidth label="Quotation ID (sau khi tạo)" value={quotationId} onChange={(e) => setQuotationId(e.target.value)} />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button variant="contained" onClick={() => run(() => portalApi.createQuotation({ leadId: Number(leadId), carVin: vin, voucherCode: voucherCode || undefined }), "Đã tạo báo giá.")} disabled={loading}>
              Tạo báo giá (POST /sales/quotations)
            </Button>
            <Button variant="outlined" onClick={() => run(() => portalApi.createContract(Number(quotationId)), "Đã tạo hợp đồng.")} disabled={loading}>
              Tạo hợp đồng (POST …/contracts)
            </Button>
            <Button color="warning" variant="outlined" onClick={() => run(() => portalApi.lockCar(vin), "Đã khóa VIN.")} disabled={loading || !vin}>
              Khóa xe (PUT /cars/{`{vin}`}/lock)
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
