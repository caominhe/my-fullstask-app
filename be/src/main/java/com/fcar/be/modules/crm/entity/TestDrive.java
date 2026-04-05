package com.fcar.be.modules.crm.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.fcar.be.modules.crm.enums.TestDriveStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "test_drives")
public class TestDrive {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    Lead lead; // Nằm cùng module CRM nên dùng @ManyToOne thoải mái

    @Column(name = "car_model_id", nullable = false)
    Long carModelId; // Link sang master_data của module Inventory

    @Column(name = "schedule_time", nullable = false)
    LocalDateTime scheduleTime;

    @Column(columnDefinition = "TEXT")
    String feedback;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    TestDriveStatus status = TestDriveStatus.SCHEDULED;
}
