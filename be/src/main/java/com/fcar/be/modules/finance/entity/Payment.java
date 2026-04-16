package com.fcar.be.modules.finance.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fcar.be.modules.finance.enums.PaymentMethod;
import com.fcar.be.modules.finance.enums.PaymentStatus;
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
@Table(name = "payments")
@EntityListeners(AuditingEntityListener.class)
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "contract_no", nullable = false, unique = true)
    String contractNo;

    @Column(nullable = false)
    BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type")
    PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    PaymentMethod paymentMethod;

    @Column(name = "note")
    String note;

    @Column(name = "transfer_code")
    String transferCode;

    @Column(name = "qr_payload")
    String qrPayload;

    @Column(name = "remaining_debt", nullable = false)
    BigDecimal remainingDebt;

    @CreatedDate
    @Column(name = "payment_date", updatable = false)
    LocalDateTime paymentDate;

    @Column(name = "confirmed_at")
    LocalDateTime confirmedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    PaymentStatus status = PaymentStatus.PENDING;
}
