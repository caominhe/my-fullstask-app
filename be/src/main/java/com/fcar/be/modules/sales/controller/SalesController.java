package com.fcar.be.modules.sales.controller;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.fcar.be.core.common.dto.ApiResponse;
import com.fcar.be.core.common.util.SecurityUtils;
import com.fcar.be.core.exception.AppException;
import com.fcar.be.modules.sales.dto.request.QuotationCreateReq;
import com.fcar.be.modules.sales.dto.response.ContractRes;
import com.fcar.be.modules.sales.dto.response.QuotationRes;
import com.fcar.be.modules.sales.service.SalesService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/sales")
@RequiredArgsConstructor
public class SalesController {

    private final SalesService salesService;

    @PostMapping("/quotations")
    public ApiResponse<QuotationRes> createQuotation(@RequestBody @Valid QuotationCreateReq request) {
        // Lấy ID khách hàng đang thao tác từ Token
        Long customerId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new AppException(com.fcar.be.core.exception.ErrorCode.UNAUTHENTICATED));
        return ApiResponse.<QuotationRes>builder()
                .result(salesService.createQuotation(request, customerId))
                .build();
    }

    @PostMapping("/quotations/{quotationId}/contracts")
    public ApiResponse<ContractRes> createContract(@PathVariable Long quotationId) {
        // Lấy ID Sales đang thao tác từ Token
        Long salesId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new AppException(com.fcar.be.core.exception.ErrorCode.UNAUTHENTICATED));
        return ApiResponse.<ContractRes>builder()
                .result(salesService.createContract(quotationId, salesId))
                .build();
    }

    @PutMapping("/quotations/{id}/accept")
    public ApiResponse<QuotationRes> acceptQuotation(@PathVariable Long id) {
        return ApiResponse.<QuotationRes>builder()
                .result(salesService.acceptQuotation(id))
                .build();
    }
}
