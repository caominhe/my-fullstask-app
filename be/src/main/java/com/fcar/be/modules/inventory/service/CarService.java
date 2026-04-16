package com.fcar.be.modules.inventory.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.fcar.be.modules.inventory.dto.request.CarImportReq;
import com.fcar.be.modules.inventory.dto.request.CarTransferReq;
import com.fcar.be.modules.inventory.dto.request.CarUpdateReq;
import com.fcar.be.modules.inventory.dto.response.CarDetailRes;

public interface CarService {
    CarDetailRes importCar(CarImportReq request);

    List<CarDetailRes> getAllCars(Long showroomId, String brand, String model, boolean excludeWithContract);

    CarDetailRes getCarByVin(String vin);

    CarDetailRes transferCar(String vin, CarTransferReq request);

    CarDetailRes lockCar(String vin);

    CarDetailRes sellCar(String vin);

    CarDetailRes updateCar(String vin, CarUpdateReq request);

    String uploadCarImage(MultipartFile file);

    List<String> uploadCarImages(List<MultipartFile> files);
}
