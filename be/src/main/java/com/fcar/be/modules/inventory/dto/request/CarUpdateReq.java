package com.fcar.be.modules.inventory.dto.request;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarUpdateReq {
    @Size(max = 1000, message = "CAR_IMAGE_URL_TOO_LONG")
    String imageUrl;

    List<String> imageUrls;

    @Size(max = 1000, message = "CAR_IMAGE_URL_TOO_LONG")
    String imageFolderUrl;

    @Positive(message = "CAR_PRICE_INVALID")
    BigDecimal listedPrice;
}
