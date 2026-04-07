package com.fcar.be.modules.identity.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "invalidated_refresh_tokens")
public class InvalidatedRefreshToken {

    @Id
    @Column(name = "jti", length = 64, nullable = false)
    String jti;

    @Column(name = "expires_at", nullable = false)
    LocalDateTime expiresAt;
}
