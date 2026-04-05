package com.fcar.be.modules.finance.service;

import java.util.List;

import com.fcar.be.modules.finance.dto.request.HandoverUpdateReq;
import com.fcar.be.modules.finance.dto.request.PaymentProcessReq;
import com.fcar.be.modules.finance.dto.response.HandoverRes;
import com.fcar.be.modules.finance.dto.response.PaymentRes;

public interface FinanceService {
    PaymentRes processPayment(PaymentProcessReq request);

    List<PaymentRes> getPaymentsByContract(String contractNo);

    HandoverRes initHandover(String contractNo);

    HandoverRes updateHandoverInfo(String contractNo, HandoverUpdateReq request);
}
