package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.ItemListDto;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.orderDTO.*;
import com.dev.cinemasystem.service.OrderService;
import com.dev.cinemasystem.enums.OrderStatus;
import jakarta.validation.Valid;
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
//                .message("Hủy đơn hàng thành công!")
//                .build();
//    }

    @GetMapping("/admin/{orderId}")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable Integer orderId) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.getOrderById(orderId))
                .build();
    }

    @GetMapping("/{orderId}")
    public ApiResponse<OrderUserResponse> getOrderByIdForUser(@PathVariable Integer orderId) {
        return ApiResponse.<OrderUserResponse>builder()
                .result(orderService.getOrderByIdForUser(orderId))
                .build();
    }

    @GetMapping("/{orderId}/detail")
    public ApiResponse<OrderDetailResponse> getOrderDetailById(@PathVariable Integer orderId) {
        return ApiResponse.<OrderDetailResponse>builder()
                .result(orderService.getOrderDetailById(orderId))
                .build();
    }

    @GetMapping
    public ApiResponse<List<OrderResponse>> getOrders(OrderStatus status) {
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orderService.getOrders(status))
                .build();
    }

    @GetMapping("/filter")
    public ApiResponse<PagingDto<OrderResponse>> filterOrders(
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) Integer showTimeId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PagingDto<OrderResponse>>builder()
                .message("Lọc đơn hàng thành công")
                .result(orderService.filterOrders(customerName, email, phone, showTimeId, status, page, size))
                .build();
    }

    @GetMapping("/statuses")
    public ApiResponse<ItemListDto<String>> getAllOrderStatuses() {
        return ApiResponse.<ItemListDto<String>>builder()
                .message("Lấy danh sách trạng thái đơn hàng thành công")
                .result(ItemListDto.<String>builder().items(orderService.getAllOrderStatuses()).build())
                .build();
    }

    @PatchMapping("/{orderId}/status")
    public ApiResponse<OrderResponse> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestBody @Valid OrderStatusUpdateRequest request
    ) {
        return ApiResponse.<OrderResponse>builder()
                .message("Cập nhật trạng thái đơn hàng thành công")
                .result(orderService.updateStatusOrder(orderId, request.getStatus()))
                .build();
    }

}
