import { apiClient } from "../api/client";

export const portalApi = {
  // Group 0
  createLead: (payload) => apiClient.post("/leads", payload),

  // Admin
  getUsers: () => apiClient.get("/users"),
  updateUserRoles: (userId, roleNames) => apiClient.put(`/users/${userId}/roles`, { roleNames }),
  getCars: () => apiClient.get("/cars"),
  importCar: (payload) => apiClient.post("/cars/import", payload),
  transferCar: (vin, showroomId) => apiClient.put(`/cars/${encodeURIComponent(vin)}/transfer`, { showroomId }),
  assignLead: (leadId, salesId) => apiClient.put(`/leads/${leadId}/assign/${salesId}`),
  createCampaign: (payload) => apiClient.post("/campaigns", payload),
  generateCampaignVouchers: (campaignId, { quantity, prefix, expiredAt }) => {
    const q = new URLSearchParams({ quantity: String(quantity), expiredAt });
    if (prefix) q.append("prefix", prefix);
    return apiClient.post(`/campaigns/${campaignId}/generate?${q.toString()}`);
  },

  // Sales
  getLeadsBySales: (salesId) => apiClient.get(`/leads/sales/${salesId}`),
  getCarByVin: (vin) => apiClient.get(`/cars/${encodeURIComponent(vin)}`),
  createQuotation: (payload) => apiClient.post("/sales/quotations", payload),
  createContract: (quotationId) => apiClient.post(`/sales/quotations/${quotationId}/contracts`),
  lockCar: (vin) => apiClient.put(`/cars/${encodeURIComponent(vin)}/lock`),
  processPayment: (payload) => apiClient.post("/finance/payments", payload),
  initHandover: (contractNo) => apiClient.post(`/finance/contracts/${encodeURIComponent(contractNo)}/handover`),
  updateHandover: (contractNo, payload) =>
    apiClient.put(`/finance/contracts/${encodeURIComponent(contractNo)}/handover`, payload),
  sellCar: (vin) => apiClient.put(`/cars/${encodeURIComponent(vin)}/sell`),
  activateWarranty: (payload) => apiClient.post("/aftersales/warranties", payload),
  createServiceTicket: (payload) => apiClient.post("/aftersales/service-tickets", payload),

  // Customer
  registerEvent: (eventId) => apiClient.post(`/events/${eventId}/register`),
  claimVoucher: (code) => apiClient.post(`/vouchers/${encodeURIComponent(code)}/claim`),
  acceptQuotation: (quotationId) => apiClient.put(`/sales/quotations/${quotationId}/accept`),
  getPaymentsByContract: (contractNo) => apiClient.get(`/finance/contracts/${encodeURIComponent(contractNo)}/payments`),
  getWarranty: (carVin) => apiClient.get(`/aftersales/warranties/${encodeURIComponent(carVin)}`),
  getWarrantyHistory: (carVin) =>
    apiClient.get(`/aftersales/warranties/${encodeURIComponent(carVin)}/history`),
};

