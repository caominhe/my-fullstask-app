package com.fcar.be.modules.marketing.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fcar.be.modules.marketing.entity.Voucher;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, String> {
    boolean existsByCode(String code);

    @Query("select v from Voucher v join fetch v.campaign c where c.id = :campaignId order by v.expiredAt desc")
    List<Voucher> findAllByCampaignIdWithCampaign(@Param("campaignId") Long campaignId);

    Optional<Voucher> findByCodeAndUserId(String code, Long userId);

    // Tìm 1 Voucher đang ACTIVE của Campaign cụ thể
    Optional<Voucher> findFirstByCampaignIdAndStatus(
            Long campaignId, com.fcar.be.modules.marketing.enums.VoucherStatus status);

    Optional<Voucher> findFirstByCampaignIdAndStatusAndUserIdIsNullOrderByExpiredAtAsc(
            Long campaignId, com.fcar.be.modules.marketing.enums.VoucherStatus status);

    Optional<Voucher> findFirstByCampaignIdAndUserIdOrderByExpiredAtDesc(Long campaignId, Long userId);

    java.util.List<Voucher> findByUserIdOrderByExpiredAtDesc(Long userId);
}
