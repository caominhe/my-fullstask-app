/** Tránh NaN/null gửi lên API (gây 400 @NotNull). */
export function parseDurationMonthsInput(value, fallback = 36) {
  const n = parseInt(String(value ?? "").replace(/\D/g, ""), 10);
  if (Number.isFinite(n) && n > 0) return n;
  return fallback;
}

/** Số tháng giữa start/end trên sổ (ước lượng cho form). */
export function getWarrantyMonths(warranty) {
  if (!warranty?.startDate || !warranty?.endDate) return 36;
  const start = new Date(warranty.startDate);
  const end = new Date(warranty.endDate);
  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30)));
}

/** Payload PUT cập nhật sổ — dùng chung Admin & Showroom. */
export function buildWarrantyUpdatePayload(licensePlate, durationMonths) {
  return {
    licensePlate: licensePlate && String(licensePlate).trim() ? String(licensePlate).trim() : undefined,
    durationMonths: Number(durationMonths) > 0 ? Number(durationMonths) : undefined,
  };
}
