package com.dev.cinemasystem.dto.orderDTO;

import com.dev.cinemasystem.dto.userDto.UserResponse;
import com.dev.cinemasystem.enums.OrderStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderDetailResponse {
    Integer orderId;
    Integer userId;
    UserResponse user;
    OrderStatus status;

    BigDecimal ticketTotal;
    BigDecimal comboTotal;
    BigDecimal discountAmount;
    BigDecimal totalAmount;
    BigDecimal netAmount;

    LocalDateTime expiredAt;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    OrderShowTimeDetailResponse showTime;
    List<OrderSeatDetailResponse> seats;
    List<OrderComboDetailResponse> combos;
    List<OrderPaymentDetailResponse> payments;

    LocalDateTime paidAt;
    String vnpayTransactionId;
    String bankTransactionNo;
    String bankCode;
}
