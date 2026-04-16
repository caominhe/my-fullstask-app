// Lớp dữ liệu principal: triển khai UserDetails + lưu thêm id DB cho SecurityUtils.getCurrentUserId()
package com.fcar.be.core.security;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data // Lombok: getter/setter cho id, email, password, authorities — cần cho principal trong Authentication
@AllArgsConstructor // Constructor (Long id, String email, String password, Collection authorities)
public class CustomUserDetails
        implements UserDetails { // implements interface bắt buộc để đặt vào UsernamePasswordAuthenticationToken
    private Long id; // Khóa chính user trong DB; không có trong interface gốc — tiện cho nghiệp vụ
    private String email; // Email đăng nhập; đồng thời dùng làm “username” logic
    private String
            password; // Hash mật khẩu lưu DB; UserDetails yêu cầu getPassword() — JWT flow không so khớp lại ở filter
    private Collection<? extends GrantedAuthority>
            authorities; // Danh sách quyền (ROLE_...); dùng cho hasRole/hasAuthority

    @Override // Ghi đè từ UserDetails: Spring dùng getUsername() làm tên đăng nhập chính
    public String getUsername() {
        return email; // Trả email thay vì tên riêng; khớp sub JWT và UserRepository.findByEmail
    }

    @Override // Tài khoản có bị coi là “hết hạn thời hạn” không — chưa map từ DB
    public boolean isAccountNonExpired() {
        return true; // Luôn true: không chặn theo cờ hết hạn subscription (có thể map sau)
    }

    @Override // Tài khoản có bị khóa không
    public boolean isAccountNonLocked() {
        return true; // Luôn true: chưa map locked từ entity User
    }

    @Override // Mật khẩu có hết hạn (đổi mật khẩu định kỳ) không
    public boolean isCredentialsNonExpired() {
        return true; // Luôn true: không ép đổi password theo thời gian
    }

    @Override // Tài khoản có bị vô hiệu (disabled) không
    public boolean isEnabled() {
        return true; // Luôn true: chưa map enabled từ DB — nếu có cột enabled nên trả user.getEnabled()
    }
}
