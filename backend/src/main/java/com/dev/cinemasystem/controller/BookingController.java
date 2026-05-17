package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.bookingDTO.UpdateOrderCombosRequest;
import com.dev.cinemasystem.dto.orderDTO.OrderResponse;
import com.dev.cinemasystem.service.BookingService;
import com.dev.cinemasystem.service.SeatInventoryService;
import com.dev.cinemasystem.service.SeatRoomBroadcastService;
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
    SeatInventoryService seatInventoryService;
    SeatRoomBroadcastService seatRoomBroadcastService;

    @PutMapping("/order/{orderId}/combos")
    public ApiResponse<OrderResponse> updateOrderCombos(
            @PathVariable Integer orderId,
            @RequestBody @Valid UpdateOrderCombosRequest request
    ) {
        return ApiResponse.<OrderResponse>builder()
                .result(bookingService.updateOrderCombos(orderId, request))
                .build();
    }

    @PostMapping("/order/{orderId}/cancel")
    public ApiResponse<OrderResponse> cancelOrder(@PathVariable Integer orderId) {
        OrderResponse response = bookingService.cancelOrder(orderId);
        if (response.getShowTimeId() != null) {
            seatRoomBroadcastService.broadcastSeatMap(
                    response.getShowTimeId(),
                    "RELEASED",
                    seatInventoryService.getSeatMap(response.getShowTimeId())
            );
        }
        return ApiResponse.<OrderResponse>builder()
                .result(response)
                .build();
    }

    @PostMapping("/order/{orderId}/recalculate-total")
    public ApiResponse<OrderResponse> recalculateOrderTotal(@PathVariable Integer orderId) {
        return ApiResponse.<OrderResponse>builder()
                .result(bookingService.recalculateOrderTotal(orderId))
                .build();
    }
}
