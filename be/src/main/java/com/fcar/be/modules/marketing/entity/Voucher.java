package com.fcar.be.modules.marketing.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.fcar.be.modules.marketing.enums.VoucherStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "vouchers")
public class Voucher {
    @Id
    @Column(length = 50)
    String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    Campaign campaign;

    @Column(name = "user_id")
    Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    VoucherStatus status = VoucherStatus.ACTIVE;

    @Column(name = "expired_at", nullable = false)
    LocalDateTime expiredAt;
}
