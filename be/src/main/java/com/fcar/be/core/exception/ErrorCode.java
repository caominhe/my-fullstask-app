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

    // ==============================================================================
    // [MODULE 1] INVENTORY: Kho xe & Master Data (2xxx)
    // ==============================================================================
    CAR_NOT_FOUND(2001, "Car with this VIN not found", HttpStatus.NOT_FOUND),
    CAR_EXISTED(2002, "Car with this VIN already exists in the system", HttpStatus.BAD_REQUEST),
    ENGINE_NUMBER_EXISTED(2003, "Car with this engine number already exists", HttpStatus.BAD_REQUEST),
    MASTER_DATA_NOT_FOUND(2004, "Master data (Car model) not found", HttpStatus.NOT_FOUND),
    CAR_INVALID_STATUS(2005, "Car is not in a valid status for this action", HttpStatus.BAD_REQUEST),

    // ==============================================================================
    // [MODULE 2] MARKETING: Chiến dịch & Voucher (3xxx)
    // ==============================================================================
    CAMPAIGN_NOT_FOUND(3001, "Campaign not found in the system", HttpStatus.NOT_FOUND),
    VOUCHER_NOT_FOUND(3002, "Voucher code does not exist", HttpStatus.NOT_FOUND),
    VOUCHER_EXPIRED(3003, "Voucher has expired", HttpStatus.BAD_REQUEST),
    VOUCHER_INVALID_STATUS(3004, "Voucher is not in the correct state to perform this action", HttpStatus.BAD_REQUEST),
    VOUCHER_NOT_OWNED(3005, "You do not own this voucher or it does not exist", HttpStatus.FORBIDDEN),
    VOUCHER_NOT_APPLICABLE(3006, "This voucher is not applicable for the selected car model", HttpStatus.BAD_REQUEST),

    // ==============================================================================
    // [MODULE 3] CRM: Khách hàng tiềm năng & Lái thử (4xxx)
    // ==============================================================================
    LEAD_NOT_FOUND(4001, "Lead not found in the system", HttpStatus.NOT_FOUND),
    TEST_DRIVE_NOT_FOUND(4002, "Test drive schedule not found", HttpStatus.NOT_FOUND),
    INVALID_LEAD_STATUS(4003, "Cannot change lead to this status", HttpStatus.BAD_REQUEST),
    SCHEDULE_TIME_INVALID(4004, "Test drive schedule must be in the future", HttpStatus.BAD_REQUEST),

    // ==============================================================================
    // [MODULE 4] SALES: Báo giá & Hợp đồng (5xxx)
    // ==============================================================================
    QUOTATION_NOT_FOUND(5001, "Quotation not found", HttpStatus.NOT_FOUND),
    QUOTATION_NOT_ACCEPTED(5002, "Quotation must be ACCEPTED before creating a contract", HttpStatus.BAD_REQUEST),
    CONTRACT_EXISTED(5003, "A contract has already been created for this quotation", HttpStatus.BAD_REQUEST),
    CONTRACT_NOT_FOUND(5004, "Contract not found", HttpStatus.NOT_FOUND),

    // ==============================================================================
    // [MODULE 5] FINANCE & HANDOVER: Thanh toán & Bàn giao (6xxx)
    // ==============================================================================
    HANDOVER_EXISTED(6001, "Handover process has already been initiated for this contract", HttpStatus.BAD_REQUEST),
    HANDOVER_NOT_FOUND(6002, "Handover record not found", HttpStatus.NOT_FOUND),
    LICENSE_PLATE_EXISTED(6003, "This license plate is already registered to another vehicle", HttpStatus.BAD_REQUEST),
    INVALID_PAYMENT_AMOUNT(6004, "Payment amount is invalid", HttpStatus.BAD_REQUEST),

    // Lỗi liên quan đến Aftersales (Warranty/Service) (7xxx)
    // ==============================================================================
    // [MODULE 6] AFTERSALES: Bảo hành & Dịch vụ (7xxx)
    // ==============================================================================
    WARRANTY_EXISTED(7001, "Warranty book already exists for this car VIN", HttpStatus.BAD_REQUEST),
    WARRANTY_NOT_FOUND(7002, "Warranty book not found. Please check the car VIN.", HttpStatus.NOT_FOUND),
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
