package com.fcar.be.modules.identity.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationResponse {
    /** Access token (JWT). */
    String token;
    /** Refresh token (JWT, TTL dài hơn). */
    String refreshToken;

    boolean authenticated;
    boolean requireOnboard;
}
