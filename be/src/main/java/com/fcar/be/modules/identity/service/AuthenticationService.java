package com.fcar.be.modules.identity.service;

import java.util.HashSet;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;
import com.fcar.be.core.security.JwtTokenProvider;
import com.fcar.be.modules.identity.dto.request.AuthenticationRequest;
import com.fcar.be.modules.identity.dto.response.AuthenticationResponse;
import com.fcar.be.modules.identity.entity.Role;
import com.fcar.be.modules.identity.entity.User;
import com.fcar.be.modules.identity.repository.RoleRepository;
import com.fcar.be.modules.identity.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RestTemplate restTemplate;
    private final RoleRepository roleRepository;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    // Đây là URI mà Frontend React đang chạy
    private final String GOOGLE_REDIRECT_URI = "http://localhost:3000/authenticate";

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        if (!authenticated) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        var token = jwtTokenProvider.generateToken(user.getEmail());
        return AuthenticationResponse.builder().token(token).authenticated(true).build();
    }

    @Transactional
    public AuthenticationResponse authenticateWithGoogle(String code) {
        // 1. Đổi Code lấy Google Access Token
        String tokenEndpoint = "https://oauth2.googleapis.com/token";
        Map<String, String> tokenRequest = Map.of(
                "code", code,
                "client_id", googleClientId,
                "client_secret", googleClientSecret,
                "redirect_uri", GOOGLE_REDIRECT_URI,
                "grant_type", "authorization_code");

        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenEndpoint, tokenRequest, Map.class);
        String googleAccessToken = (String) tokenResponse.getBody().get("access_token");

        // 2. Dùng Access Token gọi lấy UserInfo từ Google
        String userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(googleAccessToken);
        HttpEntity<String> entity = new HttpEntity<>("", headers);

        ResponseEntity<Map> userInfoResponse =
                restTemplate.exchange(userInfoEndpoint, HttpMethod.GET, entity, Map.class);
        String email = (String) userInfoResponse.getBody().get("email");
        String name = (String) userInfoResponse.getBody().get("name");
        String picture = (String) userInfoResponse.getBody().get("picture"); // <-- Lấy link ảnh từ Google

        // 3. Xử lý Logic FCAR: Đã có user chưa?
        var userOpt = userRepository.findByEmail(email);
        User user;
        boolean requireOnboard = false;

        if (userOpt.isEmpty()) {
            // User mới tinh -> Tạo nháp (PENDING_ONBOARD)
            user = User.builder()
                    .email(email)
                    .fullName(name)
                    .avatar(picture) // <-- Lưu vào DB
                    .status("PENDING_ONBOARD")
                    .build();

            HashSet<Role> roles = new HashSet<>();
            roleRepository.findById("CUSTOMER").ifPresent(roles::add);
            user.setRoles(roles);

            userRepository.save(user);
            requireOnboard = true;
        } else {
            user = userOpt.get();
            if ("PENDING_ONBOARD".equals(user.getStatus())) {
                requireOnboard = true;
            }
            if (user.getAvatar() == null) {
                user.setAvatar(picture);
                userRepository.save(user);
            }
        }

        // 4. Sinh JWT của hệ thống FCAR
        String fcarToken = jwtTokenProvider.generateToken(user.getEmail());

        return AuthenticationResponse.builder()
                .token(fcarToken)
                .authenticated(true)
                .requireOnboard(requireOnboard)
                .build();
    }
}
