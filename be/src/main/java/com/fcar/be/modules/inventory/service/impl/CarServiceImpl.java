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
import com.fcar.be.modules.inventory.enums.CarStatus;
import com.fcar.be.modules.inventory.mapper.CarMapper;
import com.fcar.be.modules.inventory.repository.CarRepository;
import com.fcar.be.modules.inventory.repository.MasterDataRepository;
import com.fcar.be.modules.inventory.service.CarService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CarServiceImpl implements CarService {

    private final CarRepository carRepository;
    private final MasterDataRepository masterDataRepository;
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
                .findById(request.getMasterDataId())
                .orElseThrow(() -> new AppException(ErrorCode.MASTER_DATA_NOT_FOUND));

        Car car = carMapper.toCar(request);
        car.setMasterData(masterData);
        car.setStatus(CarStatus.IN_WAREHOUSE);

        return carMapper.toCarDetailRes(carRepository.save(car));
    }

    @Override
    public List<CarDetailRes> getAllCars() {
        return carRepository.findAll().stream().map(carMapper::toCarDetailRes).toList();
    }

    @Override
    public CarDetailRes getCarByVin(String vin) {
        Car car = carRepository.findById(vin).orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));
        return carMapper.toCarDetailRes(car);
    }

    @Override
    @Transactional
    public CarDetailRes transferCar(String vin, CarTransferReq request) {
        Car car = carRepository.findById(vin).orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        // Không thể điều chuyển xe đã bán
        if (car.getStatus() == CarStatus.SOLD) {
            throw new AppException(ErrorCode.CAR_INVALID_STATUS);
        }

        car.setShowroomId(request.getShowroomId());
        return carMapper.toCarDetailRes(carRepository.save(car));
    }

    @Override
    @Transactional
    public CarDetailRes lockCar(String vin) {
        Car car = carRepository.findById(vin).orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        // Chỉ xe đang trong kho mới được phép khóa làm hợp đồng
        if (car.getStatus() != CarStatus.IN_WAREHOUSE) {
            throw new AppException(ErrorCode.CAR_INVALID_STATUS);
        }

        car.setStatus(CarStatus.LOCKED);
        return carMapper.toCarDetailRes(carRepository.save(car));
    }

    @Override
    @Transactional
    public CarDetailRes sellCar(String vin) {
        Car car = carRepository.findById(vin).orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        // Xe phải được khóa (làm hợp đồng) trước khi bán
        if (car.getStatus() != CarStatus.LOCKED) {
            throw new AppException(ErrorCode.CAR_INVALID_STATUS);
        }

        car.setStatus(CarStatus.SOLD);
        return carMapper.toCarDetailRes(carRepository.save(car));
    }
}
