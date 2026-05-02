package com.dev.cinemasystem.dto.dashboardDTO;

import com.dev.cinemasystem.enums.ComboStatus;
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
public class ComboRevenueResponse implements RevenueValue {
    Integer comboId;
    String comboName;
    String description;
    String image;
    BigDecimal price;
    ComboStatus status;
    BigDecimal revenue;
    Long soldQuantity;
    Long paidOrderCount;
}

