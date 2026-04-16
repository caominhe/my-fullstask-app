import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  MenuItem,
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

function targetScopeLabel(ev) {
  if (ev?.targetScope === "REGION") {
    const regionMap = { NORTH: "Miền Bắc", CENTRAL: "Miền Trung", SOUTH: "Miền Nam" };
    return `Khu vực: ${regionMap[ev.targetRegion] || ev.targetRegion || "—"}`;
  }
  if (ev?.targetScope === "PROVINCE") return `Địa điểm: ${ev.targetProvince || "—"}`;
  if (ev?.targetScope === "SHOWROOM") return `Chi nhánh: ${ev.targetShowroomName || ev.targetShowroomId || "—"}`;
  return "Phạm vi: Toàn quốc";
}

export default function PromotionsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [myVouchers, setMyVouchers] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [selectedShowroomId, setSelectedShowroomId] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const loadData = async (showroomId = "") => {
    setLoading(true);
    try {
      const [campaignsRes, vouchersRes, showroomsRes] = await Promise.all([
        portalApi.getCustomerCampaigns(showroomId || undefined),
        portalApi.getMyVouchers(),
        portalApi.getShowrooms(),
      ]);
      setCampaigns(campaignsRes?.result || []);
      setMyVouchers(vouchersRes?.result || []);
      setShowrooms(showroomsRes?.result || []);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Không tải được dữ liệu khuyến mãi." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const registerCampaign = async (id) => {
    if (!id) return;
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await portalApi.registerCampaign(id, selectedShowroomId || undefined);
      await loadData(selectedShowroomId);
      const voucher = res?.result;
      setMsg({
        type: "success",
        text:
          `Đăng ký chiến dịch thành công. Mã: ${voucher?.code || "—"} | ` +
          `Chiến dịch: ${voucher?.campaignName || "—"} | ` +
          `Giá trị: ${voucher?.discountType || "—"} ${voucher?.discountValue ?? "—"} | ` +
          `Trạng thái: ${voucher?.status || "—"} | ` +
          `Hết hạn: ${voucher?.expiredAt || "—"}`,
      });
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi đăng ký." });
    } finally {
      setLoading(false);
    }
  };

  const visibleCampaigns = campaigns;

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Chiến dịch khuyến mãi
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Đăng ký chiến dịch để nhận voucher từ kho ACTIVE. Trạng thái voucher: ACTIVE → CLAIMED → USED hoặc EXPIRED.
      </Typography>
      {msg.text ? (
        <Alert severity={msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      ) : null}

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          select
          label="Lọc theo showroom"
          value={selectedShowroomId}
          onChange={(e) => {
            const showroomId = e.target.value;
            setSelectedShowroomId(showroomId);
            loadData(showroomId);
          }}
          helperText={
            selectedShowroomId
              ? "Đang hiển thị chiến dịch gán cho showroom đã chọn."
              : "Mặc định hiển thị các chiến dịch áp dụng toàn bộ khách hàng."
          }
        >
          <MenuItem value="">
            <em>Tất cả khách hàng (chiến dịch ALL)</em>
          </MenuItem>
          {showrooms.map((s) => (
            <MenuItem key={s.id} value={String(s.id)}>
              {s.name}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Chiến dịch đang áp dụng
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {visibleCampaigns.map((ev) => (
          <Grid item xs={12} md={6} key={ev.id}>
            <Card>
              <CardMedia
                component="img"
                height="160"
                image="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80"
                alt={ev.name}
              />
              <CardContent>
                <Typography variant="h6">{ev.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {ev.description || "Chiến dịch khuyến mãi dành cho khách hàng."}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                  {targetScopeLabel(ev)}
                </Typography>
                <Button variant="contained" onClick={() => registerCampaign(ev.id)} disabled={loading}>
                  Đăng ký nhận voucher (campaign #{ev.id})
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {visibleCampaigns.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {selectedShowroomId
                  ? "Showroom này chưa có chiến dịch được gán."
                  : "Chưa có chiến dịch áp dụng toàn bộ khách hàng."}
              </Typography>
            </Paper>
          </Grid>
        ) : null}
      </Grid>

      <Typography variant="h6" gutterBottom>
        Ví voucher
      </Typography>
      <Paper sx={{ p: 2 }}>
        {myVouchers.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Chưa có voucher trong ví.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mã</TableCell>
                <TableCell>Campaign</TableCell>
                <TableCell>Giá trị</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Hết hạn</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {myVouchers.map((v) => (
                <TableRow key={v.code}>
                  <TableCell>{v.code}</TableCell>
                  <TableCell>{v.campaignName || "—"}</TableCell>
                  <TableCell>
                    {v.discountType || "—"} {v.discountValue ?? "—"}
                  </TableCell>
                  <TableCell>{v.status || "—"}</TableCell>
                  <TableCell>{v.expiredAt || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
