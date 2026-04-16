import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, Button, FormControl, Grid, InputLabel, MenuItem, Paper, Select, TextField, Typography } from "@mui/material";
import { portalApi } from "../../services/portalApiService";

export default function TestDrivePage() {
  const [searchParams] = useSearchParams();
  const preVin = searchParams.get("vin") || "";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showroomId, setShowroomId] = useState("");
  const [showrooms, setShowrooms] = useState([]);
  const [cars, setCars] = useState([]);
  const [selectedVin, setSelectedVin] = useState(preVin);
  const [message, setMessage] = useState({ type: "info", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await portalApi.getCars({ excludeWithContract: true });
        if (!cancelled) setCars(data?.result || []);
        const showroomRes = await portalApi.getShowrooms();
        if (!cancelled) setShowrooms(showroomRes?.result || []);
      } catch {
        /* catalog optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (preVin) setSelectedVin(preVin);
  }, [preVin]);

  const submit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập họ tên và số điện thoại." });
      return;
    }
    if (!showroomId) {
      setMessage({ type: "error", text: "Vui lòng chọn showroom muốn trải nghiệm lái thử." });
      return;
    }
    setLoading(true);
    setMessage({ type: "info", text: "" });
    try {
      await portalApi.createLead({
        fullName: fullName.trim(),
        phone: phone.trim(),
        interestedVin: selectedVin || undefined,
        source: "WEB",
        showroomId: Number(showroomId),
      });
      setMessage({ type: "success", text: "Đăng ký lái thử thành công. Showroom sẽ liên hệ sớm." });
      setFullName("");
      setPhone("");
      setShowroomId("");
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Gửi đăng ký thất bại." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography variant="h4" component="h1" fontWeight={800} gutterBottom>
        Đăng ký lái thử
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        POST /leads — chọn dòng xe quan tâm (từ kho hiện tại) để showroom tư vấn đúng xe.
      </Typography>
      {message.text ? (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      ) : null}
      <Paper sx={{ p: 3 }} component="form" onSubmit={submit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth required label="Họ và tên" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth required label="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="car-select-label">Dòng xe muốn lái / tư vấn</InputLabel>
              <Select
                labelId="car-select-label"
                label="Dòng xe muốn lái / tư vấn"
                value={selectedVin}
                onChange={(e) => setSelectedVin(e.target.value)}
              >
                <MenuItem value="">
                  <em>— Chọn từ danh sách (GET /cars) —</em>
                </MenuItem>
                {cars.map((c) => (
                  <MenuItem key={c.vin} value={c.vin}>
                    {[c.brand, c.model, c.version].filter(Boolean).join(" · ") || c.vin}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel id="showroom-select-label">Showroom muốn trải nghiệm</InputLabel>
              <Select
                labelId="showroom-select-label"
                label="Showroom muốn trải nghiệm"
                value={showroomId}
                onChange={(e) => setShowroomId(e.target.value)}
              >
                <MenuItem value="">
                  <em>— Chọn showroom —</em>
                </MenuItem>
                {showrooms.map((s) => (
                  <MenuItem key={s.id} value={String(s.id)}>
                    {s.name} {s.address ? `· ${s.address}` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Button sx={{ mt: 3 }} type="submit" variant="contained" size="large" disabled={loading}>
          {loading ? "Đang gửi..." : "Gửi đăng ký"}
        </Button>
      </Paper>
    </>
  );
}
