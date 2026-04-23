package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.orderCombo.OrderComboCreationRequest;
import com.dev.cinemasystem.dto.orderCombo.OrderComboResponse;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.service.OrderComboService;
import com.dev.cinemasystem.enums.OrderComboStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/{orderComboId}")
    public ApiResponse<OrderComboResponse> getOrderComboById(@PathVariable int orderComboId) {
        return ApiResponse.<OrderComboResponse>builder()
                .result(orderComboService.getOderComboById(orderComboId))
                .build();
    }

    @GetMapping
    public ApiResponse<List<OrderComboResponse>> getOrdersCombo(@RequestParam(required = false)OrderComboStatus status) {
        return ApiResponse.<List<OrderComboResponse>>builder()
                .result(orderComboService.getOrdersCombo(status))
                .build();
    }
}
