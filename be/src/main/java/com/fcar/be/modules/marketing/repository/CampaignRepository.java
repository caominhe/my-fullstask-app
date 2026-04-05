package com.fcar.be.modules.marketing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fcar.be.modules.marketing.entity.Campaign;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {}
