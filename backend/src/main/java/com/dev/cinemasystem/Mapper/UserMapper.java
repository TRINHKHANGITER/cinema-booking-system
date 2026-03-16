package com.dev.cinemasystem.Mapper;


import com.dev.cinemasystem.dto.userDto.UserResponse;
import com.dev.cinemasystem.dto.userDto.UserUpdateRequest;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import com.dev.cinemasystem.dto.userDto.UserCreationRequest;
import com.dev.cinemasystem.Entity.User;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;


@Mapper(componentModel = "spring")
public interface UserMapper {

    User toUserFromUserCreateRequest(UserCreationRequest request);
    UserResponse toUserResponseFromUser(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateUserInfo(@MappingTarget User user, UserUpdateRequest request);
   }

