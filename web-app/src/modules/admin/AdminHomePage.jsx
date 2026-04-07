import { Grid } from "@mui/material";
import PageHeader from "../../components/ui/PageHeader";
import PlaceholderPanel from "../../components/ui/PlaceholderPanel";

export default function AdminHomePage() {
  return (
    <>
      <PageHeader title="Quản trị" description="Giám sát hệ thống, chiến dịch và người dùng." />
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <PlaceholderPanel title="Tổng quan">KPI tổng hợp — placeholder.</PlaceholderPanel>
        </Grid>
        <Grid item xs={12} md={4}>
          <PlaceholderPanel title="Chiến dịch">Số campaign đang chạy — placeholder.</PlaceholderPanel>
        </Grid>
        <Grid item xs={12} md={4}>
          <PlaceholderPanel title="Người dùng">Đếm theo role — placeholder.</PlaceholderPanel>
        </Grid>
      </Grid>
    </>
  );
}
