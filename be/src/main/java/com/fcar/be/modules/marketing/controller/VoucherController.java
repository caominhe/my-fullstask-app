package com.fcar.be.modules.marketing.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.fcar.be.core.common.dto.ApiResponse;
import com.fcar.be.core.common.util.SecurityUtils;
import com.fcar.be.core.exception.AppException;
import com.fcar.be.modules.marketing.dto.response.VoucherRes;
import com.fcar.be.modules.marketing.service.MarketingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/vouchers")
@RequiredArgsConstructor
public class VoucherController {
    private final MarketingService marketingService;

    // Khách hàng tự thu thập mã giảm giá (Claim)
    @PostMapping("/{code}/claim")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<VoucherRes> claimVoucher(@PathVariable String code) {
        Long userId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new AppException(com.fcar.be.core.exception.ErrorCode.UNAUTHENTICATED));

        return ApiResponse.<VoucherRes>builder()
                .result(marketingService.claimVoucher(code, userId))
                .build();
    }
}
