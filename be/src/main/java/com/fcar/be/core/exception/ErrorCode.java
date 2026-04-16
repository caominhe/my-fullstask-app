package com.fcar.be.core.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {

    // ==============================================================================
    // [CORE] LỖI HỆ THỐNG CHUNG & VALIDATION (9xxx & 100x)
    // ==============================================================================
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid message key for validation", HttpStatus.BAD_REQUEST),

    // ==============================================================================
    // [MODULE 0] IDENTITY: Auth, User, Role (1xxx)
    // ==============================================================================
    USER_EXISTED(1002, "User already existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least 3 characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least 8 characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User does not exist", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated. Please login.", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission to access this resource", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    DONT_PENDING_ONBOARD(1009, "DONT_PENDING_ONBOARD", HttpStatus.BAD_REQUEST),
    INVALID_ROLE_NAME(1010, "Unknown or invalid role name", HttpStatus.BAD_REQUEST),
    GOOGLE_OAUTH_FAILED(
            1011,
            "Không đổi được mã Google (token). Kiểm tra Redirect URI khớp http://localhost:3000/authenticate, Client ID/Secret, và chỉ dùng mã một lần.",
            HttpStatus.BAD_REQUEST),
    INVALID_TOKEN(1012, "Invalid or expired token", HttpStatus.UNAUTHORIZED),
    SHOWROOM_ID_REQUIRED(1013, "Showroom is required when assigning SHOWROOM role", HttpStatus.BAD_REQUEST),
    PHONE_ALREADY_USED(1014, "Số điện thoại đã được sử dụng", HttpStatus.BAD_REQUEST),
    CITIZEN_ID_ALREADY_USED(1015, "CCCD đã được sử dụng", HttpStatus.BAD_REQUEST),
    PHONE_INVALID(1016, "Số điện thoại không hợp lệ", HttpStatus.BAD_REQUEST),
    CITIZEN_ID_INVALID(1017, "CCCD không hợp lệ", HttpStatus.BAD_REQUEST),
    ADDRESS_TOO_LONG(1018, "Địa chỉ vượt quá độ dài cho phép", HttpStatus.BAD_REQUEST),

    // ==============================================================================
    // [MODULE 1] INVENTORY: Kho xe & Master Data (2xxx)
    // ==============================================================================
    CAR_NOT_FOUND(2001, "Car with this VIN not found", HttpStatus.NOT_FOUND),
    CAR_EXISTED(2002, "VIN này đã tồn tại trong hệ thống.", HttpStatus.BAD_REQUEST),
    ENGINE_NUMBER_EXISTED(2003, "Số máy này đã tồn tại.", HttpStatus.BAD_REQUEST),
    MASTER_DATA_NOT_FOUND(2004, "Master data (Car model) not found", HttpStatus.NOT_FOUND),
    CAR_INVALID_STATUS(2005, "Car is not in a valid status for this action", HttpStatus.BAD_REQUEST),
    SHOWROOM_NOT_FOUND(2006, "Showroom not found", HttpStatus.NOT_FOUND),
    MASTER_DATA_IN_USE(2007, "Master data is referenced by cars and cannot be deleted", HttpStatus.BAD_REQUEST),
    SHOWROOM_IN_USE(2008, "Showroom is referenced by data and cannot be deleted", HttpStatus.BAD_REQUEST),
    INVALID_TRANSFER_TARGET(2009, "Provide showroomId or showroomName for transfer", HttpStatus.BAD_REQUEST),

    /** Master data — validation theo từng field */
    MASTER_DATA_BRAND_REQUIRED(2010, "Thiếu hãng (brand).", HttpStatus.BAD_REQUEST),
    MASTER_DATA_BRAND_TOO_LONG(2011, "Hãng (brand) vượt quá độ dài cho phép.", HttpStatus.BAD_REQUEST),
    MASTER_DATA_MODEL_REQUIRED(2012, "Thiếu dòng xe (model).", HttpStatus.BAD_REQUEST),
    MASTER_DATA_MODEL_TOO_LONG(2013, "Dòng xe (model) vượt quá độ dài cho phép.", HttpStatus.BAD_REQUEST),
    MASTER_DATA_VERSION_REQUIRED(2014, "Thiếu phiên bản (version).", HttpStatus.BAD_REQUEST),
    MASTER_DATA_VERSION_TOO_LONG(2015, "Phiên bản (version) vượt quá độ dài cho phép.", HttpStatus.BAD_REQUEST),
    MASTER_DATA_BASE_PRICE_REQUIRED(2016, "Thiếu giá niêm yết (base price).", HttpStatus.BAD_REQUEST),
    MASTER_DATA_BASE_PRICE_INVALID(2017, "Giá niêm yết phải lớn hơn 0.", HttpStatus.BAD_REQUEST),

    /** Showroom — validation */
    SHOWROOM_NAME_REQUIRED(2018, "Thiếu tên showroom.", HttpStatus.BAD_REQUEST),
    SHOWROOM_NAME_TOO_LONG(2019, "Tên showroom vượt quá độ dài cho phép.", HttpStatus.BAD_REQUEST),
    SHOWROOM_ADDRESS_TOO_LONG(2020, "Địa chỉ showroom vượt quá độ dài cho phép.", HttpStatus.BAD_REQUEST),

    /** Nhập xe (import) — validation */
    CAR_VIN_REQUIRED(2021, "Thiếu số VIN.", HttpStatus.BAD_REQUEST),
    CAR_VIN_LENGTH_INVALID(2022, "VIN phải đúng 17 ký tự.", HttpStatus.BAD_REQUEST),
    CAR_VIN_FORMAT_INVALID(
            2023, "VIN không hợp lệ: chỉ chữ số và chữ cái (không dùng I, O, Q).", HttpStatus.BAD_REQUEST),
    CAR_MASTER_DATA_ID_REQUIRED(2024, "Chưa chọn dòng xe (master data).", HttpStatus.BAD_REQUEST),
    CAR_ENGINE_NUMBER_REQUIRED(2025, "Thiếu số máy.", HttpStatus.BAD_REQUEST),
    CAR_ENGINE_NUMBER_TOO_LONG(2026, "Số máy vượt quá độ dài cho phép.", HttpStatus.BAD_REQUEST),
    CAR_COLOR_REQUIRED(2027, "Thiếu màu xe.", HttpStatus.BAD_REQUEST),
    CAR_COLOR_TOO_LONG(2028, "Tên màu vượt quá độ dài cho phép.", HttpStatus.BAD_REQUEST),
    CAR_IMAGE_UPLOAD_FAILED(2029, "Upload hình xe lên Cloud thất bại.", HttpStatus.BAD_REQUEST),
    CAR_IMAGE_URL_TOO_LONG(2030, "URL hình xe vượt quá độ dài cho phép.", HttpStatus.BAD_REQUEST),
    CAR_PRICE_INVALID(2031, "Giá xe phải lớn hơn 0.", HttpStatus.BAD_REQUEST),

    // ==============================================================================
    // [MODULE 2] MARKETING: Chiến dịch & Voucher (3xxx)
    // ==============================================================================
    CAMPAIGN_NOT_FOUND(3001, "Campaign not found in the system", HttpStatus.NOT_FOUND),
    VOUCHER_NOT_FOUND(3002, "Voucher code does not exist", HttpStatus.NOT_FOUND),
    VOUCHER_EXPIRED(3003, "Voucher has expired", HttpStatus.BAD_REQUEST),
    VOUCHER_INVALID_STATUS(3004, "Voucher is not in the correct state to perform this action", HttpStatus.BAD_REQUEST),
    VOUCHER_NOT_OWNED(3005, "You do not own this voucher or it does not exist", HttpStatus.FORBIDDEN),
    VOUCHER_NOT_APPLICABLE(3006, "This voucher is not applicable for the selected car model", HttpStatus.BAD_REQUEST),
    CAMPAIGN_NAME_DUPLICATED(3007, "Tên chiến dịch đã tồn tại", HttpStatus.BAD_REQUEST),
    CAMPAIGN_INVALID_QUANTITY(3008, "Số lượng voucher phải lớn hơn 0", HttpStatus.BAD_REQUEST),
    CAMPAIGN_INVALID_EXPIRED_AT(
            3009, "Thời gian hết hạn không hợp lệ (định dạng yyyy-MM-ddTHH:mm:ss)", HttpStatus.BAD_REQUEST),
    CAMPAIGN_TARGET_SCOPE_REQUIRED(3013, "Phải chọn phạm vi áp dụng khuyến mãi", HttpStatus.BAD_REQUEST),
    CAMPAIGN_TARGET_REGION_REQUIRED(3014, "Phạm vi KHU VỰC yêu cầu chọn miền", HttpStatus.BAD_REQUEST),
    CAMPAIGN_TARGET_PROVINCE_REQUIRED(3015, "Phạm vi ĐỊA ĐIỂM yêu cầu nhập tỉnh/thành", HttpStatus.BAD_REQUEST),
    CAMPAIGN_TARGET_SHOWROOM_REQUIRED(3016, "Phạm vi CHI NHÁNH yêu cầu chọn showroom", HttpStatus.BAD_REQUEST),
    CAMPAIGN_TARGET_SHOWROOM_NOT_FOUND(3017, "Showroom áp dụng khuyến mãi không tồn tại", HttpStatus.NOT_FOUND),

    // ==============================================================================
    // [MODULE 3] CRM: Khách hàng tiềm năng & Lái thử (4xxx)
    // ==============================================================================
    LEAD_NOT_FOUND(4001, "Lead not found in the system", HttpStatus.NOT_FOUND),
    TEST_DRIVE_NOT_FOUND(4002, "Test drive schedule not found", HttpStatus.NOT_FOUND),
    INVALID_LEAD_STATUS(4003, "Cannot change lead to this status", HttpStatus.BAD_REQUEST),
    SCHEDULE_TIME_INVALID(4004, "Test drive schedule must be in the future", HttpStatus.BAD_REQUEST),
    LEAD_CUSTOMER_REQUIRED(4005, "Lead must be linked to customer account to use voucher", HttpStatus.BAD_REQUEST),

    // ==============================================================================
    // [MODULE 4] SALES: Báo giá & Hợp đồng (5xxx)
    // ==============================================================================
    QUOTATION_NOT_FOUND(5001, "Quotation not found", HttpStatus.NOT_FOUND),
    QUOTATION_NOT_ACCEPTED(5002, "Quotation must be ACCEPTED before creating a contract", HttpStatus.BAD_REQUEST),
    CONTRACT_EXISTED(5003, "A contract has already been created for this quotation", HttpStatus.BAD_REQUEST),
    CONTRACT_NOT_FOUND(5004, "Contract not found", HttpStatus.NOT_FOUND),
    CONTRACT_NOT_PENDING(5005, "Contract must be in PENDING status for this action", HttpStatus.BAD_REQUEST),
    CONTRACT_NOT_SIGNED(5006, "Contract must be confirmed by customer before payment", HttpStatus.BAD_REQUEST),
    CONTRACT_PAYMENT_TYPE_MISMATCH(
            5007, "Payment type does not match customer selected method", HttpStatus.BAD_REQUEST),

    // ==============================================================================
    // [MODULE 5] FINANCE & HANDOVER: Thanh toán & Bàn giao (6xxx)
    // ==============================================================================
    HANDOVER_EXISTED(6001, "Handover process has already been initiated for this contract", HttpStatus.BAD_REQUEST),
    HANDOVER_NOT_FOUND(6002, "Handover record not found", HttpStatus.NOT_FOUND),
    LICENSE_PLATE_EXISTED(6003, "This license plate is already registered to another vehicle", HttpStatus.BAD_REQUEST),
    INVALID_PAYMENT_AMOUNT(6004, "Payment amount is invalid", HttpStatus.BAD_REQUEST),
    PAYMENT_NOT_FOUND(6005, "Receipt not found", HttpStatus.NOT_FOUND),
    PAYMENT_NOT_CONFIRMED(6006, "Receipt has not been confirmed as paid", HttpStatus.BAD_REQUEST),
    RECEIPT_EXISTED(6007, "Receipt already exists for this contract", HttpStatus.BAD_REQUEST),
    PAYMENT_PROOF_REQUIRED(6008, "Chuyển khoản yêu cầu ảnh xác minh", HttpStatus.BAD_REQUEST),

    // Lỗi liên quan đến Aftersales (Warranty/Service) (7xxx)
    // ==============================================================================
    // [MODULE 6] AFTERSALES: Bảo hành & Dịch vụ (7xxx)
    // ==============================================================================
    WARRANTY_EXISTED(7001, "Warranty book already exists for this car VIN", HttpStatus.BAD_REQUEST),
    WARRANTY_NOT_FOUND(7002, "Warranty book not found. Please check the car VIN.", HttpStatus.NOT_FOUND),
    CAR_NOT_HANDED_OVER(7003, "Car has not been handed over yet", HttpStatus.BAD_REQUEST),
    WARRANTY_LOOKUP_PARAMS(7004, "Chỉ nhập số hợp đồng hoặc biển số (một trong hai)", HttpStatus.BAD_REQUEST),
    WARRANTY_UPDATE_EMPTY(7005, "Cần biển số mới hoặc thời hạn (tháng) để cập nhật sổ", HttpStatus.BAD_REQUEST),
    ;

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
