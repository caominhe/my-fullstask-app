package com.fcar.be.modules.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fcar.be.modules.identity.entity.InvalidatedRefreshToken;

public interface InvalidatedRefreshTokenRepository extends JpaRepository<InvalidatedRefreshToken, String> {

    boolean existsByJti(String jti);
}
