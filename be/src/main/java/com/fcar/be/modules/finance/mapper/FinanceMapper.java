package com.fcar.be.modules.finance.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.fcar.be.modules.finance.dto.request.PaymentProcessReq;
import com.fcar.be.modules.finance.dto.response.HandoverRes;
import com.fcar.be.modules.finance.dto.response.PaymentRes;
import com.fcar.be.modules.finance.entity.Handover;
import com.fcar.be.modules.finance.entity.Payment;

@Mapper(componentModel = "spring")
public interface FinanceMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "paymentDate", ignore = true)
    @Mapping(target = "status", ignore = true)
    Payment toPayment(PaymentProcessReq req);

    PaymentRes toPaymentRes(Payment payment);

    HandoverRes toHandoverRes(Handover handover);
}
