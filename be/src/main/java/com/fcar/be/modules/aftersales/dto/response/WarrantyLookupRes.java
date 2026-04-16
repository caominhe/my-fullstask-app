package com.fcar.be.modules.aftersales.dto.response;

import java.util.List;

import lombok.*;
import lombok.experimental.FieldDefaults;

/** Kết quả tra cứu nhanh cho ADMIN (theo số HĐ hoặc biển số). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarrantyLookupRes {
    String carVin;
    String contractNo;
    /** Biển số dùng để tra (echo). */
    String licensePlateQuery;

    WarrantyBookRes warranty;
    List<ServiceTicketRes> history;
}
