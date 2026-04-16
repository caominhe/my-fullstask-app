// Bean tiện ích: tạo JWT access/refresh, parse claims, verify chữ ký HS256 (thư viện jjwt)
package com.fcar.be.core.security;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

// AuthenticationService

@Component // Một instance trong container; inject ở mọi nơi cần ký/verify JWT
@Slf4j // Lombok: cung cấp org.slf4j.Logger log
public class JwtTokenProvider {

    private static final String CLAIM_REFRESH = "typ"; // Tên custom claim phân loại token (access vs refresh)
    private static final String REFRESH_VALUE = "refresh"; // Giá trị claim typ khi token là refresh

    @Value("${app.jwt.secret}") // Đọc secret từ cấu hình; dùng làm khóa HMAC (phải đủ dài thực tế cho HS256)
    private String jwtSecret; // Chuỗi secret; getBytes() đưa vào Keys.hmacShaKeyFor

    @Value("${app.jwt.expiration-ms}") // Thời gian sống access token (milliseconds)
    private long jwtExpirationInMs; // Cộng vào thời điểm hiện tại để set exp

    @Value("${app.jwt.refresh-expiration-ms}") // Thời gian sống refresh token (thường dài hơn access)
    private long refreshExpirationInMs; // Dùng trong generateRefreshToken

    public String generateToken(String username) { // API công khai: nhận username thực tế là email; trả JWT access
        Date now = new Date(); // Thời điểm hiện tại (server) cho iat/exp
        Date expiryDate = new Date(
                now.getTime() + jwtExpirationInMs); // exp = now + cấu hình; kết quả: thời điểm hết hạn access token
        SecretKey key = Keys.hmacShaKeyFor(
                jwtSecret.getBytes()); // Derive khóa HMAC-SHA từ byte secret; kết quả: SecretKey dùng sign/verify

        return Jwts.builder() // Bắt đầu builder JWT
                .setSubject(
                        username) // Claim sub = định danh user (email); client không cần decode để biết ai — server đọc
                // lại khi verify
                .setIssuedAt(new Date()) // Claim iat = lúc phát hành (có thể trùng now)
                .setExpiration(expiryDate) // Claim exp: sau thời điểm này validateToken sẽ fail
                .signWith(
                        key,
                        SignatureAlgorithm
                                .HS256) // Ký toàn bộ header+payload bằng HMAC SHA-256; thuật toán ghi trong JWT header
                .compact(); // Nối base64url thành chuỗi JWT ba phần; kết quả: String token gửi cho client
    }

    /** Refresh token: subject = email; claim typ=refresh; jti = UUID; không nhét roles vào payload */
    public String generateRefreshToken(String username) { // Nhận email; trả JWT refresh dùng ở endpoint /auth/refresh
        Date now = new Date(); // Mốc thời gian phát hành
        Date expiryDate =
                new Date(now.getTime() + refreshExpirationInMs); // Hạn refresh theo cấu hình riêng (dài hơn access)
        SecretKey key = Keys.hmacShaKeyFor(
                jwtSecret.getBytes()); // Cùng secret với access (cùng server ký); có thể tách secret riêng trong thiết
        // kế khác

        return Jwts.builder()
                .setId(UUID.randomUUID().toString()) // Claim jti: id phiên bản token (tiện revoke/rotation sau này)
                .setSubject(username) // sub = email; refresh chỉ để cấp access mới, role vẫn load từ DB lúc đó
                .claim(
                        CLAIM_REFRESH,
                        REFRESH_VALUE) // Custom claim typ="refresh" để validateRefreshToken phân biệt với access
                .setIssuedAt(now) // iat
                .setExpiration(expiryDate) // exp cho refresh
                .signWith(key, SignatureAlgorithm.HS256) // Ký HS256
                .compact(); // Chuỗi JWT refresh
    }

    /** Đọc claim jti (JWT ID) sau khi parse có verify chữ ký */
    public String getJwtId(String token) { // Nhận chuỗi JWT; trả jti hoặc null nếu không có
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes()); // Khóa verify giống lúc ký
        Claims claims = Jwts.parserBuilder() // Tạo JwtParserBuilder
                .setSigningKey(key) // Gắn khóa để verify chữ ký trước khi tin payload
                .build() // JwtParser
                .parseClaimsJws(token) // Parse và verify; ném nếu sai ký hoặc hết hạn
                .getBody(); // Lấy Claims (payload)
        return claims.getId(); // Trả về jti đã set trong generateRefreshToken; kết quả: String UUID hoặc null
    }

    public Date getExpirationDate(String token) { // Nhận JWT; trả java.util.Date của claim exp
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes()); // Khóa verify
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody(); // Payload sau verify
        return claims.getExpiration(); // Date hết hạn theo JWT; dùng cho hiển thị hoặc so sánh
    }

    public LocalDateTime getExpirationLocalDateTime(
            String token) { // Tiện ích: exp theo LocalDateTime zone mặc định máy chủ
        Date exp = getExpirationDate(token); // Gọi method trên; có thể ném nếu token invalid
        return LocalDateTime.ofInstant(
                exp.toInstant(), ZoneId.systemDefault()); // Chuyển Date → Instant → LocalDateTime theo ZoneId hệ thống
    }

    public String getUsernameFromJWT(
            String token) { // Nhận JWT; trả sub (email) — dùng trong filter sau khi validateToken đã ok
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes()); // Khóa verify
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody(); // Claims

        return claims.getSubject(); // sub; kết quả: email user để load UserDetails
    }

    public boolean validateToken(
            String authToken) { // Nhận chuỗi access (hoặc bất kỳ JWT cùng secret); trả true nếu parse+verify thành công
        try { // Bắt mọi lỗi parse/verify
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes()); // Khóa verify
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(
                            authToken); // Chỉ cần parse thành công = chữ ký đúng và exp chưa qua (theo mặc định jjwt)
            return true; // Token hợp lệ
        } catch (Exception ex) { // Sai ký, hết hạn, format hỏng, v.v.
            log.error("Invalid JWT token"); // Ghi log (không ném ra ngoài để filter tiếp tục chain)
        }
        return false; // Không hợp lệ
    }

    /** true khi verify được VÀ claim typ = refresh (chống dùng access làm refresh) */
    public boolean validateRefreshToken(String token) { // Dùng ở service refresh: đảm bảo đúng loại token
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes()); // Khóa verify
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody(); // Lấy claims sau verify
            return REFRESH_VALUE.equals(claims.get(
                    CLAIM_REFRESH)); // So sánh claim typ với "refresh"; kết quả: true chỉ khi là refresh token hợp lệ
        } catch (Exception ex) { // Token hỏng hoặc không phải JWT hợp lệ
            log.error("Invalid refresh JWT token"); // Log lỗi
        }
        return false; // Không phải refresh hợp lệ
    }
}
