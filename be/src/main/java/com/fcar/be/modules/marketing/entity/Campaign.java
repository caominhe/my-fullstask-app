package com.fcar.be.modules.marketing.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

import jakarta.persistence.*;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

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
