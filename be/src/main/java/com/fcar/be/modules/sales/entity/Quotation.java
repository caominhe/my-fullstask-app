package com.fcar.be.modules.sales.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fcar.be.modules.sales.enums.QuotationStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "quotations")
@EntityListeners(AuditingEntityListener.class)
public class Quotation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "lead_id", nullable = false)
    Long leadId;

    @Column(name = "car_vin", nullable = false)
    String carVin;

    @Column(name = "voucher_code")
    String voucherCode;

    @Column(name = "total_amount", nullable = false)
    BigDecimal totalAmount;

    @Column(name = "final_amount", nullable = false)
    BigDecimal finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    QuotationStatus status = QuotationStatus.DRAFT;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
}
