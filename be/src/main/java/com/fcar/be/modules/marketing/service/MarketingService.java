package com.fcar.be.modules.marketing.service;

import java.time.LocalDateTime;
import java.util.List;

import com.fcar.be.modules.marketing.dto.request.CampaignCreateReq;
import com.fcar.be.modules.marketing.dto.response.VoucherRes;
import com.fcar.be.modules.marketing.entity.Campaign;

public interface MarketingService {
    Campaign createCampaign(CampaignCreateReq request);

    List<VoucherRes> generateVouchers(Long campaignId, int quantity, String prefix, LocalDateTime expiredAt);

    VoucherRes claimVoucher(String code, Long userId);

    VoucherRes useVoucher(String code, Long userId);

    VoucherRes registerEventAndClaimVoucher(Long eventId, Long userId);

    // Thay đổi tham số hàm này
    VoucherRes validateAndUseVoucher(String code, Long userId, Long masterDataId);
}
