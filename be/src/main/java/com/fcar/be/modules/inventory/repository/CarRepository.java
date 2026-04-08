package com.fcar.be.modules.inventory.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fcar.be.modules.inventory.entity.Car;

@Repository
public interface CarRepository extends JpaRepository<Car, String> {
    boolean existsByEngineNumber(String engineNumber);

    @EntityGraph(attributePaths = {"masterData", "showroom"})
    List<Car> findAll();

    @EntityGraph(attributePaths = {"masterData", "showroom"})
    Optional<Car> findByVin(String vin);

    @EntityGraph(attributePaths = {"masterData", "showroom"})
    @Query("select c from Car c join c.masterData md "
            + "where (:showroomId is null or c.showroomId = :showroomId) "
            + "and (:brand is null or lower(md.brand) like lower(concat('%', :brand, '%'))) "
            + "and (:model is null or lower(md.model) like lower(concat('%', :model, '%')))")
    List<Car> searchCars(
            @Param("showroomId") Long showroomId, @Param("brand") String brand, @Param("model") String model);

    boolean existsByMasterData_Id(Long masterDataId);

    boolean existsByShowroomId(Long showroomId);
}
