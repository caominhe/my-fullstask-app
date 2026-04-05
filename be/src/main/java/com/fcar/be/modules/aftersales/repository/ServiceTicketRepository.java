package com.fcar.be.modules.aftersales.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fcar.be.modules.aftersales.entity.ServiceTicket;

@Repository
public interface ServiceTicketRepository extends JpaRepository<ServiceTicket, Long> {
    List<ServiceTicket> findByWarrantyIdOrderByServiceDateDesc(Long warrantyId);
}
