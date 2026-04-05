package com.fcar.be.modules.sales.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fcar.be.modules.sales.entity.Quotation;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {}
