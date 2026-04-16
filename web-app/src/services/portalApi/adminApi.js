import { apiClient } from "../../api/client";

export const adminApi = {
  getUsers: () => apiClient.get("/users"),
  updateUserRoles: (userId, roleNames, showroomId) => apiClient.put(`/users/${userId}/roles`, { roleNames, showroomId }),
  importCar: (payload) => apiClient.post("/cars/import", payload),
  updateCar: (vin, payload) => apiClient.put(`/cars/${encodeURIComponent(vin)}`, payload),
  uploadCarImages: (files) => {
    const form = new FormData();
    (files || []).forEach((file) => form.append("files", file));
    return apiClient.post("/cars/images/upload-multiple", form);
  },
  transferCar: (vin, payload) => apiClient.put(`/cars/${encodeURIComponent(vin)}/transfer`, payload),
  createMasterData: (payload) => apiClient.post("/master-data", payload),
  updateMasterData: (id, payload) => apiClient.put(`/master-data/${id}`, payload),
  deleteMasterData: (id) => apiClient.delete(`/master-data/${id}`),
  createShowroom: (payload) => apiClient.post("/showrooms", payload),
  getShowroomManagement: (showroomId) => apiClient.get(`/showrooms/${encodeURIComponent(showroomId)}/management`),
  updateShowroom: (id, payload) => apiClient.put(`/showrooms/${id}`, payload),
  deleteShowroom: (id) => apiClient.delete(`/showrooms/${id}`),
  getCampaigns: () => apiClient.get("/campaigns"),
  updateCampaign: (campaignId, payload) => apiClient.put(`/campaigns/${campaignId}`, payload),
  deleteCampaign: (campaignId) => apiClient.delete(`/campaigns/${campaignId}`),
  createCampaign: (payload) => apiClient.post("/campaigns", payload),
  getCampaignVouchers: (campaignId) => apiClient.get(`/campaigns/${campaignId}/vouchers`),
  generateCampaignVouchers: (campaignId, { quantity, prefix, expiredAt }) => {
    const q = new URLSearchParams({ quantity: String(quantity), expiredAt });
    if (prefix) q.append("prefix", prefix);
    return apiClient.post(`/campaigns/${campaignId}/generate?${q.toString()}`);
  },
  getContract: (contractNo) => apiClient.get(`/sales/contracts/${encodeURIComponent(contractNo)}`),
};
