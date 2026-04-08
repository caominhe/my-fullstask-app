import { API_BASE_URL } from "../configurations/configuration";
import { getToken, removeToken } from "../services/localStorageService";
import { triggerSessionExpired } from "../utils/sessionExpired";

/**
 * @param {string} path - ví dụ '/users/my-info' (không gồm base)
 * @param {RequestInit & { skipAuth?: boolean; skipRedirectOn401?: boolean }} options
 */
export async function apiRequest(path, options = {}) {
  const { skipAuth = false, skipRedirectOn401 = false, ...fetchOptions } = options;
  const headers = { ...fetchOptions.headers };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  if (
    fetchOptions.body != null &&
    typeof fetchOptions.body === "object" &&
    !(fetchOptions.body instanceof FormData)
  ) {
    headers["Content-Type"] = "application/json";
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...fetchOptions, headers });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text || "Invalid response" };
  }

  if (res.status === 401) {
    removeToken();
    if (!skipRedirectOn401) {
      triggerSessionExpired();
    }
    throw new Error("Phiên đăng nhập không hợp lệ hoặc đã hết hạn (401).");
  }

  if (!res.ok) {
    const msg = data?.message || res.statusText || "Request failed";
    const err = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    if (data?.code != null) err.code = data.code;
    if (data?.field) err.field = data.field;
    if (data?.fieldErrors != null && typeof data.fieldErrors === "object") {
      err.fieldErrors = { ...data.fieldErrors };
    }
    throw err;
  }

  return data;
}

export const apiClient = {
  get: (path, opts) => apiRequest(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => apiRequest(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => apiRequest(path, { ...opts, method: "PUT", body }),
  delete: (path, opts) => apiRequest(path, { ...opts, method: "DELETE" }),
};
