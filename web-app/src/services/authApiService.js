import { apiClient } from "../api/client";
import { getRefreshToken } from "./localStorageService";

export async function loginWithPassword({ email, password }) {
  const data = await apiClient.post(
    "/auth/login",
    { email, password },
    { skipAuth: true }
  );
  return data.result;
}

export async function exchangeGoogleCode(code) {
  const q = new URLSearchParams({ code });
  const data = await apiClient.post(`/auth/google/exchange?${q.toString()}`, undefined, {
    skipAuth: true,
  });
  return data.result;
}

/** Gọi trước khi xóa token ở client; không gửi Authorization (access có thể đã hết hạn). */
export async function logoutOnServer() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return;
  }
  await apiClient.post(
    "/auth/logout",
    { refreshToken },
    { skipAuth: true, skipRedirectOn401: true }
  );
}
