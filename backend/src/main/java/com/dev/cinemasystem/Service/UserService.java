package com.dev.cinemasystem.Service;


import com.dev.cinemasystem.dto.Request.UserCreationRequest;
import com.dev.cinemasystem.dto.Response.UserResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.dev.cinemasystem.Entity.User;
import com.dev.cinemasystem.Mapper.UserMapper;
import com.dev.cinemasystem.Repository.UserRepository;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;


    public UserResponse createUser(UserCreationRequest request){
        if(userRepository.e)
        User user = userMapper.toUserFromUserCreateRequest(request);
        log.info("Creating user with email: {}", user.getEmail());
        user.setRole("CUSTOMER");
        user.setStatus("ACTIVE");
        return userMapper.toUserResponseFromUser(userRepository.save(user));
    }

}
