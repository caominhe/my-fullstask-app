package com.fcar.be.modules.finance.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.fcar.be.core.common.dto.ApiResponse;
import com.fcar.be.modules.finance.dto.request.HandoverUpdateReq;
import com.fcar.be.modules.finance.dto.request.PaymentProcessReq;
import com.fcar.be.modules.finance.dto.request.ReceiptConfirmReq;
import com.fcar.be.modules.finance.dto.response.HandoverRes;
import com.fcar.be.modules.finance.dto.response.PaymentRes;
import com.fcar.be.modules.finance.service.FinanceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/finance")
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;

    @PostMapping("/receipts")
    @PreAuthorize("hasRole('SHOWROOM')")
    public ApiResponse<PaymentRes> createReceipt(@RequestBody @Valid PaymentProcessReq request) {
        return ApiResponse.<PaymentRes>builder()
                .result(financeService.createReceipt(request))
                .build();
    }

    @PutMapping("/receipts/{receiptId}/confirm")
    @PreAuthorize("hasRole('SHOWROOM')")
    public ApiResponse<PaymentRes> confirmReceipt(
            @PathVariable Long receiptId, @RequestBody @Valid ReceiptConfirmReq request) {
        return ApiResponse.<PaymentRes>builder()
                .result(financeService.confirmReceipt(receiptId, request))
                .build();
    }

    @PostMapping(
            value = "/contracts/{contractNo}/receipts/{receiptId}/payment-proof",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SHOWROOM')")
    public ApiResponse<String> uploadPaymentProof(
            @PathVariable String contractNo, @PathVariable Long receiptId, @RequestPart("file") MultipartFile file) {
        return ApiResponse.<String>builder()
                .result(financeService.uploadPaymentProof(contractNo, receiptId, file))
                .build();
    }

    @GetMapping("/contracts/{contractNo}/receipt")
    @PreAuthorize("hasAnyRole('SHOWROOM', 'CUSTOMER')")
    public ApiResponse<PaymentRes> getReceiptByContract(@PathVariable String contractNo) {
        return ApiResponse.<PaymentRes>builder()
                .result(financeService.getReceiptByContract(contractNo))
                .build();
    }

    @GetMapping("/contracts/{contractNo}/payments")
    @PreAuthorize("hasAnyRole('SHOWROOM', 'CUSTOMER')")
    public ApiResponse<List<PaymentRes>> getPaymentsByContract(@PathVariable String contractNo) {
        return ApiResponse.<List<PaymentRes>>builder()
                .result(financeService.getPaymentsByContract(contractNo))
                .build();
    }

    @PostMapping("/contracts/{contractNo}/handover")
    @PreAuthorize("hasRole('SHOWROOM')")
    public ApiResponse<HandoverRes> initHandover(@PathVariable String contractNo) {
        return ApiResponse.<HandoverRes>builder()
                .result(financeService.initHandover(contractNo))
                .build();
    }

    @PutMapping("/contracts/{contractNo}/handover")
    @PreAuthorize("hasRole('SHOWROOM')")
    public ApiResponse<HandoverRes> updateHandover(
            @PathVariable String contractNo, @RequestBody @Valid HandoverUpdateReq request) {
        return ApiResponse.<HandoverRes>builder()
                .result(financeService.updateHandoverInfo(contractNo, request))
                .build();
    }

    @GetMapping("/contracts/{contractNo}/handover")
    @PreAuthorize("hasAnyRole('SHOWROOM', 'CUSTOMER')")
    public ApiResponse<HandoverRes> getHandover(@PathVariable String contractNo) {
        return ApiResponse.<HandoverRes>builder()
                .result(financeService.getHandover(contractNo))
                .build();
    }
}
