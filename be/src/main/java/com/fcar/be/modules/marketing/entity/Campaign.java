package com.fcar.be.modules.marketing.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

import jakarta.persistence.*;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fcar.be.modules.marketing.enums.CampaignRegion;
import com.fcar.be.modules.marketing.enums.CampaignTargetScope;
import com.fcar.be.modules.marketing.enums.DiscountType;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "campaigns")
@EntityListeners(AuditingEntityListener.class)
public class Campaign {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false)
    String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    DiscountType discountType;

    @Column(name = "discount_value", nullable = false)
    BigDecimal discountValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_scope", nullable = false)
    @Builder.Default
    CampaignTargetScope targetScope = CampaignTargetScope.ALL;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_region", length = 20)
    CampaignRegion targetRegion;

    @Column(name = "target_province", length = 100)
    String targetProvince;

    @Column(name = "target_showroom_id")
    Long targetShowroomId;

    // --- CẬP NHẬT TẠI ĐÂY ---
    // Danh sách ID dòng xe được áp dụng khuyến mãi (Rỗng = áp dụng tất cả)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "campaign_applicable_cars", joinColumns = @JoinColumn(name = "campaign_id"))
    @Column(name = "master_data_id")
    Set<Long> applicableMasterDataIds;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
}
