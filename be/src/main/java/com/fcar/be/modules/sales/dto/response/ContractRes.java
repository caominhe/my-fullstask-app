package com.fcar.be.modules.sales.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fcar.be.modules.sales.enums.ContractStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractRes {
    String contractNo;
    Long leadId;
    Long customerUserId;
    String customerFullName;
    String customerPhone;
    String carVin;
    Long masterDataId;
    String carBrand;
    String carModel;
    String carVersion;
    Long showroomId;
    String showroomName;
    String showroomAddress;
    String voucherCode;
    BigDecimal totalAmount;
    BigDecimal discountAmount;
    BigDecimal finalAmount;
    Long salesId;
    LocalDateTime signedDate;
    ContractStatus status;
}
