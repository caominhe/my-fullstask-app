import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import { ROUTES } from "../constants/routes";
import AppShell from "./AppShell";

const navItems = [
  { to: ROUTES.ADMIN_HOME, label: "Tổng quan", icon: <HomeOutlinedIcon fontSize="small" /> },
  { to: ROUTES.ADMIN_INVENTORY, label: "Kho toàn quốc", icon: <WarehouseOutlinedIcon fontSize="small" /> },
  { to: ROUTES.ADMIN_SHOWROOM_MANAGEMENT, label: "Quản lí showroom", icon: <StorefrontOutlinedIcon fontSize="small" /> },
  { to: ROUTES.ADMIN_CONTRACTS, label: "Quản lí hợp đồng", icon: <DescriptionOutlinedIcon fontSize="small" /> },
  {
    to: ROUTES.ADMIN_CAMPAIGNS,
    label: "Chiến dịch & voucher",
    icon: <CampaignOutlinedIcon fontSize="small" />,
  },
  { to: ROUTES.ADMIN_AFTERSALES, label: "Bảo hành & hậu mãi", icon: <BuildCircleOutlinedIcon fontSize="small" /> },
  { to: ROUTES.ADMIN_USERS, label: "Người dùng", icon: <ManageAccountsOutlinedIcon fontSize="small" /> },
  { to: ROUTES.ADMIN_REPORTS, label: "Báo cáo", icon: <AssessmentOutlinedIcon fontSize="small" /> },
];

export default function AdminLayout() {
  return <AppShell variant="dark" title="FCAR — Quản trị" homePath={ROUTES.ADMIN_HOME} navItems={navItems} />;
}
