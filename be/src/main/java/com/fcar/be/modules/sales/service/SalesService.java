package com.fcar.be.modules.sales.service;

import com.fcar.be.modules.sales.dto.request.QuotationCreateReq;
import com.fcar.be.modules.sales.dto.response.ContractRes;
import com.fcar.be.modules.sales.dto.response.QuotationRes;

public interface SalesService {
    QuotationRes createQuotation(QuotationCreateReq request, Long customerUserId);

    ContractRes createContract(Long quotationId, Long salesId);

    QuotationRes acceptQuotation(Long quotationId);
}
