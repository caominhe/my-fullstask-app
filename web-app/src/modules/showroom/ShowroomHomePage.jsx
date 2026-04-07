import { Grid } from "@mui/material";
import PageHeader from "../../components/ui/PageHeader";
import PlaceholderPanel from "../../components/ui/PlaceholderPanel";

export default function ShowroomHomePage() {
  return (
    <>
      <PageHeader
        title="Showroom"
        description="Điều hành kho xe, lead và bán hàng — dashboard số liệu sẽ nối sau."
      />
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <PlaceholderPanel title="Xe trong ngày">Tổng nhập / chuyển / bán — placeholder.</PlaceholderPanel>
        </Grid>
        <Grid item xs={12} md={4}>
          <PlaceholderPanel title="Lead cần xử lý">Số lead mới, đã gán — placeholder.</PlaceholderPanel>
        </Grid>
        <Grid item xs={12} md={4}>
          <PlaceholderPanel title="Hợp đồng chờ">Chờ duyệt / chờ thanh toán — placeholder.</PlaceholderPanel>
        </Grid>
      </Grid>
    </>
  );
}
