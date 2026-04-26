package com.dev.cinemasystem.dto.orderDTO;

import com.dev.cinemasystem.enums.PaymentStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderPaymentDetailResponse {
    Integer paymentId;
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
