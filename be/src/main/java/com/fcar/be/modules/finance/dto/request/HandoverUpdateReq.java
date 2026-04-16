package com.fcar.be.modules.finance.dto.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HandoverUpdateReq {
    @NotBlank
    String licensePlate;

    @NotNull
    Long receiptId;

    @NotNull
    LocalDateTime handoverDate;
}
