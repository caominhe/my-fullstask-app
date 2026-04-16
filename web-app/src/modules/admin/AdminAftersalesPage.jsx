import { useState } from "react";
import {
  Alert,
  Box,
  Button,
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

export default function AdminAftersalesPage() {
  const [lookupContractNo, setLookupContractNo] = useState("");
  const [lookupLicensePlate, setLookupLicensePlate] = useState("");
  const [resolvedVin, setResolvedVin] = useState("");
  const [resolvedContractNo, setResolvedContractNo] = useState("");

  const [msg, setMsg] = useState({ type: "", text: "" });
  const [warranty, setWarranty] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const run = async (fn, okText, opts = {}) => {
    setLoading(true);
    setMsg({ type: "", text: "" });
    if (!opts.keepWarranty) setWarranty(null);
    if (!opts.keepHistory) setHistory([]);
    try {
      const res = await fn();
      setMsg({ type: "success", text: okText });
      return res?.result;
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi." });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const lookupByContractOrPlate = async () => {
    const c = lookupContractNo.trim();
    const p = lookupLicensePlate.trim();
    if ((c && p) || (!c && !p)) {
      setMsg({ type: "error", text: "Chỉ nhập số hợp đồng hoặc biển số (một trong hai)." });
      return;
    }
    const data = await run(
      () =>
        portalApi.adminWarrantyLookup({
          contractNo: c || undefined,
          licensePlate: p || undefined,
        }),
      "Đã tra cứu.",
      { keepWarranty: true, keepHistory: true }
    );
    if (data) {
      setResolvedVin((data.carVin || "").toUpperCase());
      setResolvedContractNo(data.contractNo || "");
      setWarranty(data.warranty || null);
      setHistory(data.history || []);
    }
  };

  const loadWarranty = async () => {
    if (!resolvedVin.trim()) return;
    const data = await run(() => portalApi.getWarranty(resolvedVin.trim()), "Đã tải sổ bảo hành.", { keepHistory: true });
    if (data) setWarranty(data);
  };

  const loadHistory = async () => {
    if (!resolvedVin.trim()) return;
    const data = await run(
      () => portalApi.getWarrantyHistory(resolvedVin.trim()),
      "Đã tải lịch sử dịch vụ.",
      { keepWarranty: true }
    );
    if (data) setHistory(data);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Quản lý bảo hành &amp; hậu mãi
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        ADMIN: chỉ <strong>tra cứu và xem</strong> sổ bảo hành / lịch sử theo số hợp đồng hoặc biển số. Kích hoạt và cập
        nhật sổ do showroom thực hiện.
      </Typography>

      {msg.text ? (
        <Alert severity={msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      ) : null}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          Tra cứu theo số hợp đồng hoặc biển số
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Số hợp đồng"
              value={lookupContractNo}
              onChange={(e) => setLookupContractNo(e.target.value)}
              placeholder="VD: HD-XXXXX"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Biển số xe"
              value={lookupLicensePlate}
              onChange={(e) => setLookupLicensePlate(e.target.value.toUpperCase())}
              placeholder="Hoặc nhập biển (không cùng lúc với số HĐ)"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button variant="contained" sx={{ height: 56 }} onClick={lookupByContractOrPlate} disabled={loading}>
              Tra cứu sổ + lịch sử
            </Button>
          </Grid>
          {resolvedVin ? (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                VIN: <strong>{resolvedVin}</strong>
                {resolvedContractNo ? (
                  <>
                    {" "}
                    · HĐ: <strong>{resolvedContractNo}</strong>
                  </>
                ) : null}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button variant="outlined" size="small" onClick={loadWarranty} disabled={loading}>
                  Tải lại sổ
                </Button>
                <Button variant="outlined" size="small" onClick={loadHistory} disabled={loading}>
                  Tải lại lịch sử
                </Button>
              </Box>
            </Grid>
          ) : null}
        </Grid>
      </Paper>

      {warranty ? (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Sổ bảo hành (chỉ xem)
          </Typography>
          <Typography variant="body2">VIN: {warranty.carVin || "—"}</Typography>
          <Typography variant="body2">Biển số: {warranty.licensePlate || "—"}</Typography>
          <Typography variant="body2">Bắt đầu: {warranty.startDate || "—"}</Typography>
          <Typography variant="body2">Kết thúc: {warranty.endDate || "—"}</Typography>
          <Typography variant="body2">Hết hạn: {warranty.isExpired ? "Có" : "Chưa"}</Typography>
        </Paper>
      ) : resolvedVin ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Chưa có sổ bảo hành cho VIN này — showroom sẽ kích hoạt khi đủ điều kiện nghiệp vụ.
        </Alert>
      ) : null}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Lịch sử dịch vụ (chỉ xem)
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ngày</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell align="right">Chi phí</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ color: "text.secondary" }}>
                  Chưa có lịch sử dịch vụ.
                </TableCell>
              </TableRow>
            ) : (
              history.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.serviceDate || "—"}</TableCell>
                  <TableCell>{row.description || "—"}</TableCell>
                  <TableCell align="right">{row.totalCost ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
