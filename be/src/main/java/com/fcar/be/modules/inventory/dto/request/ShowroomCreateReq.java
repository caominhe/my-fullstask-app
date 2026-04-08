package com.fcar.be.modules.inventory.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowroomCreateReq {
    @NotBlank(message = "SHOWROOM_NAME_REQUIRED")
    @Size(max = 200, message = "SHOWROOM_NAME_TOO_LONG")
    String name;

    @Size(max = 500, message = "SHOWROOM_ADDRESS_TOO_LONG")
    String address;
}
