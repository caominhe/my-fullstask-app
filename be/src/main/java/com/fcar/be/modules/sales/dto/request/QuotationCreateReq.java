package com.fcar.be.modules.sales.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuotationCreateReq {
    @NotNull
    Long leadId;

    @NotBlank
    String carVin;

    String voucherCode; // Có thể null nếu khách không có mã
}
