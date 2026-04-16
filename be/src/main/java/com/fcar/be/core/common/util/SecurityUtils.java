// # Tiện ích lấy ID người dùng đang đăng nhập từ SecurityContext
package com.fcar.be.core.common.util;

import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;

public class SecurityUtils {
    private SecurityUtils() {}

    public static Optional<String> getCurrentUserLogin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) return Optional.empty();

        if (authentication.getPrincipal() instanceof UserDetails userDetails) {
            return Optional.ofNullable(userDetails.getUsername());
        } else if (authentication.getPrincipal() instanceof String principal) {
            return Optional.of(principal);
        }

        return Optional.empty();
    }

    // Thêm hàm này vào dưới hàm getCurrentUserLogin()
    public static Optional<Long> getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) return Optional.empty();

        if (authentication.getPrincipal() instanceof com.fcar.be.core.security.CustomUserDetails userDetails) {
            return Optional.of(userDetails.getId());
        }

        return Optional.empty();
    }

    public static Long requireCurrentUserId() {
        return getCurrentUserId().orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
    }
}
