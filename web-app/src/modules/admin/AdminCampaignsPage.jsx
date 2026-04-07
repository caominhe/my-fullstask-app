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

export default function AdminCampaignsPage() {
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState([]);

  const [campaignName, setCampaignName] = useState("");
  const [discountType, setDiscountType] = useState("CASH");
  const [discountValue, setDiscountValue] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [quantity, setQuantity] = useState("20");
  const [prefix, setPrefix] = useState("TET");
  const [expiredAt, setExpiredAt] = useState("");

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Chiến dịch khuyến mãi
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        POST /campaigns · POST /campaigns/{`{campaignId}`}/generate — API danh sách campaign (GET) có thể bổ sung sau.
      </Typography>
      {msg.text ? (
        <Alert severity={msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      ) : null}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          + Tạo chiến dịch
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Tên chiến dịch" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Loại giảm (CASH/PERCENT...)" value={discountType} onChange={(e) => setDiscountType(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Giá trị" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              sx={{ height: 56 }}
              variant="contained"
              onClick={async () => {
                setLoading(true);
                setMsg({ type: "", text: "" });
                try {
                  const res = await portalApi.createCampaign({
                    name: campaignName,
                    discountType,
                    discountValue: Number(discountValue),
                  });
                  if (res?.result?.id) setCampaignId(String(res.result.id));
                  setMsg({ type: "success", text: "Đã tạo chiến dịch." });
                } catch (e) {
                  setMsg({ type: "error", text: e.message || "Lỗi." });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              Lưu
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Kho voucher — sinh mã hàng loạt
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Campaign ID" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Số lượng" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Hết hạn"
              InputLabelProps={{ shrink: true }}
              value={expiredAt}
              onChange={(e) => setExpiredAt(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              sx={{ height: 56 }}
              variant="outlined"
              onClick={async () => {
                const dt = expiredAt.length === 16 ? `${expiredAt}:00` : expiredAt;
                setLoading(true);
                setMsg({ type: "", text: "" });
                try {
                  const res = await portalApi.generateCampaignVouchers(Number(campaignId), {
                    quantity: Number(quantity),
                    prefix,
                    expiredAt: dt,
                  });
                  setVouchers(res?.result || []);
                  setMsg({ type: "success", text: "Đã sinh mã voucher." });
                } catch (e) {
                  setMsg({ type: "error", text: e.message || "Lỗi." });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              Sinh mã
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {vouchers.length > 0 ? (
        <Paper variant="outlined">
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Mã vừa sinh (xem nhanh)
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Mã</TableCell>
                  <TableCell>Hết hạn</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vouchers.slice(0, 50).map((v, i) => (
                  <TableRow key={i}>
                    <TableCell>{v.code || JSON.stringify(v)}</TableCell>
                    <TableCell>{v.expiredAt || v.expiresAt || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {vouchers.length > 50 ? (
              <Typography variant="caption" color="text.secondary">
                Hiển thị 50/{vouchers.length} mã.
              </Typography>
            ) : null}
          </Box>
        </Paper>
      ) : null}
    </Box>
  );
}
