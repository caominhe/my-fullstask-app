export const KEY_TOKEN = "accessToken";
export const KEY_REFRESH_TOKEN = "refreshToken";

export const setToken = (token) => {
  localStorage.setItem(KEY_TOKEN, token);
};

export const getToken = () => {
  return localStorage.getItem(KEY_TOKEN);
};

export const removeToken = () => {
  return localStorage.removeItem(KEY_TOKEN);
};

export const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem(KEY_REFRESH_TOKEN, token);
  }
};

export const getRefreshToken = () => {
  return localStorage.getItem(KEY_REFRESH_TOKEN);
};

export const removeRefreshToken = () => {
  return localStorage.removeItem(KEY_REFRESH_TOKEN);
};

/** Xóa cả access + refresh (đăng xuất / phiên hết hạn hoàn toàn). */
export const removeAllAuthTokens = () => {
  removeToken();
  removeRefreshToken();
};
