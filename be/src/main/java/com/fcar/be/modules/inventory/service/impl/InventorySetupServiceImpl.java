package com.fcar.be.modules.inventory.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;
import com.fcar.be.modules.identity.dto.response.UserResponse;
import com.fcar.be.modules.identity.mapper.UserMapper;
import com.fcar.be.modules.identity.repository.UserRepository;
import com.fcar.be.modules.inventory.dto.request.MasterDataCreateReq;
import com.fcar.be.modules.inventory.dto.request.ShowroomCreateReq;
import com.fcar.be.modules.inventory.dto.response.CarDetailRes;
import com.fcar.be.modules.inventory.dto.response.MasterDataRes;
import com.fcar.be.modules.inventory.dto.response.ShowroomManagementRes;
import com.fcar.be.modules.inventory.dto.response.ShowroomPromotionRes;
import com.fcar.be.modules.inventory.dto.response.ShowroomRes;
import com.fcar.be.modules.inventory.entity.MasterData;
import com.fcar.be.modules.inventory.entity.Showroom;
import com.fcar.be.modules.inventory.mapper.CarMapper;
import com.fcar.be.modules.inventory.repository.CarRepository;
import com.fcar.be.modules.inventory.repository.MasterDataRepository;
import com.fcar.be.modules.inventory.repository.ShowroomRepository;
import com.fcar.be.modules.inventory.service.InventorySetupService;
import com.fcar.be.modules.marketing.entity.Campaign;
import com.fcar.be.modules.marketing.enums.CampaignTargetScope;
import com.fcar.be.modules.marketing.enums.VoucherStatus;
import com.fcar.be.modules.marketing.repository.CampaignRepository;
import com.fcar.be.modules.marketing.repository.VoucherRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InventorySetupServiceImpl implements InventorySetupService {
    private final MasterDataRepository masterDataRepository;
    private final ShowroomRepository showroomRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final VoucherRepository voucherRepository;
    private final UserMapper userMapper;
    private final CarMapper carMapper;

    @Override
    @Transactional
    public MasterDataRes createMasterData(MasterDataCreateReq request) {
        MasterData entity = MasterData.builder()
                .brand(request.getBrand().trim())
                .model(request.getModel().trim())
                .version(request.getVersion().trim())
                .basePrice(request.getBasePrice())
                .build();

        MasterData saved = masterDataRepository.save(entity);
        return MasterDataRes.builder()
                .id(saved.getId())
                .brand(saved.getBrand())
                .model(saved.getModel())
                .version(saved.getVersion())
                .basePrice(saved.getBasePrice())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MasterDataRes> getAllMasterData(String brand, String model) {
        String normalizedBrand = brand == null ? "" : brand.trim();
        String normalizedModel = model == null ? "" : model.trim();
        return masterDataRepository
                .findByBrandContainingIgnoreCaseAndModelContainingIgnoreCaseAndIsDeletedFalse(
                        normalizedBrand, normalizedModel)
                .stream()
                .map(md -> MasterDataRes.builder()
                        .id(md.getId())
                        .brand(md.getBrand())
                        .model(md.getModel())
                        .version(md.getVersion())
                        .basePrice(md.getBasePrice())
                        .createdAt(md.getCreatedAt())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public MasterDataRes updateMasterData(Long id, MasterDataCreateReq request) {
        MasterData target = masterDataRepository
                .findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.MASTER_DATA_NOT_FOUND));
        target.setBrand(request.getBrand().trim());
        target.setModel(request.getModel().trim());
        target.setVersion(request.getVersion().trim());
        target.setBasePrice(request.getBasePrice());

        MasterData saved = masterDataRepository.save(target);
        return MasterDataRes.builder()
                .id(saved.getId())
                .brand(saved.getBrand())
                .model(saved.getModel())
                .version(saved.getVersion())
                .basePrice(saved.getBasePrice())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void deleteMasterData(Long id) {
        MasterData target = masterDataRepository
                .findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.MASTER_DATA_NOT_FOUND));
        if (Boolean.TRUE.equals(target.getIsDeleted())) {
            throw new AppException(ErrorCode.MASTER_DATA_NOT_FOUND);
        }
        if (carRepository.existsByMasterData_Id(id)) {
            throw new AppException(ErrorCode.MASTER_DATA_IN_USE);
        }
        target.setIsDeleted(true);
        masterDataRepository.save(target);
    }

    @Override
    @Transactional
    public ShowroomRes createShowroom(ShowroomCreateReq request) {
        Showroom entity = Showroom.builder()
                .name(request.getName().trim())
                .address(request.getAddress())
                .build();

        Showroom saved = showroomRepository.save(entity);
        return ShowroomRes.builder()
                .id(saved.getId())
                .name(saved.getName())
                .address(saved.getAddress())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShowroomRes> getAllShowrooms(String keyword) {
        String normalized = keyword == null ? "" : keyword.trim();
        List<Showroom> showrooms = normalized.isEmpty()
                ? showroomRepository.findByIsDeletedFalse()
                : showroomRepository.findByNameContainingIgnoreCaseAndIsDeletedFalse(normalized);
        return showrooms.stream()
                .map(sr -> ShowroomRes.builder()
                        .id(sr.getId())
                        .name(sr.getName())
                        .address(sr.getAddress())
                        .createdAt(sr.getCreatedAt())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public ShowroomRes updateShowroom(Long id, ShowroomCreateReq request) {
        Showroom target = showroomRepository
                .findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.SHOWROOM_NOT_FOUND));
        target.setName(request.getName().trim());
        target.setAddress(request.getAddress());
        Showroom saved = showroomRepository.save(target);
        return ShowroomRes.builder()
                .id(saved.getId())
                .name(saved.getName())
                .address(saved.getAddress())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void deleteShowroom(Long id) {
        Showroom target = showroomRepository
                .findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.SHOWROOM_NOT_FOUND));
        if (Boolean.TRUE.equals(target.getIsDeleted())) {
            throw new AppException(ErrorCode.SHOWROOM_NOT_FOUND);
        }
        if (carRepository.existsByShowroomId(id)) {
            throw new AppException(ErrorCode.SHOWROOM_IN_USE);
        }
        target.setIsDeleted(true);
        showroomRepository.save(target);
    }

    @Override
    @Transactional(readOnly = true)
    public ShowroomManagementRes getShowroomManagement(Long showroomId) {
        Showroom showroom = showroomRepository
                .findByIdAndIsDeletedFalse(showroomId)
                .orElseThrow(() -> new AppException(ErrorCode.SHOWROOM_NOT_FOUND));

        ShowroomRes showroomRes = ShowroomRes.builder()
                .id(showroom.getId())
                .name(showroom.getName())
                .address(showroom.getAddress())
                .createdAt(showroom.getCreatedAt())
                .build();

        List<UserResponse> users = userRepository.findByShowroomId(showroomId).stream()
                .map(userMapper::toUserResponse)
                .toList();

        List<CarDetailRes> cars = carRepository.searchCars(showroomId, null, null).stream()
                .map(carMapper::toCarDetailRes)
                .toList();

        List<ShowroomPromotionRes> promotions = campaignRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(campaign -> isCampaignApplicableToShowroom(campaign, showroom))
                .map(this::toShowroomPromotionRes)
                .toList();

        return ShowroomManagementRes.builder()
                .showroom(showroomRes)
                .users(users)
                .cars(cars)
                .promotions(promotions)
                .build();
    }

    private boolean isCampaignApplicableToShowroom(Campaign campaign, Showroom showroom) {
        if (campaign.getTargetScope() == null || campaign.getTargetScope() == CampaignTargetScope.ALL) {
            return true;
        }
        if (campaign.getTargetScope() == CampaignTargetScope.SHOWROOM) {
            return campaign.getTargetShowroomId() != null
                    && campaign.getTargetShowroomId().equals(showroom.getId());
        }
        if (campaign.getTargetScope() == CampaignTargetScope.PROVINCE) {
            String province = normalizeText(campaign.getTargetProvince());
            String address = normalizeText(showroom.getAddress());
            return province != null && address != null && address.contains(province);
        }
        // REGION: dự án chưa lưu region cho showroom, tạm coi là hiển thị để admin vẫn theo dõi được campaign.
        return campaign.getTargetScope() == CampaignTargetScope.REGION;
    }

    private ShowroomPromotionRes toShowroomPromotionRes(Campaign campaign) {
        List<com.fcar.be.modules.marketing.entity.Voucher> vouchers =
                voucherRepository.findAllByCampaignIdWithCampaign(campaign.getId());
        int active = 0;
        int claimed = 0;
        int used = 0;
        int expired = 0;
        for (com.fcar.be.modules.marketing.entity.Voucher voucher : vouchers) {
            VoucherStatus status = voucher.getStatus();
            if (status == VoucherStatus.ACTIVE) active++;
            else if (status == VoucherStatus.CLAIMED) claimed++;
            else if (status == VoucherStatus.USED) used++;
            else if (status == VoucherStatus.EXPIRED) expired++;
        }

        String targetShowroomName = null;
        if (campaign.getTargetShowroomId() != null) {
            targetShowroomName = showroomRepository
                    .findById(campaign.getTargetShowroomId())
                    .map(Showroom::getName)
                    .orElse(null);
        }

        return ShowroomPromotionRes.builder()
                .campaignId(campaign.getId())
                .campaignName(campaign.getName())
                .targetScope(campaign.getTargetScope())
                .targetRegion(campaign.getTargetRegion())
                .targetProvince(campaign.getTargetProvince())
                .targetShowroomId(campaign.getTargetShowroomId())
                .targetShowroomName(targetShowroomName)
                .totalVouchers(vouchers.size())
                .activeVouchers(active)
                .claimedVouchers(claimed)
                .usedVouchers(used)
                .expiredVouchers(expired)
                .build();
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().toLowerCase();
        return normalized.isBlank() ? null : normalized;
    }
}
