package com.fcar.be.modules.sales.dto.response;

import java.time.LocalDateTime;

import com.fcar.be.modules.sales.enums.ContractStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractRes {
    String contractNo;
    Long quotationId;
    Long salesId;
    LocalDateTime signedDate;
    ContractStatus status;
}
