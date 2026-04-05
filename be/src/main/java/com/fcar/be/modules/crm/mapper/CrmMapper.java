package com.fcar.be.modules.crm.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.fcar.be.modules.crm.dto.request.LeadCreateReq;
import com.fcar.be.modules.crm.dto.response.LeadRes;
import com.fcar.be.modules.crm.entity.Lead;

@Mapper(componentModel = "spring")
public interface CrmMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "assignedSalesId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Lead toLead(LeadCreateReq req);

    LeadRes toLeadRes(Lead lead);
}
