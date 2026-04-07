package com.fcar.be.modules.crm.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.fcar.be.core.common.dto.ApiResponse;
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

    @PutMapping("/{leadId}/assign/{salesId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES')")
    public ApiResponse<LeadRes> assignSales(@PathVariable Long leadId, @PathVariable Long salesId) {
        return ApiResponse.<LeadRes>builder()
                .result(leadService.assignSales(leadId, salesId))
                .build();
    }

    @GetMapping("/sales/{salesId}")
    @PreAuthorize("hasRole('SALES')")
    public ApiResponse<List<LeadRes>> getLeadsBySales(@PathVariable Long salesId) {
        return ApiResponse.<List<LeadRes>>builder()
                .result(leadService.getLeadsBySales(salesId))
                .build();
    }
}
