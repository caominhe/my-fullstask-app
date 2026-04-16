package com.fcar.be.modules.aftersales.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fcar.be.core.common.util.SecurityUtils;
import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;
import com.fcar.be.modules.aftersales.dto.request.ServiceTicketCreateReq;
import com.fcar.be.modules.aftersales.dto.request.WarrantyActivateReq;
import com.fcar.be.modules.aftersales.dto.request.WarrantyUpdateReq;
import com.fcar.be.modules.aftersales.dto.response.ServiceTicketRes;
import com.fcar.be.modules.aftersales.dto.response.WarrantyBookRes;
import com.fcar.be.modules.aftersales.dto.response.WarrantyLookupRes;
import com.fcar.be.modules.aftersales.entity.ServiceTicket;
import com.fcar.be.modules.aftersales.entity.WarrantyBook;
import com.fcar.be.modules.aftersales.mapper.AftersalesMapper;
import com.fcar.be.modules.aftersales.repository.ServiceTicketRepository;
import com.fcar.be.modules.aftersales.repository.WarrantyBookRepository;
import com.fcar.be.modules.aftersales.service.AftersalesService;
import com.fcar.be.modules.finance.enums.HandoverStatus;
import com.fcar.be.modules.finance.repository.HandoverRepository;
import com.fcar.be.modules.identity.repository.UserRepository;
import com.fcar.be.modules.inventory.enums.CarStatus;
import com.fcar.be.modules.inventory.repository.CarRepository;
import com.fcar.be.modules.sales.entity.Contract;
import com.fcar.be.modules.sales.repository.ContractRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AftersalesServiceImpl implements AftersalesService {

    private final WarrantyBookRepository warrantyRepository;
    private final ServiceTicketRepository ticketRepository;
    private final AftersalesMapper aftersalesMapper;
    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final ContractRepository contractRepository;
    private final HandoverRepository handoverRepository;

    @Override
    @Transactional
    public WarrantyBookRes activateWarrantyForShowroom(WarrantyActivateReq request) {
        validateSalesScopeForCar(request.getCarVin());
        return persistNewWarranty(request);
    }

    private WarrantyBookRes persistNewWarranty(WarrantyActivateReq request) {
        if (warrantyRepository.findByCarVin(request.getCarVin()).isPresent()) {
            throw new AppException(ErrorCode.WARRANTY_EXISTED);
        }

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusMonths(request.getDurationMonths());

        WarrantyBook warrantyBook = WarrantyBook.builder()
                .carVin(request.getCarVin())
                .licensePlate(request.getLicensePlate())
                .startDate(startDate)
                .endDate(endDate)
                .build();

        return enrichWarrantyRes(warrantyRepository.save(warrantyBook));
    }

    @Override
    @Transactional
    public WarrantyBookRes updateWarranty(String carVin, WarrantyUpdateReq request) {
        validateSalesScopeForCar(carVin);
        WarrantyBook wb = warrantyRepository
                .findByCarVin(carVin)
                .orElseThrow(() -> new AppException(ErrorCode.WARRANTY_NOT_FOUND));
        boolean changed = false;
        if (request.getLicensePlate() != null && !request.getLicensePlate().isBlank()) {
            wb.setLicensePlate(request.getLicensePlate().trim());
            changed = true;
        }
        if (request.getDurationMonths() != null && request.getDurationMonths() > 0) {
            wb.setEndDate(wb.getStartDate().plusMonths(request.getDurationMonths()));
            changed = true;
        }
        if (!changed) {
            throw new AppException(ErrorCode.WARRANTY_UPDATE_EMPTY);
        }
        return enrichWarrantyRes(warrantyRepository.save(wb));
    }

    @Override
    public WarrantyLookupRes adminLookupWarranty(String contractNo, String licensePlate) {
        boolean hasContract = contractNo != null && !contractNo.isBlank();
        boolean hasPlate = licensePlate != null && !licensePlate.isBlank();
        if (hasContract == hasPlate) {
            throw new AppException(ErrorCode.WARRANTY_LOOKUP_PARAMS);
        }
        String vin;
        String resolvedContractNo = null;
        String plateQuery = null;
        if (hasContract) {
            Contract c = contractRepository
                    .findById(contractNo.trim())
                    .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
            vin = c.getCarVin();
            resolvedContractNo = c.getContractNo();
        } else {
            plateQuery = licensePlate.trim();
            vin = resolveVinByLicensePlate(plateQuery);
        }
        WarrantyLookupRes res = WarrantyLookupRes.builder()
                .carVin(vin)
                .contractNo(resolvedContractNo)
                .licensePlateQuery(plateQuery)
                .build();
        warrantyRepository
                .findByCarVin(vin)
                .ifPresentOrElse(
                        wb -> {
                            res.setWarranty(enrichWarrantyRes(wb));
                            res.setHistory(ticketRepository.findByWarrantyIdOrderByServiceDateDesc(wb.getId()).stream()
                                    .map(aftersalesMapper::toServiceTicketRes)
                                    .toList());
                        },
                        () -> {
                            res.setWarranty(null);
                            res.setHistory(List.of());
                        });
        if (res.getContractNo() == null) {
            contractRepository
                    .findTopByCarVinOrderBySignedDateDesc(vin)
                    .ifPresent(c -> res.setContractNo(c.getContractNo()));
        }
        return res;
    }

    private String resolveVinByLicensePlate(String plate) {
        return warrantyRepository
                .findByLicensePlate(plate)
                .map(WarrantyBook::getCarVin)
                .or(() -> handoverRepository.findByLicensePlate(plate).flatMap(h -> contractRepository
                        .findById(h.getContractNo())
                        .map(Contract::getCarVin)))
                .orElseThrow(() -> new AppException(ErrorCode.WARRANTY_NOT_FOUND));
    }

    @Override
    public WarrantyBookRes getWarrantyByVin(String carVin) {
        validateSalesScopeForCar(carVin);

        WarrantyBook warranty = warrantyRepository
                .findByCarVin(carVin)
                .orElseThrow(() -> new AppException(ErrorCode.WARRANTY_NOT_FOUND));
        return enrichWarrantyRes(warranty);
    }

    @Override
    @Transactional
    public ServiceTicketRes createServiceTicket(ServiceTicketCreateReq request) {
        validateSalesScopeForCar(request.getCarVin());

        WarrantyBook warranty = warrantyRepository
                .findByCarVin(request.getCarVin())
                .orElseThrow(() -> new AppException(ErrorCode.WARRANTY_NOT_FOUND));

        ServiceTicket ticket = aftersalesMapper.toServiceTicket(request);
        ticket.setWarrantyId(warranty.getId());
        ticket.setServiceDate(LocalDateTime.now());

        return aftersalesMapper.toServiceTicketRes(ticketRepository.save(ticket));
    }

    @Override
    public List<ServiceTicketRes> getServiceHistory(String carVin) {
        validateSalesScopeForCar(carVin);

        WarrantyBook warranty = warrantyRepository
                .findByCarVin(carVin)
                .orElseThrow(() -> new AppException(ErrorCode.WARRANTY_NOT_FOUND));

        return ticketRepository.findByWarrantyIdOrderByServiceDateDesc(warranty.getId()).stream()
                .map(aftersalesMapper::toServiceTicketRes)
                .toList();
    }

    // Hàm tiện ích để map và tính toán thêm cờ isExpired
    private WarrantyBookRes enrichWarrantyRes(WarrantyBook warrantyBook) {
        WarrantyBookRes res = aftersalesMapper.toWarrantyBookRes(warrantyBook);
        res.setExpired(LocalDate.now().isAfter(warrantyBook.getEndDate()));
        return res;
    }

    /**
     * Admin: xem toàn bộ.
     * Showroom: chỉ được thao tác xe đã SOLD thuộc showroom của chính mình.
     * Customer: giữ nguyên hành vi cũ (được check bởi controller/service business hiện tại).
     */
    private void validateSalesScopeForCar(String carVin) {
        if (hasRole("ROLE_ADMIN")) {
            return;
        }
        if (!hasRole("ROLE_SHOWROOM")) {
            return;
        }

        Long currentUserId = SecurityUtils.requireCurrentUserId();
        var currentUser =
                userRepository.findById(currentUserId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (currentUser.getShowroomId() == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        var car = carRepository.findByVin(carVin).orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));
        if (car.getStatus() != CarStatus.SOLD) {
            throw new AppException(ErrorCode.CAR_INVALID_STATUS);
        }
        if (!Objects.equals(car.getShowroomId(), currentUser.getShowroomId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        var contract = contractRepository
                .findTopByCarVinOrderBySignedDateDesc(carVin)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_HANDED_OVER));
        boolean handedOver =
                handoverRepository.existsByContractNoAndStatus(contract.getContractNo(), HandoverStatus.HANDED_OVER);
        if (!handedOver) {
            throw new AppException(ErrorCode.CAR_NOT_HANDED_OVER);
        }
    }

    private boolean hasRole(String roleName) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities() == null) {
            return false;
        }
        return auth.getAuthorities().stream().anyMatch(a -> roleName.equals(a.getAuthority()));
    }
}
