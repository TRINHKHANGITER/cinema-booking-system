package com.dev.cinemasystem.Controller;

import com.dev.cinemasystem.Service.CinemaService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaCreationRequest;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaResponse;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaUpdateRequest;
import com.dev.cinemasystem.enums.CinemaStatus;
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
                .message("Cinemas retrieved successfully")
                .result(cinemaService.getCinemas(provinceId, isShowing, status))
                .build();
    }

    @GetMapping("/{cinemaId}")
    public ApiResponse<CinemaResponse> getCinemaById(@PathVariable Integer cinemaId) {
        return ApiResponse.<CinemaResponse>builder()
                .message("Cinema retrieved successfully")
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
                .message("Cinemas retrieved successfully")
                .result(cinemaService.getAllCinemas(provinceId, status, page, size))
                .build();
    }

    @PostMapping
    public ApiResponse<CinemaResponse> createCinema(@RequestBody CinemaCreationRequest request) {
        return ApiResponse.<CinemaResponse>builder()
                .message("Cinema created successfully")
                .result(cinemaService.createCinema(request))
                .build();
    }

    @PatchMapping("/{cinemaId}")
    public ApiResponse<CinemaResponse> updateCinema(@PathVariable Integer cinemaId, @RequestBody CinemaUpdateRequest request) {
        return ApiResponse.<CinemaResponse>builder()
                .message("Cinema updated successfully")
                .result(cinemaService.updateCinema(cinemaId, request))
                .build();
    }

    @DeleteMapping("/{cinemaId}")
    public ApiResponse<Boolean> deleteCinemaById(@PathVariable Integer cinemaId) {
        return ApiResponse.<Boolean>builder()
                .message("Cinema deleted successfully")
                .result(cinemaService.deleteCinemaById(cinemaId))
                .build();
    }
}

