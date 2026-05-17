package com.dev.cinemasystem.service;

import com.dev.cinemasystem.configuration.payment.VnPayConfig;
import com.dev.cinemasystem.constant.VnpayParamsRequest;
import com.dev.cinemasystem.constant.VnpayParamsResponse;
import com.dev.cinemasystem.dto.checkoutDTO.CheckoutRequest;
import com.dev.cinemasystem.dto.paymentDTO.PaymentCreationRequest;
import com.dev.cinemasystem.dto.showTimeSeatDTO.ShowTimeSeatResponse;
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
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CheckoutService {
    static final String RESPONSE_CODE_SUCCESS = "00";
    static final String RESPONSE_CODE_CANCELLED = "24";

    OrderRepository orderRepository;
    PaymentRepository paymentRepository;
    PaymentService paymentService;
    VnpayService vnpayService;
    VnPayConfig vnPayConfig;
    SeatInventoryService seatInventoryService;
    SeatRoomBroadcastService seatRoomBroadcastService;

    @Transactional
    public String createCheckout(CheckoutRequest request, String clientIp) {
        if (request == null || request.getOrderId() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Order order = orderRepository.findByIdForUpdate(request.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PAYING) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }
        if (order.getExpiredAt() != null && !order.getExpiredAt().isAfter(LocalDateTime.now())) {
            throw new AppException(ErrorCode.ORDER_EXPIRED);
        }

        Order recalculated = seatInventoryService.recalculateOrderTotals(order.getOrderId());
        if (recalculated.getNetAmount() == null || recalculated.getNetAmount().signum() <= 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        paymentService.createPayment(PaymentCreationRequest.builder()
                .orderId(order.getOrderId())
                .amount(recalculated.getNetAmount())
                .build());

        VnpayRequest vnpayRequest = VnpayRequest.builder()
                .orderId(order.getOrderId())
                .amount(recalculated.getNetAmount())
                .holdExpiresAt(order.getExpiredAt())
                .build();

        String ipAddress = (clientIp == null || clientIp.isBlank()) ? "127.0.0.1" : clientIp;
        return vnpayService.buildVnpayUrl(vnpayRequest, ipAddress);
    }

    @Transactional
    public boolean handleVnpayReturn(Map<String, String> rawParams) {
        Map<String, String> params = normalizeParams(rawParams);
        Integer orderId = extractOrderIdFromReference(params.get(VnpayParamsResponse.TRANSACTION_REFERENCE));
        if (orderId == null) {
            return false;
        }

        boolean validSignature = isValidSignature(params);
        if (!validSignature) {
            return false;
        }

        String responseCode = params.get(VnpayParamsResponse.RESPONSE_CODE);
        String transactionStatus = params.get(VnpayParamsResponse.TRANSACTION_STATUS);
        boolean success = RESPONSE_CODE_SUCCESS.equals(responseCode)
                && (transactionStatus == null || RESPONSE_CODE_SUCCESS.equals(transactionStatus));

        if (success) {
            try {
                markPaymentSuccess(orderId, params);
                Integer showTimeId = seatInventoryService.confirmSold(orderId);
                broadcastSeatMap(showTimeId, "SOLD");
                return true;
            } catch (AppException exception) {
                if (exception.getErrorCode() == ErrorCode.ORDER_EXPIRED
                        || exception.getErrorCode() == ErrorCode.ORDER_STATUS_INVALID) {
                    markPaymentExpired(orderId, params);
                    Integer showTimeId = seatInventoryService.releaseForPaymentFailure(orderId, PaymentStatus.EXPIRED);
                    broadcastSeatMap(showTimeId, "EXPIRED");
                    return false;
                }
                throw exception;
            }
        }

        markPaymentFailure(orderId, params, responseCode);
        PaymentStatus status = RESPONSE_CODE_CANCELLED.equals(responseCode)
                ? PaymentStatus.CANCELLED
                : PaymentStatus.FAILED;
        Integer showTimeId = seatInventoryService.releaseForPaymentFailure(orderId, status);
        broadcastSeatMap(showTimeId, "RELEASED");
        return false;
    }

    @Transactional
    public Map<String, String> handleVnpayIpn(Map<String, String> rawParams) {
        Map<String, String> response = new HashMap<>();
        boolean processed = handleVnpayReturn(rawParams);
        response.put("RspCode", "00");
        response.put("Message", processed ? "Confirm Success" : "Transaction Processed");
        return response;
    }

    private void markPaymentSuccess(Integer orderId, Map<String, String> params) {
        Payment payment = resolvePaymentForCallback(orderId, params);
        payment.setStatus(PaymentStatus.SUCCESS);
        if (payment.getPaidAt() == null) {
            payment.setPaidAt(LocalDateTime.now());
        }
        paymentRepository.save(payment);
    }

    private void markPaymentFailure(Integer orderId, Map<String, String> params, String responseCode) {
        Payment payment = resolvePaymentForCallback(orderId, params);
        payment.setStatus(RESPONSE_CODE_CANCELLED.equals(responseCode)
                ? PaymentStatus.CANCELLED
                : PaymentStatus.FAILED);
        paymentRepository.save(payment);
    }

    private void markPaymentExpired(Integer orderId, Map<String, String> params) {
        Payment payment = resolvePaymentForCallback(orderId, params);
        payment.setStatus(PaymentStatus.EXPIRED);
        paymentRepository.save(payment);
    }

    private Payment resolvePaymentForCallback(Integer orderId, Map<String, String> params) {
        String transactionRef = params.get(VnpayParamsResponse.TRANSACTION_REFERENCE);
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        Payment payment = paymentRepository.findByTransactionId(transactionRef)
                .or(() -> paymentRepository.findTopByOrder_OrderIdAndStatusOrderByPaymentIdDesc(orderId, PaymentStatus.PENDING))
                .or(() -> paymentRepository.findTopByOrder_OrderIdOrderByPaymentIdDesc(orderId))
                .orElseGet(Payment::new);

        payment.setOrder(order);

        BigDecimal callbackAmount = parseCallbackAmount(params.get(VnpayParamsResponse.AMOUNT));
        if (callbackAmount != null) {
            payment.setAmount(callbackAmount);
        } else if (payment.getAmount() == null) {
            payment.setAmount(order.getNetAmount() != null ? order.getNetAmount() : BigDecimal.ZERO);
        }

        String cardType = params.get(VnpayParamsResponse.CARD_TYPE);
        payment.setMethod(cardType != null && !cardType.isBlank() ? "VNPAY-" + cardType : "VNPAY");
        payment.setBankCode(params.get(VnpayParamsResponse.BANK_CODE));
        payment.setBankTransactionNo(params.get(VnpayParamsResponse.BANK_TRANSACTION_NO));
        payment.setTransactionId(transactionRef);
        payment.setInfoTransaction(params.get(VnpayParamsResponse.ORDER_INFO));
        return payment;
    }

    private BigDecimal parseCallbackAmount(String rawAmount) {
        if (rawAmount == null || rawAmount.isBlank()) {
            return null;
        }
        try {
            return new BigDecimal(rawAmount)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private boolean isValidSignature(Map<String, String> params) {
        String secureHash = params.get(VnpayParamsRequest.SECURE_HASH);
        if (secureHash == null || secureHash.isBlank()) {
            return false;
        }

        Map<String, String> fields = new HashMap<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (value == null) {
                continue;
            }
            if (!key.startsWith("vnp_")) {
                continue;
            }
            if (VnpayParamsRequest.SECURE_HASH.equals(key) || "vnp_SecureHashType".equals(key)) {
                continue;
            }
            fields.put(key, value);
        }

        String signingData = VnPayUtil.buildQueryData(fields, true);
        String expectedHash = VnPayUtil.hmacSha512(vnPayConfig.getHashSecret(), signingData);
        return expectedHash.equalsIgnoreCase(secureHash);
    }

    private Integer extractOrderIdFromReference(String transactionReference) {
        if (transactionReference == null || transactionReference.isBlank()) {
            return null;
        }

        StringBuilder digits = new StringBuilder();
        for (int i = 0; i < transactionReference.length(); i++) {
            char current = transactionReference.charAt(i);
            if (Character.isDigit(current)) {
                digits.append(current);
            } else {
                break;
            }
        }

        if (digits.isEmpty()) {
            return null;
        }

        try {
            return Integer.parseInt(digits.toString());
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private Map<String, String> normalizeParams(Map<String, String> rawParams) {
        return rawParams != null ? new HashMap<>(rawParams) : new HashMap<>();
    }

    private void broadcastSeatMap(Integer showTimeId, String type) {
        if (showTimeId == null) {
            return;
        }
        List<ShowTimeSeatResponse> seatMap = seatInventoryService.getSeatMap(showTimeId);
        seatRoomBroadcastService.broadcastSeatMap(showTimeId, type, seatMap);
    }
}
