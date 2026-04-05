package com.fcar.be.modules.crm.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fcar.be.modules.crm.enums.LeadStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "lead_activities")
@EntityListeners(AuditingEntityListener.class)
public class LeadActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    Lead lead;

    @Column(name = "customer_user_id")
    Long customerUserId; // Ghi nhận ID khách hàng

    @Column(name = "demo_car_id")
    Long demoCarId; // Ghi nhận ID xe lái thử (Nếu có)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    LeadStatus status; // Trạng thái của lần tương tác này

    @Column(columnDefinition = "TEXT")
    String comment; // Nhận xét, đánh giá của khách

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
}
