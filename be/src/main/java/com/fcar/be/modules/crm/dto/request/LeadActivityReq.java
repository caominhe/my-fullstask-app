package com.fcar.be.modules.crm.dto.request;

import com.fcar.be.modules.crm.enums.LeadStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LeadActivityReq {
    Long demoCarId; // Truyền lên nếu là log cho việc lái thử
    LeadStatus status; // Truyền status tương ứng (VD: NEEDS_CONSULTATION, TEST_DRIVEN)
    String comment; // Nội dung đánh giá
}
