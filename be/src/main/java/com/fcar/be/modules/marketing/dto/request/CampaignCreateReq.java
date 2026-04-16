package com.fcar.be.modules.marketing.dto.request;

import java.math.BigDecimal;
import java.util.Set;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import com.fcar.be.modules.marketing.enums.CampaignRegion;
import com.fcar.be.modules.marketing.enums.CampaignTargetScope;
import com.fcar.be.modules.marketing.enums.DiscountType;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CampaignCreateReq {
    @NotBlank
    String name;

    @NotNull
    DiscountType discountType;

    @NotNull
    BigDecimal discountValue;

    @NotNull
    CampaignTargetScope targetScope;

    CampaignRegion targetRegion;

    String targetProvince;

    Long targetShowroomId;

    // Admin truyền danh sách ID xe vào đây (Có thể rỗng)
    Set<Long> applicableMasterDataIds;
}
