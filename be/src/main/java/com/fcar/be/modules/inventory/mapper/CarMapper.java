package com.fcar.be.modules.inventory.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.fcar.be.modules.inventory.dto.request.CarImportReq;
import com.fcar.be.modules.inventory.dto.response.CarDetailRes;
import com.fcar.be.modules.inventory.entity.Car;

@Mapper(componentModel = "spring")
public interface CarMapper {
    @Mapping(target = "masterData", ignore = true) // Sẽ tự set bằng code trong Service
    @Mapping(target = "showroom", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "listedPrice", ignore = true)
    @Mapping(target = "imageUrlsJson", ignore = true)
    @Mapping(target = "imageFolderUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Car toCar(CarImportReq request);

    @Mapping(source = "masterData.id", target = "masterDataId")
    @Mapping(source = "masterData.brand", target = "brand")
    @Mapping(source = "masterData.model", target = "model")
    @Mapping(source = "masterData.version", target = "version")
    @Mapping(source = "masterData.basePrice", target = "basePrice")
    @Mapping(source = "showroom.name", target = "showroomName")
    @Mapping(target = "imageUrls", ignore = true)
    CarDetailRes toCarDetailRes(Car car);
}
