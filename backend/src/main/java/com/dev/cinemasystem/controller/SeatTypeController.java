package com.dev.cinemasystem.controller;


import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.ItemListDto;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeCreationRequest;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeResponse;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeUpdateRequest;
import com.dev.cinemasystem.enums.SeatTypeStatus;
import com.dev.cinemasystem.service.SeatTypeService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/seat-type")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatTypeController {
    SeatTypeService seatTypeService;

    @GetMapping("/{seatTypeId}")
    public ApiResponse<SeatTypeResponse> getSeatTypeById(@PathVariable Integer seatTypeId) {
        return ApiResponse.<SeatTypeResponse>builder()
                .message("Láº¥y thÃ´ng tin loáº¡i gháº¿ thÃ nh cÃ´ng")
                .result(seatTypeService.getSeatTypeById(seatTypeId))
                .build();
    }

    @PostMapping
    public ApiResponse<SeatTypeResponse> createSeatType(@RequestBody @Valid SeatTypeCreationRequest request) {
        return ApiResponse.<SeatTypeResponse>builder()
                .message("Táº¡o loáº¡i gháº¿ thÃ nh cÃ´ng")
                .result(seatTypeService.createSeatType(request))
                .build();
    }

    @GetMapping("/all")
    public ApiResponse<PagingDto<SeatTypeResponse>> getAllSeatTypes(
            @RequestParam(required = false) SeatTypeStatus status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PagingDto<SeatTypeResponse>>builder()
                .message("Láº¥y danh sÃ¡ch loáº¡i gháº¿ thÃ nh cÃ´ng")
                .result(seatTypeService.getAllSeatTypes(status, page, size))
                .build();
    }

    @GetMapping("/filter")
    public ApiResponse<PagingDto<SeatTypeResponse>> filterSeatTypes(
            @RequestParam(required = false) Integer seatTypeId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PagingDto<SeatTypeResponse>>builder()
                .message("Lá»c loáº¡i gháº¿ thÃ nh cÃ´ng")
                .result(seatTypeService.filterSeatTypes(seatTypeId, name, status, page, size))
                .build();
    }

    @GetMapping("/statuses")
    public ApiResponse<ItemListDto<String>> getAllSeatTypeStatuses() {
        List<String> statuses = seatTypeService.getAllSeatTypeStatuses();
        return ApiResponse.<ItemListDto<String>>builder()
                .message("Láº¥y danh sÃ¡ch tráº¡ng thÃ¡i loáº¡i gháº¿ thÃ nh cÃ´ng")
                .result(ItemListDto.<String>builder().items(statuses).build())
                .build();
    }

    @PatchMapping("/{seatTypeId}")
    public ApiResponse<SeatTypeResponse> updateSeatType(
            @PathVariable Integer seatTypeId,
            @RequestBody @Valid SeatTypeUpdateRequest request
    ) {
        return ApiResponse.<SeatTypeResponse>builder()
                .message("Cáº­p nháº­t loáº¡i gháº¿ thÃ nh cÃ´ng")
                .result(seatTypeService.updateSeatType(seatTypeId, request))
                .build();
    }

    @DeleteMapping("/{seatTypeId}")
    public ApiResponse<Boolean> deleteSeatType(@PathVariable Integer seatTypeId) {
        return ApiResponse.<Boolean>builder()
                .result(seatTypeService.deleteSeatType(seatTypeId))
                .message("XÃ³a loáº¡i gháº¿ thÃ nh cÃ´ng")
                .build();
    }
}


