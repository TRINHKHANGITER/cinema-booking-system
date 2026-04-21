package com.dev.cinemasystem.controller;


import com.dev.cinemasystem.service.SeatService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.seatDTO.SeatCreationResquest;
import com.dev.cinemasystem.dto.seatDTO.SeatResponse;
import com.dev.cinemasystem.enums.SeatStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/seat")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatController {
    SeatService seatService;

    @GetMapping
    public ApiResponse<List<SeatResponse>> getSeatsByRoom(
            @RequestParam Integer roomId,
            @RequestParam(defaultValue = "ACTIVE") SeatStatus status
    ) {
        return ApiResponse.<List<SeatResponse>>builder()
                .message("Seats retrieved successfully")
                .result(seatService.getSeatsByRoom(roomId, status))
                .build();
    }

    @GetMapping("/{seatId}")
    public ApiResponse<SeatResponse> getSeatById(@PathVariable Integer seatId    ) {
        return ApiResponse.<SeatResponse>builder()
                .message("Seat retrieved successfully")
                .result(seatService.getSeatById(seatId))
                .build();
    }

    @PostMapping
    public ApiResponse<SeatResponse> createSeat(@RequestBody SeatCreationResquest request) {
        return ApiResponse.<SeatResponse>builder()
                .message("Seat created successfully")
                .result(seatService.createSeat(request))
                .build();
    }

    @GetMapping("/all/{cinemaId}")
    public ApiResponse<PagingDto<SeatResponse>> getAllSeats(
            @RequestParam (required = false) Integer cinemaId,
            @RequestParam (required = false) Integer seatTypeId,
            @RequestParam (required = false)SeatStatus status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size

    ) {
        return ApiResponse.<PagingDto<SeatResponse>>builder()
                .message("Seats retrieved successfully")
                .result(seatService.getAllseats(cinemaId, seatTypeId, status,page, size))
                .build();
    }

    @PatchMapping("/{seatId}")
    public ApiResponse<SeatResponse> updateSeat(@PathVariable Integer seatId, @RequestBody SeatCreationResquest request) {
        return ApiResponse.<SeatResponse>builder()
                .message("Seat updated successfully")
                .result(seatService.updateSeat(seatId, request))
                .build();
    }




    @DeleteMapping("/{seatId}")
    public ApiResponse<Boolean> deleteSeat(@PathVariable Integer seatId) {
        return ApiResponse.<Boolean>builder()
                .result(seatService.deleteSeat(seatId))
                .message("Seat deleted successfully")
                .build();
    }

}

