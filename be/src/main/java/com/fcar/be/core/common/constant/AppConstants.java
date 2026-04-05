// # Lưu các hằng số tĩnh (VD: DEFAULT_PAGE_SIZE = 20)
package com.fcar.be.core.common.constant;

public final class AppConstants {
    private AppConstants() {} // Ngăn khởi tạo object

    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String SORT_BY_CREATED_AT = "createdAt";
    public static final String SORT_DIRECTION_DESC = "desc";

    // Regex cho Validation (Phù hợp với các bảng Users, Leads trong SQL của bạn)
    public static final String PHONE_NUMBER_REGEX = "^[0-9]{10,11}$";
}
