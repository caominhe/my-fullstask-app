package com.fcar.be.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import com.fcar.be.core.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // Đã xóa OAuth2SuccessHandler vì bây giờ ta tự xử lý luồng Google OAuth2 ở AuthenticationController
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                // 1. Bật CORS (Sử dụng Bean CorsFilter bên dưới)
                .cors(Customizer.withDefaults())

                // 2. Tắt CSRF (Bảo vệ mặc định của Spring, nhưng ta dùng JWT nên không cần thiết)
                .csrf(AbstractHttpConfigurer::disable)

                // 3. Cấu hình phân quyền cho các API
                .authorizeHttpRequests(
                        auth -> auth.requestMatchers(
                                        "/auth/**", // Cho phép API login hệ thống và login Google
                                        // (/auth/google/exchange)
                                        "/users/register", // Cho phép đăng ký chay (nếu bạn vẫn giữ API này)
                                        "/swagger-ui/**", // Cho phép xem tài liệu API
                                        "/v3/api-docs/**")
                                .permitAll()
                                .anyRequest()
                                .authenticated() // Mọi API khác (Bao gồm cả /users/onboard) đều bắt buộc phải có JWT
                        // Token
                        )

                // 4. Thêm bộ lọc JWT vào trước bộ lọc xác thực mặc định
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return httpSecurity.build();
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();

        // Cấp phép cho Frontend React ở cổng 3000
        corsConfiguration.addAllowedOrigin("http://localhost:3000");

        // Cho phép tất cả các HTTP method (GET, POST, PUT, DELETE, OPTIONS, v.v.)
        corsConfiguration.addAllowedMethod("*");

        // Cho phép tất cả các header gửi lên
        corsConfiguration.addAllowedHeader("*");

        // Cho phép gửi kèm cookie hoặc thông tin xác thực (Bắt buộc phải có để Frontend gửi Header Authorization
        // Bearer)
        corsConfiguration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration); // Áp dụng cấu hình CORS này cho mọi API

        return new CorsFilter(source);
    }
}
