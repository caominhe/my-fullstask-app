package com.fcar.be.modules.marketing.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.fcar.be.modules.marketing.dto.request.CampaignCreateReq;
import com.fcar.be.modules.marketing.dto.response.VoucherRes;
import com.fcar.be.modules.marketing.entity.Campaign;
import com.fcar.be.modules.marketing.entity.Voucher;

@Mapper(componentModel = "spring")
public interface MarketingMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Campaign toCampaign(CampaignCreateReq request);

    @Mapping(source = "campaign.id", target = "campaignId")
    @Mapping(source = "campaign.name", target = "campaignName")
    @Mapping(source = "campaign.discountType", target = "discountType")
    @Mapping(source = "campaign.discountValue", target = "discountValue")
    VoucherRes toVoucherRes(Voucher voucher);
}
