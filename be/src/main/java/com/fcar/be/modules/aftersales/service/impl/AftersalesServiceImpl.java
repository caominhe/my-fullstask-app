package com.fcar.be.modules.aftersales.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;
import com.fcar.be.modules.aftersales.dto.request.ServiceTicketCreateReq;
import com.fcar.be.modules.aftersales.dto.request.WarrantyActivateReq;
import com.fcar.be.modules.aftersales.dto.response.ServiceTicketRes;
import com.fcar.be.modules.aftersales.dto.response.WarrantyBookRes;
import com.fcar.be.modules.aftersales.entity.ServiceTicket;
import com.fcar.be.modules.aftersales.entity.WarrantyBook;
import com.fcar.be.modules.aftersales.mapper.AftersalesMapper;
import com.fcar.be.modules.aftersales.repository.ServiceTicketRepository;
import com.fcar.be.modules.aftersales.repository.WarrantyBookRepository;
import com.fcar.be.modules.aftersales.service.AftersalesService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AftersalesServiceImpl implements AftersalesService {

    private final WarrantyBookRepository warrantyRepository;
    private final ServiceTicketRepository ticketRepository;
    private final AftersalesMapper aftersalesMapper;

    @Override
    @Transactional
    public WarrantyBookRes activateWarranty(WarrantyActivateReq request) {
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
    public WarrantyBookRes getWarrantyByVin(String carVin) {
        WarrantyBook warranty = warrantyRepository
                .findByCarVin(carVin)
                .orElseThrow(() -> new AppException(ErrorCode.WARRANTY_NOT_FOUND));
        return enrichWarrantyRes(warranty);
    }

    @Override
    @Transactional
    public ServiceTicketRes createServiceTicket(ServiceTicketCreateReq request) {
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
}
