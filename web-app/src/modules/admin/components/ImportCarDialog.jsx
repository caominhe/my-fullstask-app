import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Pagination, TextField, Typography } from "@mui/material";

const INVENTORY_LIST_PAGE_SIZE = 5;

export default function ImportCarDialog({
  open,
  onClose,
  vin,
  setVin,
  masterDataId,
  setMasterDataId,
  importMasterMenuSlice,
  importMasterOptions,
  importMdOptionsPage,
  setImportMdOptionsPage,
  engineNumber,
  setEngineNumber,
  color,
  setColor,
  imageInputRef,
  imageMultiInputRef,
  imageFolderInputRef,
  pickImportImage,
  pickImportImages,
  loading,
  uploadingImage,
  pendingImportFiles,
  submitImport,
  setImportFieldErrors,
  setPendingImportFiles,
  importVinFb,
  importMasterFb,
  importEngineFb,
  importColorFb,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nhập xe vào kho tổng</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="VIN (17 ký tự)"
              value={vin}
              {...importVinFb}
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
              {...importMasterFb}
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
              {...importEngineFb}
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
              {...importColorFb}
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
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => pickImportImage(e.target.files?.[0])}
            />
            <input
              ref={imageMultiInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => pickImportImages(e.target.files)}
            />
            <input
              ref={imageFolderInputRef}
              type="file"
              accept="image/*"
              multiple
              webkitdirectory=""
              directory=""
              style={{ display: "none" }}
              onChange={(e) => pickImportImages(e.target.files)}
            />
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button variant="outlined" onClick={() => imageInputRef.current?.click()} disabled={loading || uploadingImage}>
                {uploadingImage ? "Đang upload ảnh..." : "Chọn 1 ảnh từ máy"}
              </Button>
              <Button variant="outlined" onClick={() => imageMultiInputRef.current?.click()} disabled={loading || uploadingImage}>
                {uploadingImage ? "Đang upload..." : "Chọn nhiều ảnh"}
              </Button>
              <Button variant="outlined" onClick={() => imageFolderInputRef.current?.click()} disabled={loading || uploadingImage}>
                {uploadingImage ? "Đang upload..." : "Chọn cả folder ảnh"}
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              {pendingImportFiles.length > 0
                ? `Đã chọn ${pendingImportFiles.length} ảnh. Ảnh sẽ được upload lên Cloudinary khi bấm Lưu.`
                : "Chọn ảnh trước, rồi bấm Lưu để upload lên Cloudinary fcar-images/cars."}
            </Typography>
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
            onClose();
            setImportFieldErrors({});
            setPendingImportFiles([]);
          }}
        >
          Huỷ
        </Button>
        <Button variant="contained" onClick={submitImport} disabled={loading}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
