package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.service.CinemaService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.ItemListDto;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaCreationRequest;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaResponse;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaUpdateRequest;
import com.dev.cinemasystem.enums.CinemaStatus;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cinema")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CinemaController {
    CinemaService cinemaService;

    @GetMapping
    public ApiResponse<List<CinemaResponse>> getCinemas(
            @RequestParam(required = false) Integer provinceId,
            @RequestParam(required = false) Boolean isShowing,
            @RequestParam(required = false) CinemaStatus status
    ) {
        return ApiResponse.<List<CinemaResponse>>builder()
                .message("Lấy danh sách rạp thành công")
                .result(cinemaService.getCinemas(provinceId, isShowing, status))
                .build();
    }

    @GetMapping("/item-list")
    public ApiResponse<ItemListDto<CinemaResponse>> getCinemasAsItemList(
            @RequestParam(required = false) Integer provinceId,
            @RequestParam(required = false) CinemaStatus status
    ) {
        return ApiResponse.<ItemListDto<CinemaResponse>>builder()
                .message("Lấy danh sách rạp thành công")
                .result(ItemListDto.<CinemaResponse>builder()
                        .items(cinemaService.getCinemas(provinceId, false, status))
                        .build())
                .build();
    }

    @GetMapping("/{cinemaId}")
    public ApiResponse<CinemaResponse> getCinemaById(@PathVariable Integer cinemaId) {
        return ApiResponse.<CinemaResponse>builder()
                .message("Lấy thông tin rạp thành công")
                .result(cinemaService.getCinemaById(cinemaId))
                .build();
    }

    @GetMapping("/all")
    public ApiResponse<PagingDto<CinemaResponse>> getAllCinemas(
            @RequestParam(required = false) Integer provinceId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) CinemaStatus status
    ) {
        return ApiResponse.<PagingDto<CinemaResponse>>builder()
                .message("Lấy danh sách rạp thành công")
                .result(cinemaService.getAllCinemas(provinceId, status, page, size))
                .build();
    }

    @GetMapping("/filter")
    public ApiResponse<PagingDto<CinemaResponse>> filterCinemas(
            @RequestParam(required = false) Integer cinemaId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer provinceId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PagingDto<CinemaResponse>>builder()
                .message("Lọc rạp thành công")
                .result(cinemaService.filterCinemas(cinemaId, name, provinceId, status, page, size))
                .build();
    }

    @GetMapping("/statuses")
    public ApiResponse<ItemListDto<String>> getAllCinemaStatuses() {
        List<String> statuses = cinemaService.getAllCinemaStatuses();
        return ApiResponse.<ItemListDto<String>>builder()
                .message("Lấy danh sách trạng thái rạp thành công")
                .result(ItemListDto.<String>builder().items(statuses).build())
                .build();
    }

    @PostMapping
    public ApiResponse<CinemaResponse> createCinema(@RequestBody @Valid CinemaCreationRequest request) {
        return ApiResponse.<CinemaResponse>builder()
                .message("Tạo rạp thành công")
                .result(cinemaService.createCinema(request))
                .build();
    }

    @PatchMapping("/{cinemaId}")
    public ApiResponse<CinemaResponse> updateCinema(
            @PathVariable Integer cinemaId,
            @RequestBody @Valid CinemaUpdateRequest request
    ) {
        return ApiResponse.<CinemaResponse>builder()
                .message("Cập nhật rạp thành công")
                .result(cinemaService.updateCinema(cinemaId, request))
                .build();
    }

    @DeleteMapping("/{cinemaId}")
    public ApiResponse<Boolean> deleteCinemaById(@PathVariable Integer cinemaId) {
        return ApiResponse.<Boolean>builder()
                .message("Xóa rạp thành công")
                .result(cinemaService.deleteCinemaById(cinemaId))
                .build();
    }
}


