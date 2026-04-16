package com.fcar.be.modules.inventory.dto.request;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarImportReq {
    @NotBlank(message = "CAR_VIN_REQUIRED")
    @Size(min = 17, max = 17, message = "CAR_VIN_LENGTH_INVALID")
    @Pattern(regexp = "^[A-HJ-NPR-Z0-9]{17}$", message = "CAR_VIN_FORMAT_INVALID")
    String vin;

    @NotNull(message = "CAR_MASTER_DATA_ID_REQUIRED")
    @Positive(message = "CAR_MASTER_DATA_ID_REQUIRED")
    Long masterDataId;

    @NotBlank(message = "CAR_ENGINE_NUMBER_REQUIRED")
    @Size(max = 80, message = "CAR_ENGINE_NUMBER_TOO_LONG")
    String engineNumber;

    @NotBlank(message = "CAR_COLOR_REQUIRED")
    @Size(max = 60, message = "CAR_COLOR_TOO_LONG")
    String color;

    @Size(max = 1000, message = "CAR_IMAGE_URL_TOO_LONG")
    String imageUrl;

    List<String> imageUrls;

    @Size(max = 1000, message = "CAR_IMAGE_URL_TOO_LONG")
    String imageFolderUrl;

    Long showroomId; // Có thể null nếu để ở kho tổng
}
