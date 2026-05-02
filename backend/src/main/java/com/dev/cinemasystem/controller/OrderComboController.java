package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.orderCombo.OrderComboCreationRequest;
import com.dev.cinemasystem.dto.orderCombo.OrderComboResponse;
import com.dev.cinemasystem.dto.orderCombo.OrderComboStatusUpdateRequest;
import com.dev.cinemasystem.service.OrderComboService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/orderCombo")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderComboController {
    OrderComboService orderComboService;

    @PostMapping
    public ApiResponse<OrderComboResponse> createOrderCombo(@RequestBody OrderComboCreationRequest orderComboCreationRequest) {
        return ApiResponse.<OrderComboResponse>builder()
                .result(orderComboService.createOrderCombo(orderComboCreationRequest))
                .build();
    }

    @PatchMapping("/{orderComboId}/status")
    public ApiResponse<OrderComboResponse> updateOrderComboStatus(
            @PathVariable Integer orderComboId,
            @RequestBody @Valid OrderComboStatusUpdateRequest request
    ) {
        return ApiResponse.<OrderComboResponse>builder()
                .message("Cap nhat trang thai combo trong don hang thanh cong")
                .result(orderComboService.updateOrderComboStatus(orderComboId, request.getStatus()))
                .build();
    }

    @GetMapping("/{orderComboId}")
    public ApiResponse<OrderComboResponse> getOrderComboById(@PathVariable int orderComboId) {
        return ApiResponse.<OrderComboResponse>builder()
                .result(orderComboService.getOderComboById(orderComboId))
                .build();
    }

    @GetMapping
    public ApiResponse<List<OrderComboResponse>> getOrdersCombo() {
        return ApiResponse.<List<OrderComboResponse>>builder()
                .result(orderComboService.getOrdersCombo())
                .build();
    }
}
