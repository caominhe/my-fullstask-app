import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { fetchMyInfo } from "../../services/userService";
import { portalApi } from "../../services/portalApiService";

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 3 }}>{children}</Box>;
}

export default function CustomerProfileDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tabIndex = tabParam === "payments" ? 2 : tabParam === "purchase" ? 1 : 0;

  const [tab, setTab] = useState(tabIndex);
  const [profile, setProfile] = useState(null);
  const [loadProfileErr, setLoadProfileErr] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [quotationId, setQuotationId] = useState("");
  const [qLoading, setQLoading] = useState(false);
  const [qMsg, setQMsg] = useState({ type: "", text: "" });

  const [contractNo, setContractNo] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [payMsg, setPayMsg] = useState({ type: "", text: "" });
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingProfile(true);
      setLoadProfileErr("");
      try {
        const data = await fetchMyInfo();
        if (!cancelled) setProfile(data);
      } catch (e) {
        if (!cancelled) setLoadProfileErr(e.message || "Không tải được hồ sơ.");
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "payments") setTab(2);
    else if (t === "purchase") setTab(1);
    else setTab(0);
  }, [searchParams]);

  const handleTab = (_, v) => {
    setTab(v);
    const key = v === 0 ? "" : v === 1 ? "purchase" : "payments";
    if (key) setSearchParams({ tab: key });
    else setSearchParams({});
  };

  const acceptQuotation = async () => {
    if (!quotationId) return;
    setQLoading(true);
    setQMsg({ type: "", text: "" });
    try {
      await portalApi.acceptQuotation(Number(quotationId));
      setQMsg({ type: "success", text: "Bạn đã đồng ý báo giá. Sales sẽ tiếp tục thủ tục hợp đồng." });
      setQuotationId("");
    } catch (e) {
      setQMsg({ type: "error", text: e.message || "Không xác nhận được." });
    } finally {
      setQLoading(false);
    }
  };

  const loadPayments = async () => {
    if (!contractNo.trim()) return;
    setPayLoading(true);
    setPayMsg({ type: "", text: "" });
    try {
      const res = await portalApi.getPaymentsByContract(contractNo.trim());
      setPayments(res?.result || []);
      setPayMsg({ type: "success", text: "Đã tải lịch sử thanh toán." });
    } catch (e) {
      setPayMsg({ type: "error", text: e.message || "Lỗi tải dữ liệu." });
      setPayments([]);
    } finally {
      setPayLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Bảng điều khiển cá nhân
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        GET /users/my-info khi mở trang — quản lý báo giá, thanh toán theo tab.
      </Typography>
      {loadProfileErr ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadProfileErr}
        </Alert>
      ) : null}

      <Paper sx={{ p: 2, mb: 3, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Avatar src={profile?.avatar} sx={{ width: 72, height: 72 }} />
        <Box>
          <Typography variant="h6">{profile?.fullName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {profile?.email} · {profile?.phone || "Chưa có SĐT"}
          </Typography>
          <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {(profile?.roles || []).map((r) => (
              <Chip key={r.name} size="small" label={r.name} />
            ))}
          </Box>
        </Box>
      </Paper>

      <Tabs value={tab} onChange={handleTab}>
        <Tab label="Tổng quan" />
        <Tab label="Mua xe — báo giá" />
        <Tab label="Thanh toán & hợp đồng" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Typography variant="body1">
          Chào mừng đến khu vực khách hàng FCAR. Dùng tab <strong>Mua xe</strong> để xác nhận báo giá từ nhân viên Sales, tab{" "}
          <strong>Thanh toán</strong> để xem các đợt chuyển khoản theo số hợp đồng.
        </Typography>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Card variant="outlined" sx={{ bgcolor: "primary.50", borderColor: "primary.light" }}>
          <CardContent>
            <Typography variant="overline" color="primary">
              Báo giá từ Sales
            </Typography>
            <Typography variant="h6" gutterBottom>
              Đồng ý mức giá đã thương lượng
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Khi Sales gửi báo giá qua hệ thống, bạn nhập mã báo giá (ID) bên dưới và xác nhận — API PUT /sales/quotations/
              {"{id}"}/accept
            </Typography>
            {qMsg.text ? (
              <Alert severity={qMsg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
                {qMsg.text}
              </Alert>
            ) : null}
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Mã báo giá (Quotation ID)"
                  value={quotationId}
                  onChange={(e) => setQuotationId(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md="auto">
                <Button variant="contained" size="large" color="success" onClick={acceptQuotation} disabled={qLoading || !quotationId}>
                  {qLoading ? "Đang gửi..." : "Đồng ý với báo giá này"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          GET /finance/contracts/{`{contractNo}`}/payments — nhập số hợp đồng do Sales cung cấp.
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Số hợp đồng" value={contractNo} onChange={(e) => setContractNo(e.target.value)} />
          </Grid>
          <Grid item xs={12} md="auto">
            <Button variant="contained" onClick={loadPayments} disabled={payLoading}>
              {payLoading ? "Đang tải..." : "Xem tiến độ thanh toán"}
            </Button>
          </Grid>
        </Grid>
        {payMsg.text ? (
          <Alert severity={payMsg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
            {payMsg.text}
          </Alert>
        ) : null}
        {payments.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Loại</TableCell>
                <TableCell align="right">Số tiền</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>{p.paymentType || "—"}</TableCell>
                  <TableCell align="right">{p.amount != null ? Number(p.amount).toLocaleString("vi-VN") : "—"}</TableCell>
                  <TableCell>{p.status || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Chưa có dữ liệu — nhập số hợp đồng và tải.
          </Typography>
        )}
      </TabPanel>
    </Box>
  );
}
