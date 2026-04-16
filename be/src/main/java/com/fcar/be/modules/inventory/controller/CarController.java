package com.fcar.be.modules.inventory.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.fcar.be.core.common.dto.ApiResponse;
import com.fcar.be.modules.inventory.dto.request.CarImportReq;
import com.fcar.be.modules.inventory.dto.request.CarTransferReq;
import com.fcar.be.modules.inventory.dto.request.CarUpdateReq;
import com.fcar.be.modules.inventory.dto.response.CarDetailRes;
import com.fcar.be.modules.inventory.service.CarService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarService carService;

    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CarDetailRes> importCar(@RequestBody @Valid CarImportReq request) {
        return ApiResponse.<CarDetailRes>builder()
                .result(carService.importCar(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<CarDetailRes>> getAllCars(
            @RequestParam(required = false) Long showroomId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String model,
            @RequestParam(required = false, defaultValue = "false") boolean excludeWithContract) {
        return ApiResponse.<List<CarDetailRes>>builder()
                .result(carService.getAllCars(showroomId, brand, model, excludeWithContract))
                .build();
    }

    @GetMapping("/{vin}")
    public ApiResponse<CarDetailRes> getCarByVin(@PathVariable String vin) {
        return ApiResponse.<CarDetailRes>builder()
                .result(carService.getCarByVin(vin))
                .build();
    }

    @PutMapping("/{vin}/transfer")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CarDetailRes> transferCar(@PathVariable String vin, @RequestBody @Valid CarTransferReq request) {
        return ApiResponse.<CarDetailRes>builder()
                .result(carService.transferCar(vin, request))
                .build();
    }

    @PutMapping("/{vin}/lock")
    @PreAuthorize("hasRole('SHOWROOM')")
    public ApiResponse<CarDetailRes> lockCar(@PathVariable String vin) {
        return ApiResponse.<CarDetailRes>builder()
                .result(carService.lockCar(vin))
                .build();
    }

    @PutMapping("/{vin}/sell")
    @PreAuthorize("hasRole('SHOWROOM')")
    public ApiResponse<CarDetailRes> sellCar(@PathVariable String vin) {
        return ApiResponse.<CarDetailRes>builder()
                .result(carService.sellCar(vin))
                .build();
    }

    @PutMapping("/{vin}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CarDetailRes> updateCar(@PathVariable String vin, @RequestBody @Valid CarUpdateReq request) {
        return ApiResponse.<CarDetailRes>builder()
                .result(carService.updateCar(vin, request))
                .build();
    }

    @PostMapping("/images/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> uploadCarImage(@RequestParam("file") MultipartFile file) {
        return ApiResponse.<String>builder()
                .result(carService.uploadCarImage(file))
                .build();
    }

    @PostMapping("/images/upload-multiple")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<String>> uploadCarImages(@RequestParam("files") List<MultipartFile> files) {
        return ApiResponse.<List<String>>builder()
                .result(carService.uploadCarImages(files))
                .build();
    }
}
