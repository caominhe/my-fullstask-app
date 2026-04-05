package com.fcar.be.modules.aftersales.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.fcar.be.modules.aftersales.dto.request.ServiceTicketCreateReq;
import com.fcar.be.modules.aftersales.dto.response.ServiceTicketRes;
import com.fcar.be.modules.aftersales.dto.response.WarrantyBookRes;
import com.fcar.be.modules.aftersales.entity.ServiceTicket;
import com.fcar.be.modules.aftersales.entity.WarrantyBook;

@Mapper(componentModel = "spring")
public interface AftersalesMapper {

    @Mapping(target = "isExpired", ignore = true)
    WarrantyBookRes toWarrantyBookRes(WarrantyBook warrantyBook);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "warrantyId", ignore = true)
    @Mapping(target = "serviceDate", ignore = true)
    ServiceTicket toServiceTicket(ServiceTicketCreateReq req);

    ServiceTicketRes toServiceTicketRes(ServiceTicket serviceTicket);
}
