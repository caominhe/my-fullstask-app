import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setSessionExpiredHandler } from "../utils/sessionExpired";
import { useNotify } from "../contexts/NotifyContext";

const SESSION_EXPIRED_MSG =
  "Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.";

/**
 * Đăng ký xử lý 401 từ api/client: Snackbar cố định + điều hướng /login (không reload full trang).
 */
export default function SessionExpiredBridge() {
  const navigate = useNavigate();
  const { error: notifyError } = useNotify();

  useEffect(() => {
    setSessionExpiredHandler(() => {
      notifyError(SESSION_EXPIRED_MSG);
      navigate("/login", { replace: true });
    });
    return () => setSessionExpiredHandler(null);
  }, [navigate, notifyError]);

  return null;
}
