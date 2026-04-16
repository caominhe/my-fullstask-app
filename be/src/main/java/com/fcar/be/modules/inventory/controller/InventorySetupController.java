package com.fcar.be.modules.inventory.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.fcar.be.core.common.dto.ApiResponse;
import com.fcar.be.modules.inventory.dto.request.MasterDataCreateReq;
import com.fcar.be.modules.inventory.dto.request.ShowroomCreateReq;
import com.fcar.be.modules.inventory.dto.response.MasterDataRes;
import com.fcar.be.modules.inventory.dto.response.ShowroomManagementRes;
import com.fcar.be.modules.inventory.dto.response.ShowroomRes;
import com.fcar.be.modules.inventory.service.InventorySetupService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class InventorySetupController {
    private final InventorySetupService inventorySetupService;

    @PostMapping("/master-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<MasterDataRes> createMasterData(@RequestBody @Valid MasterDataCreateReq request) {
        return ApiResponse.<MasterDataRes>builder()
                .result(inventorySetupService.createMasterData(request))
                .build();
    }

    @GetMapping("/master-data")
    public ApiResponse<List<MasterDataRes>> getAllMasterData(
            @RequestParam(required = false) String brand, @RequestParam(required = false) String model) {
        return ApiResponse.<List<MasterDataRes>>builder()
                .result(inventorySetupService.getAllMasterData(brand, model))
                .build();
    }

    @PutMapping("/master-data/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<MasterDataRes> updateMasterData(
            @PathVariable Long id, @RequestBody @Valid MasterDataCreateReq request) {
        return ApiResponse.<MasterDataRes>builder()
                .result(inventorySetupService.updateMasterData(id, request))
                .build();
    }

    @DeleteMapping("/master-data/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteMasterData(@PathVariable Long id) {
        inventorySetupService.deleteMasterData(id);
        return ApiResponse.<String>builder().result("Deleted").build();
    }

    @PostMapping("/showrooms")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ShowroomRes> createShowroom(@RequestBody @Valid ShowroomCreateReq request) {
        return ApiResponse.<ShowroomRes>builder()
                .result(inventorySetupService.createShowroom(request))
                .build();
    }

    @GetMapping("/showrooms")
    public ApiResponse<List<ShowroomRes>> getAllShowrooms(@RequestParam(required = false) String keyword) {
        return ApiResponse.<List<ShowroomRes>>builder()
                .result(inventorySetupService.getAllShowrooms(keyword))
                .build();
    }

    @PutMapping("/showrooms/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ShowroomRes> updateShowroom(
            @PathVariable Long id, @RequestBody @Valid ShowroomCreateReq request) {
        return ApiResponse.<ShowroomRes>builder()
                .result(inventorySetupService.updateShowroom(id, request))
                .build();
    }

    @DeleteMapping("/showrooms/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteShowroom(@PathVariable Long id) {
        inventorySetupService.deleteShowroom(id);
        return ApiResponse.<String>builder().result("Deleted").build();
    }

    @GetMapping("/showrooms/{id}/management")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ShowroomManagementRes> getShowroomManagement(@PathVariable Long id) {
        return ApiResponse.<ShowroomManagementRes>builder()
                .result(inventorySetupService.getShowroomManagement(id))
                .build();
    }
}
