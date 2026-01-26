package com.dev.cinemasystem.Mapper;


import com.dev.cinemasystem.dto.Response.UserResponse;
import org.mapstruct.Mapper;
import com.dev.cinemasystem.dto.Request.UserCreationRequest;
import com.dev.cinemasystem.Entity.User;


@Mapper(componentModel = "spring")
public interface UserMapper {

    User toUserFromUserCreateRequest(UserCreationRequest request);
    UserResponse toUserResponseFromUser(User user);
   }

