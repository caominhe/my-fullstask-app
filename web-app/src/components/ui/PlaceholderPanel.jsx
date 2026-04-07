import { Alert, Paper, Typography } from "@mui/material";

export default function PlaceholderPanel({ title, children }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Alert severity="info" sx={{ mt: 1 }}>
        {children || "Màn hình sẽ được nối API trong giai đoạn tiếp theo."}
      </Alert>
    </Paper>
  );
}
