package com.fcar.be.modules.sales.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.fcar.be.modules.finance.enums.PaymentType;
import com.fcar.be.modules.sales.enums.ContractStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "contracts")
public class Contract {
    @Id
    @Column(name = "contract_no", length = 50)
    String contractNo;

    @Column(name = "lead_id", nullable = false)
    Long leadId;

    @Column(name = "car_vin", nullable = false, length = 17)
    String carVin;

    @Column(name = "voucher_code", length = 50)
    String voucherCode;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    BigDecimal totalAmount;

    @Column(name = "discount_amount", nullable = false, precision = 15, scale = 2)
    BigDecimal discountAmount;

    @Column(name = "final_amount", nullable = false, precision = 15, scale = 2)
    BigDecimal finalAmount;

    @Column(name = "sales_id", nullable = false)
    Long salesId;

    @Column(name = "signed_date")
    LocalDateTime signedDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type")
    PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    ContractStatus status = ContractStatus.PENDING;
}
