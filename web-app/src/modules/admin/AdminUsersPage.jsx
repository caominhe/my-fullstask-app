import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { portalApi } from "../../services/portalApiService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [roleCsv, setRoleCsv] = useState("CUSTOMER");

  const load = async () => {
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await portalApi.getUsers();
      setUsers(res?.result || []);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi tải users." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openModal = (u) => {
    setEditId(u.id);
    setRoleCsv((u.roles || []).map((r) => r.name).join(",") || "CUSTOMER");
    setOpen(true);
  };

  const saveRoles = async () => {
    if (!editId) return;
    setLoading(true);
    try {
      const roleNames = roleCsv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await portalApi.updateUserRoles(editId, roleNames);
      setMsg({ type: "success", text: "Đã cập nhật quyền (ADMIN / SALES / CUSTOMER)." });
      setOpen(false);
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Quản trị nhân sự
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        GET /users · PUT /users/{`{id}`}/roles — gán quyền ADMIN, SALES, CUSTOMER (khớp DB).
      </Typography>
      {msg.text ? (
        <Alert severity={msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      ) : null}

      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={load} disabled={loading}>
          Làm mới
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ overflow: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.fullName}</TableCell>
                <TableCell>{(u.roles || []).map((r) => r.name).join(", ") || "—"}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => openModal(u)} aria-label="sửa quyền">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Sửa quyền người dùng #{editId}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            label="Roles (CSV)"
            helperText="VD: ADMIN,SALES hoặc CUSTOMER"
            value={roleCsv}
            onChange={(e) => setRoleCsv(e.target.value.toUpperCase())}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Huỷ</Button>
          <Button variant="contained" onClick={saveRoles} disabled={loading}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
