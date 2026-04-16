import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { portalApi } from "../../services/portalApiService";

function formatVnd(v) {
  return Number(v || 0).toLocaleString("vi-VN");
}

function printContractAsPdf(contract) {
  if (!contract) return;
  const html = `
    <html><head><title>Hop dong ${contract.contractNo || ""}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color:#111; }
      .section { border:1px solid #ddd; border-radius:8px; padding:12px; margin-top:12px; }
      .row { display:flex; justify-content:space-between; margin:4px 0; }
    </style></head><body>
      <h1>HOP DONG MUA BAN XE</h1>
      <div>So HD: ${contract.contractNo || "—"} | Trang thai: ${contract.status || "—"}</div>
      <div class="section">
        <h3>Thong tin khach hang</h3>
        <div class="row"><span>Ho ten</span><strong>${contract.customerFullName || "—"}</strong></div>
        <div class="row"><span>Dien thoai</span><strong>${contract.customerPhone || "—"}</strong></div>
      </div>
      <div class="section">
        <h3>Thong tin xe</h3>
        <div class="row"><span>Xe</span><strong>${[contract.carBrand, contract.carModel, contract.carVersion].filter(Boolean).join(" ") || "—"}</strong></div>
        <div class="row"><span>VIN</span><strong>${contract.carVin || "—"}</strong></div>
        <div class="row"><span>Showroom</span><strong>${contract.showroomName || "—"}</strong></div>
      </div>
      <div class="section">
        <h3>Gia tri hop dong</h3>
        <div class="row"><span>Gia xe goc</span><strong>${formatVnd(contract.totalAmount)} VND</strong></div>
        <div class="row"><span>Voucher</span><strong>${contract.voucherCode || "Khong ap dung"}</strong></div>
        <div class="row"><span>Giam gia</span><strong>${formatVnd(contract.discountAmount)} VND</strong></div>
        <div class="row"><span>Tong thanh toan</span><strong>${formatVnd(contract.finalAmount)} VND</strong></div>
      </div>
    </body></html>
  `;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

export default function ShowroomFinancePage() {
  const [contractNo, setContractNo] = useState("");
  const [contractInfo, setContractInfo] = useState(null);

  const [payType, setPayType] = useState("DEPOSIT");
  const [payMethod, setPayMethod] = useState("CASH");
  const [payNote, setPayNote] = useState("");
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [proofFile, setProofFile] = useState(null);

  const [receiptIdForHandover, setReceiptIdForHandover] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [handoverDate, setHandoverDate] = useState("");

  const [history, setHistory] = useState([]);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [last, setLast] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async (fn, ok) => {
    setLoading(true);
    setMsg({ type: "", text: "" });
    setLast(null);
    try {
      const res = await fn();
      setMsg({ type: "success", text: ok });
      setLast(res);
      return res;
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi." });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshContractData = async (no) => {
    const cn = no.trim();
    const [contractRes, historyRes, receiptRes] = await Promise.all([
      portalApi.getContract(cn),
      portalApi.getPaymentsByContract(cn).catch(() => ({ result: [] })),
      portalApi.getReceiptByContract(cn).catch(() => null),
    ]);
    setContractInfo(contractRes?.result || null);
    setHistory(historyRes?.result || []);
    const rec = receiptRes?.result ?? null;
    setCurrentReceipt(rec);
    setReceiptIdForHandover(rec?.id != null ? String(rec.id) : "");
    return { contract: contractRes, history: historyRes, receipt: receiptRes };
  };

  const loadContract = async () => {
    if (!contractNo.trim()) return;
    await run(async () => refreshContractData(contractNo), "Đã tải thông tin hợp đồng.");
  };

  const createReceiptAfterLoad = async () => {
    if (!contractNo.trim() || !contractInfo || currentReceipt) return;
    if (contractInfo.status !== "SIGNED") {
      setMsg({
        type: "error",
        text: "Hợp đồng phải ở trạng thái SIGNED (khách đã xác nhận) mới tạo được biên lai.",
      });
      return;
    }
    await run(async () => {
      const createRes = await portalApi.createReceipt({
        contractNo: contractNo.trim(),
      });
      await refreshContractData(contractNo);
      return createRes;
    }, "Đã tạo biên lai (chỉ ID + gắn HĐ) và tải lại dữ liệu.");
  };

  const confirmReceipt = async () => {
    if (!currentReceipt?.id || !contractNo.trim()) return;
    const amt = Number(payAmount);
    if (!amt || amt <= 0) {
      setMsg({ type: "error", text: "Nhập số tiền thanh toán lần này." });
      return;
    }
    if (payMethod === "BANK_TRANSFER" && !proofFile) {
      setMsg({ type: "error", text: "Chuyển khoản bắt buộc có ảnh xác minh." });
      return;
    }

    await run(async () => {
      let proofImageUrl = null;
      if (payMethod === "BANK_TRANSFER") {
        const up = await portalApi.uploadPaymentProof(contractNo.trim(), currentReceipt.id, proofFile);
        proofImageUrl = up?.result;
        if (!proofImageUrl) {
          throw new Error("Không nhận được URL ảnh sau khi upload.");
        }
      }
      const res = await portalApi.confirmReceipt(currentReceipt.id, {
        amount: amt,
        paymentType: payType,
        paymentMethod: payMethod,
        note: payNote || undefined,
        proofImageUrl: proofImageUrl || undefined,
      });
      setPayAmount("");
      setProofFile(null);
      await refreshContractData(contractNo);
      return res;
    }, "Đã cập nhật biên lai và ghi nhận lịch sử thanh toán.");
  };

  const canCreateReceipt =
    contractNo.trim() &&
    contractInfo &&
    contractInfo.status === "SIGNED" &&
    !currentReceipt &&
    !loading;

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Kế toán chi nhánh
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Khung 1: tải HĐ rồi tạo biên lai (chỉ khởi tạo ID, chưa chọn hình thức/phương thức). Khung 2: lần thanh toán đầu
        tiên mới ghi hình thức/phương thức lên biên lai + lịch sử. Khung 3: lịch giao xe.
      </Typography>
      {msg.text ? (
        <Alert severity={msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      ) : null}

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          Khung 1 — Tải hợp đồng
        </Typography>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Số hợp đồng" value={contractNo} onChange={(e) => setContractNo(e.target.value)} />
          </Grid>
          <Grid item xs={12} md="auto">
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button variant="outlined" sx={{ height: 56 }} onClick={loadContract} disabled={loading || !contractNo.trim()}>
                Tải hợp đồng
              </Button>
              <Button variant="contained" sx={{ height: 56 }} onClick={createReceiptAfterLoad} disabled={loading || !canCreateReceipt}>
                Tạo biên lai
              </Button>
            </Box>
          </Grid>
        </Grid>
        {contractInfo && contractInfo.status !== "SIGNED" ? (
          <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 1 }}>
            Trạng thái hiện tại: {contractInfo.status}. Cần SIGNED để tạo biên lai.
          </Typography>
        ) : null}
        {contractInfo ? (
          <Box sx={{ mt: 2 }}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fff" }}>
              <Typography variant="h6" fontWeight={800}>
                HỢP ĐỒNG MUA BÁN XE
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Số HĐ: {contractInfo.contractNo} · Trạng thái: {contractInfo.status}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Khách hàng: {contractInfo.customerFullName || "—"} · {contractInfo.customerPhone || "—"}
              </Typography>
              <Typography variant="body2">
                Xe: {[contractInfo.carBrand, contractInfo.carModel, contractInfo.carVersion].filter(Boolean).join(" ")}
              </Typography>
              <Typography variant="body2">VIN: {contractInfo.carVin || "—"}</Typography>
              <Typography variant="body2">Showroom: {contractInfo.showroomName || "—"}</Typography>
              <Typography variant="body2">Voucher: {contractInfo.voucherCode || "Không áp dụng"}</Typography>
              <Typography variant="body2">Giá gốc: {formatVnd(contractInfo.totalAmount)} VND</Typography>
              <Typography variant="body2">Giảm giá: {formatVnd(contractInfo.discountAmount)} VND</Typography>
              <Typography variant="body2" fontWeight={700}>
                Tổng thanh toán: {formatVnd(contractInfo.finalAmount)} VND
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                ID biên lai: {currentReceipt?.id ? currentReceipt.id : "chưa có biên lai"}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Button size="small" variant="outlined" onClick={() => printContractAsPdf(contractInfo)}>
                  In / Lưu PDF hợp đồng
                </Button>
              </Box>
            </Paper>
          </Box>
        ) : null}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          Khung 2 — Cập nhật biên lai (ghi lịch sử thanh toán)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sau khi tạo biên lai, dùng form bên dưới cho lần thanh toán đầu tiên — khi đó hệ thống mới lưu hình thức/phương
          thức lên biên lai và thêm dòng lịch sử.
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="ID biên lai" value={currentReceipt?.id || ""} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Tổng thanh toán (biên lai)"
              value={currentReceipt?.amount != null ? Number(currentReceipt.amount).toLocaleString("vi-VN") : ""}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Công nợ còn lại"
              value={currentReceipt?.remainingDebt != null ? Number(currentReceipt.remainingDebt).toLocaleString("vi-VN") : ""}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Số tiền thanh toán lần này"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              disabled={!currentReceipt}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Hình thức thanh toán"
              value={payType}
              onChange={(e) => setPayType(e.target.value)}
              disabled={!currentReceipt}
            >
              <MenuItem value="DEPOSIT">Cọc</MenuItem>
              <MenuItem value="INSTALLMENT">Trả góp</MenuItem>
              <MenuItem value="FULL">Trả hết</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Phương thức thanh toán"
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              disabled={!currentReceipt}
            >
              <MenuItem value="CASH">Tiền mặt</MenuItem>
              <MenuItem value="BANK_TRANSFER">Chuyển khoản</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Ghi chú" value={payNote} onChange={(e) => setPayNote(e.target.value)} disabled={!currentReceipt} />
          </Grid>
          {payMethod === "BANK_TRANSFER" ? (
            <Grid item xs={12}>
              <Button variant="outlined" component="label" sx={{ mr: 1 }} disabled={!currentReceipt}>
                Chọn ảnh xác minh (bắt buộc)
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                />
              </Button>
              {proofFile ? (
                <Typography component="span" variant="body2">
                  {proofFile.name}
                </Typography>
              ) : (
                <Typography component="span" variant="caption" color="text.secondary">
                  Upload lên Cloudinary (thư mục payment / số HĐ / ID biên lai)
                </Typography>
              )}
            </Grid>
          ) : null}
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={confirmReceipt}
              disabled={
                loading ||
                !currentReceipt?.id ||
                !payAmount ||
                (payMethod === "BANK_TRANSFER" && !proofFile)
              }
            >
              Xác nhận thanh toán
            </Button>
          </Grid>
        </Grid>
        {currentReceipt ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">Biên lai ID: {currentReceipt.id}</Typography>
            <Typography variant="body2">Trạng thái: {currentReceipt.status}</Typography>
            <Typography variant="body2" color="text.secondary">
              Hình thức / phương thức trên biên lai:{" "}
              {[currentReceipt.paymentType, currentReceipt.paymentMethod].every(Boolean)
                ? `${currentReceipt.paymentType} / ${currentReceipt.paymentMethod}`
                : "chưa ghi — sẽ cập nhật sau lần thanh toán đầu tiên"}
            </Typography>
            {currentReceipt.qrPayload ? (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">QR CK (mã + số tiền):</Typography>
                <img
                  alt="qr-payment"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    currentReceipt.qrPayload
                  )}`}
                />
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          Khung 3 — Lịch giao xe
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="ID biên lai" value={receiptIdForHandover} onChange={(e) => setReceiptIdForHandover(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Biển số" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth type="datetime-local" label="Ngày giao xe" InputLabelProps={{ shrink: true }} value={handoverDate} onChange={(e) => setHandoverDate(e.target.value)} />
          </Grid>
          <Grid item xs={12} md="auto">
            <Button variant="outlined" sx={{ height: 56 }} onClick={() => run(() => portalApi.initHandover(contractNo.trim()), "Đã tạo lịch bàn giao.")} disabled={loading || !contractNo.trim()}>
              Tạo lịch giao
            </Button>
          </Grid>
          <Grid item xs={12} md="auto">
            <Button
              variant="contained"
              sx={{ height: 56 }}
              onClick={() =>
                run(
                  () =>
                    portalApi.updateHandover(contractNo.trim(), {
                      receiptId: Number(receiptIdForHandover),
                      licensePlate,
                      handoverDate: handoverDate ? `${handoverDate}:00` : undefined,
                    }),
                  "Đã giao xe thành công."
                )
              }
              disabled={loading || !contractNo.trim() || !receiptIdForHandover || !handoverDate}
            >
              Ấn đã giao
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {history.length > 0 ? (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Lịch sử thanh toán theo hợp đồng
          </Typography>
          {history.map((h) => (
            <Box key={h.id} sx={{ mb: 1 }}>
              <Typography variant="body2">
                Biên lai #{h.receiptId || "—"} · {h.paymentType} / {h.paymentMethod} ·{" "}
                {Number(h.amount || 0).toLocaleString("vi-VN")} · Công nợ còn lại:{" "}
                {Number(h.remainingDebt || 0).toLocaleString("vi-VN")}
              </Typography>
              {h.proofImageUrl ? (
                <Typography variant="caption" component="div">
                  <a href={h.proofImageUrl} target="_blank" rel="noopener noreferrer">
                    Xem ảnh xác minh
                  </a>
                </Typography>
              ) : null}
            </Box>
          ))}
        </Paper>
      ) : null}

      {last ? (
        <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: "grey.50" }}>
          <Typography variant="caption" color="text.secondary">
            Phản hồi gần nhất
          </Typography>
          <Box component="pre" sx={{ m: 0, fontSize: 12, overflow: "auto" }}>
            {JSON.stringify(last, null, 2)}
          </Box>
        </Paper>
      ) : null}
    </Box>
  );
}
