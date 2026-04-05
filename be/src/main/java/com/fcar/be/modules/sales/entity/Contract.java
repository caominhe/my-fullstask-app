package com.fcar.be.modules.sales.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

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

    @Column(name = "quotation_id", nullable = false, unique = true)
    Long quotationId;

    @Column(name = "sales_id", nullable = false)
    Long salesId;

    @Column(name = "signed_date")
    LocalDateTime signedDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    ContractStatus status = ContractStatus.PENDING;
}
