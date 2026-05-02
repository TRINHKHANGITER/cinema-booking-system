package com.dev.cinemasystem.dto.dashboardDTO;

import com.dev.cinemasystem.enums.MovieTypeStatus;
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
public class MovieTypeRevenueResponse implements RevenueValue {
    Integer movieTypeId;
    String movieTypeName;
    String description;
    MovieTypeStatus status;
    BigDecimal revenue;
    Long paidOrderCount;
}

