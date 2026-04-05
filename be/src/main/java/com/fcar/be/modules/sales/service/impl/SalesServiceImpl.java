package com.fcar.be.modules.sales.service.impl;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;
import com.fcar.be.modules.crm.service.LeadService;
import com.fcar.be.modules.inventory.dto.response.CarDetailRes;
import com.fcar.be.modules.inventory.service.CarService;
import com.fcar.be.modules.marketing.dto.response.VoucherRes;
import com.fcar.be.modules.marketing.enums.DiscountType;
import com.fcar.be.modules.marketing.service.MarketingService;
import com.fcar.be.modules.sales.dto.request.QuotationCreateReq;
import com.fcar.be.modules.sales.dto.response.ContractRes;
import com.fcar.be.modules.sales.dto.response.QuotationRes;
import com.fcar.be.modules.sales.entity.Contract;
import com.fcar.be.modules.sales.entity.Quotation;
import com.fcar.be.modules.sales.enums.ContractStatus;
import com.fcar.be.modules.sales.enums.QuotationStatus;
import com.fcar.be.modules.sales.mapper.SalesMapper;
import com.fcar.be.modules.sales.repository.ContractRepository;
import com.fcar.be.modules.sales.repository.QuotationRepository;
import com.fcar.be.modules.sales.service.SalesService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SalesServiceImpl implements SalesService {

    private final QuotationRepository quotationRepository;
    private final ContractRepository contractRepository;
    private final SalesMapper salesMapper;

    // Tiêm (Inject) Service từ các Module khác vào để giao tiếp chéo
    private final LeadService leadService;
    private final CarService carService;
    private final MarketingService marketingService;

    @Override
    @Transactional
    public QuotationRes createQuotation(QuotationCreateReq request, Long customerUserId) {
        // 1. Gọi Inventory lấy giá xe gốc và thông tin MasterData bằng số VIN
        CarDetailRes car = carService.getCarByVin(request.getCarVin());
        BigDecimal totalAmount = car.getBasePrice();
        BigDecimal finalAmount = totalAmount;

        // 2. Kiểm duyệt và áp dụng Voucher (Gọi sang module Marketing)
        if (request.getVoucherCode() != null && !request.getVoucherCode().isBlank()) {
            VoucherRes voucher = marketingService.validateAndUseVoucher(
                    request.getVoucherCode(),
                    customerUserId,
                    car.getMasterDataId() // Truyền ID dòng xe vật lý vào để check điều kiện
                    );

            if (voucher.getDiscountType() == DiscountType.PERCENT) {
                BigDecimal discountAmt =
                        totalAmount.multiply(voucher.getDiscountValue()).divide(BigDecimal.valueOf(100));
                finalAmount = totalAmount.subtract(discountAmt);
            } else {
                finalAmount = totalAmount.subtract(voucher.getDiscountValue());
            }
        }

        // 3. Khởi tạo Báo giá
        Quotation quotation = Quotation.builder()
                .leadId(request.getLeadId())
                .carVin(request.getCarVin())
                .voucherCode(request.getVoucherCode())
                .totalAmount(totalAmount)
                .finalAmount(finalAmount)
                .status(QuotationStatus.DRAFT)
                .build();

        // 4. Lưu vào Database
        Quotation savedQuotation = quotationRepository.save(quotation);

        // (Đã loại bỏ logic gọi chéo cập nhật trạng thái QUOTING trên bảng Lead để tránh dư thừa dữ liệu)

        return salesMapper.toQuotationRes(savedQuotation);
    }

    @Override
    @Transactional
    public QuotationRes acceptQuotation(Long quotationId) {
        Quotation quotation = quotationRepository
                .findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

        quotation.setStatus(QuotationStatus.ACCEPTED);
        return salesMapper.toQuotationRes(quotationRepository.save(quotation));
    }

    @Override
    @Transactional
    public ContractRes createContract(Long quotationId, Long salesId) {
        // 1. Kiểm tra xem báo giá đã có hợp đồng chưa (quan hệ 1-1)
        if (contractRepository.existsByQuotationId(quotationId)) {
            throw new AppException(ErrorCode.CONTRACT_EXISTED);
        }

        // 2. Kiểm tra Báo giá có hợp lệ không
        Quotation quotation = quotationRepository
                .findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

        if (quotation.getStatus() != QuotationStatus.ACCEPTED) {
            throw new AppException(ErrorCode.QUOTATION_NOT_ACCEPTED);
        }

        // 3. LUỒNG 4: TỰ ĐỘNG KHÓA XE (LOCK CAR)
        // Gọi sang module Inventory để chuyển xe từ IN_WAREHOUSE sang LOCKED.
        // Nếu xe đã bị Sales khác khóa, CarService sẽ throw Exception và giao dịch này sẽ bị Rollback.
        carService.lockCar(quotation.getCarVin());

        // 4. Sinh số hợp đồng ngẫu nhiên (VD: HD-8F3A9)
        String contractNo = "HD-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();

        Contract contract = Contract.builder()
                .contractNo(contractNo)
                .quotationId(quotationId)
                .salesId(salesId)
                .status(ContractStatus.PENDING)
                .build();

        // 5. Có thể gọi LeadService cập nhật phễu thành WON ở bước thanh toán hoàn tất (Finance),
        // ở bước này khách chỉ mới lên hợp đồng, chờ cọc tiền.
        return salesMapper.toContractRes(contractRepository.save(contract));
    }
}
