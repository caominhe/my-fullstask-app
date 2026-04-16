package com.fcar.be.modules.identity.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fcar.be.core.exception.AppException;
import com.fcar.be.core.exception.ErrorCode;
import com.fcar.be.modules.identity.dto.request.UpdateMyProfileRequest;
import com.fcar.be.modules.identity.dto.request.UserCreationRequest;
import com.fcar.be.modules.identity.dto.request.UserOnboardRequest;
import com.fcar.be.modules.identity.dto.response.UserResponse;
import com.fcar.be.modules.identity.entity.Role;
import com.fcar.be.modules.identity.entity.User;
import com.fcar.be.modules.identity.mapper.UserMapper;
import com.fcar.be.modules.identity.repository.RoleRepository;
import com.fcar.be.modules.identity.repository.UserRepository;
import com.fcar.be.modules.inventory.repository.ShowroomRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final ShowroomRepository showroomRepository;

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

    /**
     * Gán lại toàn bộ role cho user (thay thế set cũ). Chỉ gọi từ API được bảo vệ ADMIN.
     */
    @Transactional
    public UserResponse updateUserRoles(Long userId, Set<String> roleNames, Long showroomId) {
        User target = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String actorEmail =
                SecurityContextHolder.getContext().getAuthentication().getName();
        User actor =
                userRepository.findByEmail(actorEmail).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (actor.getId().equals(target.getId()) && roleNames.stream().noneMatch("ADMIN"::equals)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        HashSet<Role> newRoles = new HashSet<>();
        for (String name : roleNames) {
            Role role = roleRepository.findById(name).orElseThrow(() -> new AppException(ErrorCode.INVALID_ROLE_NAME));
            newRoles.add(role);
        }

        boolean hasShowroomRole = newRoles.stream().anyMatch(role -> "SHOWROOM".equals(role.getName()));
        if (hasShowroomRole) {
            if (showroomId == null) {
                throw new AppException(ErrorCode.SHOWROOM_ID_REQUIRED);
            }
            var showroom = showroomRepository
                    .findByIdAndIsDeletedFalse(showroomId)
                    .orElseThrow(() -> new AppException(ErrorCode.SHOWROOM_NOT_FOUND));
            target.setShowroomId(showroom.getId());
        } else {
            target.setShowroomId(null);
        }

        target.setRoles(newRoles);
        return userMapper.toUserResponse(userRepository.save(target));
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

        // Tìm user trong DB (roles cần có để FE phân quyền /users/my-info)
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateMyInfo(UpdateMyProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String normalizedPhone = normalizeField(request.getPhone());
        String normalizedCitizenId = normalizeField(request.getCitizenId());
        String normalizedAddress = normalizeField(request.getAddress());

        validateProfileFields(normalizedPhone, normalizedCitizenId, normalizedAddress);

        if (normalizedPhone != null && userRepository.existsByPhoneAndIdNot(normalizedPhone, user.getId())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_USED);
        }
        if (normalizedCitizenId != null
                && userRepository.existsByCitizenIdAndIdNot(normalizedCitizenId, user.getId())) {
            throw new AppException(ErrorCode.CITIZEN_ID_ALREADY_USED);
        }

        user.setPhone(normalizedPhone);
        user.setCitizenId(normalizedCitizenId);
        user.setAddress(normalizedAddress);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    private String normalizeField(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }

    private void validateProfileFields(String phone, String citizenId, String address) {
        if (phone != null && (phone.length() < 10 || phone.length() > 11)) {
            throw new AppException(ErrorCode.PHONE_INVALID);
        }
        if (citizenId != null && (citizenId.length() != 12 || !citizenId.chars().allMatch(Character::isDigit))) {
            throw new AppException(ErrorCode.CITIZEN_ID_INVALID);
        }
        if (address != null && address.length() > 255) {
            throw new AppException(ErrorCode.ADDRESS_TOO_LONG);
        }
    }
}
