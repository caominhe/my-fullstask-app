package com.fcar.be.modules.inventory.dto.request;

import jakarta.validation.constraints.NotNull;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarTransferReq {
    @NotNull(message = "Showroom ID is required")
    Long showroomId; // Nơi xe sẽ được điều chuyển đến
}
