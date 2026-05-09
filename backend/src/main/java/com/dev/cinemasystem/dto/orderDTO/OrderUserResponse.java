package com.dev.cinemasystem.dto.orderDTO;

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
public class OrderUserResponse {
    int orderId;

    int userId;

    Integer showTimeId;

    BigDecimal ticketTotal;

    BigDecimal comboTotal;

    BigDecimal totalAmount;

    BigDecimal discountAmount;

    BigDecimal netAmount;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    OrderStatus status;
}
