package com.fcar.be.modules.marketing.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;
import com.fcar.be.modules.crm.service.LeadService;
import com.fcar.be.modules.identity.repository.UserRepository;
import com.fcar.be.modules.marketing.dto.request.CampaignCreateReq;
import com.fcar.be.modules.marketing.dto.response.VoucherRes;
import com.fcar.be.modules.marketing.entity.Campaign;
import com.fcar.be.modules.marketing.entity.Event;
import com.fcar.be.modules.marketing.entity.Voucher;
import com.fcar.be.modules.marketing.enums.VoucherStatus;
import com.fcar.be.modules.marketing.mapper.MarketingMapper;
import com.fcar.be.modules.marketing.repository.CampaignRepository;
import com.fcar.be.modules.marketing.repository.EventRepository;
import com.fcar.be.modules.marketing.repository.VoucherRepository;
import com.fcar.be.modules.marketing.service.MarketingService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MarketingServiceImpl implements MarketingService {
    private final CampaignRepository campaignRepository;
    private final VoucherRepository voucherRepository;
    private final MarketingMapper marketingMapper;
    private final EventRepository eventRepository;
    private final LeadService leadService;
    private final UserRepository userRepository;

    @Override
    public Campaign createCampaign(CampaignCreateReq request) {
        return campaignRepository.save(marketingMapper.toCampaign(request));
    }

    @Override
    @Transactional
    public List<VoucherRes> generateVouchers(Long campaignId, int quantity, String prefix, LocalDateTime expiredAt) {
        Campaign campaign = campaignRepository
                .findById(campaignId)
                .orElseThrow(() -> new AppException(ErrorCode.CAMPAIGN_NOT_FOUND));

        List<Voucher> newVouchers = new ArrayList<>();
        for (int i = 0; i < quantity; i++) {
            // Sinh mã ngẫu nhiên: VD "VIP-8F3A9C"
            String code = (prefix != null ? prefix + "-" : "")
                    + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

            newVouchers.add(Voucher.builder()
                    .code(code)
                    .campaign(campaign)
                    .status(VoucherStatus.ACTIVE)
                    .expiredAt(expiredAt)
                    .build());
        }

        return voucherRepository.saveAll(newVouchers).stream()
                .map(marketingMapper::toVoucherRes)
                .toList();
    }

    @Override
    @Transactional
    public VoucherRes claimVoucher(String code, Long userId) {
        Voucher voucher =
                voucherRepository.findById(code).orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

        if (voucher.getStatus() != VoucherStatus.ACTIVE) {
            throw new AppException(ErrorCode.VOUCHER_INVALID_STATUS);
        }
        if (voucher.getExpiredAt().isBefore(LocalDateTime.now())) {
            voucher.setStatus(VoucherStatus.EXPIRED);
            voucherRepository.save(voucher);
            throw new AppException(ErrorCode.VOUCHER_EXPIRED);
        }

        voucher.setUserId(userId);
        voucher.setStatus(VoucherStatus.CLAIMED);
        return marketingMapper.toVoucherRes(voucherRepository.save(voucher));
    }

    @Override
    @Transactional
    public VoucherRes useVoucher(String code, Long userId) {
        Voucher voucher = voucherRepository
                .findByCodeAndUserId(code, userId)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_OWNED));

        if (voucher.getStatus() != VoucherStatus.CLAIMED) {
            throw new AppException(ErrorCode.VOUCHER_INVALID_STATUS);
        }
        if (voucher.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.VOUCHER_EXPIRED);
        }

        voucher.setStatus(VoucherStatus.USED);
        return marketingMapper.toVoucherRes(voucherRepository.save(voucher));
    }

    @Transactional
    public VoucherRes registerEventAndClaimVoucher(Long eventId, Long userId) {
        // 1. Kiểm tra Event
        Event event = eventRepository
                .findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION)); // Cần tạo thêm EVENT_NOT_FOUND

        // 2. Lấy thông tin User hiện tại (Identity Module)
        var user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // 3. Tự động tạo Lead bên CRM Module
        com.fcar.be.modules.crm.dto.request.LeadCreateReq leadReq =
                com.fcar.be.modules.crm.dto.request.LeadCreateReq.builder()
                        .userId(userId)
                        .fullName(user.getFullName())
                        .phone(user.getPhone() != null ? user.getPhone() : "0000000000") // Tránh lỗi null phone
                        .source(com.fcar.be.modules.crm.enums.LeadSource.EVENT)
                        .showroomId(event.getShowroomId()) // Tự động định tuyến Lead về Showroom tổ chức Event
                        .build();
        leadService.createLead(leadReq);

        // 4. Tìm và cấp Voucher (Marketing Module)
        if (event.getCampaign() != null) {
            Voucher voucher = voucherRepository
                    .findFirstByCampaignIdAndStatus(event.getCampaign().getId(), VoucherStatus.ACTIVE)
                    .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND)); // Hết voucher

            voucher.setUserId(userId);
            voucher.setStatus(VoucherStatus.CLAIMED);
            return marketingMapper.toVoucherRes(voucherRepository.save(voucher));
        }
        return null; // Trả về rỗng nếu sự kiện không có khuyến mãi
    }

    @Override
    @Transactional
    public VoucherRes validateAndUseVoucher(String code, Long userId, Long masterDataId) {
        // 1. Kiểm tra quyền sở hữu
        Voucher voucher = voucherRepository
                .findByCodeAndUserId(code, userId)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_OWNED));

        Campaign campaign = voucher.getCampaign();

        // 2. Trạng thái bắt buộc phải là CLAIMED (Đã được gán cho user qua Event)
        if (voucher.getStatus() != VoucherStatus.CLAIMED) {
            throw new AppException(ErrorCode.VOUCHER_INVALID_STATUS);
        }

        // 3. Kiểm tra thời gian (Đã đồng bộ múi giờ ở BeApplication)
        if (voucher.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.VOUCHER_EXPIRED);
        }

        // 4. Kiểm tra ID dòng xe xem có nằm trong danh sách được áp dụng không
        Set<Long> allowedCars = campaign.getApplicableMasterDataIds();
        if (allowedCars != null && !allowedCars.isEmpty() && !allowedCars.contains(masterDataId)) {
            throw new AppException(ErrorCode.VOUCHER_NOT_APPLICABLE);
        }

        // 5. Hợp lệ -> Đổi thành USED
        voucher.setStatus(VoucherStatus.USED);
        return marketingMapper.toVoucherRes(voucherRepository.save(voucher));
    }
}
