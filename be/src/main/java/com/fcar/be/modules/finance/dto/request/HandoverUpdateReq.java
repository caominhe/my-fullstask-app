package com.fcar.be.modules.finance.dto.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HandoverUpdateReq {
    @NotBlank
    String licensePlate;

    LocalDateTime handoverDate; // Có thể null nếu chỉ mới bấm biển chứ chưa giao
}
