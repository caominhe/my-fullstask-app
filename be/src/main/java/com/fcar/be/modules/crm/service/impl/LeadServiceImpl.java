package com.fcar.be.modules.crm.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fcar.be.core.common.util.SecurityUtils;
import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;
import com.fcar.be.modules.crm.dto.request.LeadActivityReq;
import com.fcar.be.modules.crm.dto.request.LeadCreateReq;
import com.fcar.be.modules.crm.dto.response.LeadRes;
import com.fcar.be.modules.crm.entity.Lead;
import com.fcar.be.modules.crm.entity.LeadActivity;
import com.fcar.be.modules.crm.enums.LeadStatus;
import com.fcar.be.modules.crm.mapper.CrmMapper;
import com.fcar.be.modules.crm.repository.LeadActivityRepository;
import com.fcar.be.modules.crm.repository.LeadRepository;
import com.fcar.be.modules.crm.service.LeadService;
import com.fcar.be.modules.identity.repository.UserRepository;
import com.fcar.be.modules.inventory.repository.ShowroomRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LeadServiceImpl implements LeadService {

    private final LeadRepository leadRepository;
    private final LeadActivityRepository leadActivityRepository; // Đã thêm repository này
    private final CrmMapper crmMapper;
    private final ShowroomRepository showroomRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public LeadRes createLead(LeadCreateReq request) {
        if (request.getShowroomId() == null
                || !showroomRepository.existsByIdAndIsDeletedFalse(request.getShowroomId())) {
            throw new AppException(ErrorCode.SHOWROOM_NOT_FOUND);
        }
        Lead lead = crmMapper.toLead(request);
        if (lead.getUserId() == null) {
            SecurityUtils.getCurrentUserId().ifPresent(lead::setUserId);
        }
        lead.setStatus(LeadStatus.NEEDS_CONSULTATION);
        return crmMapper.toLeadRes(leadRepository.save(lead));
    }

    private List<LeadRes> getLeadsByShowroom(Long showroomId) {
        return leadRepository.findByShowroomIdOrderByCreatedAtDesc(showroomId).stream()
                .map(crmMapper::toLeadRes)
                .toList();
    }

    @Override
    public List<LeadRes> getLeadsForCurrentSales(Long salesUserId) {
        var salesUser =
                userRepository.findById(salesUserId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (salesUser.getShowroomId() == null) {
            throw new AppException(ErrorCode.SHOWROOM_NOT_FOUND);
        }
        return getLeadsByShowroom(salesUser.getShowroomId());
    }

    @Override
    @Transactional
    public void logActivity(Long leadId, Long customerUserId, LeadActivityReq req) {
        Lead lead = leadRepository.findById(leadId).orElseThrow(() -> new AppException(ErrorCode.LEAD_NOT_FOUND));

        // 1. Tạo lịch sử tương tác
        LeadActivity activity = LeadActivity.builder()
                .lead(lead)
                .customerUserId(customerUserId)
                .demoCarId(req.getDemoCarId())
                .status(req.getStatus())
                .comment(req.getComment())
                .build();
        leadActivityRepository.save(activity);

        // 2. Tự động chuyển phễu (Lead Funnel)
        lead.setStatus(req.getStatus());
        leadRepository.save(lead);
    }

    @Override
    @Transactional
    public void updateLeadStatus(Long leadId, LeadStatus newStatus) {
        Lead lead = leadRepository.findById(leadId).orElseThrow(() -> new AppException(ErrorCode.LEAD_NOT_FOUND));
        lead.setStatus(newStatus);
        leadRepository.save(lead);
    }
}
