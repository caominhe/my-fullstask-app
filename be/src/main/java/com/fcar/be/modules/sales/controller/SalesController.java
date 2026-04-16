package com.fcar.be.modules.sales.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.fcar.be.core.common.dto.ApiResponse;
import com.fcar.be.core.common.util.SecurityUtils;
import com.fcar.be.modules.marketing.dto.response.VoucherRes;
import com.fcar.be.modules.sales.dto.request.ContractCreateReq;
import com.fcar.be.modules.sales.dto.response.ContractRes;
import com.fcar.be.modules.sales.service.SalesService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/sales")
@RequiredArgsConstructor
public class SalesController {

    private final SalesService salesService;

    @PostMapping("/contracts")
    @PreAuthorize("hasRole('SHOWROOM')")
    public ApiResponse<ContractRes> createContract(@RequestBody @Valid ContractCreateReq request) {
        Long salesId = SecurityUtils.requireCurrentUserId();
        return ApiResponse.<ContractRes>builder()
                .result(salesService.createContract(request, salesId))
                .build();
    }

    @GetMapping("/contracts/{contractNo}")
    @PreAuthorize("hasAnyRole('SHOWROOM', 'CUSTOMER', 'ADMIN')")
    public ApiResponse<ContractRes> getContract(@PathVariable String contractNo) {
        return ApiResponse.<ContractRes>builder()
                .result(salesService.getContract(contractNo))
                .build();
    }

    @GetMapping("/contracts/my-showroom/unprocessed")
    @PreAuthorize("hasRole('SHOWROOM')")
    public ApiResponse<List<ContractRes>> getUnprocessedContractsForCurrentShowroom() {
        Long salesId = SecurityUtils.requireCurrentUserId();
        return ApiResponse.<List<ContractRes>>builder()
                .result(salesService.getUnprocessedContractsForCurrentShowroom(salesId))
                .build();
    }

    @GetMapping("/leads/{leadId}/vouchers")
    @PreAuthorize("hasRole('SHOWROOM')")
    public ApiResponse<List<VoucherRes>> getLeadCustomerVouchers(@PathVariable Long leadId) {
        Long salesId = SecurityUtils.requireCurrentUserId();
        return ApiResponse.<List<VoucherRes>>builder()
                .result(salesService.getLeadCustomerVouchers(leadId, salesId))
                .build();
    }

    @PutMapping("/contracts/{contractNo}/confirm")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<ContractRes> confirmContract(@PathVariable String contractNo) {
        return ApiResponse.<ContractRes>builder()
                .result(salesService.confirmContractByCustomer(contractNo))
                .build();
    }
}
