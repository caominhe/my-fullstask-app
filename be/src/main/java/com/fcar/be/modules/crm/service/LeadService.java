package com.fcar.be.modules.crm.service;

import java.util.List;

import com.fcar.be.modules.crm.dto.request.LeadActivityReq;
import com.fcar.be.modules.crm.dto.request.LeadCreateReq;
import com.fcar.be.modules.crm.dto.response.LeadRes;
import com.fcar.be.modules.crm.enums.LeadStatus;

public interface LeadService {
    LeadRes createLead(LeadCreateReq request);

    LeadRes assignSales(Long leadId, Long salesId);

    List<LeadRes> getLeadsBySales(Long salesId);

    // Bổ sung 2 hàm mới phục vụ Funnel
    void logActivity(Long leadId, Long customerUserId, LeadActivityReq req);

    void updateLeadStatus(Long leadId, LeadStatus newStatus);
}
