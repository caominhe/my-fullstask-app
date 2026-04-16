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
import { fetchMyInfo, updateMyInfo } from "../../services/userService";
import { portalApi } from "../../services/portalApiService";

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 3 }}>{children}</Box>;
}

function formatVnd(v) {
  return Number(v || 0).toLocaleString("vi-VN");
}

function printContractAsPdf(contract) {
  if (!contract) return;
  const html = `
    <html>
      <head>
        <title>Hop dong ${contract.contractNo || ""}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          h1, h2 { margin: 0 0 8px 0; }
          .muted { color: #666; font-size: 12px; }
          .section { margin-top: 18px; border: 1px solid #ddd; border-radius: 8px; padding: 12px; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; }
          .sign { margin-top: 40px; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <h1>HOP DONG MUA BAN XE</h1>
        <div class="muted">So hop dong: ${contract.contractNo || "—"} | Trang thai: ${contract.status || "—"}</div>
        <div class="section">
          <h2>Thong tin khach hang</h2>
          <div class="row"><span>Ho ten</span><strong>${contract.customerFullName || "—"}</strong></div>
          <div class="row"><span>Dien thoai</span><strong>${contract.customerPhone || "—"}</strong></div>
        </div>
        <div class="section">
          <h2>Thong tin xe va showroom</h2>
          <div class="row"><span>Xe</span><strong>${[contract.carBrand, contract.carModel, contract.carVersion].filter(Boolean).join(" ") || "—"}</strong></div>
          <div class="row"><span>VIN</span><strong>${contract.carVin || "—"}</strong></div>
          <div class="row"><span>Showroom</span><strong>${contract.showroomName || "—"}</strong></div>
          <div class="row"><span>Dia chi</span><strong>${contract.showroomAddress || "—"}</strong></div>
        </div>
        <div class="section">
          <h2>Thong tin gia tri hop dong</h2>
          <div class="row"><span>Gia niem yet</span><strong>${formatVnd(contract.totalAmount)} VND</strong></div>
          <div class="row"><span>Voucher</span><strong>${contract.voucherCode || "Khong ap dung"}</strong></div>
          <div class="row"><span>Giam gia</span><strong>${formatVnd(contract.discountAmount)} VND</strong></div>
          <div class="row"><span>Tong thanh toan</span><strong>${formatVnd(contract.finalAmount)} VND</strong></div>
        </div>
        <div class="sign">
          <div>Khach hang<br/><br/><br/>(Ky, ghi ro ho ten)</div>
          <div>Showroom<br/><br/><br/>(Ky, dong dau)</div>
        </div>
      </body>
    </html>
  `;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

export default function CustomerProfileDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tabIndex = tabParam === "purchase" ? 1 : 0;

  const [tab, setTab] = useState(tabIndex);
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState("");
  const [citizenId, setCitizenId] = useState("");
  const [address, setAddress] = useState("");
  const [loadProfileErr, setLoadProfileErr] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  const [contractNoConfirm, setContractNoConfirm] = useState("");
  const [contractPreview, setContractPreview] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState({ type: "", text: "" });
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingProfile(true);
      setLoadProfileErr("");
      try {
        const data = await fetchMyInfo();
        if (!cancelled) {
          setProfile(data);
          setPhone(data?.phone || "");
          setCitizenId(data?.citizenId || "");
          setAddress(data?.address || "");
        }
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
    if (t === "payments") {
      setSearchParams({ tab: "purchase" });
      return;
    }
    if (t === "purchase") setTab(1);
    else setTab(0);
  }, [searchParams, setSearchParams]);

  const handleTab = (_, v) => {
    setTab(v);
    const key = v === 0 ? "" : "purchase";
    if (key) setSearchParams({ tab: key });
    else setSearchParams({});
  };

  const loadContractPreview = async () => {
    if (!contractNoConfirm.trim()) return;
    setConfirmLoading(true);
    setConfirmMsg({ type: "", text: "" });
    try {
      const [contractRes, paymentsRes] = await Promise.all([
        portalApi.getContract(contractNoConfirm.trim()),
        portalApi.getPaymentsByContract(contractNoConfirm.trim()).catch(() => ({ result: [] })),
      ]);
      setContractPreview(contractRes?.result || null);
      setPayments(paymentsRes?.result || []);
      setConfirmMsg({ type: "success", text: "Đã tải hợp đồng và lịch sử thanh toán." });
    } catch (e) {
      setConfirmMsg({ type: "error", text: e.message || "Không tải được hợp đồng." });
      setContractPreview(null);
      setPayments([]);
    } finally {
      setConfirmLoading(false);
    }
  };

  const saveMyProfile = async () => {
    setSavingProfile(true);
    setProfileMsg({ type: "", text: "" });
    try {
      const updated = await updateMyInfo({ phone, citizenId, address });
      setProfile(updated);
      setPhone(updated?.phone || "");
      setCitizenId(updated?.citizenId || "");
      setAddress(updated?.address || "");
      setProfileMsg({ type: "success", text: "Đã cập nhật hồ sơ." });
    } catch (e) {
      setProfileMsg({ type: "error", text: e.message || "Không cập nhật được hồ sơ." });
    } finally {
      setSavingProfile(false);
    }
  };

  const confirmContract = async () => {
    if (!contractNoConfirm.trim()) return;
    setConfirmLoading(true);
    setConfirmMsg({ type: "", text: "" });
    try {
      const res = await portalApi.confirmContract(contractNoConfirm.trim());
      setContractPreview(res?.result || contractPreview);
      setConfirmMsg({ type: "success", text: "Bạn đã xác nhận hợp đồng. Trạng thái đã chuyển sang SIGNED." });
      const paymentsRes = await portalApi.getPaymentsByContract(contractNoConfirm.trim()).catch(() => ({ result: [] }));
      setPayments(paymentsRes?.result || []);
    } catch (e) {
      setConfirmMsg({ type: "error", text: e.message || "Không xác nhận được hợp đồng." });
    } finally {
      setConfirmLoading(false);
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
        GET /users/my-info khi mở trang — xem hợp đồng và theo dõi thanh toán theo tab.
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

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Cập nhật hồ sơ khách hàng
          </Typography>
          {profileMsg.text ? (
            <Alert severity={profileMsg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
              {profileMsg.text}
            </Alert>
          ) : null}
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="CCCD" value={citizenId} onChange={(e) => setCitizenId(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Địa chỉ" value={address} onChange={(e) => setAddress(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={saveMyProfile} disabled={savingProfile}>
                {savingProfile ? "Đang lưu..." : "Lưu hồ sơ"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Tabs value={tab} onChange={handleTab}>
        <Tab label="Tổng quan" />
        <Tab label="Mua xe — hợp đồng & thanh toán" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Typography variant="body1">
          Chào mừng đến khu vực khách hàng FCAR. Dùng tab <strong>Mua xe</strong> để xác nhận hợp đồng từ showroom, tab{" "}
          <strong>Mua xe</strong> cũng hiển thị luôn lịch sử thanh toán theo số hợp đồng.
        </Typography>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Card variant="outlined" sx={{ bgcolor: "primary.50", borderColor: "primary.light" }}>
          <CardContent>
            <Typography variant="overline" color="primary">
              Xác nhận hợp đồng
            </Typography>
            <Typography variant="h6" gutterBottom>
              Kiểm tra thông tin hợp đồng và xác nhận
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Khách hàng chỉ được quyền kiểm tra hợp đồng do showroom gửi và xác nhận trạng thái. Việc tạo biên lai/thu tiền
              do showroom thực hiện ở màn Finance.
            </Typography>
            {confirmMsg.text ? (
              <Alert severity={confirmMsg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
                {confirmMsg.text}
              </Alert>
            ) : null}
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Số hợp đồng"
                  value={contractNoConfirm}
                  onChange={(e) => setContractNoConfirm(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md="auto">
                <Button variant="outlined" size="large" onClick={loadContractPreview} disabled={confirmLoading || !contractNoConfirm}>
                  {confirmLoading ? "Đang tải..." : "Tải hợp đồng"}
                </Button>
              </Grid>
              <Grid item xs={12} md="auto">
                <Button
                  variant="contained"
                  size="large"
                  color="success"
                  onClick={confirmContract}
                  disabled={confirmLoading || !contractNoConfirm || contractPreview?.status === "SIGNED"}
                >
                  {confirmLoading ? "Đang gửi..." : "Xác nhận hợp đồng"}
                </Button>
              </Grid>
            </Grid>
            {contractPreview ? (
              <Box sx={{ mt: 2 }}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fff" }}>
                  <Typography variant="h6" fontWeight={800}>
                    HỢP ĐỒNG MUA BÁN XE
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Số HĐ: {contractPreview.contractNo || "—"} · Trạng thái: {contractPreview.status || "—"}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
                    Bên mua
                  </Typography>
                  <Typography variant="body2">
                    {contractPreview.customerFullName || "—"} · {contractPreview.customerPhone || "—"}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
                    Xe và showroom
                  </Typography>
                  <Typography variant="body2">
                    {[contractPreview.carBrand, contractPreview.carModel, contractPreview.carVersion].filter(Boolean).join(" ")}
                  </Typography>
                  <Typography variant="body2">VIN: {contractPreview.carVin || "—"}</Typography>
                  <Typography variant="body2">
                    {contractPreview.showroomName || "—"}
                    {contractPreview.showroomAddress ? ` · ${contractPreview.showroomAddress}` : ""}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
                    Giá trị hợp đồng
                  </Typography>
                  <Typography variant="body2">Voucher: {contractPreview.voucherCode || "Không áp dụng"}</Typography>
                  <Typography variant="body2">Giá xe gốc: {formatVnd(contractPreview.totalAmount)} VND</Typography>
                  <Typography variant="body2">Giảm giá: {formatVnd(contractPreview.discountAmount)} VND</Typography>
                  <Typography variant="body2" fontWeight={700}>
                    Tổng thanh toán: {formatVnd(contractPreview.finalAmount)} VND
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => printContractAsPdf(contractPreview)}>
                      In / Lưu PDF hợp đồng
                    </Button>
                  </Box>
                </Paper>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {payments.length === 0
                    ? "Chưa có biên lai thanh toán."
                    : "Đã có biên lai thanh toán, xem lịch sử bên dưới."}
                </Typography>
              </Box>
            ) : null}

            {payments.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Lịch sử thanh toán
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Biên lai</TableCell>
                      <TableCell>Hình thức</TableCell>
                      <TableCell>Phương thức</TableCell>
                      <TableCell align="right">Số tiền</TableCell>
                      <TableCell align="right">Công nợ còn lại</TableCell>
                      <TableCell>Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.receiptId || "—"}</TableCell>
                        <TableCell>{p.paymentType || "—"}</TableCell>
                        <TableCell>{p.paymentMethod || "—"}</TableCell>
                        <TableCell align="right">{Number(p.amount || 0).toLocaleString("vi-VN")}</TableCell>
                        <TableCell align="right">{Number(p.remainingDebt || 0).toLocaleString("vi-VN")}</TableCell>
                        <TableCell>{p.status || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : null}
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
}
