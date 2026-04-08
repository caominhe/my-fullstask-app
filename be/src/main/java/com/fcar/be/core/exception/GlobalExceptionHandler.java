// # @RestControllerAdvice hứng mọi lỗi và trả về ErrorResponse
package com.fcar.be.core.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.fcar.be.core.common.dto.ApiResponse;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiResponse<?>> handlingAccessDenied(AccessDeniedException exception) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
        ApiResponse<?> apiResponse = new ApiResponse<>();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());
        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse<?>> handlingAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        ApiResponse<?> apiResponse = new ApiResponse<>();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());
        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<?>> handlingValidation(MethodArgumentNotValidException exception) {
        var fieldErrorsList = exception.getBindingResult().getFieldErrors();
        if (fieldErrorsList == null || fieldErrorsList.isEmpty()) {
            ApiResponse<?> apiResponse = new ApiResponse<>();
            apiResponse.setCode(ErrorCode.INVALID_KEY.getCode());
            apiResponse.setMessage(ErrorCode.INVALID_KEY.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
        }

        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ErrorCode firstCode = ErrorCode.INVALID_KEY;
        String firstField = null;
        String firstMessage = null;

        for (FieldError fe : fieldErrorsList) {
            String field = fe.getField();
            String enumKey = fe.getDefaultMessage();
            if (enumKey == null) {
                enumKey = "";
            }
            String message;
            ErrorCode code;
            try {
                code = ErrorCode.valueOf(enumKey);
                message = code.getMessage();
            } catch (IllegalArgumentException ignored) {
                code = ErrorCode.INVALID_KEY;
                message = enumKey.isEmpty() ? ErrorCode.INVALID_KEY.getMessage() : enumKey;
            }
            fieldErrors.put(field, message);
            if (firstField == null) {
                firstField = field;
                firstMessage = message;
                firstCode = code;
            }
        }

        ApiResponse<?> apiResponse = new ApiResponse<>();
        apiResponse.setCode(firstCode.getCode());
        apiResponse.setMessage(firstMessage);
        apiResponse.setField(firstField);
        apiResponse.setFieldErrors(fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
    }

    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse<?>> handlingRuntimeException(RuntimeException exception) {
        ApiResponse<?> apiResponse = new ApiResponse<>();
        apiResponse.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
        apiResponse.setMessage(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }
}
