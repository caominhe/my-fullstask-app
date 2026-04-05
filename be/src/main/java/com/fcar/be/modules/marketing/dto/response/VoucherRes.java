package com.fcar.be.modules.marketing.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fcar.be.modules.marketing.enums.DiscountType;
import com.fcar.be.modules.marketing.enums.VoucherStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherRes {
    String code;
    Long campaignId;
    String campaignName;
    Long userId;
    VoucherStatus status;
    LocalDateTime expiredAt;
    // Voucher là tiền mặt hay %
    DiscountType discountType;
    BigDecimal discountValue;
}
