package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.paymentDTO.PaymentCreationRequest;
import com.dev.cinemasystem.dto.paymentDTO.PaymentResponse;
import com.dev.cinemasystem.dto.paymentDTO.PaymentUpdateRequest;
import com.dev.cinemasystem.entity.Order;
import com.dev.cinemasystem.entity.Payment;
import com.dev.cinemasystem.mapper.PaymentMapper;
import com.dev.cinemasystem.repository.OrderRepository;
import com.dev.cinemasystem.repository.PaymentRepository;
import com.dev.cinemasystem.enums.PaymentStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentService {
    final PaymentRepository paymentRepository;
    final PaymentMapper paymentMapper;
    final OrderRepository orderRepository;

    public PaymentResponse createPayment(PaymentCreationRequest paymentCreationRequest) {
        Payment payment = paymentMapper.toPayment(paymentCreationRequest);

        Order order = orderRepository.findById(paymentCreationRequest.getOrderId())
                .orElseThrow(RuntimeException::new);
        payment.setOrder(order);
        payment.setInfoTransaction(buildTransferContent(order.getOrderId()));

        return paymentMapper.toPaymentResponse(paymentRepository.save(payment));
    }

    public void updatePayment(int paymentId, PaymentUpdateRequest paymentUpdateRequest) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not exists!"));

        paymentMapper.updatePayment(payment, paymentUpdateRequest);
        paymentRepository.save(payment);
        // paymentMapper.toPaymentResponse(payment);
    }

    public List<PaymentResponse> getPayments() {
        return paymentRepository.findAll().stream().map(paymentMapper::toPaymentResponse).toList();
    }

    public PaymentResponse getPaymentById(Integer paymentId) {
        return paymentMapper.toPaymentResponse(paymentRepository.findById(paymentId)
                .orElseThrow(RuntimeException::new));
    }

    public void cancelPayment(Integer orderId, PaymentStatus paymentStatus) {
        Payment payment = paymentRepository.findByOrder_OrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found!"));

        payment.setStatus(paymentStatus);
        paymentRepository.save(payment);
    }

    public static String buildTransferContent(int orderId) {
        return "THANH TOAN DH" + String.format("%04d", orderId);
    }

}


