package com.dev.cinemasystem.dto.dashboardDTO;

import com.dev.cinemasystem.enums.MovieStatus;
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
public class MovieRevenueResponse implements RevenueValue {
    Integer movieId;
    String movieName;
    Integer movieTypeId;
    String movieTypeName;
    LocalDate releaseDate;
    LocalDate endDate;
    MovieStatus status;
    BigDecimal revenue;
    Long paidOrderCount;
}

