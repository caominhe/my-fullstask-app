# FCAR Frontend (`web-app`)

Frontend cho hệ thống FCAR, xây dựng bằng React + MUI, kết nối với backend qua REST API (`/api/v1`).

## 1) Công nghệ chính

- React 18
- React Router DOM 6
- Material UI (MUI)
- CRA (`react-scripts`)

## 2) Kiến trúc thư mục

Source chính nằm trong `src/`.

- `modules/`: các màn hình theo domain (`public`, `customer`, `showroom`, `admin`, `auth`)
- `layouts/`: layout theo vai trò (public/showroom/admin)
- `routes/`: định nghĩa route + guard role
- `services/`: API client (`portalApiService`)
- `contexts/`: auth context
- `constants/`: route, role, constant dùng chung
- `components/`: component tái sử dụng

## 3) Route chính theo vai trò

Định nghĩa tại `src/routes/AppRoutes.jsx`.

### Public

- `/` trang marketing
- `/cars` danh mục xe
- `/cars/:vin` chi tiết xe
- `/test-drive` đăng ký lái thử

### Customer (role `CUSTOMER`)

- `/profile`
- `/my-garage`
- `/promotions`

### Showroom (role `SHOWROOM`)

- `/showroom`
- `/showroom/sales` (CRM + lock xe + tạo hợp đồng)
- `/showroom/finance`
- `/showroom/aftersales`

### Admin (role `ADMIN`)

- `/admin`
- `/admin/inventory`
- `/admin/showrooms`
- `/admin/contracts`
- `/admin/campaigns`
- `/admin/aftersales`
- `/admin/users`

## 4) Tích hợp API

File: `src/services/portalApiService.js`.

Nhóm API chính:

- Admin: users, inventory, showroom, campaigns
- Sales/Showroom: leads, lock car, create contract, lead vouchers
- Finance/Handover
- Aftersales
- Customer: events, my vouchers, register event, confirm contract

API client dùng `apiClient` chung trong `src/api/client` để xử lý base URL, token, error.

## 5) Cài đặt và chạy local

### Yêu cầu

- Node.js 18+ (khuyến nghị)
- npm

### Cài dependencies

```bash
cd web-app
npm install
```

### Chạy dev

```bash
npm start
```

Mặc định app chạy ở `http://localhost:3000`.

### Build production

```bash
npm run build
```

## 6) Các script

Trong `web-app/package.json`:

- `npm start`: chạy dev server
- `npm run build`: build production
- `npm test`: chạy test
- `npm run eject`: eject CRA (không khuyến nghị)

## 7) Luồng nghiệp vụ nổi bật

- Customer đăng ký event -> nhận voucher (`ACTIVE -> CLAIMED`) và thấy trong ví voucher.
- Showroom xử lý lead -> khóa VIN -> rà voucher khách -> tạo hợp đồng và tính tiền cuối.
- Admin quản lý campaign theo phạm vi (`ALL/REGION/PROVINCE/SHOWROOM`) và sinh voucher.

## 8) Cấu hình môi trường

Frontend cần trỏ đúng backend `http://localhost:8080/api/v1`.

Nếu project có file `.env` riêng cho frontend, kiểm tra biến API base URL tương ứng (tùy cấu hình `apiClient`).

## 9) Ghi chú phát triển

- Ưu tiên tái sử dụng API đã có trong `portalApiService`, tránh tạo call trùng.
- Các trang role-based nên giữ guard trong `AppRoutes + ProtectedRoute`.
- Khi thêm màn mới:
  1. tạo module page
  2. thêm route
  3. thêm menu trong layout tương ứng
  4. thêm API method nếu cần
