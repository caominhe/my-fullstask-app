package com.fcar.be.modules.finance.mapper;

import org.mapstruct.Mapper;

import com.fcar.be.modules.finance.dto.response.HandoverRes;
import com.fcar.be.modules.finance.dto.response.PaymentRes;
import com.fcar.be.modules.finance.entity.Handover;
import com.fcar.be.modules.finance.entity.Payment;

@Mapper(componentModel = "spring")
public interface FinanceMapper {
    PaymentRes toPaymentRes(Payment payment);

    HandoverRes toHandoverRes(Handover handover);
}
