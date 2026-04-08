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
  MenuItem,
  Pagination,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { portalApi } from "../../services/portalApiService";
import EmptyState from "../../components/ui/EmptyState";
import {
  getInventoryFieldFeedback,
  INV_MAX,
  spreadInventoryFieldFeedback,
  validateBasePrice,
  validateMasterIdSelected,
  validateOptionalMax,
  validateRequiredMax,
  validateShowroomSelected,
  validateVin,
} from "../../utils/inventoryFieldValidation";

/** Số bản ghi tối đa hiển thị mỗi trang cho các danh sách inventory */
const INVENTORY_LIST_PAGE_SIZE = 5;

const CAR_STATUS_LABELS = {
  IN_WAREHOUSE: "Kho tổng",
  AVAILABLE: "Sẵn sàng (đại lý)",
  LOCKED: "Đã khóa (HĐ)",
  SOLD: "Đã bán",
};

export default function AdminInventoryPage() {
  const [cars, setCars] = useState([]);
  const [masterDataList, setMasterDataList] = useState([]);
  const [showroomList, setShowroomList] = useState([]);
  const [allShowrooms, setAllShowrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [setupTab, setSetupTab] = useState(0);

  const [carFilterShowroomId, setCarFilterShowroomId] = useState("");
  const [mdFilterBrand, setMdFilterBrand] = useState("");
  const [mdFilterModel, setMdFilterModel] = useState("");
  const [showroomKeyword, setShowroomKeyword] = useState("");

  const [importOpen, setImportOpen] = useState(false);
  /** Lỗi nhập lô xe theo tên field BE (vin, masterDataId, engineNumber, color) */
  const [importFieldErrors, setImportFieldErrors] = useState({});
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferVin, setTransferVin] = useState("");
  const [transferShowroomName, setTransferShowroomName] = useState("");
  const [transferShowroomOptions, setTransferShowroomOptions] = useState([]);

  const [vin, setVin] = useState("");
  const [masterDataId, setMasterDataId] = useState("");
  const [importMasterOptions, setImportMasterOptions] = useState([]);
  const [engineNumber, setEngineNumber] = useState("");
  const [color, setColor] = useState("");

  const [mdBrand, setMdBrand] = useState("");
  const [mdModel, setMdModel] = useState("");
  const [mdVersion, setMdVersion] = useState("");
  const [mdBasePrice, setMdBasePrice] = useState("");
  const [editingMd, setEditingMd] = useState(null);

  const [srName, setSrName] = useState("");
  const [srAddress, setSrAddress] = useState("");
  const [editingSr, setEditingSr] = useState(null);

  const [mdListPage, setMdListPage] = useState(0);
  const [srListPage, setSrListPage] = useState(0);
  const [carListPage, setCarListPage] = useState(0);
  const [importMdOptionsPage, setImportMdOptionsPage] = useState(0);
  const [transferSrOptionsPage, setTransferSrOptionsPage] = useState(0);

  const fetchCarsByShowroom = async (showroomId) => {
    const res = await portalApi.getCars({
      showroomId: showroomId != null && showroomId !== "" ? Number(showroomId) : undefined,
    });
    setCars(res?.result || []);
    setCarListPage(0);
  };

  const loadCars = async () => {
    await fetchCarsByShowroom(carFilterShowroomId);
  };

  const loadAllShowrooms = async () => {
    const res = await portalApi.getShowrooms();
    setAllShowrooms(res?.result || []);
  };

  const loadMasterData = async () => {
    const res = await portalApi.getMasterData({ brand: mdFilterBrand || undefined, model: mdFilterModel || undefined });
    setMasterDataList(res?.result || []);
    setMdListPage(0);
  };

  const loadShowrooms = async () => {
    const res = await portalApi.getShowrooms(showroomKeyword || undefined);
    setShowroomList(res?.result || []);
    setSrListPage(0);
  };

  const loadAll = async () => {
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      await Promise.all([loadCars(), loadAllShowrooms()]);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi tải dữ liệu." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (setupTab !== 1) return;
    loadMasterData();
    loadShowrooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupTab]);

  const showroomLabelForCar = (c) => {
    if (c.showroomName) return c.showroomName;
    if (c.showroomId != null) {
      const s = allShowrooms.find((x) => x.id === c.showroomId);
      if (s) return s.name;
    }
    return "Kho tổng";
  };

  const importMasterMenuSlice = () => {
    const start = importMdOptionsPage * INVENTORY_LIST_PAGE_SIZE;
    let slice = importMasterOptions.slice(start, start + INVENTORY_LIST_PAGE_SIZE);
    const sel = importMasterOptions.find((m) => String(m.id) === masterDataId);
    if (sel && !slice.some((m) => m.id === sel.id)) {
      slice = [sel, ...slice.filter((m) => m.id !== sel.id).slice(0, INVENTORY_LIST_PAGE_SIZE - 1)];
    }
    return slice;
  };

  const transferShowroomMenuSlice = () => {
    const start = transferSrOptionsPage * INVENTORY_LIST_PAGE_SIZE;
    let slice = transferShowroomOptions.slice(start, start + INVENTORY_LIST_PAGE_SIZE);
    const sel = transferShowroomOptions.find((s) => s.name === transferShowroomName);
    if (sel && !slice.some((s) => s.id === sel.id)) {
      slice = [sel, ...slice.filter((s) => s.id !== sel.id).slice(0, INVENTORY_LIST_PAGE_SIZE - 1)];
    }
    return slice;
  };

  const submitCreateMasterData = async () => {
    setLoading(true);
    try {
      await portalApi.createMasterData({
        brand: mdBrand,
        model: mdModel,
        version: mdVersion,
        basePrice: Number(mdBasePrice),
      });
      setMdBrand("");
      setMdModel("");
      setMdVersion("");
      setMdBasePrice("");
      setMsg({ type: "success", text: "Đã tạo master data." });
      if (setupTab === 1) await loadMasterData();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi tạo master data." });
    } finally {
      setLoading(false);
    }
  };

  const submitCreateShowroom = async () => {
    setLoading(true);
    try {
      await portalApi.createShowroom({ name: srName, address: srAddress || undefined });
      setSrName("");
      setSrAddress("");
      setMsg({ type: "success", text: "Đã tạo showroom." });
      await loadAllShowrooms();
      if (setupTab === 1) await loadShowrooms();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi tạo showroom." });
    } finally {
      setLoading(false);
    }
  };

  const openImportDialog = async () => {
    setVin("");
    setMasterDataId("");
    setEngineNumber("");
    setColor("");
    setImportFieldErrors({});
    setImportMdOptionsPage(0);
    setImportOpen(true);
    try {
      const res = await portalApi.getMasterData({});
      setImportMasterOptions(res?.result || []);
    } catch {
      setImportMasterOptions(masterDataList);
    }
  };

  const submitImport = async () => {
    setImportFieldErrors({});
    setLoading(true);
    try {
      await portalApi.importCar({
        vin: vin.trim(),
        masterDataId: masterDataId ? Number(masterDataId) : null,
        engineNumber: engineNumber.trim(),
        color: color.trim(),
      });
      setMsg({ type: "success", text: "Đã nhập xe mới vào kho tổng." });
      setImportOpen(false);
      setImportFieldErrors({});
      await loadCars();
    } catch (e) {
      if (e.fieldErrors && typeof e.fieldErrors === "object" && Object.keys(e.fieldErrors).length > 0) {
        setImportFieldErrors(e.fieldErrors);
        setMsg({ type: "", text: "" });
      } else if (e.code === 2002) {
        setImportFieldErrors({ vin: e.message });
        setMsg({ type: "", text: "" });
      } else if (e.code === 2003) {
        setImportFieldErrors({ engineNumber: e.message });
        setMsg({ type: "", text: "" });
      } else {
        setMsg({ type: "error", text: e.message || "Lỗi import." });
      }
    } finally {
      setLoading(false);
    }
  };

  const submitTransfer = async () => {
    setLoading(true);
    try {
      await portalApi.transferCar(transferVin, { showroomName: transferShowroomName });
      setMsg({ type: "success", text: "Đã điều chuyển xe." });
      setTransferOpen(false);
      await loadCars();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi transfer." });
    } finally {
      setLoading(false);
    }
  };

  const saveMasterData = async () => {
    if (!editingMd) return;
    setLoading(true);
    try {
      await portalApi.updateMasterData(editingMd.id, editingMd);
      setEditingMd(null);
      setMsg({ type: "success", text: "Đã cập nhật master data." });
      await Promise.all([loadMasterData(), loadCars(), loadAllShowrooms()]);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi cập nhật master data." });
    } finally {
      setLoading(false);
    }
  };

  const removeMasterData = async (id) => {
    setLoading(true);
    try {
      await portalApi.deleteMasterData(id);
      setMsg({ type: "success", text: "Đã xóa master data." });
      await Promise.all([loadMasterData(), loadCars(), loadAllShowrooms()]);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Không thể xóa master data." });
    } finally {
      setLoading(false);
    }
  };

  const saveShowroom = async () => {
    if (!editingSr) return;
    setLoading(true);
    try {
      await portalApi.updateShowroom(editingSr.id, { name: editingSr.name, address: editingSr.address });
      setEditingSr(null);
      setMsg({ type: "success", text: "Đã cập nhật showroom." });
      await Promise.all([loadShowrooms(), loadCars(), loadAllShowrooms()]);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi cập nhật showroom." });
    } finally {
      setLoading(false);
    }
  };

  const removeShowroom = async (id) => {
    setLoading(true);
    try {
      await portalApi.deleteShowroom(id);
      setMsg({ type: "success", text: "Đã xóa showroom." });
      await Promise.all([loadShowrooms(), loadCars(), loadAllShowrooms()]);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Không thể xóa showroom." });
    } finally {
      setLoading(false);
    }
  };

  const emptyFb = { error: false, helperText: "", InputProps: {}, color: null };

  const importVinFb = getInventoryFieldFeedback(importFieldErrors.vin, vin, validateVin);
  const importMasterFb = getInventoryFieldFeedback(importFieldErrors.masterDataId, masterDataId, validateMasterIdSelected);
  const importEngineFb = getInventoryFieldFeedback(importFieldErrors.engineNumber, engineNumber, (v) =>
    validateRequiredMax(v, INV_MAX.engine, "Số máy")
  );
  const importColorFb = getInventoryFieldFeedback(importFieldErrors.color, color, (v) =>
    validateRequiredMax(v, INV_MAX.color, "Màu")
  );

  const createBrandFb = getInventoryFieldFeedback(null, mdBrand, (v) => validateRequiredMax(v, INV_MAX.brand, "Hãng"));
  const createModelFb = getInventoryFieldFeedback(null, mdModel, (v) => validateRequiredMax(v, INV_MAX.model, "Dòng xe"));
  const createVersionFb = getInventoryFieldFeedback(null, mdVersion, (v) => validateRequiredMax(v, INV_MAX.version, "Phiên bản"));
  const createPriceFb = getInventoryFieldFeedback(null, mdBasePrice, validateBasePrice);

  const createSrNameFb = getInventoryFieldFeedback(null, srName, (v) =>
    validateRequiredMax(v, INV_MAX.showroomName, "Tên showroom")
  );
  const createSrAddrFb = getInventoryFieldFeedback(null, srAddress, (v) =>
    validateOptionalMax(v, INV_MAX.address, "Địa chỉ")
  );

  const transferShFb = getInventoryFieldFeedback(null, transferShowroomName, validateShowroomSelected);

  const editMdBrandFb = editingMd
    ? getInventoryFieldFeedback(null, editingMd.brand, (v) => validateRequiredMax(v, INV_MAX.brand, "Hãng"))
    : emptyFb;
  const editMdModelFb = editingMd
    ? getInventoryFieldFeedback(null, editingMd.model, (v) => validateRequiredMax(v, INV_MAX.model, "Dòng xe"))
    : emptyFb;
  const editMdVersionFb = editingMd
    ? getInventoryFieldFeedback(null, editingMd.version, (v) => validateRequiredMax(v, INV_MAX.version, "Phiên bản"))
    : emptyFb;
  const editMdPriceFb = editingMd ? getInventoryFieldFeedback(null, editingMd.basePrice, validateBasePrice) : emptyFb;

  const editSrNameFb = editingSr
    ? getInventoryFieldFeedback(null, editingSr.name, (v) => validateRequiredMax(v, INV_MAX.showroomName, "Tên showroom"))
    : emptyFb;
  const editSrAddrFb = editingSr
    ? getInventoryFieldFeedback(null, editingSr.address ?? "", (v) => validateOptionalMax(v, INV_MAX.address, "Địa chỉ"))
    : emptyFb;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Quản lý kho tổng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tab Tạo / Tìm cho master data &amp; showroom · Bảng xe nhập lô lọc theo đại lý
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" onClick={loadAll} disabled={loading}>
            Làm mới
          </Button>
          <Button variant="contained" onClick={openImportDialog}>
            + Nhập lô xe mới
          </Button>
        </Box>
      </Box>

      {msg.text ? <Alert severity={msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>{msg.text}</Alert> : null}

      <Paper variant="outlined" sx={{ mb: 2, overflow: "hidden" }}>
        <Tabs
          value={setupTab}
          onChange={(_, v) => setSetupTab(v)}
          sx={{ borderBottom: 1, borderColor: "divider", px: 1 }}
        >
          <Tab label="Tạo" />
          <Tab label="Tìm" />
        </Tabs>

        {setupTab === 0 ? (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Tạo master data
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Brand"
                      value={mdBrand}
                      {...spreadInventoryFieldFeedback(createBrandFb)}
                      onChange={(e) => setMdBrand(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Model"
                      value={mdModel}
                      {...spreadInventoryFieldFeedback(createModelFb)}
                      onChange={(e) => setMdModel(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Version"
                      value={mdVersion}
                      {...spreadInventoryFieldFeedback(createVersionFb)}
                      onChange={(e) => setMdVersion(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Base price"
                      value={mdBasePrice}
                      {...spreadInventoryFieldFeedback(createPriceFb)}
                      onChange={(e) => setMdBasePrice(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" onClick={submitCreateMasterData} disabled={loading || !mdBrand || !mdModel || !mdVersion || !mdBasePrice}>
                      Tạo master data
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Tạo showroom
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Tên showroom"
                      value={srName}
                      {...spreadInventoryFieldFeedback(createSrNameFb)}
                      onChange={(e) => setSrName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Địa chỉ"
                      value={srAddress}
                      {...spreadInventoryFieldFeedback(createSrAddrFb)}
                      onChange={(e) => setSrAddress(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" onClick={submitCreateShowroom} disabled={loading || !srName}>
                      Tạo showroom
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Tìm &amp; quản lý master data
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                  <TextField size="small" label="Brand" value={mdFilterBrand} onChange={(e) => setMdFilterBrand(e.target.value)} />
                  <TextField size="small" label="Model" value={mdFilterModel} onChange={(e) => setMdFilterModel(e.target.value)} />
                  <Button variant="outlined" onClick={loadMasterData} disabled={loading}>
                    Tìm
                  </Button>
                </Box>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Master data</TableCell>
                        <TableCell align="right">Tác vụ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {masterDataList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Typography variant="body2" color="text.secondary">Chưa có kết quả — nhấn «Tìm» (có thể để trống để xem tất cả).</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        masterDataList
                          .slice(mdListPage * INVENTORY_LIST_PAGE_SIZE, mdListPage * INVENTORY_LIST_PAGE_SIZE + INVENTORY_LIST_PAGE_SIZE)
                          .map((m) => (
                            <TableRow key={m.id}>
                              <TableCell>{m.id}</TableCell>
                              <TableCell>{m.brand} {m.model} {m.version}</TableCell>
                              <TableCell align="right">
                                <Button size="small" onClick={() => setEditingMd({ ...m })}>Sửa</Button>
                                <Button size="small" color="error" onClick={() => removeMasterData(m.id)}>Xóa</Button>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                  {masterDataList.length > 0 ? (
                    <TablePagination
                      component="div"
                      count={masterDataList.length}
                      page={mdListPage}
                      onPageChange={(_, p) => setMdListPage(p)}
                      rowsPerPage={INVENTORY_LIST_PAGE_SIZE}
                      rowsPerPageOptions={[INVENTORY_LIST_PAGE_SIZE]}
                      labelRowsPerPage="Số dòng"
                      labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                    />
                  ) : null}
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Tìm &amp; quản lý showroom
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                  <TextField size="small" label="Từ khóa tên" value={showroomKeyword} onChange={(e) => setShowroomKeyword(e.target.value)} />
                  <Button variant="outlined" onClick={loadShowrooms} disabled={loading}>
                    Tìm
                  </Button>
                </Box>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Showroom</TableCell>
                        <TableCell align="right">Tác vụ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {showroomList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Typography variant="body2" color="text.secondary">Chưa có kết quả — nhấn «Tìm».</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        showroomList
                          .slice(srListPage * INVENTORY_LIST_PAGE_SIZE, srListPage * INVENTORY_LIST_PAGE_SIZE + INVENTORY_LIST_PAGE_SIZE)
                          .map((s) => (
                            <TableRow key={s.id}>
                              <TableCell>{s.id}</TableCell>
                              <TableCell>{s.name}</TableCell>
                              <TableCell align="right">
                                <Button size="small" onClick={() => setEditingSr({ ...s })}>Sửa</Button>
                                <Button size="small" color="error" onClick={() => removeShowroom(s.id)}>Xóa</Button>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                  {showroomList.length > 0 ? (
                    <TablePagination
                      component="div"
                      count={showroomList.length}
                      page={srListPage}
                      onPageChange={(_, p) => setSrListPage(p)}
                      rowsPerPage={INVENTORY_LIST_PAGE_SIZE}
                      rowsPerPageOptions={[INVENTORY_LIST_PAGE_SIZE]}
                      labelRowsPerPage="Số dòng"
                      labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                    />
                  ) : null}
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

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
              <TableRow><TableCell colSpan={6}><Typography variant="body2" color="text.secondary">Đang tải danh sách...</Typography></TableCell></TableRow>
            ) : cars.length === 0 ? (
              <TableRow><TableCell colSpan={6} sx={{ border: 0, p: 0 }}><EmptyState title="Không có xe phù hợp" description="Đổi bộ lọc showroom hoặc nhấn «Nhập lô xe mới»." /></TableCell></TableRow>
            ) : (
              cars
                .slice(carListPage * INVENTORY_LIST_PAGE_SIZE, carListPage * INVENTORY_LIST_PAGE_SIZE + INVENTORY_LIST_PAGE_SIZE)
                .map((c) => (
                  <TableRow key={c.vin} hover>
                    <TableCell sx={{ fontFamily: "monospace" }}>{c.vin}</TableCell>
                    <TableCell>{[c.brand, c.model, c.version].filter(Boolean).join(" ")}</TableCell>
                    <TableCell>{showroomLabelForCar(c)}</TableCell>
                    <TableCell>{CAR_STATUS_LABELS[c.status] || c.status}</TableCell>
                    <TableCell align="right">{c.basePrice != null ? Number(c.basePrice).toLocaleString("vi-VN") : "—"}</TableCell>
                    <TableCell align="right">
                      {c.status === "IN_WAREHOUSE" ? (
                        <Button
                          size="small"
                          onClick={async () => {
                            setTransferVin(c.vin);
                            setTransferShowroomName("");
                            setTransferSrOptionsPage(0);
                            setTransferOpen(true);
                            try {
                              const res = await portalApi.getShowrooms();
                              setTransferShowroomOptions(res?.result || []);
                            } catch {
                              setTransferShowroomOptions(allShowrooms);
                            }
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

      <Dialog
        open={importOpen}
        onClose={() => {
          setImportOpen(false);
          setImportFieldErrors({});
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Nhập xe vào kho tổng</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="VIN (17 ký tự)"
                value={vin}
                {...spreadInventoryFieldFeedback(importVinFb)}
                onChange={(e) => {
                  setVin(e.target.value.toUpperCase());
                  setImportFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.vin;
                    return next;
                  });
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Dòng xe (Master data)"
                value={masterDataId}
                {...spreadInventoryFieldFeedback(importMasterFb)}
                onChange={(e) => {
                  setMasterDataId(e.target.value);
                  setImportFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.masterDataId;
                    return next;
                  });
                }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">
                  <em>— Chọn dòng xe —</em>
                </MenuItem>
                {importMasterMenuSlice().map((m) => (
                  <MenuItem key={m.id} value={String(m.id)}>
                    #{m.id} · {m.brand} {m.model} {m.version} · {m.basePrice != null ? Number(m.basePrice).toLocaleString("vi-VN") : "—"} ₫
                  </MenuItem>
                ))}
              </TextField>
              {importMasterOptions.length > INVENTORY_LIST_PAGE_SIZE ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                  <Pagination
                    size="small"
                    color="primary"
                    page={importMdOptionsPage + 1}
                    count={Math.ceil(importMasterOptions.length / INVENTORY_LIST_PAGE_SIZE)}
                    onChange={(_, p) => setImportMdOptionsPage(p - 1)}
                  />
                </Box>
              ) : null}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số máy"
                value={engineNumber}
                {...spreadInventoryFieldFeedback(importEngineFb)}
                onChange={(e) => {
                  setEngineNumber(e.target.value);
                  setImportFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.engineNumber;
                    return next;
                  });
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Màu"
                value={color}
                {...spreadInventoryFieldFeedback(importColorFb)}
                onChange={(e) => {
                  setColor(e.target.value);
                  setImportFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.color;
                    return next;
                  });
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Gán showroom sau khi nhập xe bằng «Điều chuyển đại lý».
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setImportOpen(false);
              setImportFieldErrors({});
            }}
          >
            Huỷ
          </Button>
          <Button variant="contained" onClick={submitImport} disabled={loading}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={transferOpen} onClose={() => setTransferOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Điều chuyển {transferVin}</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="dense"
            label="Showroom đích"
            value={transferShowroomName}
            {...spreadInventoryFieldFeedback(transferShFb)}
            onChange={(e) => setTransferShowroomName(e.target.value)}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="">
              <em>— Chọn showroom —</em>
            </MenuItem>
            {transferShowroomMenuSlice().map((s) => (
              <MenuItem key={s.id} value={s.name}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
          {transferShowroomOptions.length > INVENTORY_LIST_PAGE_SIZE ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
              <Pagination
                size="small"
                color="primary"
                page={transferSrOptionsPage + 1}
                count={Math.ceil(transferShowroomOptions.length / INVENTORY_LIST_PAGE_SIZE)}
                onChange={(_, p) => setTransferSrOptionsPage(p - 1)}
              />
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferOpen(false)}>Huỷ</Button>
          <Button variant="contained" onClick={submitTransfer} disabled={loading || !transferShowroomName}>
            Chuyển
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editingMd} onClose={() => setEditingMd(null)} fullWidth maxWidth="sm">
        <DialogTitle>Sửa Master Data</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Brand"
                value={editingMd?.brand || ""}
                {...spreadInventoryFieldFeedback(editMdBrandFb)}
                onChange={(e) => setEditingMd((p) => ({ ...p, brand: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Model"
                value={editingMd?.model || ""}
                {...spreadInventoryFieldFeedback(editMdModelFb)}
                onChange={(e) => setEditingMd((p) => ({ ...p, model: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Version"
                value={editingMd?.version || ""}
                {...spreadInventoryFieldFeedback(editMdVersionFb)}
                onChange={(e) => setEditingMd((p) => ({ ...p, version: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Base price"
                value={editingMd?.basePrice ?? ""}
                {...spreadInventoryFieldFeedback(editMdPriceFb)}
                onChange={(e) => setEditingMd((p) => ({ ...p, basePrice: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions><Button onClick={() => setEditingMd(null)}>Huỷ</Button><Button variant="contained" onClick={saveMasterData} disabled={loading}>Lưu</Button></DialogActions>
      </Dialog>

      <Dialog open={!!editingSr} onClose={() => setEditingSr(null)} fullWidth maxWidth="sm">
        <DialogTitle>Sửa Showroom</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên showroom"
                value={editingSr?.name || ""}
                {...spreadInventoryFieldFeedback(editSrNameFb)}
                onChange={(e) => setEditingSr((p) => ({ ...p, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                value={editingSr?.address || ""}
                {...spreadInventoryFieldFeedback(editSrAddrFb)}
                onChange={(e) => setEditingSr((p) => ({ ...p, address: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions><Button onClick={() => setEditingSr(null)}>Huỷ</Button><Button variant="contained" onClick={saveShowroom} disabled={loading}>Lưu</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
