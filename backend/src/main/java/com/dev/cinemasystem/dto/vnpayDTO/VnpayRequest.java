package com.dev.cinemasystem.dto.vnpayDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VnpayRequest {
    int orderId;
    BigDecimal amount;
}
