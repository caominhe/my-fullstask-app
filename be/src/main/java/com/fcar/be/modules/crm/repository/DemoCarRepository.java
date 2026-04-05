package com.fcar.be.modules.crm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fcar.be.modules.crm.entity.DemoCar;

@Repository
public interface DemoCarRepository extends JpaRepository<DemoCar, Long> {}
