import {
  Box,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import EmptyState from "../../../components/ui/EmptyState";

const INVENTORY_LIST_PAGE_SIZE = 5;

export default function CarListTable({
  allShowrooms,
  carFilterShowroomId,
  setCarFilterShowroomId,
  loading,
  fetchCarsByShowroom,
  setLoading,
  setMsg,
  loadCars,
  cars,
  carListPage,
  setCarListPage,
  showroomLabelForCar,
  carStatusLabels,
  onEditCar,
  onTransferCar,
}) {
  return (
    <>
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Xe nhập lô
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Lọc theo showroom để chỉ xem xe đang thuộc đại lý đó; để trống để xem toàn bộ.
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            select
            size="small"
            label="Showroom"
            value={carFilterShowroomId}
            onChange={async (e) => {
              const v = e.target.value;
              setCarFilterShowroomId(v);
              setLoading(true);
              try {
                await fetchCarsByShowroom(v);
              } catch (err) {
                setMsg({ type: "error", text: err.message || "Lỗi tải danh sách xe." });
              } finally {
                setLoading(false);
              }
            }}
            sx={{ minWidth: 260 }}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="">
              <em>Tất cả showroom</em>
            </MenuItem>
            {allShowrooms.map((s) => (
              <MenuItem key={s.id} value={String(s.id)}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" onClick={loadCars} disabled={loading}>
            Áp dụng lọc
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} variant="outlined">
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
                  <EmptyState title="Không có xe phù hợp" description="Đổi bộ lọc showroom hoặc nhấn «Nhập lô xe mới»." />
                </TableCell>
              </TableRow>
            ) : (
              cars
                .slice(carListPage * INVENTORY_LIST_PAGE_SIZE, carListPage * INVENTORY_LIST_PAGE_SIZE + INVENTORY_LIST_PAGE_SIZE)
                .map((c) => (
                  <TableRow key={c.vin} hover>
                    <TableCell sx={{ fontFamily: "monospace" }}>{c.vin}</TableCell>
                    <TableCell>{[c.brand, c.model, c.version].filter(Boolean).join(" ")}</TableCell>
                    <TableCell>{showroomLabelForCar(c)}</TableCell>
                    <TableCell>{carStatusLabels[c.status] || c.status}</TableCell>
                    <TableCell align="right">{c.basePrice != null ? Number(c.basePrice).toLocaleString("vi-VN") : "—"}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => onEditCar(c)}>
                        Sửa xe
                      </Button>
                      {c.status === "IN_WAREHOUSE" ? (
                        <Button size="small" onClick={() => onTransferCar(c.vin)}>
                          Điều chuyển đại lý
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        {cars.length > 0 ? (
          <TablePagination
            component="div"
            count={cars.length}
            page={carListPage}
            onPageChange={(_, p) => setCarListPage(p)}
            rowsPerPage={INVENTORY_LIST_PAGE_SIZE}
            rowsPerPageOptions={[INVENTORY_LIST_PAGE_SIZE]}
            labelRowsPerPage="Số dòng"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          />
        ) : null}
      </TableContainer>
    </>
  );
}
