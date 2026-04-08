package com.fcar.be.modules.inventory.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
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
public class MasterDataCreateReq {
    @NotBlank(message = "MASTER_DATA_BRAND_REQUIRED")
    @Size(max = 120, message = "MASTER_DATA_BRAND_TOO_LONG")
    String brand;

    @NotBlank(message = "MASTER_DATA_MODEL_REQUIRED")
    @Size(max = 120, message = "MASTER_DATA_MODEL_TOO_LONG")
    String model;

    @NotBlank(message = "MASTER_DATA_VERSION_REQUIRED")
    @Size(max = 120, message = "MASTER_DATA_VERSION_TOO_LONG")
    String version;

    @NotNull(message = "MASTER_DATA_BASE_PRICE_REQUIRED")
    @DecimalMin(value = "0.0", inclusive = false, message = "MASTER_DATA_BASE_PRICE_INVALID")
    BigDecimal basePrice;
}
