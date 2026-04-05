package com.fcar.be.modules.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fcar.be.modules.inventory.entity.Car;

@Repository
public interface CarRepository extends JpaRepository<Car, String> {
    boolean existsByEngineNumber(String engineNumber);
}
