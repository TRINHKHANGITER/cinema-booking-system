package com.dev.cinemasystem.dto.dashboardDTO;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RevenueRankingResponse<T extends RevenueValue> {
    LocalDate startDate;
    LocalDate endDate;
    BigDecimal totalRevenue;
    Integer topN;
    String sortDirection;
    List<T> chartItems;
    List<T> items;
    Long totalItems;
    int currentPage;
    int pageSize;
    Integer totalPages;
}
