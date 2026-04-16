package com.fcar.be.modules.finance.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.fcar.be.modules.finance.enums.HandoverStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "handovers")
public class Handover {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "contract_no", nullable = false, unique = true)
    String contractNo;

    @Column(name = "license_plate", unique = true)
    String licensePlate; // Sẽ được cập nhật sau khi đi bấm biển số

    @Column(name = "handover_date")
    LocalDateTime handoverDate; // Ngày giao xe thực tế

    @Column(name = "receipt_id")
    Long receiptId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    HandoverStatus status = HandoverStatus.PROCESSING;
}
