package com.dev.cinemasystem.dto.orderDTO;

import com.dev.cinemasystem.dto.userDto.UserResponse;
import com.dev.cinemasystem.enums.OrderStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {
    Integer orderId;
    Integer userId;
    UserResponse user;
    Integer showTimeId;

    BigDecimal ticketTotal;
    BigDecimal comboTotal;
    BigDecimal discountAmount;
    BigDecimal totalAmount;
    BigDecimal netAmount;

    LocalDateTime expiredAt;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    OrderStatus status;
}
