package com.dev.cinemasystem.dto.dashboardDTO;

import com.dev.cinemasystem.enums.OrderStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderStatisticItemResponse {
    Integer orderId;
    String customerName;
    String movieName;
    LocalDate showDate;
    LocalTime showTime;
    Long ticketQuantity;
    BigDecimal totalAmount;
    OrderStatus status;
    LocalDateTime orderCreatedAt;
}
