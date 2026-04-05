package com.fcar.be.modules.marketing.controller;

import org.springframework.web.bind.annotation.*;

import com.fcar.be.core.common.dto.ApiResponse;
import com.fcar.be.core.common.util.SecurityUtils;
import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;
import com.fcar.be.modules.marketing.dto.response.VoucherRes;
import com.fcar.be.modules.marketing.service.MarketingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final MarketingService marketingService;

    @PostMapping("/{eventId}/register")
    public ApiResponse<VoucherRes> registerEvent(@PathVariable Long eventId) {
        Long userId = SecurityUtils.getCurrentUserId().orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        return ApiResponse.<VoucherRes>builder()
                .result(marketingService.registerEventAndClaimVoucher(eventId, userId))
                .build();
    }
}
