package com.fcar.be.modules.identity.controller;

import org.springframework.web.bind.annotation.*;

import com.fcar.be.core.common.dto.ApiResponse;
import com.fcar.be.modules.identity.dto.request.AuthenticationRequest;
import com.fcar.be.modules.identity.dto.request.LogoutRequest;
import com.fcar.be.modules.identity.dto.request.RefreshTokenRequest;
import com.fcar.be.modules.identity.dto.response.AuthenticationResponse;
import com.fcar.be.modules.identity.service.AuthenticationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        var result = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthenticationResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        var result = authenticationService.refreshToken(request);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }

    @PostMapping("/logout")
    public ApiResponse<String> logout(@RequestBody(required = false) LogoutRequest request) {
        if (request == null) {
            request = LogoutRequest.builder().build();
        }
        authenticationService.logout(request);
        return ApiResponse.<String>builder()
                .result("Đăng xuất thành công, refresh token đã bị vô hiệu hóa.")
                .build();
    }

    @PostMapping("/google/exchange")
    public ApiResponse<AuthenticationResponse> exchangeGoogleCode(@RequestParam("code") String code) {
        var result = authenticationService.authenticateWithGoogle(code);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }
}
