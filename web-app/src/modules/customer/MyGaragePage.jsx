import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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

export default function MyGaragePage() {
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [warranty, setWarranty] = useState(null);
  const [history, setHistory] = useState([]);

  const loadWarranty = async () => {
    if (!vin.trim()) return;
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await portalApi.getWarranty(vin.trim());
      setWarranty(res?.result || null);
      setMsg({ type: "success", text: "Đã tải sổ bảo hành." });
    } catch (e) {
      setWarranty(null);
      setMsg({ type: "error", text: e.message || "Lỗi." });
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!vin.trim()) return;
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await portalApi.getWarrantyHistory(vin.trim());
      setHistory(res?.result || []);
      setMsg({ type: "success", text: "Đã tải lịch sử xưởng." });
    } catch (e) {
      setHistory([]);
      setMsg({ type: "error", text: e.message || "Lỗi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Garage của tôi
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        GET /aftersales/warranties/{`{carVin}`} và /history
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Số VIN xe" value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} />
        </Grid>
        <Grid item xs={12} md={8} sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button variant="contained" onClick={loadWarranty} disabled={loading}>
            Xem sổ bảo hành
          </Button>
          <Button variant="outlined" onClick={loadHistory} disabled={loading}>
            Xem lịch sử sửa chữa / bảo dưỡng
          </Button>
        </Grid>
      </Grid>
      {msg.text ? (
        <Alert severity={msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      ) : null}

      {warranty ? (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Sổ bảo hành điện tử
            </Typography>
            <Typography variant="body2">VIN: {warranty.carVin || vin}</Typography>
            <Typography variant="body2">Biển số: {warranty.licensePlate || "—"}</Typography>
            <Typography variant="body2">Hết hạn: {warranty.endDate || "—"}</Typography>
          </CardContent>
        </Card>
      ) : null}

      {history.length > 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Lịch sử xưởng
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mô tả / ngày</TableCell>
                <TableCell align="right">Chi phí</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.description || row.serviceDate || JSON.stringify(row)}</TableCell>
                  <TableCell align="right">{row.totalCost != null ? row.totalCost : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ) : null}
    </Box>
  );
}
