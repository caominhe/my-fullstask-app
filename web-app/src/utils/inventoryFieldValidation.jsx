import CheckCircle from "@mui/icons-material/CheckCircle";
import InputAdornment from "@mui/material/InputAdornment";

/** Khớp quy tắc BE: VIN 17 ký tự, không I/O/Q */
export const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

export const INV_MAX = {
  brand: 120,
  model: 120,
  version: 120,
  engine: 80,
  color: 60,
  showroomName: 200,
  address: 500,
};

export function validateVin(raw) {
  const s = String(raw || "").trim().toUpperCase();
  if (!s) return { empty: true, ok: false, msg: "" };
  if (s.length !== 17) return { empty: false, ok: false, msg: "VIN cần đúng 17 ký tự." };
  if (!VIN_REGEX.test(s)) return { empty: false, ok: false, msg: "VIN không hợp lệ (không dùng I, O, Q)." };
  return { empty: false, ok: true, msg: "" };
}

export function validateRequiredMax(raw, max, labelShort) {
  const s = String(raw || "").trim();
  if (!s) return { empty: true, ok: false, msg: "" };
  if (s.length > max) return { empty: false, ok: false, msg: `${labelShort} tối đa ${max} ký tự.` };
  return { empty: false, ok: true, msg: "" };
}

/** Địa chỉ: trống = trung tính; có nội dung thì kiểm tra độ dài */
export function validateOptionalMax(raw, max, labelShort) {
  const s = String(raw || "").trim();
  if (!s) return { empty: true, ok: true, msg: "" };
  if (s.length > max) return { empty: false, ok: false, msg: `${labelShort} tối đa ${max} ký tự.` };
  return { empty: false, ok: true, msg: "" };
}

export function validateBasePrice(raw) {
  const t = String(raw ?? "").trim();
  if (!t) return { empty: true, ok: false, msg: "" };
  const n = Number(t);
  if (Number.isNaN(n) || n <= 0) return { empty: false, ok: false, msg: "Giá phải là số lớn hơn 0." };
  return { empty: false, ok: true, msg: "" };
}

export function validateMasterIdSelected(id) {
  const s = id != null && id !== "" ? String(id) : "";
  if (!s) return { empty: true, ok: false, msg: "" };
  const n = Number(s);
  if (!Number.isInteger(n) || n < 1) return { empty: false, ok: false, msg: "Chọn dòng xe (master data)." };
  return { empty: false, ok: true, msg: "" };
}

export function validateShowroomSelected(name) {
  const s = String(name || "").trim();
  if (!s) return { empty: true, ok: false, msg: "" };
  return { empty: false, ok: true, msg: "" };
}

const successAdornment = (
  <InputAdornment position="end">
    <CheckCircle sx={{ color: "success.main", fontSize: "1.25rem" }} aria-hidden />
  </InputAdornment>
);

/**
 * Trả props cho TextField: error, color, helperText, InputProps
 * - Trống: không đỏ không xanh
 * - Có serverError: đỏ, ưu tiên message server
 * - Có giá trị + client invalid: đỏ + msg
 * - Hợp lệ: color success + helper "Hợp lệ" + icon tích xanh
 */
export function getInventoryFieldFeedback(serverError, value, validateFn) {
  const r = validateFn(value);
  if (r.empty) {
    return {
      error: false,
      helperText: "",
      InputProps: {},
      color: null,
    };
  }
  if (serverError) {
    return {
      error: true,
      helperText: serverError,
      InputProps: {},
      color: null,
    };
  }
  if (!r.ok) {
    return {
      error: true,
      helperText: r.msg,
      InputProps: {},
      color: null,
    };
  }
  return {
    error: false,
    color: "success",
    helperText: "Hợp lệ",
    InputProps: { endAdornment: successAdornment },
  };
}

/** Gộp feedback thành props TextField (MUI) */
export function spreadInventoryFieldFeedback(fb) {
  if (!fb) {
    return { error: false, helperText: "", InputProps: {} };
  }
  return {
    ...(fb.color ? { color: fb.color } : {}),
    error: fb.error,
    helperText: fb.helperText,
    InputProps: fb.InputProps,
  };
}
