package com.fcar.be.modules.inventory.dto.response;

import com.fcar.be.modules.marketing.enums.CampaignRegion;
import com.fcar.be.modules.marketing.enums.CampaignTargetScope;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowroomPromotionRes {
    Long campaignId;
    String campaignName;
    CampaignTargetScope targetScope;
    CampaignRegion targetRegion;
    String targetProvince;
    Long targetShowroomId;
    String targetShowroomName;
    int totalVouchers;
    int activeVouchers;
    int claimedVouchers;
    int usedVouchers;
    int expiredVouchers;
}
