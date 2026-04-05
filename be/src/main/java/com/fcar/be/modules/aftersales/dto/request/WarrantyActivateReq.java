package com.fcar.be.modules.aftersales.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarrantyActivateReq {
    @NotBlank
    String carVin;

    @NotBlank
    String licensePlate;

    @NotNull
    Integer durationMonths; // Thời hạn bảo hành (VD: 36 tháng)
}
