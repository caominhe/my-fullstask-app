package com.fcar.be.modules.sales.service;

import java.util.List;

import com.fcar.be.modules.marketing.dto.response.VoucherRes;
import com.fcar.be.modules.sales.dto.request.ContractCreateReq;
import com.fcar.be.modules.sales.dto.response.ContractRes;

public interface SalesService {
    ContractRes createContract(ContractCreateReq request, Long salesId);

    ContractRes confirmContractByCustomer(String contractNo);

    ContractRes getContract(String contractNo);

    List<ContractRes> getUnprocessedContractsForCurrentShowroom(Long salesUserId);

    List<VoucherRes> getLeadCustomerVouchers(Long leadId, Long salesUserId);
}
