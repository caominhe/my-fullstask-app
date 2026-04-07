/** Gọi khi API trả 401 — đăng ký từ SessionExpiredBridge (trong Router). */
let handler = null;

export function setSessionExpiredHandler(fn) {
  handler = typeof fn === "function" ? fn : null;
}

export function triggerSessionExpired() {
  if (handler) {
    handler();
  } else {
    window.location.assign("/login");
  }
}
