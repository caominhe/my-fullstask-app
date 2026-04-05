package com.fcar.be.modules.finance.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import com.fcar.be.modules.finance.enums.PaymentType;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentProcessReq {
    @NotBlank
    String contractNo;

    @NotNull
    @Positive
    BigDecimal amount;

    @NotNull
    PaymentType paymentType;
}
