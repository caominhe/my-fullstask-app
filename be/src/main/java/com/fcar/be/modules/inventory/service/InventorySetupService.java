package com.fcar.be.modules.inventory.service;

import java.util.List;

import com.fcar.be.modules.inventory.dto.request.MasterDataCreateReq;
import com.fcar.be.modules.inventory.dto.request.ShowroomCreateReq;
import com.fcar.be.modules.inventory.dto.response.MasterDataRes;
import com.fcar.be.modules.inventory.dto.response.ShowroomManagementRes;
import com.fcar.be.modules.inventory.dto.response.ShowroomRes;

public interface InventorySetupService {
    MasterDataRes createMasterData(MasterDataCreateReq request);

    List<MasterDataRes> getAllMasterData(String brand, String model);

    MasterDataRes updateMasterData(Long id, MasterDataCreateReq request);

    void deleteMasterData(Long id);

    ShowroomRes createShowroom(ShowroomCreateReq request);

    List<ShowroomRes> getAllShowrooms(String keyword);

    ShowroomRes updateShowroom(Long id, ShowroomCreateReq request);

    void deleteShowroom(Long id);

    ShowroomManagementRes getShowroomManagement(Long showroomId);
}
