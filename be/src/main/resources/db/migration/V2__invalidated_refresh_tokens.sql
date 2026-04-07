-- Blacklist refresh token JWT sau logout (jti = JWT ID)
CREATE TABLE invalidated_refresh_tokens (
    jti VARCHAR(64) PRIMARY KEY COMMENT 'JWT ID (claim jti) của refresh token đã thu hồi',
    expires_at DATETIME NOT NULL COMMENT 'Thời điểm JWT gốc hết hạn — dùng để dọn bản ghi cũ',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT = 'Refresh token JWT đã logout / bị thu hồi';
