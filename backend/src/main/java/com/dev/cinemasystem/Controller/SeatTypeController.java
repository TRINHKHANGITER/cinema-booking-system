package com.dev.cinemasystem.Controller;


import com.dev.cinemasystem.Service.SeatTypeService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeCreationRequest;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeResponse;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeUpdateRequest;
import com.dev.cinemasystem.enums.SeatTypeStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/seat-type")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatTypeController {
    SeatTypeService seatTypeService;


    @GetMapping("/{seatTypeId}")
    public ApiResponse<SeatTypeResponse> getSeatTypeById(@PathVariable Integer seatTypeId    ) {
        return ApiResponse.<SeatTypeResponse>builder()
                .message("Seat retrieved successfully")
                .result(seatTypeService.getSeatTypeById(seatTypeId))
                .build();
    }

    @PostMapping
    public ApiResponse<SeatTypeResponse> createSeat(@RequestBody SeatTypeCreationRequest request) {
        return ApiResponse.<SeatTypeResponse>builder()
                .message("Seat created successfully")
                .result(seatTypeService.createSeatType(request))
                .build();
    }

    @GetMapping("/all")
    public ApiResponse<PagingDto<SeatTypeResponse>> getAllSeats(
            @RequestParam (required = false)SeatTypeStatus status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size

    ) {
        return ApiResponse.<PagingDto<SeatTypeResponse>>builder()
                .message("Seats retrieved successfully")
                .result(seatTypeService.getAllSeatTypes(status,page, size))
                .build();
    }

    @PatchMapping("/{seatTypeId}")
    public ApiResponse<SeatTypeResponse> updateSeat(@PathVariable Integer seatTypeId, @RequestBody SeatTypeUpdateRequest request) {
        return ApiResponse.<SeatTypeResponse>builder()
                .message("Seat updated successfully")
                .result(seatTypeService.updateSeatType(seatTypeId, request))
                .build();
    }




    @DeleteMapping("/{seatTypeId}")
    public ApiResponse<Boolean> deleteSeat(@PathVariable Integer seatTypeId) {
        return ApiResponse.<Boolean>builder()
                .result(seatTypeService.deleteSeatType(seatTypeId))
                .message("Seat deleted successfully")
                .build();
    }

}

