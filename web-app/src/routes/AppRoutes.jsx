import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";

// Layouts
import PublicLayout from "../layouts/CustomerLayout/PublicLayout";
import ProtectedRoute from "./ProtectedRoute";

// Các màn hình Auth (Tạm lấy các file cũ của bạn)
import Login from "../components/Login";
import Authenticate from "../components/Authenticate";
import Onboard from "../components/Onboard";

// Tạo Placeholder cho các trang Public (Ta sẽ code chi tiết sau)
const HomePage = () => <h1>Trang Chủ FCAR - Các dòng xe hot</h1>;
const CarListPage = () => <h1>Danh sách Xe - Lấy từ Inventory</h1>;
const TestDrivePage = () => <h1>Form Đăng ký Lái thử</h1>;
const CustomerDashboard = () => <h1>Trang Dashboard Khách Hàng (Cần Login)</h1>;

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* CỤM AUTH: Không nằm trong Layout để màn hình full viền */}
          <Route path="/login" element={<Login />} />
          <Route path="/authenticate" element={<Authenticate />} />
          <Route path="/onboard" element={<Onboard />} />

          {/* NHÓM PUBLIC PAGES: Nằm trong PublicLayout có Navbar/Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/cars" element={<CarListPage />} />
            <Route path="/test-drive" element={<TestDrivePage />} />
            
            {/* NHÓM CUSTOMER PAGES: Được bảo vệ bởi ProtectedRoute */}
            <Route element={<ProtectedRoute />}>
               <Route path="/profile" element={<CustomerDashboard />} />
               {/* Sau này ghép các trang xem hợp đồng, lịch lái thử của khách vào đây */}
            </Route>
          </Route>

          {/* SAU NÀY SẼ THÊM NHÓM SHOWROOM VÀ ADMIN Ở ĐÂY */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}