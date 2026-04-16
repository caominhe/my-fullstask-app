package com.fcar.be.modules.sales.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fcar.be.modules.sales.entity.Contract;
import com.fcar.be.modules.sales.enums.ContractStatus;

@Repository
public interface ContractRepository extends JpaRepository<Contract, String> {
    boolean existsByCarVinAndStatusIn(String carVin, List<ContractStatus> statuses);

    /** Xe đang gắn hợp đồng chưa hủy (khác CANCELLED). */
    boolean existsByCarVinAndStatusNot(String carVin, ContractStatus status);

    Optional<Contract> findTopByCarVinOrderBySignedDateDesc(String carVin);

    List<Contract> findByLeadIdInAndStatusIn(List<Long> leadIds, List<ContractStatus> statuses);
}
