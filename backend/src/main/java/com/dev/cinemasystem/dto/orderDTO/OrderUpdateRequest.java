package com.dev.cinemasystem.dto.orderDTO;

import com.dev.cinemasystem.enums.OrderStatus;

import java.math.BigDecimal;

public class OrderUpdateRequest {
    BigDecimal ticketTotal;
    BigDecimal comboTotal;
    BigDecimal discountAmount;
    BigDecimal totalAmount;
    BigDecimal netAmount;
    OrderStatus status;
}
