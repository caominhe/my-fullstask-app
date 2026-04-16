package com.fcar.be.modules.crm.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fcar.be.modules.crm.enums.LeadSource;
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
@Table(name = "leads")
@EntityListeners(AuditingEntityListener.class)
public class Lead {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "user_id")
    Long userId; // ID khách hàng (nếu đã có tài khoản, link sang module Identity)

    @Column(name = "full_name", nullable = false)
    String fullName;

    @Column(nullable = false)
    String phone;

    @Column(name = "interested_vin", length = 17)
    String interestedVin;

    @Enumerated(EnumType.STRING)
    LeadSource source;

    @Column(name = "showroom_id")
    Long showroomId; // ID showroom tiếp nhận/phụ trách lead

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    LeadStatus status = LeadStatus.NEEDS_CONSULTATION;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
}
