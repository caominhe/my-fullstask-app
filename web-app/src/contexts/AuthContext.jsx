import { createContext, useState, useEffect, useContext } from "react";
import { getToken, setToken as saveToken, removeToken } from "../services/localStorageService";

// Tạo Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khi app khởi chạy, kiểm tra xem có token cũ không để phục hồi trạng thái
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          // Gọi API my-info để lấy thông tin user. (Tái sử dụng logic cũ của bạn)
          const response = await fetch("http://localhost:8080/api/v1/users/my-info", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data.result);
          } else {
            removeToken(); // Token hết hạn hoặc lỗi
          }
        } catch (error) {
          console.error("Lỗi xác thực", error);
        }
      }
      setLoading(false); // Xong bước kiểm tra
    };
    initAuth();
  }, []);

  // Hàm gọi khi Login thành công
  const login = (token, userData) => {
    saveToken(token);
    setUser(userData);
  };

  // Hàm gọi khi Đăng xuất
  const logout = () => {
    removeToken();
    setUser(null);
    window.location.href = "/login"; // Force redirect
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children} {/* Chỉ render app khi đã check auth xong */}
    </AuthContext.Provider>
  );
};

// Custom hook để dùng cho tiện
export const useAuth = () => useContext(AuthContext);