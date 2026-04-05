package com.fcar.be.modules.inventory.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarImportReq {
    @NotBlank(message = "VIN is required")
    @Size(min = 17, max = 17, message = "VIN must be exactly 17 characters")
    String vin;

    @NotNull(message = "Master Data ID is required")
    Long masterDataId;

    @NotBlank(message = "Engine number is required")
    String engineNumber;

    @NotBlank(message = "Color is required")
    String color;

    Long showroomId; // Có thể null nếu để ở kho tổng
}
