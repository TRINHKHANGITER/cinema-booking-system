package com.dev.cinemasystem.Controller;


import com.dev.cinemasystem.Service.ShowTimeService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.showTimeDTO.*;
import com.dev.cinemasystem.enums.SortDirection;
import com.dev.cinemasystem.enums.ShowTimeStatus;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping({"/show-time", "/showtime"})
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShowTimeController {
    ShowTimeService showTimeService;


    @GetMapping("/{showTimeId}")
    public ApiResponse<ShowTimeResponse> getShowTimeById(@PathVariable  Integer showTimeId    ) {
        return ApiResponse.<ShowTimeResponse>builder()
                .message("ShowTime retrieved successfully")
                .result(showTimeService.getShowTimeById(showTimeId))
                .build();
    }

    @GetMapping("/cinema/{cinemaId}")
    public ApiResponse<PagingDto<ShowTimeResponse>> getShowTimes(
            @PathVariable Integer cinemaId,
            @RequestParam(defaultValue = "SCHEDULED") ShowTimeStatus status,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(defaultValue = "showtime") String sortBy,
            @RequestParam(defaultValue = "ASC") SortDirection direction
    ) {
        return ApiResponse.<PagingDto<ShowTimeResponse>>builder()
                .message("ShowTimes retrieved successfully")
                .result(showTimeService.getShowTimes(cinemaId, status, page, size, sortBy, direction))
                .build();
    }

    @PostMapping
    public ApiResponse<ShowTimeResponse> createShowTime(@RequestBody @Valid ShowTimeCreationResquest request) {
        return ApiResponse.<ShowTimeResponse>builder()
                .message("ShowTime created successfully")
                .result(showTimeService.createShowTime(request))
                .build();
    }

    @PatchMapping("/{showTimeId}")
    public ApiResponse<ShowTimeResponse> updateShowTime(@PathVariable Integer showTimeId, @RequestBody @Valid ShowTimeUpdateResquest request) {
        return ApiResponse.<ShowTimeResponse>builder()
                .message("ShowTime updated successfully")
                .result(showTimeService.updateShowTime(showTimeId, request))
                .build();
    }

    @DeleteMapping("/{showTimeId}")
    public ApiResponse<Boolean> deleteShowTime(@PathVariable Integer showTimeId) {
        return ApiResponse.<Boolean>builder()
                .result(showTimeService.deleteShowTime(showTimeId))
                .message("ShowTime deleted successfully")
                .build();
    }



    @PostMapping("/search")
    public ApiResponse<PagingDto<ShowTimeSearchDto>> searchShowTimes(@RequestBody @Valid ShowTimeSearchRequest request) {
        return ApiResponse.<PagingDto<ShowTimeSearchDto>>builder()
                .message("ShowTimes retrieved successfully")
                .result(showTimeService.searchShowTimes(request))
                .build();
    }




}
