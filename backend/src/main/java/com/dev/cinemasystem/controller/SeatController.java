package com.dev.cinemasystem.controller;


import com.dev.cinemasystem.service.SeatService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.ItemListDto;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.seatDTO.SeatCreationResquest;
import com.dev.cinemasystem.dto.seatDTO.SeatResponse;
import com.dev.cinemasystem.enums.SeatStatus;
import jakarta.validation.Valid;
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
            @RequestParam(required = false) SeatStatus status
    ) {
        return ApiResponse.<List<SeatResponse>>builder()
                .message("Lấy danh sách ghế thành công")
                .result(seatService.getSeatsByRoom(roomId, status))
                .build();
    }

    @GetMapping("/statuses")
    public ApiResponse<ItemListDto<String>> getAllSeatStatuses() {
        List<String> statuses = seatService.getAllSeatStatuses();
        return ApiResponse.<ItemListDto<String>>builder()
                .message("Lấy danh sách trạng thái ghế thành công")
                .result(ItemListDto.<String>builder().items(statuses).build())
                .build();
    }

    @GetMapping("/{seatId}")
    public ApiResponse<SeatResponse> getSeatById(@PathVariable Integer seatId    ) {
        return ApiResponse.<SeatResponse>builder()
                .message("Lấy thông tin ghế thành công")
                .result(seatService.getSeatById(seatId))
                .build();
    }

    @PostMapping
    public ApiResponse<SeatResponse> createSeat(@RequestBody @Valid SeatCreationResquest request) {
        return ApiResponse.<SeatResponse>builder()
                .message("Tạo ghế thành công")
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
                .message("Lấy danh sách ghế thành công")
                .result(seatService.getAllseats(cinemaId, seatTypeId, status,page, size))
                .build();
    }

    @PatchMapping("/{seatId}")
    public ApiResponse<SeatResponse> updateSeat(@PathVariable Integer seatId, @RequestBody @Valid SeatCreationResquest request) {
        return ApiResponse.<SeatResponse>builder()
                .message("Cập nhật ghế thành công")
                .result(seatService.updateSeat(seatId, request))
                .build();
    }




    @DeleteMapping("/{seatId}")
    public ApiResponse<Boolean> deleteSeat(@PathVariable Integer seatId) {
        return ApiResponse.<Boolean>builder()
                .result(seatService.deleteSeat(seatId))
                .message("Xóa ghế thành công")
                .build();
    }

}
