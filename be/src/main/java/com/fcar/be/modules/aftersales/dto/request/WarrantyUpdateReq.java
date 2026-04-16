package com.fcar.be.modules.aftersales.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarrantyUpdateReq {
    /** Cập nhật biển số trên sổ. */
    String licensePlate;

    /**
     * Gán lại ngày kết thúc = ngày bắt đầu + số tháng (tính từ sổ hiện tại).
     */
    Integer durationMonths;
}
