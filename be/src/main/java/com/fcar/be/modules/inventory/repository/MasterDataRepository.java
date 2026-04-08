package com.fcar.be.modules.inventory.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fcar.be.modules.inventory.entity.MasterData;

@Repository
public interface MasterDataRepository extends JpaRepository<MasterData, Long> {
    Optional<MasterData> findByIdAndIsDeletedFalse(Long id);

    boolean existsByIdAndIsDeletedFalse(Long id);

    List<MasterData> findByIsDeletedFalse();

    List<MasterData> findByBrandContainingIgnoreCaseAndModelContainingIgnoreCaseAndIsDeletedFalse(
            String brand, String model);
}
