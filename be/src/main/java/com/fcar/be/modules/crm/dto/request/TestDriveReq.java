package com.fcar.be.modules.crm.dto.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TestDriveReq {
    @NotNull
    Long leadId;

    @NotNull
    Long carModelId;

    @NotNull
    LocalDateTime scheduleTime;
}
