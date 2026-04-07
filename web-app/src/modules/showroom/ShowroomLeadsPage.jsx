import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
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
import { useAuth } from "../../contexts/AuthContext";
import { ROLES } from "../../constants/roles";
import { portalApi } from "../../services/portalApiService";
import EmptyState from "../../components/ui/EmptyState";

export default function ShowroomLeadsPage() {
  const { user } = useAuth();
  const isAdmin = (user?.roles || []).some((r) => r.name === ROLES.ADMIN);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [leadId, setLeadId] = useState("");
  const [assignSalesId, setAssignSalesId] = useState("");

  const loadLeads = async () => {
    if (!user?.id) return;
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await portalApi.getLeadsBySales(user.id);
      setRows(res?.result || []);
      setMsg({ type: "success", text: "Đã tải danh sách lead phụ trách." });
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi." });
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load when user id available
  }, [user?.id]);

  const assign = async () => {
    if (!leadId || !assignSalesId) return;
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      await portalApi.assignLead(Number(leadId), Number(assignSalesId));
      setMsg({ type: "success", text: "Đã phân công lead." });
      await loadLeads();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi phân công." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        CRM — Khách hàng của tôi
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        GET /leads/sales/{`{salesId}`} · {isAdmin ? "Bạn có quyền Admin — có thể phân công lead." : "Phân công lead: cần quyền Admin hoặc Quản lý."}
      </Typography>
      {msg.text ? (
        <Alert severity={msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      ) : null}

      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={loadLeads} disabled={loading}>
          Làm mới danh sách
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ mb: 3, overflow: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>SĐT</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>NV phụ trách</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ border: 0, p: 0 }}>
                  <EmptyState
                    title="Chưa có khách hàng tiềm năng"
                    description="Bạn chưa có lead được gán. Hãy chờ quản trị phân công hoặc làm mới sau."
                  />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">
                    Đang tải...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.fullName}</TableCell>
                  <TableCell>{r.phone}</TableCell>
                  <TableCell>
                    <Chip size="small" label={r.status || "—"} />
                  </TableCell>
                  <TableCell>{r.assignedSalesId ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {isAdmin ? (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Phân công lead (PUT /leads/{`{leadId}`}/assign/{`{salesId}`})
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Lead ID" value={leadId} onChange={(e) => setLeadId(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Sales ID nhận lead" value={assignSalesId} onChange={(e) => setAssignSalesId(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button variant="contained" onClick={assign} disabled={loading}>
                Phân công
              </Button>
            </Grid>
          </Grid>
        </Paper>
      ) : null}
    </Box>
  );
}
