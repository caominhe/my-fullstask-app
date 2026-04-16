import { Button, Grid, MenuItem, Paper, TextField, Typography } from "@mui/material";

function toMoney(v) {
  return Number(v || 0).toLocaleString("vi-VN");
}

export default function ContractTab({
  loading,
  contractLeadId,
  setContractLeadId,
  contractVin,
  setContractVin,
  voucherCode,
  setVoucherCode,
  leadVouchers,
  createdContractNo,
  carBasePrice,
  discountAmount,
  finalAmount,
  selectedVoucher,
  onLoadLeadVouchers,
  onCreateContract,
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <TextField fullWidth label="Lead ID" value={contractLeadId} onChange={(e) => setContractLeadId(e.target.value)} />
        </Grid>
        <Grid item xs={12} md="auto">
          <Button variant="outlined" sx={{ height: 56 }} onClick={onLoadLeadVouchers} disabled={loading || !contractLeadId}>
            Rà voucher khách
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="VIN đã khóa"
            value={contractVin}
            onChange={(e) => setContractVin(e.target.value.toUpperCase())}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label="Voucher của khách (CLAIMED)"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            SelectProps={{ displayEmpty: true }}
            helperText={leadVouchers.length ? "Voucher hiện có của khách hàng này" : "Khách chưa có voucher khả dụng"}
          >
            <MenuItem value="">
              <em>Không áp dụng voucher</em>
            </MenuItem>
            {leadVouchers.map((v) => (
              <MenuItem key={v.code} value={v.code}>
                {v.code} - {v.discountType} {v.discountValue} (hết hạn: {v.expiredAt || "—"})
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField fullWidth label="Contract No tạo ra" value={createdContractNo} InputProps={{ readOnly: true }} />
        </Grid>

        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Tạm tính hợp đồng
            </Typography>
            <Typography variant="body2">Giá xe: {toMoney(carBasePrice)} VND</Typography>
            <Typography variant="body2">
              Giảm giá: {toMoney(discountAmount)} VND {selectedVoucher ? `(${selectedVoucher.code})` : ""}
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              Cần thanh toán: {toMoney(finalAmount)} VND
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" onClick={onCreateContract} disabled={loading || !contractLeadId || !contractVin}>
            Lên hợp đồng
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
