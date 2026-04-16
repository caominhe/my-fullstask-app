# Kế hoạch học Backend FCAR — 3 ngày (template có sẵn)

Cách dùng: mỗi ngày tick ô **Đã đọc** / **Đã chốt output**. Đường dẫn gốc: `be/src/main/java/com/fcar/be/`.

## Ngày 1 — Nền tảng + Identity + Inventory

### Mục tiêu cuối ngày
- [ ] Giải thích được flow request: filter JWT → controller → service → repo
- [ ] Nắm auth/login/refresh/role và các bảng `users`, `roles`
- [ ] Nắm vòng đời xe `CarStatus` và setup `master_data` / `showrooms`

### Buổi sáng — Core & Security (khoảng 3–4h)

| File cần đọc | Nội dung chính |
|--------------|----------------|
| `core/config/SecurityConfig.java` | Route public/protected, CORS, JWT filter |
| `core/config/MethodSecurityConfig.java` | `@PreAuthorize` |
| `core/security/JwtAuthenticationFilter.java`, `JwtTokenProvider.java` | Bearer token |
| `core/security/CustomUserDetailsService.java` | Map role → `ROLE_*` |
| `core/exception/GlobalExceptionHandler.java`, `ErrorCode.java` | Chuẩn lỗi API |
| `../resources/application.yaml` | `context-path`, JWT, DB |

**Output cần chốt**
- [ ] Bản phác sơ đồ: 1 request có JWT đi qua đâu
- [ ] Liệt kê 5 route public trong `SecurityConfig`

### Buổi chiều — Identity (khoảng 3–4h)

| File cần đọc | Nội dung chính |
|--------------|----------------|
| `modules/identity/controller/AuthenticationController.java` | `/auth/*` |
| `modules/identity/controller/UserController.java` | `/users/*`, role admin |
| `modules/identity/service/AuthenticationService.java` | Login, refresh, logout, Google |
| `modules/identity/service/UserService.java` | Register, roles, onboard, profile |
| `modules/identity/entity/User.java`, `Role.java` | Model |
| `modules/identity/bootstrap/AdminUserBootstrap.java` | Seed admin |

**Output cần chốt**
- [ ] Bảng: endpoint → method service → lỗi chính (ErrorCode)
- [ ] Mô tả ngắn: refresh token bị revoke khi logout thế nào (`invalidated_refresh_tokens`)

### Buổi tối — Inventory (khoảng 2h)

| File cần đọc | Nội dung chính |
|--------------|----------------|
| `modules/inventory/controller/CarController.java` | Import, lock, sell, GET public |
| `modules/inventory/controller/InventorySetupController.java` | Master data, showroom |
| `modules/inventory/service/impl/CarServiceImpl.java` | Rule `CarStatus` |
| `modules/inventory/service/impl/InventorySetupServiceImpl.java` | CRUD + showroom management |
| `modules/inventory/enums/CarStatus.java` | Enum trạng thái |

**Output cần chốt**
- [ ] Vẽ state machine: `IN_WAREHOUSE → AVAILABLE → LOCKED → SOLD`
- [ ] Ghi nhớ: `transfer` chỉ khi xe đang `IN_WAREHOUSE`

---

## Ngày 2 — CRM + Sales + Finance

### Mục tiêu cuối ngày
- [ ] Trace luồng: Lead → Contract → Payment → Handover
- [ ] Liệt kê điều kiện tạo hợp đồng và confirm thanh toán

### Buổi sáng — CRM & Sales (khoảng 3–4h)

| File cần đọc | Nội dung chính |
|--------------|----------------|
| `modules/crm/controller/LeadController.java` | POST `/leads`, GET showroom |
| `modules/crm/service/impl/LeadServiceImpl.java` | Tạo lead, funnel |
| `modules/crm/enums/LeadStatus.java` | Trạng thái lead |
| `modules/sales/controller/SalesController.java` | Contract, confirm customer |
| `modules/sales/service/impl/SalesServiceImpl.java` | Tạo contract, voucher, enrich |
| `modules/sales/enums/ContractStatus.java` | PENDING → SIGNED → … |

**Output cần chốt**
- [ ] Sequence 5 bước: tạo lead → sales tạo contract (điều kiện xe `LOCKED`, cùng showroom)
- [ ] Ghi chú: dùng voucher cần `lead.userId` (`LEAD_CUSTOMER_REQUIRED`)

