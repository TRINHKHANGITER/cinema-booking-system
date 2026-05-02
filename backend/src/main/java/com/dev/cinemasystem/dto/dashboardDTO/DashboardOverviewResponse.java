package com.dev.cinemasystem.dto.dashboardDTO;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardOverviewResponse {
    LocalDate startDate;
    LocalDate endDate;
    BigDecimal totalRevenue;
    Long customerCount;
    Long movieCount;
    Long cinemaCount;
}

