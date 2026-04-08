-- ==============================================================================
-- MODULE 0: AUTH & IDENTITY (Quản lý Định danh & Phân quyền RBAC)
-- ==============================================================================
CREATE TABLE permissions (
    name VARCHAR(50) PRIMARY KEY COMMENT 'Tên quyền (vd: CREATE_CAR, DELETE_USER)',
    description VARCHAR(255) COMMENT 'Mô tả quyền'
) COMMENT='Bảng lưu trữ chi tiết các thao tác được phép';

CREATE TABLE roles (
    name VARCHAR(50) PRIMARY KEY COMMENT 'Tên vai trò (vd: ADMIN, SALES, CUSTOMER)',
    description VARCHAR(255) COMMENT 'Mô tả vai trò'
) COMMENT='Bảng lưu trữ các nhóm vai trò trong hệ thống';

CREATE TABLE roles_permissions (
    role_name VARCHAR(50) NOT NULL,
    permission_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (role_name, permission_name),
    FOREIGN KEY (role_name) REFERENCES roles(name) ON DELETE CASCADE,
    FOREIGN KEY (permission_name) REFERENCES permissions(name) ON DELETE CASCADE
) COMMENT='Bảng trung gian Role <-> Permission';

CREATE TABLE showrooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Tên đại lý/Showroom',
    address VARCHAR(255) COMMENT 'Địa chỉ',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Đánh dấu xóa mềm',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT='Bảng quản lý danh sách các chi nhánh Showroom';

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE COMMENT 'Email đăng nhập (bắt buộc, không trùng)',
    avatar VARCHAR(255) ,
    password_hash VARCHAR(255) COMMENT 'Mật khẩu đã băm (Null nếu login qua Google OAuth2)',
    full_name VARCHAR(100) NOT NULL COMMENT 'Họ và tên',
    phone VARCHAR(20) UNIQUE COMMENT 'Số điện thoại',
    provider VARCHAR(20) COMMENT 'Nguồn đăng nhập: LOCAL, GOOGLE',
    showroom_id BIGINT COMMENT 'ID của showroom người này làm việc (Null nếu là Admin/Customer)',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Đánh dấu xóa mềm',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'Trạng thái: ACTIVE, INACTIVE, BANNED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (showroom_id) REFERENCES showrooms(id)
) COMMENT='Bảng lưu trữ thông tin người dùng';

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_name) REFERENCES roles(name) ON DELETE CASCADE
) COMMENT='Bảng trung gian User <-> Role';

-- ==============================================================================
-- MODULE 1: INVENTORY (Quản lý Sản phẩm & Kho bãi)
-- ==============================================================================
CREATE TABLE master_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(50) NOT NULL COMMENT 'Hãng xe (VD: Toyota, Ford)',
    model VARCHAR(50) NOT NULL COMMENT 'Dòng xe (VD: Camry, Ranger)',
    version VARCHAR(50) NOT NULL COMMENT 'Phiên bản (VD: 2.0Q, Wildtrak)',
    base_price DECIMAL(15, 2) NOT NULL COMMENT 'Giá niêm yết',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Đánh dấu xóa mềm',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT='Bảng danh mục các loại xe';

CREATE TABLE cars (
    vin CHAR(17) PRIMARY KEY COMMENT 'Số khung (VIN) - Định danh duy nhất của xe',
    master_data_id BIGINT NOT NULL COMMENT 'Khóa ngoại tham chiếu dòng xe',
    engine_number VARCHAR(50) NOT NULL UNIQUE COMMENT 'Số máy (không trùng)',
    color VARCHAR(30) NOT NULL COMMENT 'Màu sắc xe',
    showroom_id BIGINT COMMENT 'ID của showroom đang giữ xe (Null nếu ở kho tổng)',
    status VARCHAR(20) NOT NULL DEFAULT 'IN_WAREHOUSE' COMMENT 'Trạng thái: IN_WAREHOUSE, AVAILABLE, LOCKED, SOLD',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Đánh dấu xóa mềm',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (master_data_id) REFERENCES master_data(id),
    FOREIGN KEY (showroom_id) REFERENCES showrooms(id)
) COMMENT='Bảng quản lý từng chiếc xe vật lý trong kho';

-- Gộp logic migration V2/V3: sau mọi thao tác seed (nếu có), đồng bộ xe đã gán showroom → AVAILABLE
UPDATE cars
SET status = 'AVAILABLE'
WHERE showroom_id IS NOT NULL
  AND status = 'IN_WAREHOUSE';

