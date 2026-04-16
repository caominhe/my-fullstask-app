import { apiClient } from "../../api/client";

export const showroomApi = {
  getLeadsMyShowroom: () => apiClient.get("/leads/my-showroom"),
  createContract: (payload) => apiClient.post("/sales/contracts", payload),
  getLeadVouchers: (leadId) => apiClient.get(`/sales/leads/${encodeURIComponent(leadId)}/vouchers`),
  lockCar: (vin) => apiClient.put(`/cars/${encodeURIComponent(vin)}/lock`),
  createReceipt: (payload) => apiClient.post("/finance/receipts", payload),
  confirmReceipt: (receiptId, payload) => apiClient.put(`/finance/receipts/${receiptId}/confirm`, payload),
  uploadPaymentProof: (contractNo, receiptId, file) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post(
      `/finance/contracts/${encodeURIComponent(contractNo)}/receipts/${receiptId}/payment-proof`,
      form
    );
  },
  getReceiptByContract: (contractNo) => apiClient.get(`/finance/contracts/${encodeURIComponent(contractNo)}/receipt`),
  initHandover: (contractNo) => apiClient.post(`/finance/contracts/${encodeURIComponent(contractNo)}/handover`),
  getHandover: (contractNo) => apiClient.get(`/finance/contracts/${encodeURIComponent(contractNo)}/handover`),
  updateHandover: (contractNo, payload) =>
    apiClient.put(`/finance/contracts/${encodeURIComponent(contractNo)}/handover`, payload),
};
