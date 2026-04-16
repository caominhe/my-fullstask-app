package com.fcar.be.modules.marketing.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.fcar.be.core.common.dto.ApiResponse;
import com.fcar.be.core.common.util.SecurityUtils;
import com.fcar.be.modules.marketing.dto.response.VoucherRes;
import com.fcar.be.modules.marketing.service.MarketingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/vouchers")
@RequiredArgsConstructor
public class VoucherController {
    private final MarketingService marketingService;

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<java.util.List<VoucherRes>> getMyVouchers() {
        Long userId = SecurityUtils.requireCurrentUserId();
        return ApiResponse.<java.util.List<VoucherRes>>builder()
                .result(marketingService.getMyVouchers(userId))
                .build();
    }

    // Khách hàng tự thu thập mã giảm giá (Claim)
    @PostMapping("/{code}/claim")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<VoucherRes> claimVoucher(@PathVariable String code) {
        Long userId = SecurityUtils.requireCurrentUserId();

        return ApiResponse.<VoucherRes>builder()
                .result(marketingService.claimVoucher(code, userId))
                .build();
    }
}
