import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import { ROUTES } from "../constants/routes";
import AppShell from "./AppShell";

const navItems = [
  { to: ROUTES.ADMIN_HOME, label: "Tổng quan", icon: <HomeOutlinedIcon fontSize="small" /> },
  { to: ROUTES.ADMIN_INVENTORY, label: "Kho toàn quốc", icon: <WarehouseOutlinedIcon fontSize="small" /> },
  { to: ROUTES.ADMIN_LEADS, label: "Phân công Lead", icon: <AssignmentIndIcon fontSize="small" /> },
  {
    to: ROUTES.ADMIN_CAMPAIGNS,
    label: "Chiến dịch & voucher",
    icon: <CampaignOutlinedIcon fontSize="small" />,
  },
  { to: ROUTES.ADMIN_USERS, label: "Người dùng", icon: <ManageAccountsOutlinedIcon fontSize="small" /> },
  { to: ROUTES.ADMIN_REPORTS, label: "Báo cáo", icon: <AssessmentOutlinedIcon fontSize="small" /> },
];

export default function AdminLayout() {
  return <AppShell variant="dark" title="FCAR — Quản trị" homePath={ROUTES.ADMIN_HOME} navItems={navItems} />;
}
