package com.dev.cinemasystem.dto.orderCombo;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderComboCreationRequest {
    Integer orderId;
    Integer comboId;
    Integer quantity;
}
