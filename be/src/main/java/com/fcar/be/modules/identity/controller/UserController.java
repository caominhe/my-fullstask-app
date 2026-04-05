package com.fcar.be.modules.identity.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.fcar.be.core.common.dto.ApiResponse;
import com.fcar.be.modules.identity.dto.request.UserCreationRequest;
import com.fcar.be.modules.identity.dto.request.UserOnboardRequest;
import com.fcar.be.modules.identity.dto.response.UserResponse;
import com.fcar.be.modules.identity.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/register") // Cho phép ai cũng được gọi để tạo tài khoản
    public ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<UserResponse>> getAllUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getAllUsers())
                .build();
    }

    @PutMapping("/onboard")
    public ApiResponse<UserResponse> onboardUser(@RequestBody @Valid UserOnboardRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.onboardUser(request))
                .build();
    }

    @GetMapping("/my-info")
    public ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }
}
