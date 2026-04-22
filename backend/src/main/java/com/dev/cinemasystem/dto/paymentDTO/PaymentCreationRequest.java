package com.dev.cinemasystem.dto.paymentDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentCreationRequest {
    Integer orderId;
    BigDecimal amount;
}
