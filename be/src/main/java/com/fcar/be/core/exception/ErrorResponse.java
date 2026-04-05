// # DTO quy định cấu trúc JSON trả về khi xảy ra lỗi
package com.fcar.be.core.exception;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    int code;
    String message;

    @Builder.Default
    LocalDateTime timestamp = LocalDateTime.now();
}
