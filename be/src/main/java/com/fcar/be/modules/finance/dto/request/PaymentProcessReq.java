package com.fcar.be.modules.finance.dto.request;

import jakarta.validation.constraints.NotBlank;

import lombok.*;
import lombok.experimental.FieldDefaults;

/** Tạo bản ghi biên lai (chỉ gắn hợp đồng + số tiền theo HĐ; chưa có hình thức/phương thức). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentProcessReq {
    @NotBlank
    String contractNo;
}
