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
import com.dev.cinemasystem.repository.OrderRepository;
import com.dev.cinemasystem.repository.PaymentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentService {
    PaymentRepository paymentRepository;
    PaymentMapper paymentMapper;
    OrderRepository orderRepository;

    @Transactional
    public PaymentResponse createPayment(PaymentCreationRequest paymentCreationRequest) {
        Order order = orderRepository.findById(paymentCreationRequest.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

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
