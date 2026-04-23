package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.showTimeSeatDTO.HoldSeatRequest;
import com.dev.cinemasystem.dto.showTimeSeatDTO.HoldSeatResponse;
import com.dev.cinemasystem.dto.showTimeSeatDTO.ReleaseSeatRequest;
import com.dev.cinemasystem.dto.showTimeSeatDTO.ShowTimeSeatResponse;
import com.dev.cinemasystem.service.BookingService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/showtime-seat")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShowTimeSeatController {

    BookingService bookingService;

    @GetMapping("/{showTimeId}")
    public ApiResponse<List<ShowTimeSeatResponse>> getSeatMap(@PathVariable Integer showTimeId) {
        return ApiResponse.<List<ShowTimeSeatResponse>>builder()
                .message("Showtime seat map retrieved successfully")
                .result(bookingService.getSeatMap(showTimeId))
                .build();
    }

    @PostMapping("/hold")
    public ApiResponse<HoldSeatResponse> holdSeats(@RequestBody @Valid HoldSeatRequest request) {
        return ApiResponse.<HoldSeatResponse>builder()
                .message("Seats held successfully")
                .result(bookingService.holdSeats(request))
                .build();
    }

    @PostMapping("/release")
    public ApiResponse<HoldSeatResponse> releaseSeats(@RequestBody @Valid ReleaseSeatRequest request) {
        return ApiResponse.<HoldSeatResponse>builder()
                .message("Seats released successfully")
                .result(bookingService.releaseSeats(request))
                .build();
    }
}
