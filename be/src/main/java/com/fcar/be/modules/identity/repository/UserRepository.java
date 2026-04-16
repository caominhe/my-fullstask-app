package com.fcar.be.modules.identity.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fcar.be.modules.identity.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Tìm kiếm User theo Email (dùng cho việc Đăng nhập và kiểm tra trong CustomUserDetailsService)
    Optional<User> findByEmail(String email);

    // Kiểm tra xem Email đã tồn tại chưa (dùng cho lúc Đăng ký)
    boolean existsByEmail(String email);

    java.util.List<User> findByShowroomId(Long showroomId);

    boolean existsByPhoneAndIdNot(String phone, Long id);

    boolean existsByCitizenIdAndIdNot(String citizenId, Long id);
}
