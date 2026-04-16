package com.fcar.be.modules.crm.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.fcar.be.core.common.dto.ApiResponse;
import com.fcar.be.core.common.util.SecurityUtils;
import com.fcar.be.modules.crm.dto.request.LeadCreateReq;
import com.fcar.be.modules.crm.dto.response.LeadRes;
import com.fcar.be.modules.crm.service.LeadService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/leads")
@RequiredArgsConstructor
public class LeadController {
    private final LeadService leadService;

    @PostMapping
    public ApiResponse<LeadRes> createLead(@RequestBody @Valid LeadCreateReq request) {
        return ApiResponse.<LeadRes>builder()
                .result(leadService.createLead(request))
                .build();
    }

    @GetMapping("/my-showroom")
    @PreAuthorize("hasRole('SHOWROOM')")
    public ApiResponse<List<LeadRes>> getLeadsForCurrentSales() {
        Long salesUserId = SecurityUtils.requireCurrentUserId();
        return ApiResponse.<List<LeadRes>>builder()
                .result(leadService.getLeadsForCurrentSales(salesUserId))
                .build();
    }
}
