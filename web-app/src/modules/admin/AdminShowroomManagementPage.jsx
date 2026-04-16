import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
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

const CAR_STATUS_LABELS = {
  IN_WAREHOUSE: "Kho tổng",
  AVAILABLE: "Sẵn sàng",
  LOCKED: "Đã khóa",
  SOLD: "Đã bán",
};

export default function AdminShowroomManagementPage() {
  const [showrooms, setShowrooms] = useState([]);
  const [selectedShowroomId, setSelectedShowroomId] = useState("");
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const promotionTargetLabel = (p) => {
    if (!p) return "—";
    if (p.targetScope === "ALL") return "Tất cả";
    if (p.targetScope === "REGION") return `Khu vực: ${p.targetRegion || "—"}`;
    if (p.targetScope === "PROVINCE") return `Địa điểm: ${p.targetProvince || "—"}`;
    return `Chi nhánh: ${p.targetShowroomName || p.targetShowroomId || "—"}`;
  };

  const loadShowrooms = async () => {
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await portalApi.getShowrooms();
      const list = res?.result || [];
      setShowrooms(list);
      if (!selectedShowroomId && list.length > 0) {
        setSelectedShowroomId(String(list[0].id));
      }
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Không tải được danh sách showroom." });
    } finally {
      setLoading(false);
    }
  };

  const loadOverview = async (showroomId) => {
    if (!showroomId) return;
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await portalApi.getShowroomManagement(showroomId);
      setOverview(res?.result || null);
    } catch (e) {
      setOverview(null);
      setMsg({ type: "error", text: e.message || "Không tải được dữ liệu quản lí showroom." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShowrooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedShowroomId) return;
    loadOverview(selectedShowroomId);
  }, [selectedShowroomId]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Quản lí showroom
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Chọn showroom để xem thông tin showroom, danh sách xe và chương trình khuyến mãi.
      </Typography>

      {msg.text ? (
        <Alert severity={msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      ) : null}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Showroom"
              value={selectedShowroomId}
              onChange={(e) => setSelectedShowroomId(e.target.value)}
            >
              {showrooms.map((s) => (
                <MenuItem key={s.id} value={String(s.id)}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md="auto">
            <Button variant="outlined" onClick={() => loadOverview(selectedShowroomId)} disabled={loading || !selectedShowroomId}>
              Làm mới dữ liệu
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {overview ? (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                1) Thông tin showroom
              </Typography>
              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Tên showroom" value={overview.showroom?.name || ""} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} md={8}>
                  <TextField fullWidth label="Địa chỉ" value={overview.showroom?.address || ""} InputProps={{ readOnly: true }} />
                </Grid>
              </Grid>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID User</TableCell>
                    <TableCell>Tài khoản</TableCell>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>SĐT</TableCell>
                    <TableCell>Vai trò</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(overview.users || []).map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.id}</TableCell>
                      <TableCell>{u.email || "—"}</TableCell>
                      <TableCell>{u.fullName || "—"}</TableCell>
                      <TableCell>{u.phone || "—"}</TableCell>
                      <TableCell>{(u.roles || []).map((r) => r.name).join(", ") || "—"}</TableCell>
                    </TableRow>
                  ))}
                  {(overview.users || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ color: "text.secondary" }}>
                        Chưa có user được gán showroom này.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                2) Danh sách xe của showroom
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>VIN</TableCell>
                    <TableCell>Tên xe</TableCell>
                    <TableCell>Màu</TableCell>
                    <TableCell>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(overview.cars || []).map((car) => (
                    <TableRow key={car.vin}>
                      <TableCell>{car.vin}</TableCell>
                      <TableCell>{[car.brand, car.model, car.version].filter(Boolean).join(" ") || "—"}</TableCell>
                      <TableCell>{car.color || "—"}</TableCell>
                      <TableCell>{CAR_STATUS_LABELS[car.status] || car.status || "—"}</TableCell>
                    </TableRow>
                  ))}
                  {(overview.cars || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ color: "text.secondary" }}>
                        Showroom này hiện chưa có xe.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                3) Chương trình khuyến mãi
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID campaign</TableCell>
                    <TableCell>Tên chiến dịch</TableCell>
                    <TableCell>Phạm vi</TableCell>
                    <TableCell align="right">Voucher tổng</TableCell>
                    <TableCell align="right">ACTIVE</TableCell>
                    <TableCell align="right">CLAIMED</TableCell>
                    <TableCell align="right">USED</TableCell>
                    <TableCell align="right">EXPIRED</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(overview.promotions || []).map((promotion) => (
                    <TableRow key={promotion.campaignId}>
                      <TableCell>{promotion.campaignId}</TableCell>
                      <TableCell>{promotion.campaignName || "—"}</TableCell>
                      <TableCell>{promotionTargetLabel(promotion)}</TableCell>
                      <TableCell align="right">{promotion.totalVouchers ?? 0}</TableCell>
                      <TableCell align="right">{promotion.activeVouchers ?? 0}</TableCell>
                      <TableCell align="right">{promotion.claimedVouchers ?? 0}</TableCell>
                      <TableCell align="right">{promotion.usedVouchers ?? 0}</TableCell>
                      <TableCell align="right">{promotion.expiredVouchers ?? 0}</TableCell>
                    </TableRow>
                  ))}
                  {(overview.promotions || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ color: "text.secondary" }}>
                        Showroom này chưa có chương trình khuyến mãi.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
}
