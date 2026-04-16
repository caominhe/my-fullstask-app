package com.fcar.be.core.config; // Khai báo package: class này thuộc lớp cấu hình lõi (core.config)

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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

@Configuration // Đánh dấu: Spring quét class này, các @Bean bên trong được đăng ký
@EnableWebSecurity // Bật cơ chế SecurityFilterChain và các filter bảo mật web
public class SecurityConfig { // Lớp cấu hình duy nhất cho HTTP security + CORS trong ví dụ này

    private final JwtAuthenticationFilter
            jwtAuthenticationFilter; // Tham chiếu filter JWT (inject qua constructor); dùng khi addFilterBefore

    // Ghi chú lịch sử: luồng Google OAuth2 không dùng OAuth2SuccessHandler trong Security nữa
    public SecurityConfig(
            JwtAuthenticationFilter
                    jwtAuthenticationFilter) { // Constructor: Spring inject JwtAuthenticationFilter (bean @Component)
        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter; // Gán field để dùng trong filterChain(); kết quả: field trỏ tới instance
        // singleton của filter
    }

    @Bean // Đăng ký bean tên mặc định "filterChain" kiểu SecurityFilterChain
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity)
            throws Exception { // Nhận HttpSecurity do Spring tạo; throws Exception nếu cấu hình lỗi
        httpSecurity // Bắt đầu fluent API cấu hình trên builder HttpSecurity
                // 1. Bật CORS: kết hợp với bean CorsFilter bên dưới (Customizer.withDefaults = dùng nguồn CORS mặc định
                // / bean có sẵn)
                .cors(Customizer.withDefaults()) // Gọi cấu hình CORS mặc định; mục đích: cho phép trình duyệt gọi API
                // cross-origin theo bean CorsFilter

                // 2. Tắt CSRF: API JWT thường không dùng cookie session như form → tránh 403 khi client không gửi token
                // CSRF
                .csrf(
                        AbstractHttpConfigurer
                                ::disable) // Truyền method reference disable(csrf) → tắt bảo vệ CSRF trên toàn bộ chain

                // 3. Phân quyền theo URL/method: ai được gọi endpoint nào mà không cần đăng nhập
                .authorizeHttpRequests(
                        auth -> auth // Lambda nhận AuthorizeHttpRequestsConfigurer; trả về cùng builder để nối tiếp
                                // Công khai: đăng nhập, refresh token, đăng ký user, tài liệu OpenAPI/Swagger
                                .requestMatchers(
                                        "/auth/**",
                                        "/users/register",
                                        "/swagger-ui/**",
                                        "/v3/api-docs/**") // Khớp path theo pattern; kết quả: nhóm rule cho các URL này
                                .permitAll() // Không cần Authentication (anonymous vẫn vào được); kết quả: bỏ qua yêu
                                // cầu authenticated cho các matcher trên
                                // Công khai: chỉ POST /leads (khách gửi lead)
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/leads") // Ràng buộc thêm HttpMethod.POST; chỉ POST khớp, không mở GET/PUT
                                // trên /leads
                                .permitAll() // Cho phép không đăng nhập với POST /leads
                                // Công khai: GET danh sách/chi tiết xe
                                .requestMatchers(
                                        HttpMethod.GET, "/cars", "/cars/**") // GET /cars và mọi path con /cars/...
                                .permitAll() // Xem catalog không cần JWT
                                .anyRequest() // Mọi request chưa khớp rule trên
                                .authenticated()) // Bắt buộc đã xác thực (SecurityContext có Authentication không
                // anonymous); kết quả: cần JWT hợp lệ qua JwtAuthenticationFilter

                // 4. Chèn filter JWT trước UsernamePasswordAuthenticationFilter để đọc Bearer sớm trong chuỗi
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter
                                .class); // Tham số 1: bean filter; tham số 2: class mốc; kết quả: thứ tự filter được
        // cập nhật

        return httpSecurity
                .build(); // Hoàn tất cấu hình, tạo object SecurityFilterChain bất biến; Spring đăng ký bean này
    }

    @Bean // Đăng ký bean CorsFilter để container và Spring Security có thể dùng khi .cors(withDefaults())
    public CorsFilter corsFilter() { // Không tham số: tự tạo cấu hình CORS cứng cho dev (localhost:3000)
        CorsConfiguration corsConfiguration =
                new CorsConfiguration(); // Tạo object rỗng, sẽ set từng thuộc tính cho phép CORS

        // Cho phép origin của frontend React dev (cùng máy, khác port → trình duyệt coi là cross-origin)
        corsConfiguration.addAllowedOrigin("http://localhost:3000"); // Thêm một origin được phép; kết quả: browser nhận
        // Access-Control-Allow-Origin phù hợp khi request từ 3000

        // Cho phép mọi method (GET, POST, PUT, DELETE, OPTIONS preflight, …)
        corsConfiguration.addAllowedMethod("*"); // Ký tự * = tất cả method; mục đích: không chặn verb nào từ FE

        // Cho phép client gửi mọi header (Authorization, Content-Type, …)
        corsConfiguration.addAllowedHeader("*"); // * = mọi request header được phép trong preflight

        // Cho phép gửi credential (cookie hoặc kết hợp với header Authorization — cần khi FE gửi Bearer)
        corsConfiguration.setAllowCredentials(
                true); // true: browser được gửi kèm thông tin nhạy cảm theo quy tắc CORS (phải kèm origin cụ thể, không
        // dùng * cho origin khi bật)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource(); // Nguồn ánh xạ path → cấu hình
        source.registerCorsConfiguration(
                "/**",
                corsConfiguration); // Áp dụng corsConfiguration cho mọi path API (/**); kết quả: toàn bộ endpoint dùng
        // chung rule CORS

        return new CorsFilter(
                source); // Tạo filter Servlet bọc source; Spring gọi filter này để thêm header CORS vào response / xử
        // lý OPTIONS
    }
}
