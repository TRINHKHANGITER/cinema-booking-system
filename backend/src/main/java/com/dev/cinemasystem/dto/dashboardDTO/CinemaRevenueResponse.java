package com.dev.cinemasystem.dto.dashboardDTO;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CinemaRevenueResponse implements RevenueValue {
    Integer cinemaId;
    String cinemaName;
    Integer provinceId;
    String provinceName;
    BigDecimal revenue;
    Long paidOrderCount;
}

