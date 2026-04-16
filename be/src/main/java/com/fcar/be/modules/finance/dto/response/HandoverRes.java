package com.fcar.be.modules.finance.dto.response;

import java.time.LocalDateTime;

import com.fcar.be.modules.finance.enums.HandoverStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HandoverRes {
    Long id;
    String contractNo;
    String licensePlate;
    Long receiptId;
    LocalDateTime handoverDate;
    HandoverStatus status;
}
