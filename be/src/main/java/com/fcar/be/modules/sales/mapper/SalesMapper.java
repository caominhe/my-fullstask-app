package com.fcar.be.modules.sales.mapper;

import org.mapstruct.Mapper;

import com.fcar.be.modules.sales.dto.response.ContractRes;
import com.fcar.be.modules.sales.dto.response.QuotationRes;
import com.fcar.be.modules.sales.entity.Contract;
import com.fcar.be.modules.sales.entity.Quotation;

@Mapper(componentModel = "spring")
public interface SalesMapper {
    QuotationRes toQuotationRes(Quotation quotation);

    ContractRes toContractRes(Contract contract);
}
