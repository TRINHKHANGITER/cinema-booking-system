package com.dev.cinemasystem.entity;

import com.dev.cinemasystem.enums.PaymentMethod;
import com.dev.cinemasystem.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer paymentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    Order order;

    @Column(nullable = false, precision = 12, scale = 2)
    BigDecimal amount;

    // @Enumerated(EnumType.STRING)
    // @Column(nullable = false, length = 30)
    // Loại tài khoản/thẻ khách hàng sử dụng:ATM,QRCODE
    String method;

    // Mã Ngân hàng thanh toán. Ví dụ: NCB,...
    String bankCode;

    // mã giao dịch ngân hàng, ví điện tử, ....
    String bankTransactionNo;

    @Column(length = 200, unique = true)
    // Mã giao dịch ghi nhận tại hệ thống VNPAY. (bên thứ 3)
    String transactionId;

    String infoTransaction;

    // @Column(columnDefinition = "TEXT")
    // String providerPayload;

    LocalDateTime paidAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    LocalDateTime updatedAt;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    PaymentStatus status = PaymentStatus.PENDING;
}


