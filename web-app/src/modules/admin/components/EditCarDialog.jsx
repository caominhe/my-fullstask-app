import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from "@mui/material";

export default function EditCarDialog({
  editingCar,
  setEditingCar,
  editImageInputRef,
  editImagesInputRef,
  pickCarEditImage,
  pickCarEditImages,
  loading,
  uploadingCarEditImages,
  pendingEditFiles,
  setPrimaryEditingCarImage,
  removeEditingCarImage,
  saveCarUpdate,
  setPendingEditFiles,
}) {
  return (
    <Dialog open={!!editingCar} onClose={() => setEditingCar(null)} fullWidth maxWidth="sm">
      <DialogTitle>Cập nhật xe {editingCar?.vin || ""}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Giá xe"
              value={editingCar?.listedPrice ?? ""}
              onChange={(e) => setEditingCar((prev) => ({ ...prev, listedPrice: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Ảnh hiện có của xe
            </Typography>
            {Array.isArray(editingCar?.imageUrls) && editingCar.imageUrls.length > 0 ? (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {editingCar.imageUrls.map((img, idx) => (
                  <Box key={img} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 0.5 }}>
                    <Box component="img" src={img} alt={`car-${idx}`} sx={{ width: 88, height: 60, objectFit: "cover", borderRadius: 1, display: "block" }} />
                    <Box sx={{ mt: 0.5, display: "flex", gap: 0.5 }}>
                      <Button size="small" variant={idx === 0 ? "contained" : "outlined"} onClick={() => setPrimaryEditingCarImage(img)}>
                        {idx === 0 ? "Ảnh chính" : "Đặt chính"}
                      </Button>
                      <Button size="small" color="error" onClick={() => removeEditingCarImage(img)}>
                        Xóa
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Xe chưa có ảnh. Bạn có thể thêm ảnh mới bên dưới.
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <input
              ref={editImageInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => pickCarEditImage(e.target.files?.[0])}
            />
            <input
              ref={editImagesInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => pickCarEditImages(e.target.files)}
            />
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button variant="outlined" onClick={() => editImageInputRef.current?.click()} disabled={loading || uploadingCarEditImages}>
                {uploadingCarEditImages ? "Đang upload..." : "Chọn 1 ảnh từ máy"}
              </Button>
              <Button variant="outlined" onClick={() => editImagesInputRef.current?.click()} disabled={loading || uploadingCarEditImages}>
                {uploadingCarEditImages ? "Đang upload..." : "Chọn nhiều ảnh"}
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              {pendingEditFiles.length > 0
                ? `Đã chọn ${pendingEditFiles.length} ảnh. Ảnh sẽ được upload khi bấm Lưu.`
                : "Chọn ảnh trước, rồi bấm Lưu để upload lên Cloudinary fcar-images/cars."}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setEditingCar(null);
            setPendingEditFiles([]);
          }}
        >
          Huỷ
        </Button>
        <Button variant="contained" onClick={saveCarUpdate} disabled={loading}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
