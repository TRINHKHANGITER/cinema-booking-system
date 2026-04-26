package com.dev.cinemasystem.service;

import com.dev.cinemasystem.configuration.payment.VnPayConfig;
import com.dev.cinemasystem.constant.VnpayParamsRequest;
import com.dev.cinemasystem.constant.VnpayParamsResponse;
import com.dev.cinemasystem.dto.checkoutDTO.CheckoutRequest;
import com.dev.cinemasystem.dto.paymentDTO.PaymentCreationRequest;
import com.dev.cinemasystem.dto.vnpayDTO.VnpayRequest;
import com.dev.cinemasystem.entity.Order;
import com.dev.cinemasystem.entity.Payment;
import com.dev.cinemasystem.enums.OrderStatus;
import com.dev.cinemasystem.enums.PaymentStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.repository.OrderRepository;
import com.dev.cinemasystem.repository.PaymentRepository;
import com.dev.cinemasystem.utils.VnPayUtil;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CheckoutService {

    OrderRepository orderRepository;
    PaymentRepository paymentRepository;
    PaymentService paymentService;
    VnpayService vnpayService;
    BookingService bookingService;
    TicketService ticketService;
    VnPayConfig vnPayConfig;

    @Transactional
    public String checkout(CheckoutRequest checkoutRequest, String clientIp) {
        Order order = orderRepository.findById(checkoutRequest.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PAYING) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }
        if (order.getExpiredAt() != null && order.getExpiredAt().isBefore(LocalDateTime.now())) {
            bookingService.markOrderFailed(order.getOrderId(), OrderStatus.EXPIRED);
            throw new AppException(ErrorCode.ORDER_EXPIRED);
        }
        if (order.getNetAmount() == null || order.getNetAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        paymentService.createPayment(new PaymentCreationRequest(order.getOrderId(), order.getNetAmount()));

        return vnpayService.buildVnpayUrl(
                VnpayRequest.builder()
                        .orderId(order.getOrderId())
                        .amount(order.getNetAmount())
                        .build(),
                clientIp
        );
    }

    public boolean verifySignature(Map<String, String> inputParams) {
        Map<String, String> params = new HashMap<>(inputParams);
        String secureHash = params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String signData = VnPayUtil.buildQueryData(params, true);
        String calculatedHash = VnPayUtil.hmacSha512(vnPayConfig.getHashSecret(), signData);

        return calculatedHash.equalsIgnoreCase(secureHash);
    }

    @Transactional
    public boolean handleReturn(Map<String, String> params) {
        boolean validSignature = verifySignature(params);
        if (!validSignature) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Integer orderId = extractOrderIdFromTxnRef(params.get(VnpayParamsRequest.TRANSACTION_REFERENCE));
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        Payment payment = paymentRepository.findTopByOrder_OrderIdOrderByPaymentIdDesc(order.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        payment.setInfoTransaction(params.get(VnpayParamsResponse.ORDER_INFO));

        boolean success = "00".equals(params.get(VnpayParamsResponse.RESPONSE_CODE))
                && "00".equals(params.get(VnpayParamsResponse.TRANSACTION_STATUS));

        // Fallback: nếu IPN không về được backend, return callback vẫn có thể chốt đơn.
        if (order.getStatus() == OrderStatus.PAYING) {
            payment.setMethod(params.get(VnpayParamsResponse.CARD_TYPE));
            payment.setBankCode(params.get(VnpayParamsResponse.BANK_CODE));
            payment.setBankTransactionNo(params.get(VnpayParamsResponse.BANK_TRANSACTION_NO));
            payment.setTransactionId(params.get(VnpayParamsResponse.TRANSACTION_NO));

            if (success) {
                payment.setPaidAt(LocalDateTime.now());
                payment.setStatus(PaymentStatus.SUCCESS);
                paymentRepository.save(payment);

                bookingService.markOrderPaid(orderId);
                Order paidOrder = bookingService.getOrderEntity(orderId);
                ticketService.createTicketsFromSoldSeats(paidOrder, bookingService.getSoldSeatsByOrder(orderId));
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
                bookingService.markOrderFailed(orderId, OrderStatus.EXPIRED);
            }
        } else {
            paymentRepository.save(payment);
        }

        return success;
    }

    @Transactional
    public void handleIpn(Map<String, String> params) {
        boolean validSignature = verifySignature(params);
        if (!validSignature) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Integer orderId = extractOrderIdFromTxnRef(params.get(VnpayParamsRequest.TRANSACTION_REFERENCE));
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PAYING) {
            return;
        }

        long returnedAmount = Long.parseLong(params.getOrDefault(VnpayParamsResponse.AMOUNT, "0")) / 100;
        if (returnedAmount != order.getNetAmount().longValue()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Payment payment = paymentRepository
                .findTopByOrder_OrderIdAndStatusOrderByPaymentIdDesc(orderId, PaymentStatus.PENDING)
                .orElseGet(() -> paymentRepository.save(Payment.builder()
                        .order(order)
                        .amount(order.getNetAmount())
                        .status(PaymentStatus.PENDING)
                        .infoTransaction(PaymentService.buildTransferContent(orderId))
                        .build()));

        payment.setMethod(params.get(VnpayParamsResponse.CARD_TYPE));
        payment.setBankCode(params.get(VnpayParamsResponse.BANK_CODE));
        payment.setBankTransactionNo(params.get(VnpayParamsResponse.BANK_TRANSACTION_NO));
        payment.setTransactionId(params.get(VnpayParamsResponse.TRANSACTION_NO));
        payment.setInfoTransaction(params.get(VnpayParamsResponse.ORDER_INFO));

        boolean success = "00".equals(params.get(VnpayParamsResponse.RESPONSE_CODE))
                && "00".equals(params.get(VnpayParamsResponse.TRANSACTION_STATUS));

        if (success) {
            payment.setPaidAt(LocalDateTime.now());
            payment.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(payment);

            bookingService.markOrderPaid(orderId);
            Order paidOrder = bookingService.getOrderEntity(orderId);
            ticketService.createTicketsFromSoldSeats(paidOrder, bookingService.getSoldSeatsByOrder(orderId));
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            bookingService.markOrderFailed(orderId, OrderStatus.EXPIRED);
        }
    }

    private Integer extractOrderIdFromTxnRef(String transactionReference) {
        if (transactionReference == null || transactionReference.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        StringBuilder orderDigits = new StringBuilder();
        for (char ch : transactionReference.toCharArray()) {
            if (Character.isDigit(ch)) {
                orderDigits.append(ch);
                continue;
            }
            break;
        }

        if (orderDigits.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        try {
            return Integer.parseInt(orderDigits.toString());
        } catch (NumberFormatException ex) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }
}
