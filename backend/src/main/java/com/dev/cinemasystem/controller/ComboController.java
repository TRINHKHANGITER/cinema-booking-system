package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.comboDTO.ComboResponse;
import com.dev.cinemasystem.service.ComboService;
import com.dev.cinemasystem.enums.ComboStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/combo")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ComboController {
    ComboService comboService;

    @GetMapping
    public ApiResponse<List<ComboResponse>> getCombos(
            @RequestParam(required = false)ComboStatus status
    ) {
        return ApiResponse.<List<ComboResponse>>builder()
                .result(comboService.getCombos(status))
                .build();
    }

    @GetMapping("/{comboId}")
    public  ApiResponse<ComboResponse> getComboById(@PathVariable int comboId) {
        return ApiResponse.<ComboResponse>builder()
                .result(comboService.getComboById(comboId))
                .build();
    }
}
