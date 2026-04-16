package com.fcar.be.modules.finance.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.fcar.be.modules.finance.dto.request.HandoverUpdateReq;
import com.fcar.be.modules.finance.dto.request.PaymentProcessReq;
import com.fcar.be.modules.finance.dto.request.ReceiptConfirmReq;
import com.fcar.be.modules.finance.dto.response.HandoverRes;
import com.fcar.be.modules.finance.dto.response.PaymentRes;

public interface FinanceService {
    PaymentRes createReceipt(PaymentProcessReq request);

    PaymentRes confirmReceipt(Long receiptId, ReceiptConfirmReq request);

    String uploadPaymentProof(String contractNo, Long receiptId, MultipartFile file);

    PaymentRes getReceiptByContract(String contractNo);

    List<PaymentRes> getPaymentsByContract(String contractNo);

    HandoverRes initHandover(String contractNo);

    HandoverRes updateHandoverInfo(String contractNo, HandoverUpdateReq request);

    HandoverRes getHandover(String contractNo);
}
