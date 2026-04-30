package com.dev.cinemasystem.dto.orderDTO;

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
public class OrderComboDetailResponse {
    Integer orderComboId;
    Integer comboId;
    String comboName;
    String comboImage;
    Integer quantity;
    BigDecimal unitPrice;
    BigDecimal lineTotal;
}
