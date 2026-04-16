import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Pagination, TextField, Typography } from "@mui/material";
import { useInventory } from "./hooks/useInventory";
import CarListTable from "./components/CarListTable";
import EditCarDialog from "./components/EditCarDialog";
import ImportCarDialog from "./components/ImportCarDialog";
import InventorySetupPanel from "./components/InventorySetupPanel";
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
  /** Lỗi nhập lô xe theo tên field BE (vin, masterDataId, engineNumber, color) */
  const {
    cars,
    masterDataList,
    showroomList,
    allShowrooms,
    loading,
    setLoading,
    msg,
    setMsg,
    setupTab,
    setSetupTab,
    carFilterShowroomId,
    setCarFilterShowroomId,
    mdFilterBrand,
    setMdFilterBrand,
    mdFilterModel,
    setMdFilterModel,
    showroomKeyword,
    setShowroomKeyword,
    importOpen,
    setImportOpen,
    importFieldErrors,
    setImportFieldErrors,
    transferOpen,
    setTransferOpen,
    transferVin,
    transferShowroomName,
    setTransferShowroomName,
    transferShowroomOptions,
    vin,
    setVin,
    masterDataId,
    setMasterDataId,
    importMasterOptions,
    engineNumber,
    setEngineNumber,
    color,
    setColor,
    uploadingImage,
    pendingImportFiles,
    setPendingImportFiles,
    imageInputRef,
    imageMultiInputRef,
    imageFolderInputRef,
    editingCar,
    setEditingCar,
    uploadingCarEditImages,
    pendingEditFiles,
    setPendingEditFiles,
    editImageInputRef,
    editImagesInputRef,
    mdBrand,
    setMdBrand,
    mdModel,
    setMdModel,
    mdVersion,
    setMdVersion,
    mdBasePrice,
    setMdBasePrice,
    editingMd,
    setEditingMd,
    srName,
    setSrName,
    srAddress,
    setSrAddress,
    editingSr,
    setEditingSr,
    mdListPage,
    setMdListPage,
    srListPage,
    setSrListPage,
    carListPage,
    setCarListPage,
    importMdOptionsPage,
    setImportMdOptionsPage,
    transferSrOptionsPage,
    setTransferSrOptionsPage,
    fetchCarsByShowroom,
    loadCars,
    loadMasterData,
    loadShowrooms,
    loadAll,
    showroomLabelForCar,
    importMasterMenuSlice,
    transferShowroomMenuSlice,
    submitCreateMasterData,
    submitCreateShowroom,
    openImportDialog,
    submitImport,
    pickImportImage,
    pickImportImages,
    normalizeCarImages,
    removeEditingCarImage,
    setPrimaryEditingCarImage,
    submitTransfer,
    saveCarUpdate,
    pickCarEditImage,
    pickCarEditImages,
    saveMasterData,
    removeMasterData,
    saveShowroom,
    removeShowroom,
    openTransferDialogForVin,
  } = useInventory();

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

  const openEditCarDialog = (car) => {
    setPendingEditFiles([]);
    setEditingCar({
      vin: car.vin,
      listedPrice: car.listedPrice ?? car.basePrice ?? "",
      imageUrl: car.imageUrl || "",
      imageUrls: normalizeCarImages(car),
    });
  };

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

      <InventorySetupPanel
        loading={loading}
        setupTab={setupTab}
        setSetupTab={setSetupTab}
        mdBrand={mdBrand}
        setMdBrand={setMdBrand}
        mdModel={mdModel}
        setMdModel={setMdModel}
        mdVersion={mdVersion}
        setMdVersion={setMdVersion}
        mdBasePrice={mdBasePrice}
        setMdBasePrice={setMdBasePrice}
        srName={srName}
        setSrName={setSrName}
        srAddress={srAddress}
        setSrAddress={setSrAddress}
        createBrandFb={spreadInventoryFieldFeedback(createBrandFb)}
        createModelFb={spreadInventoryFieldFeedback(createModelFb)}
        createVersionFb={spreadInventoryFieldFeedback(createVersionFb)}
        createPriceFb={spreadInventoryFieldFeedback(createPriceFb)}
        createSrNameFb={spreadInventoryFieldFeedback(createSrNameFb)}
        createSrAddrFb={spreadInventoryFieldFeedback(createSrAddrFb)}
        submitCreateMasterData={submitCreateMasterData}
        submitCreateShowroom={submitCreateShowroom}
        mdFilterBrand={mdFilterBrand}
        setMdFilterBrand={setMdFilterBrand}
        mdFilterModel={mdFilterModel}
        setMdFilterModel={setMdFilterModel}
        showroomKeyword={showroomKeyword}
        setShowroomKeyword={setShowroomKeyword}
        loadMasterData={loadMasterData}
        loadShowrooms={loadShowrooms}
        masterDataList={masterDataList}
        mdListPage={mdListPage}
        setMdListPage={setMdListPage}
        showroomList={showroomList}
        srListPage={srListPage}
        setSrListPage={setSrListPage}
        setEditingMd={setEditingMd}
        removeMasterData={removeMasterData}
        setEditingSr={setEditingSr}
        removeShowroom={removeShowroom}
      />

      <CarListTable
        allShowrooms={allShowrooms}
        carFilterShowroomId={carFilterShowroomId}
        setCarFilterShowroomId={setCarFilterShowroomId}
        loading={loading}
        fetchCarsByShowroom={fetchCarsByShowroom}
        setLoading={setLoading}
        setMsg={setMsg}
        loadCars={loadCars}
        cars={cars}
        carListPage={carListPage}
        setCarListPage={setCarListPage}
        showroomLabelForCar={showroomLabelForCar}
        carStatusLabels={CAR_STATUS_LABELS}
        onEditCar={openEditCarDialog}
        onTransferCar={openTransferDialogForVin}
      />

      <ImportCarDialog
        open={importOpen}
        onClose={() => {
          setImportOpen(false);
          setImportFieldErrors({});
        }}
        vin={vin}
        setVin={setVin}
        masterDataId={masterDataId}
        setMasterDataId={setMasterDataId}
        importMasterMenuSlice={importMasterMenuSlice}
        importMasterOptions={importMasterOptions}
        importMdOptionsPage={importMdOptionsPage}
        setImportMdOptionsPage={setImportMdOptionsPage}
        engineNumber={engineNumber}
        setEngineNumber={setEngineNumber}
        color={color}
        setColor={setColor}
        imageInputRef={imageInputRef}
        imageMultiInputRef={imageMultiInputRef}
        imageFolderInputRef={imageFolderInputRef}
        pickImportImage={pickImportImage}
        pickImportImages={pickImportImages}
        loading={loading}
        uploadingImage={uploadingImage}
        pendingImportFiles={pendingImportFiles}
        submitImport={submitImport}
        setImportFieldErrors={setImportFieldErrors}
        setPendingImportFiles={setPendingImportFiles}
        importVinFb={spreadInventoryFieldFeedback(importVinFb)}
        importMasterFb={spreadInventoryFieldFeedback(importMasterFb)}
        importEngineFb={spreadInventoryFieldFeedback(importEngineFb)}
        importColorFb={spreadInventoryFieldFeedback(importColorFb)}
      />

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

      <EditCarDialog
        editingCar={editingCar}
        setEditingCar={setEditingCar}
        editImageInputRef={editImageInputRef}
        editImagesInputRef={editImagesInputRef}
        pickCarEditImage={pickCarEditImage}
        pickCarEditImages={pickCarEditImages}
        loading={loading}
        uploadingCarEditImages={uploadingCarEditImages}
        pendingEditFiles={pendingEditFiles}
        setPrimaryEditingCarImage={setPrimaryEditingCarImage}
        removeEditingCarImage={removeEditingCarImage}
        saveCarUpdate={saveCarUpdate}
        setPendingEditFiles={setPendingEditFiles}
      />

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
