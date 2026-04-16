package com.fcar.be.modules.crm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fcar.be.modules.crm.entity.Lead;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findByShowroomIdOrderByCreatedAtDesc(Long showroomId);
}
