package com.fcar.be.modules.inventory.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fcar.be.modules.inventory.entity.Showroom;

@Repository
public interface ShowroomRepository extends JpaRepository<Showroom, Long> {
    Optional<Showroom> findByNameIgnoreCaseAndIsDeletedFalse(String name);

    Optional<Showroom> findByIdAndIsDeletedFalse(Long id);

    boolean existsByIdAndIsDeletedFalse(Long id);

    List<Showroom> findByIsDeletedFalse();

    List<Showroom> findByNameContainingIgnoreCaseAndIsDeletedFalse(String keyword);
}
