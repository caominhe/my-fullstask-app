import { apiClient } from "../../api/client";

/** Toàn bộ API /aftersales — một nguồn, tránh trùng giữa admin/showroom/customer. */
export const aftersalesApi = {
  getWarranty: (carVin) => apiClient.get(`/aftersales/warranties/${encodeURIComponent(carVin)}`),
  getWarrantyHistory: (carVin) =>
    apiClient.get(`/aftersales/warranties/${encodeURIComponent(carVin)}/history`),
  activateWarrantyForShowroom: (payload) => apiClient.post("/aftersales/showroom/warranties", payload),
  updateWarranty: (carVin, payload) =>
    apiClient.put(`/aftersales/warranties/${encodeURIComponent(carVin)}`, payload),
  adminWarrantyLookup: ({ contractNo, licensePlate }) => {
    const q = new URLSearchParams();
    if (contractNo) q.append("contractNo", contractNo);
    if (licensePlate) q.append("licensePlate", licensePlate);
    return apiClient.get(`/aftersales/admin/warranty-lookup?${q.toString()}`);
  },
  createServiceTicket: (payload) => apiClient.post("/aftersales/service-tickets", payload),
};
