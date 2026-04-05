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
public class CarDetailRes {
    String vin;
    String engineNumber;
    String color;
    Long showroomId;
    String status;
    LocalDateTime createdAt;

    // Flattened từ MasterData để Frontend dễ hiển thị
    Long masterDataId;
    String brand;
    String model;
    String version;
    BigDecimal basePrice;
}
