import { useState } from "react";
import { Alert, Box, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import { portalApi } from "../../services/portalApiService";

export default function AdminLeadsAssignPage() {
  const [leadId, setLeadId] = useState("");
  const [salesId, setSalesId] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const assign = async () => {
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      await portalApi.assignLead(Number(leadId), Number(salesId));
      setMsg({ type: "success", text: "Đã phân công lead cho Sales." });
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Phân công Lead toàn hệ thống
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        PUT /leads/{`{leadId}`}/assign/{`{salesId}`} — giao khách tiềm năng cho nhân viên cụ thể.
      </Typography>
      {msg.text ? (
        <Alert severity={msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      ) : null}
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Lead ID" value={leadId} onChange={(e) => setLeadId(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Sales ID" value={salesId} onChange={(e) => setSalesId(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button fullWidth sx={{ height: 56 }} variant="contained" onClick={assign} disabled={loading}>
              Phân công
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
