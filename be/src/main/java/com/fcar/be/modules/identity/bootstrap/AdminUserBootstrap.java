package com.fcar.be.modules.identity.bootstrap;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fcar.be.modules.identity.entity.Role;
import com.fcar.be.modules.identity.entity.User;
import com.fcar.be.modules.identity.repository.RoleRepository;
import com.fcar.be.modules.identity.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Tạo tài khoản admin mặc định một lần khi khởi động (nếu chưa tồn tại).
 * Đăng nhập bằng email (hệ thống dùng email làm username), mặc định admin@fcar.local.
 * Mật khẩu mặc định có thể ghi đè bằng {@code app.security.bootstrap-admin-password}.
 */
@Slf4j
@Component
@Order(100)
@RequiredArgsConstructor
public class AdminUserBootstrap implements ApplicationRunner {

    /** Email đăng nhập admin (đồng bộ với cấu hình mặc định). */
    public static final String DEFAULT_ADMIN_EMAIL = "admin@fcar.local";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.security.bootstrap-admin-email:admin@fcar.local}")
    private String adminEmail;

    @Value("${app.security.bootstrap-admin-password:admin}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.findByEmail(adminEmail.trim()).isPresent()) {
            log.debug("Bootstrap admin already exists: {}", adminEmail);
            return;
        }

        Role adminRole = roleRepository
                .findById("ADMIN")
                .orElseThrow(() ->
                        new IllegalStateException("Role ADMIN không tồn tại. Kiểm tra migration Flyway (bảng roles)."));

        User admin = User.builder()
                .email(adminEmail.trim())
                .fullName("Administrator")
                .passwordHash(passwordEncoder.encode(adminPassword))
                .status("ACTIVE")
                .build();
        admin.setRoles(new HashSet<>(Set.of(adminRole)));

        userRepository.save(admin);
        log.info(
                "Đã tạo tài khoản admin: email={}, (mật khẩu từ cấu hình app.security.bootstrap-admin-password)",
                adminEmail);
    }
}
