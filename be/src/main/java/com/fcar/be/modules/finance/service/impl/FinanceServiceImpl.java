package com.fcar.be.modules.finance.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;
import com.fcar.be.modules.finance.dto.request.HandoverUpdateReq;
import com.fcar.be.modules.finance.dto.request.PaymentProcessReq;
import com.fcar.be.modules.finance.dto.response.HandoverRes;
import com.fcar.be.modules.finance.dto.response.PaymentRes;
import com.fcar.be.modules.finance.entity.Handover;
import com.fcar.be.modules.finance.entity.Payment;
import com.fcar.be.modules.finance.enums.HandoverStatus;
import com.fcar.be.modules.finance.enums.PaymentStatus;
import com.fcar.be.modules.finance.mapper.FinanceMapper;
import com.fcar.be.modules.finance.repository.HandoverRepository;
import com.fcar.be.modules.finance.repository.PaymentRepository;
import com.fcar.be.modules.finance.service.FinanceService;
import com.fcar.be.modules.sales.repository.ContractRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FinanceServiceImpl implements FinanceService {

    private final PaymentRepository paymentRepository;
    private final HandoverRepository handoverRepository;
    private final FinanceMapper financeMapper;
    private final ContractRepository contractRepository;

    @Override
    @Transactional
    public PaymentRes processPayment(PaymentProcessReq request) {
        // KIỂM TRA HỢP ĐỒNG TỒN TẠI
        if (!contractRepository.existsById(request.getContractNo())) {
            throw new AppException(ErrorCode.CONTRACT_NOT_FOUND);
        }

        Payment payment = financeMapper.toPayment(request);
        payment.setStatus(PaymentStatus.SUCCESS);
        return financeMapper.toPaymentRes(paymentRepository.save(payment));
    }

    @Override
    public List<PaymentRes> getPaymentsByContract(String contractNo) {
        return paymentRepository.findByContractNo(contractNo).stream()
                .map(financeMapper::toPaymentRes)
                .toList();
    }

    @Override
    @Transactional
    public HandoverRes initHandover(String contractNo) {
        if (handoverRepository.findByContractNo(contractNo).isPresent()) {
            throw new AppException(ErrorCode.HANDOVER_EXISTED);
        }

        Handover handover = Handover.builder()
                .contractNo(contractNo)
                .status(HandoverStatus.PROCESSING)
                .build();

        return financeMapper.toHandoverRes(handoverRepository.save(handover));
    }

    @Override
    @Transactional
    public HandoverRes updateHandoverInfo(String contractNo, HandoverUpdateReq request) {
        Handover handover = handoverRepository
                .findByContractNo(contractNo)
                .orElseThrow(() -> new AppException(ErrorCode.HANDOVER_NOT_FOUND));

        if (request.getLicensePlate() != null && !request.getLicensePlate().equals(handover.getLicensePlate())) {

            if (handoverRepository.existsByLicensePlate(request.getLicensePlate())) {
                throw new AppException(ErrorCode.LICENSE_PLATE_EXISTED);
            }
            handover.setLicensePlate(request.getLicensePlate());
        }

        if (request.getHandoverDate() != null) {
            handover.setHandoverDate(request.getHandoverDate());
            handover.setStatus(HandoverStatus.HANDED_OVER);
        }

        return financeMapper.toHandoverRes(handoverRepository.save(handover));
    }
}
