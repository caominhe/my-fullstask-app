import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import { ROLES } from "../constants/roles";
import SessionExpiredBridge from "./SessionExpiredBridge";

import PublicLayout from "../layouts/CustomerLayout/PublicLayout";
import ProtectedRoute from "./ProtectedRoute";
import ShowroomLayout from "../layouts/ShowroomLayout";
import AdminLayout from "../layouts/AdminLayout";

import Login from "../components/Login";
import RegisterPage from "../modules/auth/RegisterPage";
import Authenticate from "../components/Authenticate";
import Onboard from "../components/Onboard";

import MarketingHomePage from "../modules/public/MarketingHomePage";
import CarCatalogPage from "../modules/public/CarCatalogPage";
import CarDetailPage from "../modules/public/CarDetailPage";
import TestDrivePage from "../modules/public/TestDrivePage";

import CustomerProfileDashboard from "../modules/customer/CustomerProfileDashboard";
import MyGaragePage from "../modules/customer/MyGaragePage";
import PromotionsPage from "../modules/customer/PromotionsPage";

import ShowroomHomePage from "../modules/showroom/ShowroomHomePage";
import ShowroomLeadsPage from "../modules/showroom/ShowroomLeadsPage";
import ShowroomSalesWorkspace from "../modules/showroom/ShowroomSalesWorkspace";
import ShowroomFinancePage from "../modules/showroom/ShowroomFinancePage";
import ShowroomAftersalesPage from "../modules/showroom/ShowroomAftersalesPage";

import AdminHomePage from "../modules/admin/AdminHomePage";
import AdminUsersPage from "../modules/admin/AdminUsersPage";
import AdminInventoryPage from "../modules/admin/AdminInventoryPage";
import AdminCampaignsPage from "../modules/admin/AdminCampaignsPage";
import AdminLeadsAssignPage from "../modules/admin/AdminLeadsAssignPage";
import { Box, Typography } from "@mui/material";

function AdminReportsStub() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Báo cáo &amp; KPI
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Dashboard tổng hợp — nối API báo cáo khi có.
      </Typography>
    </Box>
  );
}

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Router>
        <SessionExpiredBridge />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/authenticate" element={<Authenticate />} />
          <Route path="/onboard" element={<Onboard />} />

          <Route path="/app/*" element={<Navigate to="/profile" replace />} />

          <Route path="/" element={<PublicLayout />}>
            <Route index element={<MarketingHomePage />} />
            <Route path="cars" element={<CarCatalogPage />} />
            <Route path="cars/:vin" element={<CarDetailPage />} />
            <Route path="test-drive" element={<TestDrivePage />} />

            <Route element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]} />}>
              <Route path="profile" element={<CustomerProfileDashboard />} />
              <Route path="my-garage" element={<MyGaragePage />} />
              <Route path="promotions" element={<PromotionsPage />} />
            </Route>
          </Route>

          <Route path="/showroom/cars" element={<Navigate to="/showroom/sales" replace />} />

          <Route path="/showroom" element={<ProtectedRoute allowedRoles={[ROLES.SALES]} />}>
            <Route element={<ShowroomLayout />}>
              <Route index element={<ShowroomHomePage />} />
              <Route path="leads" element={<ShowroomLeadsPage />} />
              <Route path="sales" element={<ShowroomSalesWorkspace />} />
              <Route path="finance" element={<ShowroomFinancePage />} />
              <Route path="aftersales" element={<ShowroomAftersalesPage />} />
            </Route>
          </Route>

          <Route path="/admin" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminHomePage />} />
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route path="leads" element={<AdminLeadsAssignPage />} />
              <Route path="campaigns" element={<AdminCampaignsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="reports" element={<AdminReportsStub />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
