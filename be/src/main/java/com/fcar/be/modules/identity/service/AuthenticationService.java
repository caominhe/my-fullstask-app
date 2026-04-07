package com.fcar.be.modules.identity.service;

import java.util.HashSet;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;
import com.fcar.be.core.security.JwtTokenProvider;
import com.fcar.be.modules.identity.dto.request.AuthenticationRequest;
import com.fcar.be.modules.identity.dto.request.LogoutRequest;
import com.fcar.be.modules.identity.dto.request.RefreshTokenRequest;
import com.fcar.be.modules.identity.dto.response.AuthenticationResponse;
import com.fcar.be.modules.identity.entity.InvalidatedRefreshToken;
import com.fcar.be.modules.identity.entity.Role;
import com.fcar.be.modules.identity.entity.User;
import com.fcar.be.modules.identity.repository.InvalidatedRefreshTokenRepository;
import com.fcar.be.modules.identity.repository.RoleRepository;
import com.fcar.be.modules.identity.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Google token endpoint bắt buộc body dạng {@code application/x-www-form-urlencoded}, không phải JSON.
 * Gửi Map trực tiếp qua RestTemplate thường bị serialize thành JSON → Google trả 400 → lỗi "Uncategorized".
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RestTemplate restTemplate;
    private final RoleRepository roleRepository;
    private final InvalidatedRefreshTokenRepository invalidatedRefreshTokenRepository;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    private static final String GOOGLE_REDIRECT_URI = "http://localhost:3000/authenticate";

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        if (!authenticated) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String accessToken = jwtTokenProvider.generateToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());
        return AuthenticationResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .authenticated(true)
                .build();
    }

    @Transactional
    public void logout(LogoutRequest request) {
        String refreshToken = request.getRefreshToken();
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        String jti = jwtTokenProvider.getJwtId(refreshToken);
        if (jti == null || jti.isBlank()) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        if (invalidatedRefreshTokenRepository.existsByJti(jti)) {
            return;
        }
        invalidatedRefreshTokenRepository.save(InvalidatedRefreshToken.builder()
                .jti(jti)
                .expiresAt(jwtTokenProvider.getExpirationLocalDateTime(refreshToken))
                .build());
    }

    public AuthenticationResponse refreshToken(RefreshTokenRequest request) {
        String provided = request.getRefreshToken();
        if (!jwtTokenProvider.validateRefreshToken(provided)) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        String jti = jwtTokenProvider.getJwtId(provided);
        if (jti == null || jti.isBlank() || invalidatedRefreshTokenRepository.existsByJti(jti)) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        String email = jwtTokenProvider.getUsernameFromJWT(provided);
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String newAccessToken = jwtTokenProvider.generateToken(email);
        boolean requireOnboard = "PENDING_ONBOARD".equals(user.getStatus());

        return AuthenticationResponse.builder()
                .token(newAccessToken)
                .refreshToken(provided)
                .authenticated(true)
                .requireOnboard(requireOnboard)
                .build();
    }

    @Transactional
    public AuthenticationResponse authenticateWithGoogle(String code) {
        String tokenEndpoint = "https://oauth2.googleapis.com/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", code);
        form.add("client_id", googleClientId);
        form.add("client_secret", googleClientSecret);
        form.add("redirect_uri", GOOGLE_REDIRECT_URI);
        form.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(form, headers);

        ResponseEntity<Map> tokenResponse;
        try {
            tokenResponse = restTemplate.postForEntity(tokenEndpoint, requestEntity, Map.class);
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Google token exchange HTTP {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new AppException(ErrorCode.GOOGLE_OAUTH_FAILED);
        }

        Map<String, Object> body = tokenResponse.getBody();
        if (body == null || !body.containsKey("access_token")) {
            log.error("Google token response missing access_token: {}", body);
            throw new AppException(ErrorCode.GOOGLE_OAUTH_FAILED);
        }
        String googleAccessToken = (String) body.get("access_token");

        String userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";
        HttpHeaders userHeaders = new HttpHeaders();
        userHeaders.setBearerAuth(googleAccessToken);
        HttpEntity<String> userEntity = new HttpEntity<>("", userHeaders);

        ResponseEntity<Map> userInfoResponse;
        try {
            userInfoResponse = restTemplate.exchange(userInfoEndpoint, HttpMethod.GET, userEntity, Map.class);
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Google userinfo HTTP {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new AppException(ErrorCode.GOOGLE_OAUTH_FAILED);
        }
        Map<String, Object> userInfo = userInfoResponse.getBody();
        if (userInfo == null || userInfo.get("email") == null) {
            log.error("Google userinfo missing email: {}", userInfo);
            throw new AppException(ErrorCode.GOOGLE_OAUTH_FAILED);
        }

        String email = (String) userInfo.get("email");
        String name = (String) userInfo.get("name");
        String picture = (String) userInfo.get("picture");

        var userOpt = userRepository.findByEmail(email);
        User user;
        boolean requireOnboard = false;

        if (userOpt.isEmpty()) {
            user = User.builder()
                    .email(email)
                    .fullName(name != null ? name : email)
                    .avatar(picture)
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
            if (user.getAvatar() == null && picture != null) {
                user.setAvatar(picture);
                userRepository.save(user);
            }
        }

        String accessToken = jwtTokenProvider.generateToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        return AuthenticationResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .authenticated(true)
                .requireOnboard(requireOnboard)
                .build();
    }
}
