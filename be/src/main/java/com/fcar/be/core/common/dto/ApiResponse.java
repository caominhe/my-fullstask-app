// # DTO bọc dữ liệu trả về thành công (code, message, data)
package com.fcar.be.core.common.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL) // Ẩn các field null khi trả về
public class ApiResponse<T> {

    @Builder.Default
    int code = 1000; // 1000 là mã thành công mặc định

    String message;
    T result;

    @Builder.Default
    LocalDateTime timestamp = LocalDateTime.now();
}
