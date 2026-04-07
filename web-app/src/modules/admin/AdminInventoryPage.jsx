import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import EmptyState from "../../components/ui/EmptyState";

export default function AdminInventoryPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [importOpen, setImportOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferVin, setTransferVin] = useState("");

  const [vin, setVin] = useState("");
  const [masterDataId, setMasterDataId] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [color, setColor] = useState("");
  const [showroomId, setShowroomId] = useState("");
  const [toShowroomId, setToShowroomId] = useState("");

  const load = async () => {
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await portalApi.getCars();
      setCars(res?.result || []);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitImport = async () => {
    setLoading(true);
    try {
      await portalApi.importCar({
        vin,
        masterDataId: Number(masterDataId),
        engineNumber,
        color,
        showroomId: showroomId ? Number(showroomId) : undefined,
      });
      setMsg({ type: "success", text: "Đã nhập xe mới vào kho tổng." });
      setImportOpen(false);
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi import." });
    } finally {
      setLoading(false);
    }
  };

  const submitTransfer = async () => {
    setLoading(true);
    try {
      await portalApi.transferCar(transferVin, Number(toShowroomId));
      setMsg({ type: "success", text: "Đã điều chuyển xe." });
      setTransferOpen(false);
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Quản lý kho tổng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            GET /cars · POST /cars/import · PUT /cars/{`{vin}`}/transfer
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" onClick={load} disabled={loading}>
            Làm mới
          </Button>
          <Button variant="contained" onClick={() => setImportOpen(true)}>
            + Nhập lô xe mới
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        Ảnh xe trên web (Cloudinary) sẽ nối khi BE có POST /files/upload — hiện nhập VIN &amp; master data theo form.
      </Alert>

      {msg.text ? (
        <Alert severity={msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      ) : null}

      <Paper variant="outlined" sx={{ overflow: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>VIN</TableCell>
              <TableCell>Xe</TableCell>
              <TableCell>Showroom</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Giá</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cars.length === 0 && loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary">
                    Đang tải danh sách...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : cars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ border: 0, p: 0 }}>
                  <EmptyState
                    title="Chưa có xe trong hệ thống"
                    description="Nhấn «Nhập lô xe mới» để thêm VIN từ kho tổng hoặc đồng bộ dữ liệu."
                  />
                </TableCell>
              </TableRow>
            ) : (
              cars.map((c) => (
                <TableRow key={c.vin} hover>
                  <TableCell sx={{ fontFamily: "monospace" }}>{c.vin}</TableCell>
                  <TableCell>{[c.brand, c.model, c.version].filter(Boolean).join(" ")}</TableCell>
                  <TableCell>{c.showroomId ?? "—"}</TableCell>
                  <TableCell>{c.status}</TableCell>
                  <TableCell align="right">{c.basePrice != null ? Number(c.basePrice).toLocaleString("vi-VN") : "—"}</TableCell>
                  <TableCell align="right">
                    {c.status === "IN_WAREHOUSE" ? (
                      <Button
                        size="small"
                        onClick={() => {
                          setTransferVin(c.vin);
                          setToShowroomId("");
                          setTransferOpen(true);
                        }}
                      >
                        Điều chuyển đại lý
                      </Button>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={importOpen} onClose={() => setImportOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nhập xe vào kho tổng</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="VIN" value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Master data ID" value={masterDataId} onChange={(e) => setMasterDataId(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Số máy" value={engineNumber} onChange={(e) => setEngineNumber(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Màu" value={color} onChange={(e) => setColor(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Showroom ID (tuỳ chọn)" value={showroomId} onChange={(e) => setShowroomId(e.target.value)} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)}>Huỷ</Button>
          <Button variant="contained" onClick={submitImport} disabled={loading}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={transferOpen} onClose={() => setTransferOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Điều chuyển {transferVin}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="ID Showroom đích"
            value={toShowroomId}
            onChange={(e) => setToShowroomId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferOpen(false)}>Huỷ</Button>
          <Button variant="contained" onClick={submitTransfer} disabled={loading}>
            Chuyển
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
