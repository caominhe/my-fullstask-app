import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { portalApi } from "../../services/portalApiService";
import { ROLES } from "../../constants/roles";

const ROLE_OPTIONS = [ROLES.ADMIN, ROLES.SHOWROOM, ROLES.CUSTOMER];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([ROLES.CUSTOMER]);
  const [selectedShowroomId, setSelectedShowroomId] = useState("");

  const load = async () => {
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const [usersRes, showroomsRes] = await Promise.all([portalApi.getUsers(), portalApi.getShowrooms()]);
      setUsers(usersRes?.result || []);
      setShowrooms(showroomsRes?.result || []);
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
    const roleNames = (u.roles || []).map((r) => r.name);
    setSelectedRoles(roleNames.length ? roleNames : [ROLES.CUSTOMER]);
    setSelectedShowroomId(u.showroomId != null ? String(u.showroomId) : "");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditId(null);
    setSelectedRoles([ROLES.CUSTOMER]);
    setSelectedShowroomId("");
  };

  const hasShowroomRole = selectedRoles.includes(ROLES.SHOWROOM);

  const saveRoles = async () => {
    if (!editId) return;
    if (selectedRoles.length === 0) {
      setMsg({ type: "error", text: "Vui lòng chọn ít nhất 1 vai trò." });
      return;
    }
    if (hasShowroomRole && !selectedShowroomId) {
      setMsg({ type: "error", text: "Role SHOWROOM bắt buộc chọn showroom quản lý." });
      return;
    }
    setLoading(true);
    try {
      await portalApi.updateUserRoles(editId, selectedRoles, hasShowroomRole ? Number(selectedShowroomId) : null);
      setMsg({ type: "success", text: "Đã cập nhật quyền (ADMIN / SHOWROOM / CUSTOMER)." });
      closeModal();
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi." });
    } finally {
      setLoading(false);
    }
  };

  const showroomNameById = (showroomId) => {
    if (showroomId == null) return "—";
    const showroom = showrooms.find((s) => s.id === showroomId);
    return showroom ? showroom.name : `Showroom #${showroomId}`;
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Quản trị nhân sự
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        GET /users · PUT /users/{`{id}`}/roles — chọn role bằng UI, nếu có SHOWROOM thì phải chọn showroom.
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
              <TableCell>Showroom quản lý</TableCell>
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
                <TableCell>{showroomNameById(u.showroomId)}</TableCell>
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

      <Dialog open={open} onClose={closeModal} fullWidth maxWidth="sm">
        <DialogTitle>Sửa quyền người dùng #{editId}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel id="roles-select-label">Vai trò</InputLabel>
            <Select
              labelId="roles-select-label"
              multiple
              value={selectedRoles}
              label="Vai trò"
              onChange={(e) => setSelectedRoles(e.target.value)}
            >
              {ROLE_OPTIONS.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {hasShowroomRole ? (
            <FormControl fullWidth margin="dense">
              <InputLabel id="showroom-select-label">Showroom quản lý</InputLabel>
              <Select
                labelId="showroom-select-label"
                value={selectedShowroomId}
                label="Showroom quản lý"
                onChange={(e) => setSelectedShowroomId(e.target.value)}
              >
                {showrooms.map((s) => (
                  <MenuItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Huỷ</Button>
          <Button variant="contained" onClick={saveRoles} disabled={loading}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
