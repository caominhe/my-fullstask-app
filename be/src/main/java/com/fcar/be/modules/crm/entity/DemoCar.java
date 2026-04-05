package com.fcar.be.modules.crm.entity;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "demo_cars")
public class DemoCar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "master_data_id", nullable = false)
    Long masterDataId; // Trỏ về ID dòng xe (VD: Camry)

    @Column(unique = true)
    String vin;

    @Column(name = "license_plate", unique = true)
    String licensePlate; // Biển số xe lái thử

    @Column(name = "external_booking_url", length = 500)
    String externalBookingUrl; // Link Calendly / Web ngoài để check lịch
}
