package com.fcar.be.modules.marketing.service;

import java.time.LocalDateTime;
import java.util.List;

import com.fcar.be.modules.marketing.dto.request.CampaignCreateReq;
import com.fcar.be.modules.marketing.dto.response.VoucherRes;
import com.fcar.be.modules.marketing.entity.Campaign;

public interface MarketingService {
    Campaign createCampaign(CampaignCreateReq request);

    Campaign updateCampaign(Long campaignId, CampaignCreateReq request);

    void deleteCampaign(Long campaignId);

    List<Campaign> getCampaigns();

    List<Campaign> getCustomerCampaigns(Long showroomId);

    List<VoucherRes> getCampaignVouchers(Long campaignId);

    List<VoucherRes> generateVouchers(Long campaignId, int quantity, String prefix, LocalDateTime expiredAt);

    VoucherRes claimVoucher(String code, Long userId);

    VoucherRes registerCampaignAndClaimVoucher(Long campaignId, Long userId, Long showroomId);

    List<VoucherRes> getMyVouchers(Long userId);

    // Thay đổi tham số hàm này
    VoucherRes validateAndUseVoucher(String code, Long userId, Long masterDataId);
}
