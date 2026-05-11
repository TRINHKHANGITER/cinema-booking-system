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
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderStatisticsResponse {
    LocalDate fromDate;
    LocalDate toDate;
    OrderStatus status;
    BigDecimal totalAmount;
    List<OrderStatisticItemResponse> items;
    Long totalItems;
    int currentPage;
    int pageSize;
    Integer totalPages;
}
