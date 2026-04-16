package com.fcar.be.modules.marketing.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.fcar.be.core.common.dto.ApiResponse;
import com.fcar.be.core.common.util.SecurityUtils;
import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;
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

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<Campaign>> getCampaigns() {
        return ApiResponse.<List<Campaign>>builder()
                .result(marketingService.getCampaigns())
                .build();
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<List<Campaign>> getCustomerCampaigns(@RequestParam(required = false) Long showroomId) {
        return ApiResponse.<List<Campaign>>builder()
                .result(marketingService.getCustomerCampaigns(showroomId))
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Campaign> createCampaign(@RequestBody @Valid CampaignCreateReq request) {
        return ApiResponse.<Campaign>builder()
                .result(marketingService.createCampaign(request))
                .build();
    }

    @PutMapping("/{campaignId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Campaign> updateCampaign(
            @PathVariable Long campaignId, @RequestBody @Valid CampaignCreateReq request) {
        return ApiResponse.<Campaign>builder()
                .result(marketingService.updateCampaign(campaignId, request))
                .build();
    }

    @DeleteMapping("/{campaignId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteCampaign(@PathVariable Long campaignId) {
        marketingService.deleteCampaign(campaignId);
        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/{campaignId}/vouchers")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<VoucherRes>> getCampaignVouchers(@PathVariable Long campaignId) {
        return ApiResponse.<List<VoucherRes>>builder()
                .result(marketingService.getCampaignVouchers(campaignId))
                .build();
    }

    @PostMapping("/{campaignId}/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<VoucherRes>> generateVouchers(
            @PathVariable Long campaignId,
            @RequestParam int quantity,
            @RequestParam(required = false) String prefix,
            @RequestParam String expiredAt) { // VD: "2026-12-31T23:59:59"

        if (quantity <= 0) {
            throw new AppException(ErrorCode.CAMPAIGN_INVALID_QUANTITY);
        }

        LocalDateTime expirationDate;
        if (expiredAt == null || expiredAt.isBlank()) {
            expirationDate = LocalDateTime.now().plusDays(30);
        } else {
            try {
                expirationDate = LocalDateTime.parse(expiredAt);
            } catch (DateTimeParseException ex) {
                throw new AppException(ErrorCode.CAMPAIGN_INVALID_EXPIRED_AT);
            }
        }
        return ApiResponse.<List<VoucherRes>>builder()
                .result(marketingService.generateVouchers(campaignId, quantity, prefix, expirationDate))
                .build();
    }

    @PostMapping("/{campaignId}/register")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<VoucherRes> registerCampaign(
            @PathVariable Long campaignId, @RequestParam(required = false) Long showroomId) {
        Long userId = SecurityUtils.requireCurrentUserId();
        return ApiResponse.<VoucherRes>builder()
                .result(marketingService.registerCampaignAndClaimVoucher(campaignId, userId, showroomId))
                .build();
    }
}