-- ==============================================================================
-- MODULE 2: MARKETING (Sự kiện, Khuyến mãi & Voucher)
-- ==============================================================================
-- Đã đảo bảng campaigns lên trước để events có thể reference
CREATE TABLE campaigns (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Tên chương trình khuyến mãi',
    discount_type VARCHAR(20) NOT NULL COMMENT 'Loại: CASH, PERCENT, GIFT',
    discount_value DECIMAL(15, 2) NOT NULL COMMENT 'Giá trị giảm (Số tiền hoặc %)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT='Bảng quản lý chương trình khuyến mãi';

CREATE TABLE events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Tên sự kiện',
    description TEXT COMMENT 'Mô tả chi tiết',
    start_date DATETIME NOT NULL COMMENT 'Ngày bắt đầu',
    end_date DATETIME NOT NULL COMMENT 'Ngày kết thúc',
    showroom_id BIGINT COMMENT 'Áp dụng cho showroom nào',
    campaign_id BIGINT COMMENT 'Chương trình khuyến mãi áp dụng (Tặng Voucher)',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Đánh dấu xóa mềm',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (showroom_id) REFERENCES showrooms(id) ON DELETE SET NULL,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
) COMMENT='Bảng quản lý sự kiện';

CREATE TABLE vouchers (
    code VARCHAR(50) PRIMARY KEY COMMENT 'Mã Voucher (VD: VIP2026)',
    campaign_id BIGINT NOT NULL COMMENT 'Khóa ngoại thuộc campaign nào',
    user_id BIGINT COMMENT 'ID khách hàng sở hữu',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'Trạng thái: ACTIVE, CLAIMED, USED, EXPIRED',
    expired_at DATETIME NOT NULL COMMENT 'Hạn sử dụng',
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) COMMENT='Bảng quản lý vòng đời từng mã Voucher';

-- ==============================================================================
-- MODULE 3: CRM (Tiếp cận, Khách hàng & Lái thử)
-- ==============================================================================
CREATE TABLE leads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT COMMENT 'Nếu khách đã có tài khoản',
    full_name VARCHAR(100) NOT NULL COMMENT 'Tên khách hàng',
    phone VARCHAR(20) NOT NULL COMMENT 'SĐT liên hệ',
    source VARCHAR(50) COMMENT 'Nguồn khách: WEB, EVENT, REFERRAL',
    showroom_id BIGINT COMMENT 'ID Showroom khách chọn lúc đăng ký',
    assigned_sales_id BIGINT COMMENT 'Nhân viên sales phụ trách',
    status VARCHAR(20) NOT NULL DEFAULT 'NEEDS_CONSULTATION' COMMENT 'Trạng thái: NEEDS_CONSULTATION, TEST_DRIVE_SCHEDULED, TEST_DRIVEN',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Đánh dấu xóa mềm',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (showroom_id) REFERENCES showrooms(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_sales_id) REFERENCES users(id) ON DELETE SET NULL
) COMMENT='Bảng quản lý khách hàng tiềm năng (Lead)';

CREATE TABLE test_drives (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lead_id BIGINT NOT NULL COMMENT 'Khóa ngoại đến bảng leads',
    car_model_id BIGINT NOT NULL COMMENT 'Mẫu xe muốn lái thử',
    schedule_time DATETIME NOT NULL COMMENT 'Thời gian hẹn lái thử',
    feedback TEXT COMMENT 'Đánh giá của khách sau khi lái',
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' COMMENT 'Trạng thái: SCHEDULED, COMPLETED, CANCELLED',
    FOREIGN KEY (lead_id) REFERENCES leads(id),
    FOREIGN KEY (car_model_id) REFERENCES master_data(id)
) COMMENT='Bảng quản lý lịch hẹn lái thử xe';

-- ==============================================================================
-- MODULE 4: SALES (Bán hàng & Hợp đồng)
-- ==============================================================================
CREATE TABLE quotations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lead_id BIGINT NOT NULL COMMENT 'Khách hàng nhận báo giá',
    car_vin CHAR(17) NOT NULL COMMENT 'Số khung xe cụ thể',
    voucher_code VARCHAR(50) COMMENT 'Mã voucher áp dụng',
    total_amount DECIMAL(15, 2) NOT NULL COMMENT 'Tổng tiền trước giảm giá',
    final_amount DECIMAL(15, 2) NOT NULL COMMENT 'Số tiền cuối cùng phải trả',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' COMMENT 'Trạng thái: DRAFT, SENT, ACCEPTED, REJECTED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id),
    FOREIGN KEY (car_vin) REFERENCES cars(vin),
    FOREIGN KEY (voucher_code) REFERENCES vouchers(code) ON DELETE SET NULL
) COMMENT='Bảng lưu trữ báo giá';

