import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { portalApi } from "../../services/portalApiService";

const LAST_SELECTED_CAMPAIGN_KEY = "admin_campaigns_selected_campaign_id";

export default function AdminCampaignsPage() {
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [vouchersLoading, setVouchersLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [editingCampaignId, setEditingCampaignId] = useState("");
  const [showrooms, setShowrooms] = useState([]);

  const [campaignName, setCampaignName] = useState("");
  const [discountType, setDiscountType] = useState("CASH");
  const [discountValue, setDiscountValue] = useState("");
  const [targetScope, setTargetScope] = useState("ALL");
  const [targetRegion, setTargetRegion] = useState("");
  const [targetProvince, setTargetProvince] = useState("");
  const [targetShowroomId, setTargetShowroomId] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [quantity, setQuantity] = useState("5");
  const [prefix, setPrefix] = useState("TET");
  const [expiredAt, setExpiredAt] = useState("");

  const targetScopeLabel = (campaign) => {
    if (!campaign) return "—";
    if (campaign.targetScope === "ALL") return "Tất cả";
    if (campaign.targetScope === "REGION") return `Khu vực: ${campaign.targetRegion || "—"}`;
    if (campaign.targetScope === "PROVINCE") return `Địa điểm: ${campaign.targetProvince || "—"}`;
    const showroomName = showrooms.find((s) => s.id === campaign.targetShowroomId)?.name;
    return `Chi nhánh: ${showroomName || campaign.targetShowroomId || "—"}`;
  };

  const toErrorMessage = (e, fallback = "Lỗi.") => {
    if (e?.code === 3007) return "Tên chiến dịch đã tồn tại.";
    if (e?.code === 3014) return "Vui lòng chọn khu vực (miền) cho chiến dịch.";
    if (e?.code === 3015) return "Vui lòng nhập tỉnh/thành cho chiến dịch.";
    if (e?.code === 3016) return "Vui lòng chọn chi nhánh showroom cho chiến dịch.";
    if (e?.code === 3017) return "Showroom áp dụng không tồn tại.";
    return e?.message || fallback;
  };

  const loadCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      const res = await portalApi.getCampaigns();
      setCampaigns(res?.result || []);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Không tải được danh sách chiến dịch." });
    } finally {
      setCampaignsLoading(false);
    }
  };

  const loadShowrooms = async () => {
    try {
      const res = await portalApi.getShowrooms();
      setShowrooms(res?.result || []);
    } catch {
      setShowrooms([]);
    }
  };

  const loadCampaignVouchers = async (id) => {
    if (!id) {
      setSelectedCampaignId("");
      setCampaignId("");
      setVouchers([]);
      localStorage.removeItem(LAST_SELECTED_CAMPAIGN_KEY);
      return;
    }
    setSelectedCampaignId(String(id));
    setCampaignId(String(id));
    localStorage.setItem(LAST_SELECTED_CAMPAIGN_KEY, String(id));
    setVouchersLoading(true);
    setVouchers([]);
    try {
      const res = await portalApi.getCampaignVouchers(Number(id));
      setVouchers(res?.result || []);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Không tải được voucher của chiến dịch." });
    } finally {
      setVouchersLoading(false);
    }
  };

  const resetCampaignForm = () => {
    setEditingCampaignId("");
    setCampaignName("");
    setDiscountType("CASH");
    setDiscountValue("");
    setTargetScope("ALL");
    setTargetRegion("");
    setTargetProvince("");
    setTargetShowroomId("");
  };

  useEffect(() => {
    loadCampaigns();
    loadShowrooms();
  }, []);

  useEffect(() => {
    if (campaigns.length === 0) {
      setSelectedCampaignId("");
      setCampaignId("");
      setVouchers([]);
      return;
    }
    const selectedExists = campaigns.some((c) => String(c.id) === selectedCampaignId);
    if (!selectedExists) {
      setSelectedCampaignId("");
      setCampaignId("");
      setVouchers([]);
    }
  }, [campaigns, selectedCampaignId]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Chiến dịch khuyến mãi
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tạo campaign theo phạm vi: tất cả, khu vực, tỉnh/thành hoặc chi nhánh showroom.
      </Typography>
      {msg.text ? (
        <Alert severity={msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      ) : null}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {editingCampaignId ? `Sửa chiến dịch #${editingCampaignId}` : "+ Tạo chiến dịch"}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Tên chiến dịch" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth select label="Loại giảm" value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
              <MenuItem value="CASH">CASH</MenuItem>
              <MenuItem value="PERCENT">PERCENT</MenuItem>
              <MenuItem value="GIFT">GIFT</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Giá trị" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth select label="Phạm vi" value={targetScope} onChange={(e) => setTargetScope(e.target.value)}>
              <MenuItem value="ALL">Tất cả</MenuItem>
              <MenuItem value="REGION">Khu vực</MenuItem>
              <MenuItem value="PROVINCE">Địa điểm</MenuItem>
              <MenuItem value="SHOWROOM">Chi nhánh</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            {targetScope === "REGION" ? (
              <TextField fullWidth select label="Khu vực" value={targetRegion} onChange={(e) => setTargetRegion(e.target.value)}>
                <MenuItem value="NORTH">Miền Bắc</MenuItem>
                <MenuItem value="CENTRAL">Miền Trung</MenuItem>
                <MenuItem value="SOUTH">Miền Nam</MenuItem>
              </TextField>
            ) : targetScope === "PROVINCE" ? (
              <TextField fullWidth label="Tỉnh/Thành" value={targetProvince} onChange={(e) => setTargetProvince(e.target.value)} />
            ) : targetScope === "SHOWROOM" ? (
              <TextField
                fullWidth
                select
                label="Chi nhánh showroom"
                value={targetShowroomId}
                onChange={(e) => setTargetShowroomId(e.target.value)}
              >
                {showrooms.map((s) => (
                  <MenuItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField fullWidth label="Đối tượng" value="Áp dụng toàn bộ khách hàng" InputProps={{ readOnly: true }} />
            )}
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              sx={{ height: 56 }}
              variant="contained"
              onClick={async () => {
                setLoading(true);
                setMsg({ type: "", text: "" });
                try {
                  const isEditing = Boolean(editingCampaignId);
                  const payload = {
                    name: campaignName.trim(),
                    discountType,
                    discountValue: Number(discountValue),
                    targetScope,
                    targetRegion: targetScope === "REGION" ? targetRegion : null,
                    targetProvince: targetScope === "PROVINCE" ? targetProvince.trim() : null,
                    targetShowroomId: targetScope === "SHOWROOM" && targetShowroomId ? Number(targetShowroomId) : null,
                  };
                  const res = isEditing
                    ? await portalApi.updateCampaign(Number(editingCampaignId), payload)
                    : await portalApi.createCampaign(payload);
                  if (res?.result?.id) {
                    setCampaignId(String(res.result.id));
                    setSelectedCampaignId(String(res.result.id));
                  }
                  resetCampaignForm();
                  await loadCampaigns();
                  setMsg({ type: "success", text: isEditing ? "Đã cập nhật chiến dịch." : "Đã tạo chiến dịch." });
                } catch (e) {
                  setMsg({ type: "error", text: toErrorMessage(e) });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              {editingCampaignId ? "Cập nhật" : "Lưu"}
            </Button>
          </Grid>
          {editingCampaignId ? (
            <Grid item xs={12} md={2}>
              <Button fullWidth sx={{ height: 56 }} variant="text" onClick={resetCampaignForm} disabled={loading}>
                Hủy sửa
              </Button>
            </Grid>
          ) : null}
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Kho voucher — sinh mã hàng loạt
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Campaign ID" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Số lượng" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Hết hạn"
              InputLabelProps={{ shrink: true }}
              value={expiredAt}
              onChange={(e) => setExpiredAt(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              sx={{ height: 56 }}
              variant="outlined"
              onClick={async () => {
                const dt = expiredAt.length === 16 ? `${expiredAt}:00` : expiredAt;
                const campaignIdNum = Number(campaignId);
                if (!Number.isInteger(campaignIdNum) || campaignIdNum <= 0) {
                  setMsg({ type: "error", text: "Campaign ID không hợp lệ." });
                  return;
                }
                if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
                  setMsg({ type: "error", text: "Số lượng voucher phải lớn hơn 0." });
                  return;
                }
                setLoading(true);
                setMsg({ type: "", text: "" });
                try {
                  const res = await portalApi.generateCampaignVouchers(campaignIdNum, {
                    quantity: Number(quantity),
                    prefix,
                    expiredAt: dt || "",
                  });
                  setSelectedCampaignId(String(campaignIdNum));
                  setCampaignId(String(campaignIdNum));
                  setVouchers(res?.result || []);
                  await loadCampaignVouchers(campaignIdNum);
                  setMsg({ type: "success", text: "Đã sinh mã voucher." });
                } catch (e) {
                  setMsg({ type: "error", text: toErrorMessage(e) });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              Sinh mã
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Danh sách chiến dịch
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên chiến dịch</TableCell>
              <TableCell>Loại giảm</TableCell>
              <TableCell>Giá trị</TableCell>
              <TableCell>Phạm vi áp dụng</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.map((c) => (
              <TableRow key={c.id} selected={String(c.id) === selectedCampaignId}>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.discountType}</TableCell>
                <TableCell>{c.discountValue}</TableCell>
                <TableCell>{targetScopeLabel(c)}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant={String(c.id) === selectedCampaignId ? "contained" : "text"}
                    onClick={async () => {
                      await loadCampaignVouchers(c.id);
                    }}
                    disabled={vouchersLoading}
                  >
                    Xem voucher
                  </Button>
                  <Button
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={() => {
                      setEditingCampaignId(String(c.id));
                      setCampaignName(c.name || "");
                      setDiscountType(c.discountType || "CASH");
                      setDiscountValue(String(c.discountValue ?? ""));
                      setTargetScope(c.targetScope || "ALL");
                      setTargetRegion(c.targetRegion || "");
                      setTargetProvince(c.targetProvince || "");
                      setTargetShowroomId(c.targetShowroomId != null ? String(c.targetShowroomId) : "");
                    }}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    sx={{ ml: 1 }}
                    onClick={async () => {
                      const ok = window.confirm(`Xóa chiến dịch #${c.id} - "${c.name}"?`);
                      if (!ok) return;
                      setLoading(true);
                      setMsg({ type: "", text: "" });
                      try {
                        await portalApi.deleteCampaign(Number(c.id));
                        if (String(c.id) === selectedCampaignId) {
                          setSelectedCampaignId("");
                          setCampaignId("");
                          setVouchers([]);
                        }
                        if (String(c.id) === editingCampaignId) {
                          resetCampaignForm();
                        }
                        await loadCampaigns();
                        setMsg({ type: "success", text: "Đã xóa chiến dịch." });
                      } catch (e) {
                        setMsg({ type: "error", text: toErrorMessage(e) });
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ color: "text.secondary" }}>
                  {campaignsLoading ? "Đang tải..." : "Chưa có chiến dịch nào."}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Paper>

      {selectedCampaignId ? (
        <Paper variant="outlined">
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Voucher của chiến dịch {selectedCampaignId || campaignId}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Mã</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Khách sở hữu</TableCell>
                  <TableCell>Hết hạn</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vouchersLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ color: "text.secondary" }}>
                      Đang tải voucher...
                    </TableCell>
                  </TableRow>
                ) : vouchers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ color: "text.secondary" }}>
                      Chiến dịch này chưa có voucher.
                    </TableCell>
                  </TableRow>
                ) : (
                  vouchers.slice(0, 50).map((v, i) => (
                    <TableRow key={i}>
                      <TableCell>{v.code || JSON.stringify(v)}</TableCell>
                      <TableCell>{v.status || "—"}</TableCell>
                      <TableCell>{v.userId ?? "—"}</TableCell>
                      <TableCell>{v.expiredAt || v.expiresAt || "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {vouchers.length > 50 ? (
              <Typography variant="caption" color="text.secondary">
                Hiển thị 50/{vouchers.length} mã.
              </Typography>
            ) : null}
          </Box>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Chọn một chiến dịch và bấm <strong>Xem voucher</strong> để hiển thị danh sách voucher của đúng chiến dịch đó.
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
