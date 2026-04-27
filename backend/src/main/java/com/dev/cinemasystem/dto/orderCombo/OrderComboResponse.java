package com.dev.cinemasystem.dto.orderCombo;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderComboResponse {
    Integer orderComboId;
    Integer orderId;
    Integer comboId;
    Integer quantity;
    BigDecimal unitPrice;
}
