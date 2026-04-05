package com.fcar.be.modules.identity.service;

import java.util.HashSet;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;
import com.fcar.be.modules.identity.dto.request.UserCreationRequest;
import com.fcar.be.modules.identity.dto.request.UserOnboardRequest;
import com.fcar.be.modules.identity.dto.response.UserResponse;
import com.fcar.be.modules.identity.entity.Role;
import com.fcar.be.modules.identity.entity.User;
import com.fcar.be.modules.identity.mapper.UserMapper;
import com.fcar.be.modules.identity.repository.RoleRepository;
import com.fcar.be.modules.identity.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserResponse createUser(UserCreationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        User user = userMapper.toUser(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        // Gán Role mặc định là CUSTOMER (Bạn cần đảm bảo Role này đã tồn tại trong DB)
        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById("CUSTOMER").ifPresent(roles::add);
        user.setRoles(roles);

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }

    @Transactional
    public UserResponse onboardUser(UserOnboardRequest request) {
        // 1. Lấy username/email của user hiện hành từ JWT Token
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Tìm User trong DB
        User user = userRepository
                .findByEmail(username) // Hoặc findByEmail tùy theo cách bạn định nghĩa trong UserRepository
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // 3. Kiểm tra xem user có đúng là đang chờ onboard không (nếu bạn có thiết kế cột status)
        if (!"PENDING_ONBOARD".equals(user.getStatus())) {
            throw new AppException(ErrorCode.DONT_PENDING_ONBOARD);
        }

        // 4. Băm mật khẩu và cập nhật thông tin
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone()); // Bỏ comment nếu Entity User của bạn có cột phone
        user.setStatus("ACTIVE"); // Bỏ comment nếu Entity User của bạn có cột status

        // 5. Lưu và trả về DTO
        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse getMyInfo() {
        // Lấy email đang đăng nhập từ Security Context (lấy từ JWT Token)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // Tìm user trong DB
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Convert sang Response (bạn có thể dùng userMapper nếu có sẵn)
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .avatar(user.getAvatar()) // <-- Thêm dòng này để trả về cho Frontend
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .status(user.getStatus())
                .build();
    }
}
