package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.bookingDTO.UpdateOrderCombosRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderResponse;
import com.dev.cinemasystem.service.BookingService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/booking")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingController {

    BookingService bookingService;

    @PutMapping("/order/{orderId}/combos")
    public ApiResponse<OrderResponse> updateOrderCombos(
            @PathVariable Integer orderId,
            @RequestBody @Valid UpdateOrderCombosRequest request
    ) {
        return ApiResponse.<OrderResponse>builder()
                .message("Cập nhật combo của đơn hàng thành công")
                .result(bookingService.updateOrderCombos(orderId, request))
                .build();
    }

    @PostMapping("/order/{orderId}/cancel")
    public ApiResponse<OrderResponse> cancelOrder(@PathVariable Integer orderId) {
        return ApiResponse.<OrderResponse>builder()
                .message("Hủy đơn hàng thành công")
                .result(bookingService.cancelOrder(orderId))
                .build();
    }

    @PostMapping("/order/{orderId}/recalculate-total")
    public ApiResponse<OrderResponse> recalculateOrderTotal(@PathVariable Integer orderId) {
        return ApiResponse.<OrderResponse>builder()
                .message("Cập nhật tổng tiền đơn hàng thành công")
                .result(bookingService.recalculateOrderTotalsForOrder(orderId))
                .build();
    }
}
