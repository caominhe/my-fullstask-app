package com.fcar.be.modules.aftersales.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.fcar.be.core.common.dto.ApiResponse;
import com.fcar.be.modules.aftersales.dto.request.ServiceTicketCreateReq;
import com.fcar.be.modules.aftersales.dto.request.WarrantyActivateReq;
import com.fcar.be.modules.aftersales.dto.response.ServiceTicketRes;
import com.fcar.be.modules.aftersales.dto.response.WarrantyBookRes;
import com.fcar.be.modules.aftersales.service.AftersalesService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/aftersales")
@RequiredArgsConstructor
public class AftersalesController {

    private final AftersalesService aftersalesService;

    // --- SỔ BẢO HÀNH ---
    @PostMapping("/warranties")
    @PreAuthorize("hasRole('SALES')")
    public ApiResponse<WarrantyBookRes> activateWarranty(@RequestBody @Valid WarrantyActivateReq request) {
        return ApiResponse.<WarrantyBookRes>builder()
                .result(aftersalesService.activateWarranty(request))
                .build();
    }

    @GetMapping("/warranties/{carVin}")
    @PreAuthorize("hasAnyRole('SALES', 'CUSTOMER')")
    public ApiResponse<WarrantyBookRes> getWarranty(@PathVariable String carVin) {
        return ApiResponse.<WarrantyBookRes>builder()
                .result(aftersalesService.getWarrantyByVin(carVin))
                .build();
    }

    // --- LỊCH SỬ BẢO DƯỠNG ---
    @PostMapping("/service-tickets")
    @PreAuthorize("hasRole('SALES')")
    public ApiResponse<ServiceTicketRes> createServiceTicket(@RequestBody @Valid ServiceTicketCreateReq request) {
        return ApiResponse.<ServiceTicketRes>builder()
                .result(aftersalesService.createServiceTicket(request))
                .build();
    }

    @GetMapping("/warranties/{carVin}/history")
    @PreAuthorize("hasAnyRole('SALES', 'CUSTOMER')")
    public ApiResponse<List<ServiceTicketRes>> getServiceHistory(@PathVariable String carVin) {
        return ApiResponse.<List<ServiceTicketRes>>builder()
                .result(aftersalesService.getServiceHistory(carVin))
                .build();
    }
}
