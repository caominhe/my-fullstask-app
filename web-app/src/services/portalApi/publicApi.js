import { apiClient } from "../../api/client";

export const publicApi = {
  createLead: (payload) => apiClient.post("/leads", payload),
  getCars: (params = {}) => {
    const q = new URLSearchParams();
    if (params.showroomId != null && params.showroomId !== "") q.append("showroomId", String(params.showroomId));
    if (params.brand) q.append("brand", params.brand);
    if (params.model) q.append("model", params.model);
    if (params.excludeWithContract === true) q.append("excludeWithContract", "true");
    return apiClient.get(`/cars${q.toString() ? `?${q.toString()}` : ""}`);
  },
  getCarByVin: (vin) => apiClient.get(`/cars/${encodeURIComponent(vin)}`),
  getMasterData: (params = {}) => {
    const q = new URLSearchParams();
    if (params.brand) q.append("brand", params.brand);
    if (params.model) q.append("model", params.model);
    return apiClient.get(`/master-data${q.toString() ? `?${q.toString()}` : ""}`);
  },
  getShowrooms: (keyword) => apiClient.get(`/showrooms${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ""}`),
};
