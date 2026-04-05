package com.fcar.be.modules.aftersales.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceTicketCreateReq {
    @NotBlank
    String carVin; // Tìm sổ bảo hành qua VIN

    @NotBlank
    String description;

    @NotNull
    @PositiveOrZero
    BigDecimal totalCost;
}
