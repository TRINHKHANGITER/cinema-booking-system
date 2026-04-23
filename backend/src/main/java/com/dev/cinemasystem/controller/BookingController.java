package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.bookingDTO.UpdateOrderCombosRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderResponse;
import com.dev.cinemasystem.service.BookingService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

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
                .message("Order combos updated successfully")
                .result(bookingService.updateOrderCombos(orderId, request))
                .build();
    }

    @PostMapping("/order/{orderId}/cancel")
    public ApiResponse<OrderResponse> cancelOrder(@PathVariable Integer orderId) {
        return ApiResponse.<OrderResponse>builder()
                .message("Order cancelled successfully")
                .result(bookingService.cancelOrder(orderId))
                .build();
    }
}
