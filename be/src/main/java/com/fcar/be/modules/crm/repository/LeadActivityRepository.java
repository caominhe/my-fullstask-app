package com.fcar.be.modules.crm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fcar.be.modules.crm.entity.LeadActivity;

@Repository
public interface LeadActivityRepository extends JpaRepository<LeadActivity, Long> {}
