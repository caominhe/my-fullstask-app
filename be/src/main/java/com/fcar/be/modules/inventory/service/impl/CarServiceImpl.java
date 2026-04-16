package com.fcar.be.modules.inventory.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;
import com.fcar.be.modules.inventory.dto.request.CarImportReq;
import com.fcar.be.modules.inventory.dto.request.CarTransferReq;
import com.fcar.be.modules.inventory.dto.request.CarUpdateReq;
import com.fcar.be.modules.inventory.dto.response.CarDetailRes;
import com.fcar.be.modules.inventory.entity.Car;
import com.fcar.be.modules.inventory.entity.MasterData;
import com.fcar.be.modules.inventory.entity.Showroom;
import com.fcar.be.modules.inventory.enums.CarStatus;
import com.fcar.be.modules.inventory.mapper.CarMapper;
import com.fcar.be.modules.inventory.repository.CarRepository;
import com.fcar.be.modules.inventory.repository.MasterDataRepository;
import com.fcar.be.modules.inventory.repository.ShowroomRepository;
import com.fcar.be.modules.inventory.service.CarService;
import com.fcar.be.modules.sales.enums.ContractStatus;
import com.fcar.be.modules.sales.repository.ContractRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CarServiceImpl implements CarService {

    private final CarRepository carRepository;
    private final MasterDataRepository masterDataRepository;
    private final ShowroomRepository showroomRepository;
    private final CarMapper carMapper;
    private final CloudinaryImageService cloudinaryImageService;
    private final ObjectMapper objectMapper;
    private final ContractRepository contractRepository;

    @Override
    @Transactional
    public CarDetailRes importCar(CarImportReq request) {
        if (carRepository.existsById(request.getVin())) {
            throw new AppException(ErrorCode.CAR_EXISTED);
        }
        if (carRepository.existsByEngineNumber(request.getEngineNumber())) {
            throw new AppException(ErrorCode.ENGINE_NUMBER_EXISTED);
        }

        MasterData masterData = masterDataRepository
                .findByIdAndIsDeletedFalse(request.getMasterDataId())
                .orElseThrow(() -> new AppException(ErrorCode.MASTER_DATA_NOT_FOUND));

        if (request.getShowroomId() != null
                && !showroomRepository.existsByIdAndIsDeletedFalse(request.getShowroomId())) {
            throw new AppException(ErrorCode.SHOWROOM_NOT_FOUND);
        }

        Car car = carMapper.toCar(request);
        car.setMasterData(masterData);
        List<String> normalizedImageUrls = normalizeImageUrls(request.getImageUrls());
        String normalizedImageUrl = normalizeImageUrl(request.getImageUrl());
        if (normalizedImageUrl == null && !normalizedImageUrls.isEmpty()) {
            normalizedImageUrl = normalizedImageUrls.get(0);
        }
        car.setImageUrl(normalizedImageUrl);
        car.setImageUrlsJson(writeImageUrlsJson(normalizedImageUrls));
        car.setImageFolderUrl(normalizeImageUrl(request.getImageFolderUrl()));
        // Có showroom ngay khi nhập → coi như đã về đại lý (AVAILABLE); không thì kho tổng.
        car.setStatus(request.getShowroomId() != null ? CarStatus.AVAILABLE : CarStatus.IN_WAREHOUSE);

        return toEffectiveCarDetailRes(carRepository.save(car));
    }

    @Override
    @Transactional
    public List<CarDetailRes> getAllCars(Long showroomId, String brand, String model, boolean excludeWithContract) {
        String normalizedBrand = brand == null || brand.isBlank() ? null : brand.trim();
        String normalizedModel = model == null || model.isBlank() ? null : model.trim();
        var stream = carRepository.searchCars(showroomId, normalizedBrand, normalizedModel).stream()
                .map(this::repairShowroomStatusIfNeeded);
        if (excludeWithContract) {
            stream = stream.filter(
                    c -> !contractRepository.existsByCarVinAndStatusNot(c.getVin(), ContractStatus.CANCELLED));
        }
        return stream.map(this::toEffectiveCarDetailRes).toList();
    }

    @Override
    @Transactional
    public CarDetailRes getCarByVin(String vin) {
        Car car = carRepository.findByVin(vin).orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));
        car = repairShowroomStatusIfNeeded(car);
        return toEffectiveCarDetailRes(car);
    }

    /**
     * Dữ liệu lệch: đã có showroom_id nhưng status còn IN_WAREHOUSE (import cũ / migration chưa chạy).
     * Sửa thành AVAILABLE và lưu để GET /cars và GET /cars/{vin} hiển thị đúng.
     */
    private Car repairShowroomStatusIfNeeded(Car car) {
        if (car.getShowroomId() != null && car.getStatus() == CarStatus.IN_WAREHOUSE) {
            car.setStatus(CarStatus.AVAILABLE);
            return carRepository.save(car);
        }
        return car;
    }

    @Override
    @Transactional
    public CarDetailRes transferCar(String vin, CarTransferReq request) {
        Car car = carRepository.findByVin(vin).orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        // Chỉ cho phép điều chuyển xe đang trong kho tổng.
        if (car.getStatus() != CarStatus.IN_WAREHOUSE) {
            throw new AppException(ErrorCode.CAR_INVALID_STATUS);
        }

        Long targetShowroomId = resolveShowroomId(request);
        car.setShowroomId(targetShowroomId);
        car.setStatus(CarStatus.AVAILABLE);
        Car saved = carRepository.save(car);
        Showroom target = showroomRepository
                .findByIdAndIsDeletedFalse(targetShowroomId)
                .orElseThrow(() -> new AppException(ErrorCode.SHOWROOM_NOT_FOUND));
        saved.setShowroom(target);
        return toEffectiveCarDetailRes(saved);
    }

    private Long resolveShowroomId(CarTransferReq request) {
        if (request.getShowroomId() != null) {
            if (!showroomRepository.existsByIdAndIsDeletedFalse(request.getShowroomId())) {
                throw new AppException(ErrorCode.SHOWROOM_NOT_FOUND);
            }
            return request.getShowroomId();
        }

        if (request.getShowroomName() != null && !request.getShowroomName().isBlank()) {
            Showroom showroom = showroomRepository
                    .findByNameIgnoreCaseAndIsDeletedFalse(
                            request.getShowroomName().trim())
                    .orElseThrow(() -> new AppException(ErrorCode.SHOWROOM_NOT_FOUND));
            return showroom.getId();
        }

        throw new AppException(ErrorCode.INVALID_TRANSFER_TARGET);
    }

    @Override
    @Transactional
    public CarDetailRes lockCar(String vin) {
        Car car = carRepository.findByVin(vin).orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        // Xe ở kho tổng hoặc đã về showroom (AVAILABLE) mới được khóa làm hợp đồng
        if (car.getStatus() != CarStatus.IN_WAREHOUSE && car.getStatus() != CarStatus.AVAILABLE) {
            throw new AppException(ErrorCode.CAR_INVALID_STATUS);
        }

        car.setStatus(CarStatus.LOCKED);
        return toEffectiveCarDetailRes(carRepository.save(car));
    }

    @Override
    @Transactional
    public CarDetailRes sellCar(String vin) {
        Car car = carRepository.findByVin(vin).orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        // Xe phải được khóa (làm hợp đồng) trước khi bán
        if (car.getStatus() != CarStatus.LOCKED) {
            throw new AppException(ErrorCode.CAR_INVALID_STATUS);
        }

        car.setStatus(CarStatus.SOLD);
        return toEffectiveCarDetailRes(carRepository.save(car));
    }

    @Override
    @Transactional
    public CarDetailRes updateCar(String vin, CarUpdateReq request) {
        Car car = carRepository.findByVin(vin).orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        List<String> normalizedImageUrls = normalizeImageUrls(request.getImageUrls());
        String normalizedImageUrl = normalizeImageUrl(request.getImageUrl());
        if (normalizedImageUrl == null && !normalizedImageUrls.isEmpty()) {
            normalizedImageUrl = normalizedImageUrls.get(0);
        }
        car.setImageUrl(normalizedImageUrl);
        car.setImageUrlsJson(writeImageUrlsJson(normalizedImageUrls));
        car.setImageFolderUrl(normalizeImageUrl(request.getImageFolderUrl()));
        car.setListedPrice(normalizeListedPrice(request.getListedPrice()));

        return toEffectiveCarDetailRes(carRepository.save(car));
    }

    @Override
    public String uploadCarImage(MultipartFile file) {
        return cloudinaryImageService.uploadCarImage(file);
    }

    @Override
    public List<String> uploadCarImages(List<MultipartFile> files) {
        return cloudinaryImageService.uploadCarImages(files);
    }

    private String normalizeImageUrl(String imageUrl) {
        if (imageUrl == null) {
            return null;
        }
        String normalized = imageUrl.trim();
        return normalized.isBlank() ? null : normalized;
    }

    private List<String> normalizeImageUrls(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return new ArrayList<>();
        }
        return imageUrls.stream()
                .map(this::normalizeImageUrl)
                .filter(url -> url != null)
                .distinct()
                .toList();
    }

    private String writeImageUrlsJson(List<String> imageUrls) {
        List<String> normalized = imageUrls == null ? new ArrayList<>() : imageUrls;
        try {
            return objectMapper.writeValueAsString(normalized);
        } catch (JsonProcessingException ex) {
            throw new AppException(ErrorCode.CAR_IMAGE_UPLOAD_FAILED);
        }
    }

    private List<String> readImageUrlsJson(String imageUrlsJson) {
        if (imageUrlsJson == null || imageUrlsJson.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(imageUrlsJson, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException ex) {
            return new ArrayList<>();
        }
    }

    private BigDecimal normalizeListedPrice(BigDecimal listedPrice) {
        if (listedPrice == null) {
            return null;
        }
        if (listedPrice.signum() <= 0) {
            throw new AppException(ErrorCode.CAR_PRICE_INVALID);
        }
        return listedPrice;
    }

    private CarDetailRes toEffectiveCarDetailRes(Car car) {
        CarDetailRes res = carMapper.toCarDetailRes(car);
        res.setImageUrls(readImageUrlsJson(car.getImageUrlsJson()));
        res.setImageFolderUrl(car.getImageFolderUrl());
        if (res.getListedPrice() != null) {
            res.setBasePrice(res.getListedPrice());
        }
        return res;
    }
}