CREATE TABLE contracts (
    contract_no VARCHAR(50) PRIMARY KEY COMMENT 'Số hợp đồng (duy nhất)',
    quotation_id BIGINT NOT NULL UNIQUE COMMENT 'Khóa ngoại 1-1 với báo giá',
    sales_id BIGINT NOT NULL COMMENT 'Sales chốt hợp đồng',
    signed_date DATETIME COMMENT 'Ngày ký hợp đồng',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'Trạng thái: PENDING, SIGNED, COMPLETED, CANCELLED',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Đánh dấu xóa mềm',
    FOREIGN KEY (quotation_id) REFERENCES quotations(id),
    FOREIGN KEY (sales_id) REFERENCES users(id)
) COMMENT='Bảng quản lý hợp đồng mua bán';

-- ==============================================================================
-- MODULE 5: FINANCE & HANDOVER (Thanh toán, Giấy tờ & Bàn giao)
-- ==============================================================================
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_no VARCHAR(50) NOT NULL COMMENT 'Thanh toán cho hợp đồng nào',
    amount DECIMAL(15, 2) NOT NULL COMMENT 'Số tiền thanh toán',
    payment_type VARCHAR(20) NOT NULL COMMENT 'Loại: DEPOSIT, INSTALLMENT, FULL',
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày thanh toán',
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' COMMENT 'Trạng thái: PENDING, SUCCESS, FAILED',
    FOREIGN KEY (contract_no) REFERENCES contracts(contract_no)
) COMMENT='Bảng ghi nhận lịch sử thanh toán';

CREATE TABLE handovers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_no VARCHAR(50) NOT NULL UNIQUE COMMENT 'Bàn giao cho hợp đồng nào',
    license_plate VARCHAR(20) UNIQUE COMMENT 'Biển số xe (nhập sau khi đi bấm biển)',
    handover_date DATETIME COMMENT 'Ngày bàn giao xe thực tế',
    status VARCHAR(20) NOT NULL DEFAULT 'PROCESSING' COMMENT 'Trạng thái: PROCESSING, HANDED_OVER',
    FOREIGN KEY (contract_no) REFERENCES contracts(contract_no)
) COMMENT='Bảng theo dõi tiến độ giấy tờ và giao xe';

-- ==============================================================================
-- MODULE 6: AFTERSALES (Kích hoạt Bảo hành & Hậu mãi)
-- ==============================================================================
CREATE TABLE warranty_books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    car_vin CHAR(17) NOT NULL UNIQUE COMMENT 'Bảo hành cho xe nào',
    license_plate VARCHAR(20) NOT NULL COMMENT 'Biển số',
    start_date DATE NOT NULL COMMENT 'Ngày bắt đầu bảo hành',
    end_date DATE NOT NULL COMMENT 'Ngày kết thúc bảo hành',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_vin) REFERENCES cars(vin)
) COMMENT='Sổ bảo hành điện tử';

CREATE TABLE service_tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    warranty_id BIGINT NOT NULL COMMENT 'Khóa ngoại đến sổ bảo hành',
    service_date DATETIME NOT NULL COMMENT 'Ngày làm dịch vụ',
    description TEXT NOT NULL COMMENT 'Mô tả nội dung bảo dưỡng/sửa chữa',
    total_cost DECIMAL(15, 2) NOT NULL COMMENT 'Chi phí dịch vụ',
    FOREIGN KEY (warranty_id) REFERENCES warranty_books(id)
) COMMENT='Phiếu ghi nhận lịch sử sửa chữa/bảo dưỡng';

-- ==============================================================================
-- DỮ LIỆU KHỞI TẠO (MASTER DATA)
-- ==============================================================================
INSERT INTO roles (name, description) VALUES
('ADMIN', 'Quản trị viên toàn hệ thống'),
('SALES', 'Nhân viên tư vấn bán hàng'),
('CUSTOMER', 'Khách hàng sử dụng dịch vụ');

-- Blacklist refresh token JWT sau logout (jti = JWT ID)
CREATE TABLE invalidated_refresh_tokens (
    jti VARCHAR(64) PRIMARY KEY COMMENT 'JWT ID (claim jti) của refresh token đã thu hồi',
    expires_at DATETIME NOT NULL COMMENT 'Thời điểm JWT gốc hết hạn — dùng để dọn bản ghi cũ',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT = 'Refresh token JWT đã logout / bị thu hồi';


CREATE INDEX idx_car_status ON cars(status);
CREATE INDEX idx_lead_status ON leads(status);
CREATE INDEX idx_contract_status ON contracts(status);
