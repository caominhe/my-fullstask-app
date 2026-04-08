package com.fcar.be.modules.inventory.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MasterDataRes {
    Long id;
    String brand;
    String model;
    String version;
    BigDecimal basePrice;
    LocalDateTime createdAt;
}
