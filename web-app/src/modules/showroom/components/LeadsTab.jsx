import { Box, Button, Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import EmptyState from "../../../components/ui/EmptyState";

export default function LeadsTab({ leads, loading, onRefresh, onPickLead }) {
  return (
    <Paper variant="outlined" sx={{ overflow: "auto" }}>
      <Box sx={{ p: 2, pb: 0 }}>
        <Button variant="outlined" onClick={onRefresh} disabled={loading}>
          Làm mới lead
        </Button>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Lead ID</TableCell>
            <TableCell>Khách hàng</TableCell>
            <TableCell>SĐT</TableCell>
            <TableCell>VIN cần tư vấn</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell align="right">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} sx={{ border: 0, p: 0 }}>
                <EmptyState
                  title="Chưa có lead cho showroom"
                  description="Khi khách tạo lead và chọn showroom này, dữ liệu sẽ hiển thị tại đây."
                />
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id} hover>
                <TableCell>{lead.id}</TableCell>
                <TableCell>{lead.fullName || "—"}</TableCell>
                <TableCell>{lead.phone || "—"}</TableCell>
                <TableCell sx={{ fontFamily: "monospace" }}>{lead.interestedVin || "—"}</TableCell>
                <TableCell>
                  <Chip size="small" label={lead.status || "—"} />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => onPickLead(lead)}>
                    Dùng lead này
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
