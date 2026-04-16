import { Button, Grid, Paper, TextField } from "@mui/material";

export default function LockCarTab({ vinToLock, setVinToLock, loading, onLock }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="VIN cần khóa" value={vinToLock} onChange={(e) => setVinToLock(e.target.value.toUpperCase())} />
        </Grid>
        <Grid item xs={12} md="auto">
          <Button
            variant="contained"
            color="warning"
            sx={{ height: 56 }}
            onClick={onLock}
            disabled={loading || !vinToLock}
          >
            Khóa xe
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
