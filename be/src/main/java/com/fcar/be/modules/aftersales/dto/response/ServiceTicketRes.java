package com.fcar.be.modules.aftersales.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceTicketRes {
    Long id;
    Long warrantyId;
    LocalDateTime serviceDate;
    String description;
    BigDecimal totalCost;
}
