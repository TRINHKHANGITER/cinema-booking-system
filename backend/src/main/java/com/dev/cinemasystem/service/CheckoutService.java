package com.dev.cinemasystem.service;

import com.dev.cinemasystem.configuration.payment.VnPayConfig;
import com.dev.cinemasystem.constant.VnpayParamsRequest;
import com.dev.cinemasystem.constant.VnpayParamsResponse;
import com.dev.cinemasystem.dto.orderCombo.OrderComboCreationRequest;
import com.dev.cinemasystem.dto.paymentDTO.PaymentResponse;
import com.dev.cinemasystem.dto.paymentDTO.PaymentUpdateRequest;
import com.dev.cinemasystem.dto.ticket.TicketCreationRequest;
import com.dev.cinemasystem.dto.checkoutDTO.CheckoutRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderCreationRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderResponse;
import com.dev.cinemasystem.dto.paymentDTO.PaymentCreationRequest;
import com.dev.cinemasystem.dto.vnpayDTO.VnpayRequest;
import com.dev.cinemasystem.entity.Order;
import com.dev.cinemasystem.entity.Payment;
import com.dev.cinemasystem.entity.ShowTime;
import com.dev.cinemasystem.enums.OrderStatus;
import com.dev.cinemasystem.repository.OrderRepository;
import com.dev.cinemasystem.repository.PaymentRepository;
import com.dev.cinemasystem.repository.ShowTimeRepository;
import com.dev.cinemasystem.utils.VnPayUtil;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CheckoutService {
    TicketService ticketService;
    OrderComboService orderComboService;
    OrderService orderService;
    OrderRepository orderRepository;
    PaymentService paymentService;
    PaymentRepository paymentRepository;
    VnpayService vnpayService;
    PriceTicketService priceTicketService;
    RoomService roomService;
    SeatService seatService;
    ShowTimeRepository showTimeRepository;
    VnPayConfig vnPayConfig;

    @Transactional
    public String checkout(CheckoutRequest checkoutRequest, String clientIp) {
        System.out.println("in checkout request - checkoutRequest: " + checkoutRequest);

        // 1. create order
        OrderResponse orderResponse =
                orderService.createOrder(new OrderCreationRequest(checkoutRequest.getUserId()));
        int orderId = orderResponse.getOrderId();

        // 2. create ticket
        List<TicketCreationRequest> ticketCreationRequests = checkoutRequest.getTickets();
        BigDecimal amountTickets =  ticketCreationRequests.stream().map(
                ticketCreationRequest -> {
                    ticketCreationRequest.setOrderId(orderId);
                    ticketService.createTicket(ticketCreationRequest);
                    ShowTime showTime = showTimeRepository.findById(ticketCreationRequest.getShowTimeId())
                            .orElseThrow(() -> new RuntimeException("ShowTime not exists!"));
                    int roomId = showTime.getRoom().getRoomId();
                    int roomTypeId = roomService.getRoomById(roomId).getRoomTypeId();
                    int seatTypeId = seatService.getSeatById(ticketCreationRequest.getSeatId()).getSeatTypeId();
                    return priceTicketService.getPriceByRoomTypeIdAndSeatTypeIdAndTicketTypeId(roomTypeId, seatTypeId, ticketCreationRequest.getTicketTypeId());
                }
        ).reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. create combo
        List<OrderComboCreationRequest> comboRequests = checkoutRequest.getCombos();
        BigDecimal amountCombos =  comboRequests.stream().map(
                comboRequest -> {
                    comboRequest.setOrderId(orderId);
                    orderComboService.createOrderCombo(comboRequest);
                    return orderComboService.getOderComboById(comboRequest.getComboId()).getUnitPrice();
                }
        ).reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. set price for order
        BigDecimal totalAmount = amountTickets.add(amountCombos);

        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not exists!"));
        order.setComboTotal(amountCombos);
        order.setTicketTotal(amountTickets);
        order.setTotalAmount(totalAmount);
        orderRepository.save(order);

        System.out.println("in checkout request - totalAmount: " + totalAmount);

        // 5. create payment
        paymentService.createPayment(new PaymentCreationRequest(orderId, totalAmount));

        return vnpayService.buildVnpayUrl(new VnpayRequest(orderId, totalAmount), clientIp);
    }

    public void updateCheckout(int paymentId, PaymentResponse paymentResponse, boolean success) {
        // 1. update status payment
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found!"));

        PaymentUpdateRequest paymentUpdateRequest = PaymentUpdateRequest.builder()
                .method(paymentResponse.getMethod())
                .bankCode(paymentResponse.getBankCode())
                .bankTransactionNo(paymentResponse.getBankTransactionNo())
                .transactionId(paymentResponse.getTransactionId())
                .infoTransaction(paymentResponse.getInfoTransaction())
                .build();
        if (success) paymentUpdateRequest.setPaidAt(LocalDateTime.now());

        paymentService.updatePayment(paymentId, paymentUpdateRequest);

        // 2. update status order
        if (success) {
            orderService.updateStatusOrder(paymentId, OrderStatus.CONFIRMED);
        } else {
            orderService.updateStatusOrder(paymentId, OrderStatus.CANCELLED);
        }
    }

    // kiểm tra chữ ký của vnPay
    public boolean verifySignature(Map<String, String> inputParams) {
        Map<String, String> params = new HashMap<>(inputParams);
        String secureHash = params.remove("vnp_SecureHash");
        // vnp_SecureHash là chữ ký do VNPAY tạo.
        // Đồng thời remove luôn khỏi params để không đưa vào dữ liệu cần ký lại.
        params.remove("vnp_SecureHashType");
        // Tham số này chỉ mô tả loại thuật toán, ví dụ HmacSHA512
        // Nó không thuộc dữ liệu cần ký
        // Nên cũng phải bỏ ra trước khi build chuỗi ký

        String signData = VnPayUtil.buildQueryData(params, true);
        String calculatedHash = VnPayUtil.hmacSha512(vnPayConfig.getHashSecret(), signData);

        return calculatedHash.equalsIgnoreCase(secureHash);
    }

    public boolean handleReturn(Map<String, String> params) {
        System.out.println("running in handleReturn" + params);

        boolean validSignature = verifySignature(params);
        System.out.println("params in handleReturn" + params);

        if (!validSignature) throw new RuntimeException("Signature not valid!");

        String orderId = params.get(VnpayParamsRequest.TRANSACTION_REFERENCE);
        Order order = orderRepository.findById(Integer.parseInt(orderId)).
                orElseThrow(() -> new RuntimeException("Order not found!"));

        String infoTransaction = params.get(VnpayParamsResponse.ORDER_INFO);

        Payment payment = paymentRepository.findByOrder_OrderId(order.getOrderId())
                .orElseThrow(() -> new RuntimeException("Payment not found!"));
        payment.setInfoTransaction(infoTransaction);

        orderRepository.save(order);
        paymentRepository.save(payment);

        boolean success = "00".equals(params.get(VnpayParamsResponse.RESPONSE_CODE))
                && "00".equals(params.get(VnpayParamsResponse.TRANSACTION_STATUS));

        if (!success) throw new RuntimeException("Payment failed!");

        return true;
    }

    public void handleIpn(Map<String, String> params) {
        System.out.println("running in handleIpn" + params);

        boolean validSignature = verifySignature(params);
        System.out.println("params in handleIpn" + params);

        if (!validSignature) throw new RuntimeException("Signature not valid!");

        String orderId = params.get(VnpayParamsRequest.TRANSACTION_REFERENCE);
        Order order = orderRepository.findById(Integer.parseInt(orderId)).
                orElseThrow(() -> new RuntimeException("Order not found!"));

        long returnedAmount = Long.parseLong(params.getOrDefault(VnpayParamsResponse.AMOUNT, "0")) / 100;
        if (returnedAmount != order.getTotalAmount().longValue()) throw new RuntimeException("Amount valid!");

        if (order.getStatus() != OrderStatus.PENDING) return;

        String method = params.get(VnpayParamsResponse.CARD_TYPE);
        String bankCode = params.get(VnpayParamsResponse.BANK_CODE);
        String bankTransactionNo = params.get(VnpayParamsResponse.BANK_TRANSACTION_NO);
        String transactionId = params.get(VnpayParamsResponse.TRANSACTION_NO);
        String infoTransaction = params.get(VnpayParamsResponse.ORDER_INFO);
        PaymentResponse paymentResponse = PaymentResponse.builder()
                .method(method)
                .bankCode(bankCode)
                .bankTransactionNo(bankTransactionNo)
                .transactionId(transactionId)
                .infoTransaction(infoTransaction)
                .build();

        boolean success = "00".equals(params.get(VnpayParamsResponse.RESPONSE_CODE))
                && "00".equals(params.get(VnpayParamsResponse.TRANSACTION_STATUS));

        Payment payment = paymentRepository.findByOrder_OrderId(Integer.parseInt(orderId))
                .orElseThrow(() -> new RuntimeException("Order not found!"));

        if (success) {
            updateCheckout(payment.getPaymentId(), paymentResponse, true);
            System.out.println("Payment successful!");
        } else {
            updateCheckout(payment.getPaymentId(), paymentResponse, false);
            System.out.println("Payment failed!");
        }
    }

}
