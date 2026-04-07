import { createContext, useState, useEffect, useContext, useCallback } from "react";
import {
  getToken,
  setToken as saveToken,
  removeAllAuthTokens,
  setRefreshToken,
} from "../services/localStorageService";
import { logoutOnServer } from "../services/authApiService";
import { fetchMyInfo } from "../services/userService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const profile = await fetchMyInfo();
          setUser(profile);
        } catch (error) {
          console.error("Lỗi xác thực", error);
          removeAllAuthTokens();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback((token, userData, refreshToken) => {
    saveToken(token);
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutOnServer();
    } catch (error) {
      console.error("Lỗi khi báo backend logout:", error);
    } finally {
      removeAllAuthTokens();
      setUser(null);
      window.location.href = "/login";
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    const profile = await fetchMyInfo();
    setUser(profile);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
