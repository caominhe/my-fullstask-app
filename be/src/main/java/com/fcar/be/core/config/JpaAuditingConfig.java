// # Bật tính năng tự động điền createdAt, updatedAt
package com.fcar.be.core.config;

import java.util.Optional;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import com.fcar.be.core.common.util.SecurityUtils;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaAuditingConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        // Trả về username của người dùng đang đăng nhập để điền vào cột createdBy
        return () -> Optional.of(SecurityUtils.getCurrentUserLogin().orElse("SYSTEM"));
    }
}
