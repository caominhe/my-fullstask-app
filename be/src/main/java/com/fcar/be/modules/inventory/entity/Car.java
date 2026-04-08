package com.fcar.be.modules.inventory.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fcar.be.modules.inventory.enums.CarStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "cars")
@EntityListeners(AuditingEntityListener.class)
public class Car {
    @Id
    @Column(length = 17)
    String vin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "master_data_id", nullable = false)
    MasterData masterData;

    @Column(name = "engine_number", unique = true, nullable = false)
    String engineNumber;

    @Column(nullable = false)
    String color;

    @Column(name = "showroom_id")
    Long showroomId;

    /** Chỉ đọc — cùng cột `showroom_id`, dùng để join tên showroom khi trả API. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "showroom_id", insertable = false, updatable = false)
    Showroom showroom;

    // --- CẬP NHẬT TẠI ĐÂY ---
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    CarStatus status = CarStatus.IN_WAREHOUSE;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}
