package com.fcar.be.modules.aftersales.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
@Table(name = "service_tickets")
public class ServiceTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "warranty_id", nullable = false)
    Long warrantyId;

    @Column(name = "service_date", nullable = false)
    LocalDateTime serviceDate;

    @Column(columnDefinition = "TEXT", nullable = false)
    String description;

    @Column(name = "service_location", length = 255, nullable = false)
    String serviceLocation;

    @Column(name = "total_cost", nullable = false)
    BigDecimal totalCost;
}
