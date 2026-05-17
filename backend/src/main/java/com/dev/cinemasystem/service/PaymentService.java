package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.paymentDTO.PaymentCreationRequest;
import com.dev.cinemasystem.dto.paymentDTO.PaymentResponse;
import com.dev.cinemasystem.dto.paymentDTO.PaymentUpdateRequest;
import com.dev.cinemasystem.entity.Order;
import com.dev.cinemasystem.entity.Payment;
import com.dev.cinemasystem.enums.PaymentStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.PaymentMapper;
import com.dev.cinemasystem.repository.PaymentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentService {
    PaymentRepository paymentRepository;
    PaymentMapper paymentMapper;
    @Lazy
    OrderService orderService;

    @Transactional
    public PaymentResponse createPayment(PaymentCreationRequest paymentCreationRequest) {
        Order order = orderService.getOrderEntityById(paymentCreationRequest.getOrderId());

        Payment payment = paymentRepository.findTopByOrder_OrderIdAndStatusOrderByPaymentIdDesc(
                        order.getOrderId(),
                        PaymentStatus.PENDING
                )
                .orElseGet(() -> paymentMapper.toPayment(paymentCreationRequest));

        payment.setOrder(order);
        payment.setAmount(paymentCreationRequest.getAmount());
        if (payment.getInfoTransaction() == null || payment.getInfoTransaction().isBlank()) {
            payment.setInfoTransaction(buildTransferContent(order.getOrderId()));
        }
        if (payment.getStatus() == null) {
            payment.setStatus(PaymentStatus.PENDING);
        }

        return paymentMapper.toPaymentResponse(paymentRepository.save(payment));
    }

    @Transactional
    public void updatePayment(int paymentId, PaymentUpdateRequest paymentUpdateRequest) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        paymentMapper.updatePayment(payment, paymentUpdateRequest);
        paymentRepository.save(payment);
    }

    public List<PaymentResponse> getPayments(PaymentStatus status) {
        List<Payment> payments = status == null
                ? paymentRepository.findAll()
                : paymentRepository.findAllByStatus(status);
        return payments.stream().map(paymentMapper::toPaymentResponse).toList();
    }

    public PaymentResponse getPaymentById(Integer paymentId) {
        return paymentMapper.toPaymentResponse(paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND)));
    }

    public List<Payment> getPaymentsByOrderIdDesc(Integer orderId) {
        return paymentRepository.findAllByOrder_OrderIdOrderByPaymentIdDesc(orderId);
    }

    public Optional<Payment> findByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId);
    }

    public Optional<Payment> findLatestPendingPayment(Integer orderId) {
        return paymentRepository.findTopByOrder_OrderIdAndStatusOrderByPaymentIdDesc(orderId, PaymentStatus.PENDING);
    }

    public Optional<Payment> findLatestPayment(Integer orderId) {
        return paymentRepository.findTopByOrder_OrderIdOrderByPaymentIdDesc(orderId);
    }

    public Optional<Payment> findLatestSuccessPayment(Integer orderId) {
        return paymentRepository.findAllByOrder_OrderIdOrderByPaymentIdDesc(orderId).stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.SUCCESS)
                .findFirst();
    }

    @Transactional
    public Payment savePayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment resolvePaymentForCallback(
            Integer orderId,
            String transactionRef,
            BigDecimal callbackAmount,
            String cardType,
            String bankCode,
            String bankTransactionNo,
            String infoTransaction
    ) {
        Order order = orderService.getOrderEntityByIdForUpdate(orderId);

        Payment payment = findByTransactionId(transactionRef)
                .or(() -> findLatestPendingPayment(orderId))
                .or(() -> findLatestPayment(orderId))
                .orElseGet(Payment::new);

        payment.setOrder(order);
        if (callbackAmount != null) {
            payment.setAmount(callbackAmount);
        } else if (payment.getAmount() == null) {
            payment.setAmount(order.getNetAmount() != null ? order.getNetAmount() : BigDecimal.ZERO);
        }

        payment.setMethod(cardType != null && !cardType.isBlank() ? "VNPAY-" + cardType : "VNPAY");
        payment.setBankCode(bankCode);
        payment.setBankTransactionNo(bankTransactionNo);
        payment.setTransactionId(transactionRef);
        payment.setInfoTransaction(infoTransaction);
        return payment;
    }

    @Transactional
    public void markPaymentSuccess(Payment payment) {
        payment.setStatus(PaymentStatus.SUCCESS);
        if (payment.getPaidAt() == null) {
            payment.setPaidAt(LocalDateTime.now());
        }
        paymentRepository.save(payment);
    }

    @Transactional
    public void markPaymentStatus(Payment payment, PaymentStatus status) {
        payment.setStatus(status);
        paymentRepository.save(payment);
    }

    @Transactional
    public void cancelPayment(Integer orderId, PaymentStatus paymentStatus) {
        List<Payment> pendingPayments = paymentRepository.findAllByOrder_OrderIdAndStatus(orderId, PaymentStatus.PENDING);
        if (pendingPayments.isEmpty()) {
            return;
        }

        for (Payment payment : pendingPayments) {
            payment.setStatus(paymentStatus);
        }
        paymentRepository.saveAll(pendingPayments);
    }

    public static String buildTransferContent(int orderId) {
        return "THANH TOAN DH" + String.format("%04d", orderId);
    }
}
