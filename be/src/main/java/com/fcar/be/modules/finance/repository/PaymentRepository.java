package com.fcar.be.modules.finance.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fcar.be.modules.finance.entity.Payment;
import com.fcar.be.modules.finance.enums.PaymentStatus;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    java.util.Optional<Payment> findByContractNo(String contractNo);

    Optional<Payment> findByIdAndContractNo(Long id, String contractNo);

    boolean existsByIdAndContractNoAndStatus(Long id, String contractNo, PaymentStatus status);
}
