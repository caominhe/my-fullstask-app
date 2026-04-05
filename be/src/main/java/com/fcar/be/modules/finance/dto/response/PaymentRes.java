package com.fcar.be.modules.finance.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fcar.be.modules.finance.enums.PaymentStatus;
import com.fcar.be.modules.finance.enums.PaymentType;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentRes {
    Long id;
    String contractNo;
    BigDecimal amount;
    PaymentType paymentType;
    LocalDateTime paymentDate;
    PaymentStatus status;
}