### Buổi chiều — Finance (khoảng 3–4h)

| File cần đọc | Nội dung chính |
|--------------|----------------|
| `modules/finance/controller/FinanceController.java` | Receipts, handover |
| `modules/finance/service/impl/FinanceServiceImpl.java` | Tạo receipt, confirm, contract COMPLETED |
| `modules/finance/enums/PaymentStatus.java`, `HandoverStatus.java`, `PaymentType.java` | Enum |

**Output cần chốt**
- [ ] Điều kiện tạo receipt: contract phải `SIGNED`
- [ ] Khi `remainingDebt == 0` → contract `COMPLETED`
- [ ] Handover: cần payment `SUCCESS` trước khi cập nhật bàn giao đầy đủ

### Buổi tối — Nối end-to-end (khoảng 2h)

**Output cần chốt**
- [ ] 1 trang ghi: `contractNo` xuất hiện ở bảng nào (`contracts`, `payments`, `handovers`)
- [ ] Liệt kê 3 ErrorCode đại diện cho sales (5xxx) và finance (6xxx)

---

## Ngày 3 — Aftersales + Marketing + Chuẩn bị demo

### Mục tiêu cuối ngày
- [ ] Hiểu điều kiện bảo hành / dịch vụ sau bàn giao
- [ ] Hiểu campaign/voucher và chỗ gọi từ sales/marketing
- [ ] Có script demo 15–20 phút + 3 edge case

### Buổi sáng — Aftersales & Marketing (khoảng 3–4h)

| File cần đọc | Nội dung chính |
|--------------|----------------|
| `modules/aftersales/controller/AftersalesController.java` | Warranty, ticket |
| `modules/aftersales/service/impl/AftersalesServiceImpl.java` | `validateSalesScopeForCar` |
| `modules/marketing/controller/CampaignController.java`, `VoucherController.java` | API |
| `modules/marketing/service/impl/MarketingServiceImpl.java` | Campaign target, voucher claim/use |

**Output cần chốt**
- [ ] Sau handover `HANDED_OVER` + xe `SOLD` + cùng showroom → mới activate warranty (showroom)
- [ ] Voucher: `ACTIVE → CLAIMED → USED`; `validateAndUseVoucher` khi tạo contract

### Buổi chiều — Tài liệu demo (khoảng 3–4h)

**Tạo 4 artefact (ghi vào note riêng hoặc bổ sung dưới đây)**

| Artefact | Nội dung | Đã xong |
|----------|----------|---------|
| Bảng endpoint chính | Theo module + HTTP method | [ ] |
| Bảng role → hành động | ADMIN / SHOWROOM / CUSTOMER | [ ] |
| Bảng state transition | Car, Contract, Payment, Handover, Voucher | [ ] |
| Top lỗi nghiệp vụ | 10 ErrorCode hay gặp khi demo | [ ] |

### Buổi tối — Luyện demo (khoảng 2h)

**Checklist demo**
- [ ] Happy path: login → (tuỳ scenario) lead → contract (xe LOCKED) → customer confirm → finance → handover → warranty
- [ ] Edge 1: tạo contract khi xe không `LOCKED` → `CAR_INVALID_STATUS`
- [ ] Edge 2: confirm payment vượt `remainingDebt` → `INVALID_PAYMENT_AMOUNT`
- [ ] Edge 3: warranty khi chưa handover → `CAR_NOT_HANDED_OVER`

**Script 15–20 phút (gợi ý thời lượng)**
- 2 phút: kiến trúc module + security
- 3 phút: 1 luồng nghiệp vụ chính
- 8 phút: đi qua API theo thứ tự (chỉ nói, không cần code)
- 3 phút: edge cases
- 2 phút: hướng mở rộng

---

## Ghi chú nhanh — context-path API

Base URL mặc định: `http://localhost:8080/api/v1` (xem `application.yaml`).

Ví dụ: `/auth/login` thực tế là `POST /api/v1/auth/login`.

---

## Theo dõi tiến độ tổng (3 ngày)

| Ngày | Mục tiêu đạt được (tự đánh dấu) |
|------|----------------------------------|
| 1 | [ ] Core + identity + inventory |
| 2 | [ ] CRM + sales + finance |
| 3 | [ ] Aftersales + marketing + script demo |

---

*Tạo để học và demo dự án FCAR BE; cập nhật checklist khi bạn hoàn thành từng mục.*
