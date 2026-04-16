package com.fcar.be.modules.aftersales.service;

import java.util.List;

import com.fcar.be.modules.aftersales.dto.request.ServiceTicketCreateReq;
import com.fcar.be.modules.aftersales.dto.request.WarrantyActivateReq;
import com.fcar.be.modules.aftersales.dto.request.WarrantyUpdateReq;
import com.fcar.be.modules.aftersales.dto.response.ServiceTicketRes;
import com.fcar.be.modules.aftersales.dto.response.WarrantyBookRes;
import com.fcar.be.modules.aftersales.dto.response.WarrantyLookupRes;

public interface AftersalesService {
    /** SHOWROOM: kích hoạt sổ (một nghiệp vụ với “mở sổ”) sau khi xe đã bàn giao, đúng chi nhánh. */
    WarrantyBookRes activateWarrantyForShowroom(WarrantyActivateReq request);

    WarrantyBookRes updateWarranty(String carVin, WarrantyUpdateReq request);

    WarrantyLookupRes adminLookupWarranty(String contractNo, String licensePlate);

    WarrantyBookRes getWarrantyByVin(String carVin);

    ServiceTicketRes createServiceTicket(ServiceTicketCreateReq request);

    List<ServiceTicketRes> getServiceHistory(String carVin);
}
