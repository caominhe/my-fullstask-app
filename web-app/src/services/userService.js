import { apiClient } from "../api/client";

/**
 * @param {{ skipRedirectOn401?: boolean }} [opts] - dùng skipRedirectOn401 trong luồng OAuth để không reload mất thông báo lỗi
 */
export async function fetchMyInfo(opts = {}) {
  const data = await apiClient.get("/users/my-info", opts);
  return data.result;
}

export async function updateMyInfo({ phone, citizenId, address }) {
  const data = await apiClient.put("/users/my-info", {
    phone: phone || undefined,
    citizenId: citizenId || undefined,
    address: address || undefined,
  });
  return data.result;
}

export async function registerUser({ email, password, fullName, phone }) {
  const data = await apiClient.post(
    "/users/register",
    { email, password, fullName, phone: phone || undefined },
    { skipAuth: true }
  );
  return data.result;
}

export async function onboardUser({ phone, password }) {
  const data = await apiClient.put("/users/onboard", { phone, password });
  return data.result;
}
