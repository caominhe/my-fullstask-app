// # Component check token và role trước khi cho vào
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();

  // 1. Nếu chưa đăng nhập -> Đuổi ra trang login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu có yêu cầu Role (VD: admin, showroom) mà user không có -> Đuổi về trang chủ
  // Tạm thời comment logic này lại, sau này phân quyền UI ta sẽ dùng
  
  const hasRequiredRole = user.roles.some(role => allowedRoles.includes(role.name));
  if (allowedRoles && !hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  // 3. Hợp lệ -> Cho phép đi tiếp (Render các component con)
  return <Outlet />;
}