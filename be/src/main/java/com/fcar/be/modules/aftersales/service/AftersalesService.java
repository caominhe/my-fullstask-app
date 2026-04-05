package com.fcar.be.modules.aftersales.service;

import java.util.List;

import com.fcar.be.modules.aftersales.dto.request.ServiceTicketCreateReq;
import com.fcar.be.modules.aftersales.dto.request.WarrantyActivateReq;
import com.fcar.be.modules.aftersales.dto.response.ServiceTicketRes;
import com.fcar.be.modules.aftersales.dto.response.WarrantyBookRes;

public interface AftersalesService {
    WarrantyBookRes activateWarranty(WarrantyActivateReq request);

    WarrantyBookRes getWarrantyByVin(String carVin);

    ServiceTicketRes createServiceTicket(ServiceTicketCreateReq request);

    List<ServiceTicketRes> getServiceHistory(String carVin);
}
