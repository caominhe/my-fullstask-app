import { useState } from "react";
import { Alert, Box, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import { portalApi } from "../../services/portalApiService";

function formatVnd(v) {
  return Number(v || 0).toLocaleString("vi-VN");
}

export default function AdminContractsPage() {
  const [contractNo, setContractNo] = useState("");
  const [contract, setContract] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    if (!contractNo.trim()) return;
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await portalApi.getContract(contractNo.trim());
      setContract(res?.result || null);
      setMsg({ type: "success", text: "Đã tải thông tin hợp đồng." });
    } catch (e) {
      setContract(null);
      setMsg({ type: "error", text: e.message || "Không tìm thấy hợp đồng." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Quản lí hợp đồng
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Nhập ID hợp đồng để xem đầy đủ thông tin hợp đồng như phía showroom.
      </Typography>

      {msg.text ? (
        <Alert severity={msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      ) : null}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="ID hợp đồng"
              value={contractNo}
              onChange={(e) => setContractNo(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md="auto">
            <Button variant="contained" onClick={lookup} disabled={loading || !contractNo.trim()}>
              Tra cứu hợp đồng
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {contract ? (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Chi tiết hợp đồng
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="ID hợp đồng" value={contract.contractNo || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Lead ID" value={contract.leadId || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Sales ID" value={contract.salesId || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Khách hàng" value={contract.customerFullName || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="SĐT khách hàng" value={contract.customerPhone || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Customer User ID" value={contract.customerUserId || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="VIN xe" value={contract.carVin || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tên xe"
                value={[contract.carBrand, contract.carModel, contract.carVersion].filter(Boolean).join(" ") || ""}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="MasterData ID" value={contract.masterDataId || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Showroom" value={contract.showroomName || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Địa chỉ showroom" value={contract.showroomAddress || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Showroom ID" value={contract.showroomId || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Voucher" value={contract.voucherCode || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Tổng tiền gốc" value={`${formatVnd(contract.totalAmount)} VND`} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Giảm giá" value={`${formatVnd(contract.discountAmount)} VND`} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Thành tiền" value={`${formatVnd(contract.finalAmount)} VND`} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Trạng thái hợp đồng" value={contract.status || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Ngày ký" value={contract.signedDate || ""} InputProps={{ readOnly: true }} />
            </Grid>
          </Grid>
        </Paper>
      ) : null}
    </Box>
  );
}
