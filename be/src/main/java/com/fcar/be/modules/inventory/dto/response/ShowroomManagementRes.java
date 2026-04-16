package com.fcar.be.modules.inventory.dto.response;

import java.util.List;

import com.fcar.be.modules.identity.dto.response.UserResponse;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowroomManagementRes {
    ShowroomRes showroom;
    List<UserResponse> users;
    List<CarDetailRes> cars;
    List<ShowroomPromotionRes> promotions;
}
