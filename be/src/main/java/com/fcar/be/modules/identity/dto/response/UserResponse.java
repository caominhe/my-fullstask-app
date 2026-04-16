package com.fcar.be.modules.identity.dto.response;

import java.util.Set;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    Long id;
    String email;
    String avatar;
    String fullName;
    String phone;
    String citizenId;
    String address;
    Long showroomId;
    String status;
    Set<RoleResponse> roles;
}
