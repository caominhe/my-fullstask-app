package com.fcar.be.modules.finance.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;
import com.fcar.be.modules.finance.dto.request.HandoverUpdateReq;
import com.fcar.be.modules.finance.dto.request.PaymentProcessReq;
import com.fcar.be.modules.finance.dto.request.ReceiptConfirmReq;
import com.fcar.be.modules.finance.dto.response.HandoverRes;
import com.fcar.be.modules.finance.dto.response.PaymentRes;
import com.fcar.be.modules.finance.entity.Handover;
import com.fcar.be.modules.finance.entity.Payment;
import com.fcar.be.modules.finance.entity.PaymentHistory;
import com.fcar.be.modules.finance.enums.HandoverStatus;
import com.fcar.be.modules.finance.enums.PaymentMethod;
import com.fcar.be.modules.finance.enums.PaymentStatus;
import com.fcar.be.modules.finance.mapper.FinanceMapper;
import com.fcar.be.modules.finance.repository.HandoverRepository;
import com.fcar.be.modules.finance.repository.PaymentHistoryRepository;
import com.fcar.be.modules.finance.repository.PaymentRepository;
import com.fcar.be.modules.finance.service.FinanceService;
import com.fcar.be.modules.inventory.service.impl.CloudinaryImageService;
import com.fcar.be.modules.sales.entity.Contract;
import com.fcar.be.modules.sales.enums.ContractStatus;
import com.fcar.be.modules.sales.repository.ContractRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FinanceServiceImpl implements FinanceService {

    private final PaymentRepository paymentRepository;
    private final HandoverRepository handoverRepository;
    private final PaymentHistoryRepository paymentHistoryRepository;
    private final FinanceMapper financeMapper;
    private final ContractRepository contractRepository;
    private final CloudinaryImageService cloudinaryImageService;

    @Override
    @Transactional
    public PaymentRes createReceipt(PaymentProcessReq request) {
        Contract contract = contractRepository
                .findById(request.getContractNo())
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        if (contract.getStatus() != ContractStatus.SIGNED) {
            throw new AppException(ErrorCode.CONTRACT_NOT_SIGNED);
        }
        if (paymentRepository.findByContractNo(request.getContractNo()).isPresent()) {
            throw new AppException(ErrorCode.RECEIPT_EXISTED);
        }

        Payment payment = Payment.builder()
                .contractNo(request.getContractNo())
                .amount(contract.getFinalAmount())
                .remainingDebt(contract.getFinalAmount())
                .status(PaymentStatus.PENDING)
                .paymentType(null)
                .paymentMethod(null)
                .note(null)
                .transferCode(null)
                .qrPayload(null)
                .build();
        Payment saved = paymentRepository.save(payment);
        return toReceiptRes(saved);
    }

    @Override
    @Transactional
    public PaymentRes confirmReceipt(Long receiptId, ReceiptConfirmReq request) {
        Payment payment =
                paymentRepository.findById(receiptId).orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        Contract contract = contractRepository
                .findById(payment.getContractNo())
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        if (request.getAmount().compareTo(payment.getRemainingDebt()) > 0) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_AMOUNT);
        }
        if (request.getPaymentMethod() == PaymentMethod.BANK_TRANSFER) {
            if (request.getProofImageUrl() == null || request.getProofImageUrl().isBlank()) {
                throw new AppException(ErrorCode.PAYMENT_PROOF_REQUIRED);
            }
        }

        BigDecimal newRemaining = payment.getRemainingDebt().subtract(request.getAmount());
        if (newRemaining.signum() < 0) {
            newRemaining = BigDecimal.ZERO;
        }

        payment.setPaymentType(request.getPaymentType());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setNote(request.getNote());
        payment.setRemainingDebt(newRemaining);
        payment.setStatus(newRemaining.signum() == 0 ? PaymentStatus.SUCCESS : PaymentStatus.PENDING);
        payment.setConfirmedAt(LocalDateTime.now());
        if (request.getPaymentMethod() == PaymentMethod.BANK_TRANSFER) {
            String transferCode =
                    "RCPT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            payment.setTransferCode(transferCode);
            payment.setQrPayload("PAY|" + transferCode + "|" + payment.getContractNo() + "|" + request.getAmount());
        } else {
            payment.setTransferCode(null);
            payment.setQrPayload(null);
        }
        Payment saved = paymentRepository.save(payment);

        PaymentHistory history = PaymentHistory.builder()
                .receiptId(saved.getId())
                .contractNo(saved.getContractNo())
                .amount(request.getAmount())
                .paymentType(request.getPaymentType())
                .paymentMethod(request.getPaymentMethod())
                .note(request.getNote())
                .proofImageUrl(
                        request.getPaymentMethod() == PaymentMethod.BANK_TRANSFER ? request.getProofImageUrl() : null)
                .remainingDebt(newRemaining)
                .build();
        PaymentHistory savedHistory = paymentHistoryRepository.save(history);

        if (newRemaining.signum() == 0) {
            contract.setStatus(ContractStatus.COMPLETED);
            contractRepository.save(contract);
        }

        PaymentRes res = toReceiptRes(saved);
        res.setReceiptId(saved.getId());
        res.setId(savedHistory.getId());
        return res;
    }

    @Override
    @Transactional(readOnly = true)
    public String uploadPaymentProof(String contractNo, Long receiptId, MultipartFile file) {
        Payment payment =
                paymentRepository.findById(receiptId).orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        if (!payment.getContractNo().equals(contractNo)) {
            throw new AppException(ErrorCode.PAYMENT_NOT_FOUND);
        }
        return cloudinaryImageService.uploadPaymentProof(file, contractNo, receiptId);
    }

    @Override
    public PaymentRes getReceiptByContract(String contractNo) {
        if (!contractRepository.existsById(contractNo)) {
            throw new AppException(ErrorCode.CONTRACT_NOT_FOUND);
        }
        return paymentRepository
                .findByContractNo(contractNo)
                .map(this::toReceiptRes)
                .orElse(null);
    }

    @Override
    public List<PaymentRes> getPaymentsByContract(String contractNo) {
        if (!contractRepository.existsById(contractNo)) {
            throw new AppException(ErrorCode.CONTRACT_NOT_FOUND);
        }
        if (paymentRepository.findByContractNo(contractNo).isEmpty()) {
            return List.of();
        }
        return paymentHistoryRepository.findByContractNoOrderByPaidAtAsc(contractNo).stream()
                .map(this::toHistoryRes)
                .toList();
    }

    @Override
    @Transactional
    public HandoverRes initHandover(String contractNo) {
        if (!contractRepository.existsById(contractNo)) {
            throw new AppException(ErrorCode.CONTRACT_NOT_FOUND);
        }
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

        Payment payment = paymentRepository
                .findByIdAndContractNo(request.getReceiptId(), contractNo)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new AppException(ErrorCode.PAYMENT_NOT_CONFIRMED);
        }

        if (request.getLicensePlate() != null && !request.getLicensePlate().equals(handover.getLicensePlate())) {

            if (handoverRepository.existsByLicensePlate(request.getLicensePlate())) {
                throw new AppException(ErrorCode.LICENSE_PLATE_EXISTED);
            }
            handover.setLicensePlate(request.getLicensePlate());
        }

        if (request.getHandoverDate() != null) {
            handover.setReceiptId(request.getReceiptId());
            handover.setHandoverDate(request.getHandoverDate());
            handover.setStatus(HandoverStatus.HANDED_OVER);
        }

        return financeMapper.toHandoverRes(handoverRepository.save(handover));
    }

    @Override
    public HandoverRes getHandover(String contractNo) {
        Handover handover = handoverRepository
                .findByContractNo(contractNo)
                .orElseThrow(() -> new AppException(ErrorCode.HANDOVER_NOT_FOUND));
        return financeMapper.toHandoverRes(handover);
    }

    private PaymentRes toReceiptRes(Payment payment) {
        PaymentRes res = financeMapper.toPaymentRes(payment);
        res.setReceiptId(payment.getId());
        res.setRemainingDebt(payment.getRemainingDebt());
        return res;
    }

    private PaymentRes toHistoryRes(PaymentHistory history) {
        PaymentRes res = PaymentRes.builder()
                .id(history.getId())
                .receiptId(history.getReceiptId())
                .contractNo(history.getContractNo())
                .amount(history.getAmount())
                .paymentType(history.getPaymentType())
                .paymentMethod(history.getPaymentMethod())
                .note(history.getNote())
                .proofImageUrl(history.getProofImageUrl())
                .paymentDate(history.getPaidAt())
                .remainingDebt(history.getRemainingDebt())
                .status(history.getRemainingDebt().signum() == 0 ? PaymentStatus.SUCCESS : PaymentStatus.PENDING)
                .build();
        return res;
    }
}
