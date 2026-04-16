package com.fcar.be.modules.identity.entity;

import java.util.Set;

import jakarta.persistence.*;

import com.fcar.be.core.common.entity.BaseAuditableEntity;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "users")
public class User extends BaseAuditableEntity {

    @Column(name = "email", unique = true, nullable = false)
    String email;

    @Column(name = "avatar")
    String avatar;

    @Column(name = "password_hash")
    String passwordHash;

    @Column(name = "full_name", nullable = false)
    String fullName;

    @Column(name = "phone", unique = true)
    String phone;

    @Column(name = "citizen_id", unique = true, length = 20)
    String citizenId;

    @Column(name = "address", length = 255)
    String address;

    @Column(name = "showroom_id")
    Long showroomId;

    @Column(name = "status", nullable = false)
    @Builder.Default
    String status = "ACTIVE";

    @ManyToMany(fetch = FetchType.EAGER) // Load sẵn Role để nạp vào SecurityContext
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_name"))
    Set<Role> roles;
}
