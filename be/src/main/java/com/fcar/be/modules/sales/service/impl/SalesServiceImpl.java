package com.fcar.be.modules.sales.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;
import com.fcar.be.modules.crm.entity.Lead;
import com.fcar.be.modules.crm.repository.LeadRepository;
import com.fcar.be.modules.identity.repository.UserRepository;
import com.fcar.be.modules.inventory.dto.response.CarDetailRes;
import com.fcar.be.modules.inventory.enums.CarStatus;
import com.fcar.be.modules.inventory.repository.ShowroomRepository;
import com.fcar.be.modules.inventory.service.CarService;
import com.fcar.be.modules.marketing.dto.response.VoucherRes;
import com.fcar.be.modules.marketing.enums.DiscountType;
import com.fcar.be.modules.marketing.enums.VoucherStatus;
import com.fcar.be.modules.marketing.service.MarketingService;
import com.fcar.be.modules.sales.dto.request.ContractCreateReq;
import com.fcar.be.modules.sales.dto.response.ContractRes;
import com.fcar.be.modules.sales.entity.Contract;
import com.fcar.be.modules.sales.enums.ContractStatus;
import com.fcar.be.modules.sales.mapper.SalesMapper;
import com.fcar.be.modules.sales.repository.ContractRepository;
import com.fcar.be.modules.sales.service.SalesService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SalesServiceImpl implements SalesService {

    private final ContractRepository contractRepository;
    private final SalesMapper salesMapper;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final ShowroomRepository showroomRepository;
    private final CarService carService;
    private final MarketingService marketingService;

    @Override
    @Transactional
    public ContractRes createContract(ContractCreateReq request, Long salesId) {
        Lead lead = leadRepository
                .findById(request.getLeadId())
                .orElseThrow(() -> new AppException(ErrorCode.LEAD_NOT_FOUND));
        var salesUser = getSalesUserOrThrow(salesId);
        ensureLeadBelongsToSalesShowroom(lead, salesUser.getShowroomId());

        CarDetailRes car = carService.getCarByVin(request.getCarVin());
        if (car.getStatus() == null || !CarStatus.LOCKED.name().equals(car.getStatus())) {
            throw new AppException(ErrorCode.CAR_INVALID_STATUS);
        }
        if (car.getShowroomId() == null || !car.getShowroomId().equals(salesUser.getShowroomId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (contractRepository.existsByCarVinAndStatusIn(
                request.getCarVin(), List.of(ContractStatus.PENDING, ContractStatus.SIGNED))) {
            throw new AppException(ErrorCode.CONTRACT_EXISTED);
        }

        BigDecimal totalAmount = car.getBasePrice();
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal finalAmount = totalAmount;
        String normalizedVoucher =
                request.getVoucherCode() == null || request.getVoucherCode().isBlank()
                        ? null
                        : request.getVoucherCode().trim();
        if (normalizedVoucher != null) {
            if (lead.getUserId() == null) {
                throw new AppException(ErrorCode.LEAD_CUSTOMER_REQUIRED);
            }
            VoucherRes voucher =
                    marketingService.validateAndUseVoucher(normalizedVoucher, lead.getUserId(), car.getMasterDataId());
            if (voucher.getDiscountType() == DiscountType.PERCENT) {
                discountAmount =
                        totalAmount.multiply(voucher.getDiscountValue()).divide(BigDecimal.valueOf(100));
            } else {
                discountAmount = voucher.getDiscountValue();
            }
            finalAmount = totalAmount.subtract(discountAmount);
            if (finalAmount.signum() < 0) {
                finalAmount = BigDecimal.ZERO;
            }
        }

        String contractNo = "HD-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        Contract contract = Contract.builder()
                .contractNo(contractNo)
                .leadId(request.getLeadId())
                .carVin(request.getCarVin())
                .voucherCode(normalizedVoucher)
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .salesId(salesId)
                .status(ContractStatus.PENDING)
                .build();
        return toContractResWithDetails(contractRepository.save(contract));
    }

    @Override
    @Transactional
    public ContractRes confirmContractByCustomer(String contractNo) {
        Contract contract = contractRepository
                .findById(contractNo)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        if (contract.getStatus() != ContractStatus.PENDING) {
            throw new AppException(ErrorCode.CONTRACT_NOT_PENDING);
        }
        contract.setSignedDate(LocalDateTime.now());
        contract.setStatus(ContractStatus.SIGNED);
        return toContractResWithDetails(contractRepository.save(contract));
    }

    @Override
    public ContractRes getContract(String contractNo) {
        Contract contract = contractRepository
                .findById(contractNo)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        return toContractResWithDetails(contract);
    }

    @Override
    public List<ContractRes> getUnprocessedContractsForCurrentShowroom(Long salesUserId) {
        var salesUser =
                userRepository.findById(salesUserId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (salesUser.getShowroomId() == null) {
            throw new AppException(ErrorCode.SHOWROOM_NOT_FOUND);
        }

        List<Long> leadIds = leadRepository.findByShowroomIdOrderByCreatedAtDesc(salesUser.getShowroomId()).stream()
                .map(Lead::getId)
                .toList();
        if (leadIds.isEmpty()) {
            return List.of();
        }

        return contractRepository
                .findByLeadIdInAndStatusIn(leadIds, List.of(ContractStatus.PENDING, ContractStatus.SIGNED))
                .stream()
                .map(this::toContractResWithDetails)
                .toList();
    }

    @Override
    public List<VoucherRes> getLeadCustomerVouchers(Long leadId, Long salesUserId) {
        Lead lead = leadRepository.findById(leadId).orElseThrow(() -> new AppException(ErrorCode.LEAD_NOT_FOUND));
        var salesUser = getSalesUserOrThrow(salesUserId);
        ensureLeadBelongsToSalesShowroom(lead, salesUser.getShowroomId());
        if (lead.getUserId() == null) {
            return List.of();
        }
        return marketingService.getMyVouchers(lead.getUserId()).stream()
                .filter(v -> v.getStatus() == VoucherStatus.CLAIMED || v.getStatus() == VoucherStatus.USED)
                .toList();
    }

    private com.fcar.be.modules.identity.entity.User getSalesUserOrThrow(Long salesUserId) {
        return userRepository.findById(salesUserId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    private void ensureLeadBelongsToSalesShowroom(Lead lead, Long salesShowroomId) {
        if (salesShowroomId == null || lead.getShowroomId() == null || !salesShowroomId.equals(lead.getShowroomId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private ContractRes toContractResWithDetails(Contract contract) {
        ContractRes res = salesMapper.toContractRes(contract);
        Lead lead = leadRepository.findById(contract.getLeadId()).orElse(null);
        enrichContractWithLead(res, lead);
        enrichContractWithCar(res, contract.getCarVin());
        return res;
    }

    private void enrichContractWithLead(ContractRes res, Lead lead) {
        if (lead == null) {
            return;
        }
        res.setCustomerUserId(lead.getUserId());
        res.setCustomerFullName(lead.getFullName());
        res.setCustomerPhone(lead.getPhone());
        res.setShowroomId(lead.getShowroomId());
        if (lead.getShowroomId() != null) {
            showroomRepository.findByIdAndIsDeletedFalse(lead.getShowroomId()).ifPresent(showroom -> {
                res.setShowroomName(showroom.getName());
                res.setShowroomAddress(showroom.getAddress());
            });
        }
    }

    private void enrichContractWithCar(ContractRes res, String carVin) {
        try {
            CarDetailRes car = carService.getCarByVin(carVin);
            res.setMasterDataId(car.getMasterDataId());
            res.setCarBrand(car.getBrand());
            res.setCarModel(car.getModel());
            res.setCarVersion(car.getVersion());
        } catch (AppException ignore) {
            // Keep base contract response if car detail lookup fails unexpectedly.
        }
    }
}
