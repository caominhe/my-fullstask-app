package com.fcar.be.modules.finance.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fcar.be.modules.finance.entity.Handover;

@Repository
public interface HandoverRepository extends JpaRepository<Handover, Long> {
    Optional<Handover> findByContractNo(String contractNo);

    Optional<Handover> findByLicensePlate(String licensePlate);

    boolean existsByLicensePlate(String licensePlate);

    boolean existsByContractNoAndStatus(String contractNo, com.fcar.be.modules.finance.enums.HandoverStatus status);
}
