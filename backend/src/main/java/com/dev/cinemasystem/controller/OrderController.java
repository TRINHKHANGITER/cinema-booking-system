package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderCreationRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderUpdateRequest;
import com.dev.cinemasystem.service.OrderService;
import com.dev.cinemasystem.enums.OrderStatus;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {
    OrderService orderService;

    @PostMapping
    public ApiResponse<OrderResponse> createOrder(@RequestBody OrderCreationRequest orderCreationRequest) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.createOrder(orderCreationRequest))
                .build();
    }

    @PatchMapping("/{orderId}")
    public ApiResponse<OrderResponse> updateOrder(@PathVariable Integer orderId, @RequestBody OrderUpdateRequest orderUpdateRequest) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.updateOrder(orderId, orderUpdateRequest))
                .build();
    }

//    @PatchMapping("/cancel/{orderId}")
//    public ApiResponse<String> cancelOrder(@PathVariable Integer orderId) {
//        orderService.cancelOrder(orderId);
//        return ApiResponse.<String>builder()
//                .message("Order canceled successfully!")
//                .build();
//    }

    @GetMapping("/{orderId}")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable Integer orderId) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.getOrderById(orderId))
                .build();
    }

    @GetMapping
    public ApiResponse<List<OrderResponse>> getOrders(OrderStatus status) {
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orderService.getOrders(status))
                .build();
    }

}
