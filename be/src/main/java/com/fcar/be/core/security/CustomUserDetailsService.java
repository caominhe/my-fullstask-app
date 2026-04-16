package com.fcar.be.core.security; // Cùng package security

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.fcar.be.modules.identity.entity.User;
import com.fcar.be.modules.identity.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service // Bean singleton; CustomUserDetailsService implements UserDetailsService
@RequiredArgsConstructor // Sinh constructor gán userRepository
public class CustomUserDetailsService
        implements UserDetailsService { // Triển khai interface mà DaoAuthenticationProvider / filter có thể gọi

    private final UserRepository userRepository; // Spring Data JPA repository; gọi findByEmail

    @Override // Triển khai contract loadUserByUsername từ UserDetailsService
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException { // Tham số: email (khớp sub JWT); trả CustomUserDetails; ném nếu không
        // có user
        User user = userRepository // Bắt đầu truy vấn tùy chọn
                .findByEmail(email) // Method derived query: tìm theo cột email
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: "
                        + email)); // Nếu empty Optional → ném exception với message; kết quả: User hoặc không bao giờ
        // trả về null

        List<SimpleGrantedAuthority> authorities = new ArrayList<>(); // Tạo list rỗng; sẽ thêm ROLE_*

        // Map từng Role entity sang authority có tiền tố ROLE_ để hasRole("X") khớp ROLE_X
        if (user.getRoles() != null) { // Tránh NPE nếu collection null
            user.getRoles()
                    .forEach(role -> authorities.add(
                            new SimpleGrantedAuthority("ROLE_" + role.getName()))); // Mỗi role.getName() (vd ADMIN) →
            // "ROLE_ADMIN"; kết quả: list authorities
            // cho @PreAuthorize
        }

        return new CustomUserDetails(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                authorities); // Đóng gói id, email làm username, hash mật khẩu, quyền; kết quả: object implements
        // UserDetails
    }
}
