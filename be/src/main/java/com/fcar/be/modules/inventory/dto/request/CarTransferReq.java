package com.fcar.be.modules.inventory.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarTransferReq {
    Long showroomId; // Nơi xe sẽ được điều chuyển đến
    String showroomName; // Hỗ trợ UI chọn theo tên showroom
}
