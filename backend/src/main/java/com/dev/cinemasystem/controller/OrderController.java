package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.ItemListDto;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.orderDTO.OrderCreationRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderDetailResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderResponse;
import com.dev.cinemasystem.dto.orderDTO.OrderStatusUpdateRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderUpdateRequest;
import com.dev.cinemasystem.enums.OrderStatus;
import com.dev.cinemasystem.service.OrderService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {
    OrderService orderService;

    @PostMapping
    public ApiResponse<OrderResponse> createOrder(@RequestBody @Valid OrderCreationRequest request) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.createOrder(request))
                .build();
    }

    @PatchMapping("/{orderId}")
    public ApiResponse<OrderResponse> updateOrder(
            @PathVariable Integer orderId,
            @RequestBody @Valid OrderUpdateRequest request
    ) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.updateOrder(orderId, request))
                .build();
    }

    @PatchMapping("/{orderId}/status")
    public ApiResponse<OrderResponse> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestBody @Valid OrderStatusUpdateRequest request
    ) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.updateOrderStatus(orderId, request))
                .build();
    }

    @GetMapping("/{orderId}")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable Integer orderId) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.getOrderById(orderId))
                .build();
    }

    @GetMapping("/{orderId}/detail")
    public ApiResponse<OrderDetailResponse> getOrderDetailById(@PathVariable Integer orderId) {
        return ApiResponse.<OrderDetailResponse>builder()
                .result(orderService.getOrderDetailById(orderId))
                .build();
    }

    @GetMapping
    public ApiResponse<List<OrderResponse>> getOrders(@RequestParam(required = false) OrderStatus status) {
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orderService.getOrders(status))
                .build();
    }

    @GetMapping("/filter")
    public ApiResponse<PagingDto<OrderResponse>> filterOrders(
            @RequestParam(required = false) Integer orderId,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) Integer showTimeId,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PagingDto<OrderResponse>>builder()
                .result(orderService.filterOrders(
                        orderId,
                        customerName,
                        email,
                        phone,
                        showTimeId,
                        status,
                        page,
                        size
                ))
                .build();
    }

    @GetMapping("/statuses")
    public ApiResponse<ItemListDto<String>> getAllStatuses() {
        return ApiResponse.<ItemListDto<String>>builder()
                .result(ItemListDto.<String>builder()
                        .items(orderService.getAllOrderStatuses())
                        .build())
                .build();
    }
}
