package com.fcar.be.modules.identity.dto.request;

import java.util.Set;

import jakarta.validation.constraints.NotEmpty;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateUserRolesRequest {

    /** Tên role khớp bảng {@code roles.name} (vd: ADMIN, SALES, CUSTOMER). */
    @NotEmpty(message = "roleNames must not be empty")
    Set<String> roleNames;
}
