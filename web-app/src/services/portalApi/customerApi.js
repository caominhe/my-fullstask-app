import { apiClient } from "../../api/client";

export const customerApi = {
  getCustomerCampaigns: (showroomId) =>
    apiClient.get(`/campaigns/customer${showroomId ? `?showroomId=${encodeURIComponent(showroomId)}` : ""}`),
  registerCampaign: (campaignId, showroomId) =>
    apiClient.post(
      `/campaigns/${encodeURIComponent(campaignId)}/register${
        showroomId ? `?showroomId=${encodeURIComponent(showroomId)}` : ""
      }`
    ),
  getMyVouchers: () => apiClient.get("/vouchers/my"),
  confirmContract: (contractNo) => apiClient.put(`/sales/contracts/${encodeURIComponent(contractNo)}/confirm`),
  getPaymentsByContract: (contractNo) => apiClient.get(`/finance/contracts/${encodeURIComponent(contractNo)}/payments`),
};
