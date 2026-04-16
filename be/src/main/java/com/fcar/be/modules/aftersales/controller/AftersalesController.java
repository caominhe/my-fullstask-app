package com.fcar.be.modules.aftersales.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.fcar.be.core.common.dto.ApiResponse;
import com.fcar.be.modules.aftersales.dto.request.ServiceTicketCreateReq;
import com.fcar.be.modules.aftersales.dto.request.WarrantyActivateReq;
import com.fcar.be.modules.aftersales.dto.request.WarrantyUpdateReq;
import com.fcar.be.modules.aftersales.dto.response.ServiceTicketRes;
import com.fcar.be.modules.aftersales.dto.response.WarrantyBookRes;
import com.fcar.be.modules.aftersales.dto.response.WarrantyLookupRes;
import com.fcar.be.modules.aftersales.service.AftersalesService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/aftersales")
@RequiredArgsConstructor
public class AftersalesController {

    private final AftersalesService aftersalesService;

    // --- SỔ BẢO HÀNH (kích hoạt + cập nhật: chỉ SHOWROOM; ADMIN chỉ GET) ---
    @PostMapping("/showroom/warranties")
    @PreAuthorize("hasRole('SHOWROOM')")
    public ApiResponse<WarrantyBookRes> activateWarrantyForShowroom(@RequestBody @Valid WarrantyActivateReq request) {
        return ApiResponse.<WarrantyBookRes>builder()
                .result(aftersalesService.activateWarrantyForShowroom(request))
                .build();
    }

    @PutMapping("/warranties/{carVin}")
    @PreAuthorize("hasRole('SHOWROOM')")
    public ApiResponse<WarrantyBookRes> updateWarranty(
            @PathVariable String carVin, @RequestBody WarrantyUpdateReq request) {
        return ApiResponse.<WarrantyBookRes>builder()
                .result(aftersalesService.updateWarranty(carVin, request))
                .build();
    }

    @GetMapping("/admin/warranty-lookup")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<WarrantyLookupRes> adminWarrantyLookup(
            @RequestParam(required = false) String contractNo, @RequestParam(required = false) String licensePlate) {
        return ApiResponse.<WarrantyLookupRes>builder()
                .result(aftersalesService.adminLookupWarranty(contractNo, licensePlate))
                .build();
    }

    @GetMapping("/warranties/{carVin}")
    @PreAuthorize("hasAnyRole('SHOWROOM', 'CUSTOMER', 'ADMIN')")
    public ApiResponse<WarrantyBookRes> getWarranty(@PathVariable String carVin) {
        return ApiResponse.<WarrantyBookRes>builder()
                .result(aftersalesService.getWarrantyByVin(carVin))
                .build();
    }

    // --- LỊCH SỬ BẢO DƯỠNG ---
    @PostMapping("/service-tickets")
    @PreAuthorize("hasRole('SHOWROOM')")
    public ApiResponse<ServiceTicketRes> createServiceTicket(@RequestBody @Valid ServiceTicketCreateReq request) {
        return ApiResponse.<ServiceTicketRes>builder()
                .result(aftersalesService.createServiceTicket(request))
                .build();
    }

    @GetMapping("/warranties/{carVin}/history")
    @PreAuthorize("hasAnyRole('SHOWROOM', 'CUSTOMER', 'ADMIN')")
    public ApiResponse<List<ServiceTicketRes>> getServiceHistory(@PathVariable String carVin) {
        return ApiResponse.<List<ServiceTicketRes>>builder()
                .result(aftersalesService.getServiceHistory(carVin))
                .build();
    }
}
