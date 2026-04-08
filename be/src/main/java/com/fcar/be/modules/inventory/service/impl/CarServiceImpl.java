package com.fcar.be.modules.inventory.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;
import com.fcar.be.modules.inventory.dto.request.CarImportReq;
import com.fcar.be.modules.inventory.dto.request.CarTransferReq;
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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CarServiceImpl implements CarService {

    private final CarRepository carRepository;
    private final MasterDataRepository masterDataRepository;
    private final ShowroomRepository showroomRepository;
    private final CarMapper carMapper;

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
        // Có showroom ngay khi nhập → coi như đã về đại lý (AVAILABLE); không thì kho tổng.
        car.setStatus(request.getShowroomId() != null ? CarStatus.AVAILABLE : CarStatus.IN_WAREHOUSE);

        return carMapper.toCarDetailRes(carRepository.save(car));
    }

    @Override
    @Transactional
    public List<CarDetailRes> getAllCars(Long showroomId, String brand, String model) {
        String normalizedBrand = brand == null || brand.isBlank() ? null : brand.trim();
        String normalizedModel = model == null || model.isBlank() ? null : model.trim();
        return carRepository.searchCars(showroomId, normalizedBrand, normalizedModel).stream()
                .map(this::repairShowroomStatusIfNeeded)
                .map(carMapper::toCarDetailRes)
                .toList();
    }

    @Override
    @Transactional
    public CarDetailRes getCarByVin(String vin) {
        Car car = carRepository.findByVin(vin).orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));
        car = repairShowroomStatusIfNeeded(car);
        return carMapper.toCarDetailRes(car);
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
        return carMapper.toCarDetailRes(saved);
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
        return carMapper.toCarDetailRes(carRepository.save(car));
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
        return carMapper.toCarDetailRes(carRepository.save(car));
    }
}
