package com.dev.cinemasystem.dto.paymentDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentUpdateRequest {
    String method;

    String bankCode;

    String bankTransactionNo;

    String transactionId;

    String infoTransaction;

    LocalDateTime paidAt;

}
