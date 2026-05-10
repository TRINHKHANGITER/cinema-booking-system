package com.dev.cinemasystem.controller;


import com.dev.cinemasystem.service.ShowTimeService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.ItemListDto;
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

import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping({"/show-time", "/showtime"})
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShowTimeController {
    ShowTimeService showTimeService;

    @GetMapping("/search")
    public ApiResponse<PagingDto<ShowTimeResponse>> getShowTimesByFilters(
            @RequestParam(required = false) Integer provinceId,
            @RequestParam(required = false) Integer cinemaId,
            @RequestParam(required = false) Integer movieTypeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate releaseFromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate releaseToDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime,
            @RequestParam(required = false) String movieName,
            @RequestParam(required = false) Integer movieId,
            @RequestParam(required = false) ShowTimeStatus status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(defaultValue = "showtime") String sortBy,
            @RequestParam(defaultValue = "ASC") SortDirection direction
    ) {
        return ApiResponse.<PagingDto<ShowTimeResponse>>builder()
                .message("Lấy danh sách suất chiếu thành công")
                .result(showTimeService.getShowTimesByFilters(
                        provinceId,
                        cinemaId,
                        movieTypeId,
                        releaseFromDate,
                        releaseToDate,
                        startTime,
                        endTime,
                        movieName ,
                        movieId,
                        status,
                        page,
                        size,
                        sortBy,
                        direction
                ))
                .build();
    }

    @GetMapping("/search/grouped")
    public ApiResponse<PagingDto<FullShowtimeMovieResponse>> getGroupedShowTimesByFilters(
            @RequestParam(required = false) Integer provinceId,
            @RequestParam(required = false) Integer cinemaId,
            @RequestParam(required = false) Integer movieTypeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate releaseFromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate releaseToDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime,
            @RequestParam(required = false) String movieName,
            @RequestParam(required = false) Integer movieId,
            @RequestParam(required = false) ShowTimeStatus status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(defaultValue = "showtime") String sortBy,
            @RequestParam(defaultValue = "ASC") SortDirection direction
    ) {
        return ApiResponse.<PagingDto<FullShowtimeMovieResponse>>builder()
                .message("Lấy danh sách suất chiếu theo nhóm thành công")
                .result(showTimeService.getGroupedShowTimesByFilters(
                        provinceId,
                        cinemaId,
                        movieTypeId,
                        releaseFromDate,
                        releaseToDate,
                        startTime,
                        endTime,
                        movieName ,
                        movieId,
                        status,
                        page,
                        size,
                        sortBy,
                        direction
                ))
                .build();
    }

    @GetMapping("/statuses")
    public ApiResponse<ItemListDto<String>> getAllShowTimeStatuses() {
        List<String> statuses = showTimeService.getAllShowTimeStatuses();
        return ApiResponse.<ItemListDto<String>>builder()
                .message("Lấy danh sách trạng thái suất chiếu thành công")
                .result(ItemListDto.<String>builder().items(statuses).build())
                .build();
    }

    
    @GetMapping("/{showTimeId}")
    public ApiResponse<FullShowtimeMovieResponse> getShowTimeById(@PathVariable Integer showTimeId) {
        return ApiResponse.<FullShowtimeMovieResponse>builder()
                .message("Lấy thông tin suất chiếu thành công")
                .result(showTimeService.getShowTimeById(showTimeId))
                .build();
    }

    @GetMapping("/showTimeId-tdv/{showTimeId}")
    public ApiResponse<ShowTimeResponse> getShowTimeById_tdv(@PathVariable Integer showTimeId) {
        return ApiResponse.<ShowTimeResponse>builder()
                .message("Lấy thông tin suất chiếu thành công")
                .result(showTimeService.getShowTimeById_tdv(showTimeId))
                .build();
    }

    @GetMapping("/cinema/{cinemaId}")
    public ApiResponse<PagingDto<FullShowtimeMovieResponse>> getShowTimes(
            @PathVariable Integer cinemaId,
            @RequestParam(defaultValue = "SCHEDULED") ShowTimeStatus status,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(defaultValue = "showtime") String sortBy,
            @RequestParam(defaultValue = "ASC") SortDirection direction
    ) {
        return ApiResponse.<PagingDto<FullShowtimeMovieResponse>>builder()
                .message("Lấy danh sách suất chiếu thành công")
                .result(showTimeService.getShowTimes(cinemaId, status, page, size, sortBy, direction))
                .build();
    }

    @PostMapping
    public ApiResponse<FullShowtimeMovieResponse> createShowTime(@RequestBody @Valid ShowTimeCreationResquest request) {
        return ApiResponse.<FullShowtimeMovieResponse>builder()
                .message("Tạo suất chiếu thành công")
                .result(showTimeService.createShowTime(request))
                .build();
    }

    @PatchMapping("/{showTimeId}")
    public ApiResponse<FullShowtimeMovieResponse> updateShowTime(@PathVariable Integer showTimeId, @RequestBody @Valid ShowTimeUpdateResquest request) {
        return ApiResponse.<FullShowtimeMovieResponse>builder()
                .message("Cập nhật suất chiếu thành công")
                .result(showTimeService.updateShowTime(showTimeId, request))
                .build();
    }

    @DeleteMapping("/{showTimeId}")
    public ApiResponse<Boolean> deleteShowTime(@PathVariable Integer showTimeId) {
        return ApiResponse.<Boolean>builder()
                .result(showTimeService.deleteShowTime(showTimeId))
                .message("Xóa suất chiếu thành công")
                .build();
    }







}
