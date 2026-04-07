package com.fcar.be.modules.marketing.controller;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.fcar.be.core.common.dto.ApiResponse;
import com.fcar.be.modules.marketing.dto.request.CampaignCreateReq;
import com.fcar.be.modules.marketing.dto.response.VoucherRes;
import com.fcar.be.modules.marketing.entity.Campaign;
import com.fcar.be.modules.marketing.service.MarketingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/campaigns")
@RequiredArgsConstructor
public class CampaignController {
    private final MarketingService marketingService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Campaign> createCampaign(@RequestBody @Valid CampaignCreateReq request) {
        return ApiResponse.<Campaign>builder()
                .result(marketingService.createCampaign(request))
                .build();
    }

    @PostMapping("/{campaignId}/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<VoucherRes>> generateVouchers(
            @PathVariable Long campaignId,
            @RequestParam int quantity,
            @RequestParam(required = false) String prefix,
            @RequestParam String expiredAt) { // VD: "2026-12-31T23:59:59"

        LocalDateTime expirationDate = LocalDateTime.parse(expiredAt);
        return ApiResponse.<List<VoucherRes>>builder()
                .result(marketingService.generateVouchers(campaignId, quantity, prefix, expirationDate))
                .build();
    }
}
