package com.fcar.be.modules.finance.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fcar.be.modules.finance.enums.PaymentMethod;
import com.fcar.be.modules.finance.enums.PaymentStatus;
import com.fcar.be.modules.finance.enums.PaymentType;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentRes {
    Long id;
    Long receiptId;
    String contractNo;
    BigDecimal amount;
    PaymentType paymentType;
    PaymentMethod paymentMethod;
    String note;
    /** Ảnh xác minh (lịch sử từng lần thanh toán). */
    String proofImageUrl;

    String transferCode;
    String qrPayload;
    LocalDateTime paymentDate;
    LocalDateTime confirmedAt;
    PaymentStatus status;
    BigDecimal remainingDebt;
}
