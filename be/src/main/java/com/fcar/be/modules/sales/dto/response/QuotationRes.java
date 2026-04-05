package com.fcar.be.modules.sales.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fcar.be.modules.sales.enums.QuotationStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuotationRes {
    Long id;
    Long leadId;
    String carVin;
    String voucherCode;
    BigDecimal totalAmount;
    BigDecimal finalAmount;
    QuotationStatus status;
    LocalDateTime createdAt;
}
