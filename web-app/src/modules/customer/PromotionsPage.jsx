import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { portalApi } from "../../services/portalApiService";

const DEMO_EVENTS = [
  { id: 1, title: "Lễ hội lái thử cuối tuần", subtitle: "Ưu đãi phụ kiện khi đặt cọc", image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80" },
  { id: 2, title: "Triển lãm xe điện 2026", subtitle: "Nhận voucher giảm phí trước bạ", image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80" },
];

export default function PromotionsPage() {
  const [eventId, setEventId] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const registerEvent = async (id) => {
    const eid = id || Number(eventId);
    if (!eid) return;
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      await portalApi.registerEvent(eid);
      setMsg({ type: "success", text: `Đã đăng ký sự kiện #${eid} — POST /events/{eventId}/register` });
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi đăng ký." });
    } finally {
      setLoading(false);
    }
  };

  const claim = async () => {
    if (!voucherCode.trim()) return;
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      await portalApi.claimVoucher(voucherCode.trim());
      setMsg({ type: "success", text: "Đã thêm mã vào ví — POST /vouchers/{code}/claim" });
      setVoucherCode("");
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi claim." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Sự kiện &amp; khuyến mãi
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Banner minh họa — đăng ký bằng ID sự kiện thật từ hệ thống Marketing.
      </Typography>
      {msg.text ? (
        <Alert severity={msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      ) : null}

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Sự kiện đang diễn ra
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {DEMO_EVENTS.map((ev) => (
          <Grid item xs={12} md={6} key={ev.id}>
            <Card>
              <CardMedia component="img" height="160" image={ev.image} alt={ev.title} />
              <CardContent>
                <Typography variant="h6">{ev.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {ev.subtitle}
                </Typography>
                <Button variant="contained" onClick={() => registerEvent(ev.id)} disabled={loading}>
                  Đăng ký tham gia (event #{ev.id})
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Hoặc nhập ID sự kiện thủ công
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <TextField size="small" label="Event ID" value={eventId} onChange={(e) => setEventId(e.target.value)} />
          <Button variant="outlined" onClick={() => registerEvent()} disabled={loading}>
            Đăng ký
          </Button>
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Ví voucher
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Nhập mã săn được trên web / từ nhân viên để lưu vào ví cá nhân.
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <TextField label="Mã voucher" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} />
          <Button variant="contained" color="secondary" onClick={claim} disabled={loading}>
            Thêm vào ví
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
