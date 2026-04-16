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
    Long userId;
    String fullName;
    String phone;
    String interestedVin;
    LeadSource source;
    Long showroomId;
    LeadStatus status;
    LocalDateTime createdAt;
}
