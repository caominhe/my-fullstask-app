package com.fcar.be.modules.aftersales.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarrantyBookRes {
    Long id;
    String carVin;
    String licensePlate;
    LocalDate startDate;
    LocalDate endDate;
    LocalDateTime createdAt;

    @JsonProperty("isExpired")
    boolean isExpired; // Thuộc tính tính toán thêm cho Frontend
}
