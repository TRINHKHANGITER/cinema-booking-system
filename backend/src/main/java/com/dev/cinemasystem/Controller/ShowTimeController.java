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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping({"/show-time", "/showtime"})
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShowTimeController {
    ShowTimeService showTimeService;

    @GetMapping
    public ApiResponse<PagingDto<ShowtimeMovieResponse>> getShowTimesByFilters(
            @RequestParam(required = false) Integer provinceId,
            @RequestParam(required = false) Integer cinemaId,
            @RequestParam(required = false) Integer movieTypeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate releaseDate,
            @RequestParam(defaultValue = "EQ") String releaseDateCondition,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer movieId,
            @RequestParam(required = false) ShowTimeStatus status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(defaultValue = "showtime") String sortBy,
            @RequestParam(defaultValue = "ASC") SortDirection direction
    ) {
        return ApiResponse.<PagingDto<ShowtimeMovieResponse>>builder()
                .message("ShowTimes retrieved successfully")
                .result(showTimeService.getShowTimesByFilters(
                        provinceId,
                        cinemaId,
                        movieTypeId,
                        releaseDate,
                        releaseDateCondition,
                        name,
                        movieId,
                        status,
                        page,
                        size,
                        sortBy,
                        direction
                ))
                .build();
    }

    
    @GetMapping("/{showTimeId}")
    public ApiResponse<ShowtimeMovieResponse> getShowTimeById(@PathVariable  Integer showTimeId    ) {
        return ApiResponse.<ShowtimeMovieResponse>builder()
                .message("ShowTime retrieved successfully")
                .result(showTimeService.getShowTimeById(showTimeId))
                .build();
    }

    @GetMapping("/cinema/{cinemaId}")
    public ApiResponse<PagingDto<ShowtimeMovieResponse>> getShowTimes(
            @PathVariable Integer cinemaId,
            @RequestParam(defaultValue = "SCHEDULED") ShowTimeStatus status,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(defaultValue = "showtime") String sortBy,
            @RequestParam(defaultValue = "ASC") SortDirection direction
    ) {
        return ApiResponse.<PagingDto<ShowtimeMovieResponse>>builder()
                .message("ShowTimes retrieved successfully")
                .result(showTimeService.getShowTimes(cinemaId, status, page, size, sortBy, direction))
                .build();
    }

    @PostMapping
    public ApiResponse<ShowtimeMovieResponse> createShowTime(@RequestBody @Valid ShowTimeCreationResquest request) {
        return ApiResponse.<ShowtimeMovieResponse>builder()
                .message("ShowTime created successfully")
                .result(showTimeService.createShowTime(request))
                .build();
    }

    @PatchMapping("/{showTimeId}")
    public ApiResponse<ShowtimeMovieResponse> updateShowTime(@PathVariable Integer showTimeId, @RequestBody @Valid ShowTimeUpdateResquest request) {
        return ApiResponse.<ShowtimeMovieResponse>builder()
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
