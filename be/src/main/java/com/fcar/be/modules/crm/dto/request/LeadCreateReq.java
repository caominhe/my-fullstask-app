package com.fcar.be.modules.crm.dto.request;

import jakarta.validation.constraints.NotBlank;

import com.fcar.be.modules.crm.enums.LeadSource;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LeadCreateReq {
    Long userId; // Có thể null nếu khách vãng lai

    @NotBlank
    String fullName;

    @NotBlank
    String phone;

    LeadSource source;

    Long showroomId; // Khách hàng truyền lên ID Showroom muốn đăng ký
}
