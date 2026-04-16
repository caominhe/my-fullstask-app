package com.fcar.be.modules.finance.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import com.fcar.be.modules.finance.enums.PaymentMethod;
import com.fcar.be.modules.finance.enums.PaymentType;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReceiptConfirmReq {
    @NotNull
    @Positive
    BigDecimal amount;

    @NotNull
    PaymentType paymentType;

    @NotNull
    PaymentMethod paymentMethod;

    String note;

    /** Bắt buộc khi {@link PaymentMethod#BANK_TRANSFER} — URL ảnh đã upload (Cloudinary). */
    String proofImageUrl;
}
