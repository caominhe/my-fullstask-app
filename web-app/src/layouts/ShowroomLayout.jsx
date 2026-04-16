import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import { ROUTES } from "../constants/routes";
import AppShell from "./AppShell";

const navItems = [
  { to: ROUTES.SHOWROOM_HOME, label: "Tổng quan", icon: <HomeOutlinedIcon fontSize="small" /> },
  { to: ROUTES.SHOWROOM_SALES, label: "CRM & chốt sale", icon: <RequestQuoteIcon fontSize="small" /> },
  {
    to: ROUTES.SHOWROOM_FINANCE,
    label: "Kế toán chi nhánh",
    icon: <AccountBalanceWalletOutlinedIcon fontSize="small" />,
  },
  { to: ROUTES.SHOWROOM_AFTERSALES, label: "Cố vấn dịch vụ", icon: <BuildCircleOutlinedIcon fontSize="small" /> },
];

export default function ShowroomLayout() {
  return (
    <AppShell title="FCAR — Showroom" homePath={ROUTES.SHOWROOM_HOME} navItems={navItems} />
  );
}
