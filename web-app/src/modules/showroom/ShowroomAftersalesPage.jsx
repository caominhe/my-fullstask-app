import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { portalApi } from "../../services/portalApiService";
import { buildWarrantyUpdatePayload, getWarrantyMonths, parseDurationMonthsInput } from "../../utils/warrantyUtils";

export default function ShowroomAftersalesPage() {
  const [contractNo, setContractNo] = useState("");
  const [contract, setContract] = useState(null);
  const [warranty, setWarranty] = useState(null);
  const [historyRows, setHistoryRows] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [lookupDone, setLookupDone] = useState(false);

  const [licensePlate, setLicensePlate] = useState("");
  const [durationMonths, setDurationMonths] = useState("36");
  const [description, setDescription] = useState("");
  const [serviceLocation, setServiceLocation] = useState("");
  const [totalCost, setTotalCost] = useState("0");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await portalApi.getShowrooms();
        if (cancelled) return;
        setShowrooms(res?.result || []);
      } catch {
        // optional
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const carName = useMemo(
    () => [contract?.carBrand, contract?.carModel, contract?.carVersion].filter(Boolean).join(" ") || "—",
    [contract]
  );

  const lookupWarrantyByContract = async () => {
    if (!contractNo.trim()) return;
    setLoading(true);
    setMsg({ type: "", text: "" });
    setLookupDone(false);
    try {
      const contractRes = await portalApi.getContract(contractNo.trim());
      const currentContract = contractRes?.result || null;
      setContract(currentContract);
      setLookupDone(true);

      if (currentContract?.showroomName) {
        setServiceLocation(currentContract.showroomName);
      }

      try {
        const handoverRes = await portalApi.getHandover(contractNo.trim());
        const lp = handoverRes?.result?.licensePlate || "";
        setLicensePlate(lp);
      } catch {
        setLicensePlate("");
      }

      if (!currentContract?.carVin) {
        setWarranty(null);
        setHistoryRows([]);
        setMsg({ type: "error", text: "Hợp đồng chưa có VIN xe." });
        return;
      }

      try {
        const [wRes, hRes] = await Promise.all([
          portalApi.getWarranty(currentContract.carVin),
          portalApi.getWarrantyHistory(currentContract.carVin),
        ]);
        setWarranty(wRes?.result || null);
        setHistoryRows(hRes?.result || []);
        setDurationMonths(String(getWarrantyMonths(wRes?.result)));
        setMsg({ type: "success", text: "Đã tải sổ bảo hành và lịch sử bảo hành." });
      } catch (e) {
        if (e?.code === 7002) {
          setWarranty(null);
          setHistoryRows([]);
          setMsg({ type: "error", text: "Chưa kích hoạt sổ bảo hành." });
        } else {
          throw e;
        }
      }
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi." });
    } finally {
      setLoading(false);
    }
  };

  /** Kích hoạt sổ = tạo sổ bảo hành (không tách “mở sổ”). */
  const activateWarranty = async () => {
    if (!contract?.carVin) return;
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await portalApi.activateWarrantyForShowroom({
        carVin: contract.carVin,
        licensePlate: licensePlate.trim(),
        durationMonths: parseDurationMonthsInput(durationMonths),
      });
      setWarranty(res?.result || null);
      setDurationMonths(String(getWarrantyMonths(res?.result)));
      setMsg({ type: "success", text: "Đã kích hoạt sổ bảo hành." });
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Không thể kích hoạt sổ bảo hành." });
    } finally {
      setLoading(false);
    }
  };

  const updateWarrantyBook = async () => {
    if (!contract?.carVin || !warranty) return;
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await portalApi.updateWarranty(contract.carVin, buildWarrantyUpdatePayload(licensePlate, durationMonths));
      setWarranty(res?.result || null);
      if (res?.result) setDurationMonths(String(getWarrantyMonths(res.result)));
      setMsg({ type: "success", text: "Đã cập nhật thông tin sổ bảo hành." });
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Không thể cập nhật sổ." });
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!contract?.carVin) return;
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      await portalApi.createServiceTicket({
        carVin: contract.carVin,
        description: description.trim(),
        serviceLocation: serviceLocation.trim(),
        totalCost: Number(totalCost) || 0,
      });
      const historyRes = await portalApi.getWarrantyHistory(contract.carVin);
      setHistoryRows(historyRes?.result || []);
      setDescription("");
      setTotalCost("0");
      setMsg({ type: "success", text: "Đã ghi nhận phiếu dịch vụ." });
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Không thể ghi nhận phiếu dịch vụ." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Cố vấn dịch vụ &amp; hậu mãi
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tra cứu theo số hợp đồng: <strong>kích hoạt sổ bảo hành</strong> (GET/POST showroom), <strong>cập nhật sổ</strong>{" "}
        (PUT), và ghi nhận lịch sử dịch vụ.
      </Typography>
      {msg.text ? (
        <Alert severity={msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      ) : null}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          Tra cứu theo hợp đồng &amp; sổ bảo hành
        </Typography>
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
            <Button variant="contained" onClick={lookupWarrantyByContract} disabled={loading || !contractNo.trim()}>
              Tra cứu sổ bảo hành
            </Button>
          </Grid>
        </Grid>

        {lookupDone && !warranty ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Chưa kích hoạt sổ bảo hành — dùng form bên dưới để kích hoạt (biển số + thời hạn).
          </Alert>
        ) : null}

        {warranty ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Sổ bảo hành + lịch sử bảo hành
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Số hợp đồng</TableCell>
                  <TableCell>VIN</TableCell>
                  <TableCell>Tên xe</TableCell>
                  <TableCell>Tên khách hàng</TableCell>
                  <TableCell>Kích hoạt sổ</TableCell>
                  <TableCell>Thời gian BH</TableCell>
                  <TableCell>Ngày hết hạn BH</TableCell>
                  <TableCell>Ngày bảo hành</TableCell>
                  <TableCell>Nội dung</TableCell>
                  <TableCell>Chi phí</TableCell>
                  <TableCell>Địa điểm BH</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyRows.length === 0 ? (
                  <TableRow>
                    <TableCell>{contract?.contractNo || "—"}</TableCell>
                    <TableCell>{contract?.carVin || "—"}</TableCell>
                    <TableCell>{carName}</TableCell>
                    <TableCell>{contract?.customerFullName || "—"}</TableCell>
                    <TableCell>{warranty.createdAt || "—"}</TableCell>
                    <TableCell>{getWarrantyMonths(warranty)} tháng</TableCell>
                    <TableCell>{warranty.endDate || "—"}</TableCell>
                    <TableCell colSpan={4}>Chưa có lần bảo hành nào.</TableCell>
                  </TableRow>
                ) : (
                  historyRows.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell>{contract?.contractNo || "—"}</TableCell>
                      <TableCell>{contract?.carVin || "—"}</TableCell>
                      <TableCell>{carName}</TableCell>
                      <TableCell>{contract?.customerFullName || "—"}</TableCell>
                      <TableCell>{warranty.createdAt || "—"}</TableCell>
                      <TableCell>{getWarrantyMonths(warranty)} tháng</TableCell>
                      <TableCell>{warranty.endDate || "—"}</TableCell>
                      <TableCell>{h.serviceDate || "—"}</TableCell>
                      <TableCell>{h.description || "—"}</TableCell>
                      <TableCell>{Number(h.totalCost || 0).toLocaleString("vi-VN")}</TableCell>
                      <TableCell>{h.serviceLocation || contract?.showroomName || "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        ) : null}

        {lookupDone && contract?.carVin ? (
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Kích hoạt / cập nhật sổ bảo hành
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Một nghiệp vụ: <strong>kích hoạt sổ bảo hành</strong> khi chưa có sổ; sau đó dùng <strong>cập nhật</strong> để
              sửa biển số hoặc thời hạn.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="ID hợp đồng" value={contract?.contractNo || ""} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="VIN xe" value={contract?.carVin || ""} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Tên xe" value={carName} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Tên customer" value={contract?.customerFullName || ""} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="SĐT customer" value={contract?.customerPhone || ""} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Biển số"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Thời gian bảo hành (tháng)"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                  helperText={warranty ? "Cập nhật: ghi đè ngày kết thúc = ngày bắt đầu + số tháng" : " "}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {!warranty ? (
                    <Button
                      variant="contained"
                      onClick={activateWarranty}
                      disabled={loading || !contract?.carVin || !licensePlate.trim()}
                    >
                      Kích hoạt sổ bảo hành
                    </Button>
                  ) : (
                    <Button variant="contained" color="secondary" onClick={updateWarrantyBook} disabled={loading || !contract?.carVin}>
                      Cập nhật thông tin sổ
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        ) : null}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          Ghi nhận lịch sử dịch vụ
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sau khi đã có sổ bảo hành, nhập nội dung để tạo phiếu dịch vụ (lịch sử).
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Mô tả nội dung bảo hành"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="service-location-label">Địa điểm bảo hành</InputLabel>
              <Select
                labelId="service-location-label"
                label="Địa điểm bảo hành"
                value={serviceLocation}
                onChange={(e) => setServiceLocation(e.target.value)}
              >
                {showrooms.map((s) => (
                  <MenuItem key={s.id} value={s.name}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Chi phí dự kiến"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              onClick={createTicket}
              disabled={loading || !warranty || !description.trim() || !serviceLocation.trim()}
            >
              Ghi nhận phiếu dịch vụ
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
