package com.fcar.be.modules.aftersales.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fcar.be.modules.aftersales.entity.WarrantyBook;

@Repository
public interface WarrantyBookRepository extends JpaRepository<WarrantyBook, Long> {
    Optional<WarrantyBook> findByCarVin(String carVin);

    Optional<WarrantyBook> findByLicensePlate(String licensePlate);
}
