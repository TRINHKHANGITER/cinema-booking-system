package com.dev.cinemasystem.dto.paymentDTO;

import com.dev.cinemasystem.enums.PaymentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {
    Integer paymentId;

    int orderId;

    BigDecimal amount;

    String method;

    String bankCode;

    String bankTransactionNo;

    String transactionId;

    String infoTransaction;

    LocalDateTime paidAt;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    PaymentStatus status;
}
