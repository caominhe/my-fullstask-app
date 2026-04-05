package com.fcar.be.modules.crm.dto.response;

import java.time.LocalDateTime;

import com.fcar.be.modules.crm.enums.LeadSource;
import com.fcar.be.modules.crm.enums.LeadStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LeadRes {
    Long id;
    String fullName;
    String phone;
    LeadSource source;
    Long showroomId;
    Long assignedSalesId;
    LeadStatus status;
    LocalDateTime createdAt;
}
