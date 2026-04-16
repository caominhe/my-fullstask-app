// Filter servlet: mỗi HTTP request đi qua đây để (tuỳ chọn) đọc JWT và gắn user vào SecurityContext
package com.fcar.be.core.security; // Cùng package với JwtTokenProvider, CustomUserDetailsService

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import lombok.RequiredArgsConstructor;

// request (kể cả forward)

@Component // Đăng ký bean singleton; SecurityConfig lấy bean này để addFilterBefore
@RequiredArgsConstructor // Sinh constructor: (JwtTokenProvider tokenProvider, CustomUserDetailsService
// customUserDetailsService)
public class JwtAuthenticationFilter
        extends OncePerRequestFilter { // Kế thừa: tránh chạy filter lặp khi request được forward nội bộ

    private final JwtTokenProvider tokenProvider; // Bean ký/verify JWT; gọi validateToken và getUsernameFromJWT
    private final CustomUserDetailsService
            customUserDetailsService; // Bean load UserDetails từ DB theo email (subject JWT)

    @Override // Ghi đè hook của OncePerRequestFilter
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) // Nhận request/response hiện tại và chuỗi filter còn lại
            throws ServletException, IOException { // Khai báo có thể ném lỗi servlet/IO theo hợp đồng filter
        String jwt = getJwtFromRequest(request); // Gọi private helper: trích token từ header Authorization hoặc null

        if (StringUtils.hasText(jwt)
                && tokenProvider.validateToken(
                        jwt)) { // Điều kiện: có chuỗi JWT không rỗng VÀ verify chữ ký + exp thành công
            String username = tokenProvider.getUsernameFromJWT(
                    jwt); // Đọc claim subject (email) từ payload sau khi đã parse an toàn
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(
                    username); // Gọi DB: tìm user theo email, map roles → GrantedAuthority; có thể
            // UsernameNotFoundException

            UsernamePasswordAuthenticationToken authentication = // Tạo object Authentication đã “authenticated”
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails
                                    .getAuthorities()); // principal=userDetails, credentials=null (không dùng mật khẩu
            // request), authorities=roles
            authentication.setDetails(new WebAuthenticationDetailsSource()
                    .buildDetails(request)); // Gắn WebAuthenticationDetails (IP, session id nếu có) cho audit

            SecurityContextHolder.getContext()
                    .setAuthentication(
                            authentication); // Lưu Authentication vào SecurityContext của thread hiện tại; kết quả: các
            // lớp sau (authorize, @PreAuthorize) thấy user đã login
        } // Nếu không có JWT hoặc token lỗi: không set Authentication (giữ anonymous hoặc rỗng tùy filter trước)

        filterChain.doFilter(
                request,
                response); // Luôn chuyển request/response cho filter kế tiếp (kể cả khi không có JWT — để permitAll vẫn
        // hoạt động); kết quả: request tiếp tục tới AuthorizationFilter rồi DispatcherServlet
    }

    private String getJwtFromRequest(
            HttpServletRequest request) { // Helper chỉ dùng trong class; không nhận response vì không ghi lỗi ở đây
        String bearerToken =
                request.getHeader("Authorization"); // Đọc header "Authorization" (có thể null nếu client không gửi)
        if (StringUtils.hasText(bearerToken)
                && bearerToken.startsWith("Bearer ")) { // Phải có nội dung và đúng tiền tố OAuth2 Bearer + khoảng trắng
            return bearerToken.substring(7); // Bỏ 7 ký tự đầu "Bearer " → trả về phần token thuần; kết quả: chuỗi JWT
        }
        return null; // Không đúng định dạng Bearer → không có token; caller sẽ không set SecurityContext
    }
}
