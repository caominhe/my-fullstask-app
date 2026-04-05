package com.fcar.be.modules.inventory.service;

import java.util.List;

import com.fcar.be.modules.inventory.dto.request.CarImportReq;
import com.fcar.be.modules.inventory.dto.request.CarTransferReq;
import com.fcar.be.modules.inventory.dto.response.CarDetailRes;

public interface CarService {
    CarDetailRes importCar(CarImportReq request);

    List<CarDetailRes> getAllCars();

    CarDetailRes getCarByVin(String vin);

    CarDetailRes transferCar(String vin, CarTransferReq request);

    CarDetailRes lockCar(String vin);

    CarDetailRes sellCar(String vin);
}
