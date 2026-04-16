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
import com.fcar.be.modules.inventory.repository.ShowroomRepository;
import com.fcar.be.modules.marketing.dto.request.CampaignCreateReq;
import com.fcar.be.modules.marketing.dto.response.VoucherRes;
import com.fcar.be.modules.marketing.entity.Campaign;
import com.fcar.be.modules.marketing.entity.Voucher;
import com.fcar.be.modules.marketing.enums.VoucherStatus;
import com.fcar.be.modules.marketing.mapper.MarketingMapper;
import com.fcar.be.modules.marketing.repository.CampaignRepository;
import com.fcar.be.modules.marketing.repository.VoucherRepository;
import com.fcar.be.modules.marketing.service.MarketingService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MarketingServiceImpl implements MarketingService {
    private final CampaignRepository campaignRepository;
    private final VoucherRepository voucherRepository;
    private final MarketingMapper marketingMapper;
    private final LeadService leadService;
    private final UserRepository userRepository;
    private final ShowroomRepository showroomRepository;

    @Override
    public Campaign createCampaign(CampaignCreateReq request) {
        String normalizedName = normalizeCampaignName(request.getName());
        if (campaignRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new AppException(ErrorCode.CAMPAIGN_NAME_DUPLICATED);
        }
        request.setName(normalizedName);
        normalizeAndValidateTarget(request);
        return campaignRepository.save(marketingMapper.toCampaign(request));
    }

    @Override
    @Transactional
    public Campaign updateCampaign(Long campaignId, CampaignCreateReq request) {
        Campaign campaign = campaignRepository
                .findById(campaignId)
                .orElseThrow(() -> new AppException(ErrorCode.CAMPAIGN_NOT_FOUND));

        String normalizedName = normalizeCampaignName(request.getName());
        if (campaignRepository.existsByNameIgnoreCaseAndIdNot(normalizedName, campaignId)) {
            throw new AppException(ErrorCode.CAMPAIGN_NAME_DUPLICATED);
        }
        normalizeAndValidateTarget(request);

        campaign.setName(normalizedName);
        campaign.setDiscountType(request.getDiscountType());
        campaign.setDiscountValue(request.getDiscountValue());
        campaign.setApplicableMasterDataIds(request.getApplicableMasterDataIds());
        campaign.setTargetScope(request.getTargetScope());
        campaign.setTargetRegion(request.getTargetRegion());
        campaign.setTargetProvince(request.getTargetProvince());
        campaign.setTargetShowroomId(request.getTargetShowroomId());
        return campaignRepository.save(campaign);
    }

    @Override
    @Transactional
    public void deleteCampaign(Long campaignId) {
        Campaign campaign = campaignRepository
                .findById(campaignId)
                .orElseThrow(() -> new AppException(ErrorCode.CAMPAIGN_NOT_FOUND));
        List<Voucher> vouchers = voucherRepository.findAllByCampaignIdWithCampaign(campaignId);
        if (!vouchers.isEmpty()) {
            voucherRepository.deleteAll(vouchers);
        }
        campaignRepository.delete(campaign);
    }

    @Override
    public List<Campaign> getCampaigns() {
        return campaignRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Campaign> getCustomerCampaigns(Long showroomId) {
        List<Campaign> campaigns = campaignRepository.findAllByOrderByCreatedAtDesc();
        if (showroomId == null) {
            return campaigns.stream()
                    .filter(c -> c.getTargetScope() == null
                            || c.getTargetScope() == com.fcar.be.modules.marketing.enums.CampaignTargetScope.ALL)
                    .toList();
        }
        if (!showroomRepository.existsById(showroomId)) {
            throw new AppException(ErrorCode.CAMPAIGN_TARGET_SHOWROOM_NOT_FOUND);
        }
        return campaigns.stream()
                .filter(c -> c.getTargetScope() == com.fcar.be.modules.marketing.enums.CampaignTargetScope.SHOWROOM
                        && c.getTargetShowroomId() != null
                        && c.getTargetShowroomId().equals(showroomId))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoucherRes> getCampaignVouchers(Long campaignId) {
        refreshExpiredVoucherStatuses();
        if (!campaignRepository.existsById(campaignId)) {
            throw new AppException(ErrorCode.CAMPAIGN_NOT_FOUND);
        }
        return voucherRepository.findAllByCampaignIdWithCampaign(campaignId).stream()
                .map(marketingMapper::toVoucherRes)
                .toList();
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
        refreshExpiredVoucherStatuses();
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
    public VoucherRes registerCampaignAndClaimVoucher(Long campaignId, Long userId, Long showroomId) {
        refreshExpiredVoucherStatuses();
        Campaign campaign = campaignRepository
                .findById(campaignId)
                .orElseThrow(() -> new AppException(ErrorCode.CAMPAIGN_NOT_FOUND));

        if (campaign.getTargetScope() == com.fcar.be.modules.marketing.enums.CampaignTargetScope.SHOWROOM) {
            if (showroomId == null) {
                throw new AppException(ErrorCode.CAMPAIGN_TARGET_SHOWROOM_REQUIRED);
            }
            if (campaign.getTargetShowroomId() == null
                    || !campaign.getTargetShowroomId().equals(showroomId)) {
                throw new AppException(ErrorCode.CAMPAIGN_TARGET_SHOWROOM_NOT_FOUND);
            }
        }

        Voucher existingVoucher = voucherRepository
                .findFirstByCampaignIdAndUserIdOrderByExpiredAtDesc(campaignId, userId)
                .orElse(null);
        if (existingVoucher != null) {
            return marketingMapper.toVoucherRes(existingVoucher);
        }

        var user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Long leadShowroomId = showroomId != null ? showroomId : campaign.getTargetShowroomId();
        com.fcar.be.modules.crm.dto.request.LeadCreateReq leadReq =
                com.fcar.be.modules.crm.dto.request.LeadCreateReq.builder()
                        .userId(userId)
                        .fullName(user.getFullName())
                        .phone(user.getPhone() != null ? user.getPhone() : "0000000000")
                        .source(com.fcar.be.modules.crm.enums.LeadSource.WEB)
                        .showroomId(leadShowroomId)
                        .build();
        leadService.createLead(leadReq);

        Voucher voucher = voucherRepository
                .findFirstByCampaignIdAndStatusAndUserIdIsNullOrderByExpiredAtAsc(campaignId, VoucherStatus.ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));
        voucher.setUserId(userId);
        voucher.setStatus(VoucherStatus.CLAIMED);
        return marketingMapper.toVoucherRes(voucherRepository.save(voucher));
    }

    @Override
    @Transactional
    public List<VoucherRes> getMyVouchers(Long userId) {
        refreshExpiredVoucherStatuses();
        return voucherRepository.findByUserIdOrderByExpiredAtDesc(userId).stream()
                .map(marketingMapper::toVoucherRes)
                .toList();
    }

    @Override
    @Transactional
    public VoucherRes validateAndUseVoucher(String code, Long userId, Long masterDataId) {
        refreshExpiredVoucherStatuses();
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

    private String normalizeCampaignName(String name) {
        return name == null ? null : name.trim();
    }

    private String normalizeTargetProvince(String province) {
        if (province == null) return null;
        String trimmed = province.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private void normalizeAndValidateTarget(CampaignCreateReq request) {
        if (request.getTargetScope() == null) {
            throw new AppException(ErrorCode.CAMPAIGN_TARGET_SCOPE_REQUIRED);
        }
        request.setTargetProvince(normalizeTargetProvince(request.getTargetProvince()));
        switch (request.getTargetScope()) {
            case ALL -> {
                request.setTargetRegion(null);
                request.setTargetProvince(null);
                request.setTargetShowroomId(null);
            }
            case REGION -> {
                if (request.getTargetRegion() == null) {
                    throw new AppException(ErrorCode.CAMPAIGN_TARGET_REGION_REQUIRED);
                }
                request.setTargetProvince(null);
                request.setTargetShowroomId(null);
            }
            case PROVINCE -> {
                if (request.getTargetProvince() == null) {
                    throw new AppException(ErrorCode.CAMPAIGN_TARGET_PROVINCE_REQUIRED);
                }
                request.setTargetRegion(null);
                request.setTargetShowroomId(null);
            }
            case SHOWROOM -> {
                if (request.getTargetShowroomId() == null) {
                    throw new AppException(ErrorCode.CAMPAIGN_TARGET_SHOWROOM_REQUIRED);
                }
                if (!showroomRepository.existsById(request.getTargetShowroomId())) {
                    throw new AppException(ErrorCode.CAMPAIGN_TARGET_SHOWROOM_NOT_FOUND);
                }
                request.setTargetRegion(null);
                request.setTargetProvince(null);
            }
            default -> throw new AppException(ErrorCode.CAMPAIGN_TARGET_SCOPE_REQUIRED);
        }
    }

    private void refreshExpiredVoucherStatuses() {
        List<Voucher> allVouchers = voucherRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        boolean changed = false;
        for (Voucher voucher : allVouchers) {
            if ((voucher.getStatus() == VoucherStatus.ACTIVE || voucher.getStatus() == VoucherStatus.CLAIMED)
                    && voucher.getExpiredAt() != null
                    && voucher.getExpiredAt().isBefore(now)) {
                voucher.setStatus(VoucherStatus.EXPIRED);
                changed = true;
            }
        }
        if (changed) {
            voucherRepository.saveAll(allVouchers);
        }
    }
}
