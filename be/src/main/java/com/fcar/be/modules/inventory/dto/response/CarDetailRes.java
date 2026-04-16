package com.fcar.be.modules.inventory.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
    String imageUrl;
    List<String> imageUrls;
    String imageFolderUrl;
    Long showroomId;
    /** Tên showroom (null nếu xe còn ở kho tổng). */
    String showroomName;

    String status;
    LocalDateTime createdAt;

    // Flattened từ MasterData để Frontend dễ hiển thị
    Long masterDataId;
    String brand;
    String model;
    String version;
    BigDecimal basePrice;
    BigDecimal listedPrice;
}
