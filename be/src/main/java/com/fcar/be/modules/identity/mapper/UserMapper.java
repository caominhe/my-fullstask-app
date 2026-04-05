package com.fcar.be.modules.identity.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.fcar.be.modules.identity.dto.request.UserCreationRequest;
import com.fcar.be.modules.identity.dto.response.UserResponse;
import com.fcar.be.modules.identity.entity.Permission;
import com.fcar.be.modules.identity.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "passwordHash", ignore = true)
    User toUser(UserCreationRequest request);

    UserResponse toUserResponse(User user);

    //  map Permission -> String
    default String mapPermissionToString(Permission permission) {
        return permission != null ? permission.getName() : null;
    }
}
