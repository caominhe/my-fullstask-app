package com.fcar.be.modules.finance.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fcar.be.modules.finance.enums.PaymentMethod;
import com.fcar.be.modules.finance.enums.PaymentType;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "payment_histories")
@EntityListeners(AuditingEntityListener.class)
public class PaymentHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "receipt_id", nullable = false)
    Long receiptId;

    @Column(name = "contract_no", nullable = false)
    String contractNo;

    @Column(nullable = false)
    BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false)
    PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    PaymentMethod paymentMethod;

    @Column(name = "note")
    String note;

    @Column(name = "proof_image_url", length = 1024)
    String proofImageUrl;

    @Column(name = "remaining_debt", nullable = false)
    BigDecimal remainingDebt;

    @CreatedDate
    @Column(name = "paid_at", updatable = false)
    LocalDateTime paidAt;
}
