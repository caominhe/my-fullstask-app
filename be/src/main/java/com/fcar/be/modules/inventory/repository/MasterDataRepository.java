package com.fcar.be.modules.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fcar.be.modules.inventory.entity.MasterData;

@Repository
public interface MasterDataRepository extends JpaRepository<MasterData, Long> {}
