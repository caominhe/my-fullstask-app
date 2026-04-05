package com.fcar.be.modules.identity.controller;

import org.springframework.web.bind.annotation.*;

import com.fcar.be.core.common.dto.ApiResponse;
import com.fcar.be.modules.identity.dto.request.AuthenticationRequest;
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

    @PostMapping("/google/exchange")
    public ApiResponse<AuthenticationResponse> exchangeGoogleCode(@RequestParam("code") String code) {
        var result = authenticationService.authenticateWithGoogle(code);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }
}
