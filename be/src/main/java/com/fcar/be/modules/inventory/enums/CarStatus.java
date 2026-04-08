package com.fcar.be.modules.inventory.enums;

public enum CarStatus {
    IN_WAREHOUSE, // Ở kho tổng (chưa gán đại lý)
    AVAILABLE, // Đã điều chuyển tới showroom — sẵn sàng bán
    LOCKED, // Đã bị khóa để làm hợp đồng
    SOLD // Đã bán & xuất kho
}
