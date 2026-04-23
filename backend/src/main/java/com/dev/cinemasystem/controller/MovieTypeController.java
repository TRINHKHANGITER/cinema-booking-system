package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.ItemListDto;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeCreationRequest;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeResponse;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeUpdateRequest;
import com.dev.cinemasystem.enums.MovieTypeStatus;
import com.dev.cinemasystem.service.MovieTypeService;
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
@RequestMapping("/movie-type")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MovieTypeController {
    MovieTypeService movieTypeService;

    @GetMapping("/{movieTypeId}")
    public ApiResponse<MovieTypeResponse> getMovieTypeById(@PathVariable Integer movieTypeId) {
        return ApiResponse.<MovieTypeResponse>builder()
                .message("Movie type retrieved successfully")
                .result(movieTypeService.getMovieTypeById(movieTypeId))
                .build();
    }

    @PostMapping
    public ApiResponse<MovieTypeResponse> createMovieType(
            @RequestBody @Valid MovieTypeCreationRequest request
    ) {
        return ApiResponse.<MovieTypeResponse>builder()
                .message("Movie type created successfully")
                .result(movieTypeService.createMovieType(request))
                .build();
    }

    @GetMapping("/all")
    public ApiResponse<PagingDto<MovieTypeResponse>> getAllMovieTypes(
            @RequestParam(required = false) MovieTypeStatus status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PagingDto<MovieTypeResponse>>builder()
                .message("Movie types retrieved successfully")
                .result(movieTypeService.getAllMovieTypes(status, page, size))
                .build();
    }

    @GetMapping("/filter")
    public ApiResponse<PagingDto<MovieTypeResponse>> filterMovieTypes(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PagingDto<MovieTypeResponse>>builder()
                .message("Movie types filtered successfully")
                .result(movieTypeService.filterMovieTypes(name, status, page, size))
                .build();
    }

    @GetMapping("/statuses")
    public ApiResponse<ItemListDto<String>> getAllMovieTypeStatuses() {
        List<String> statuses = movieTypeService.getAllMovieTypeStatuses();
        return ApiResponse.<ItemListDto<String>>builder()
                .message("Movie type statuses retrieved successfully")
                .result(ItemListDto.<String>builder().items(statuses).build())
                .build();
    }

    @PatchMapping("/{movieTypeId}")
    public ApiResponse<MovieTypeResponse> updateMovieType(
            @PathVariable Integer movieTypeId,
            @RequestBody @Valid MovieTypeUpdateRequest request
    ) {
        return ApiResponse.<MovieTypeResponse>builder()
                .message("Movie type updated successfully")
                .result(movieTypeService.updateMovieType(movieTypeId, request))
                .build();
    }

    @DeleteMapping("/{movieTypeId}")
    public ApiResponse<Boolean> deleteMovieType(@PathVariable Integer movieTypeId) {
        return ApiResponse.<Boolean>builder()
                .result(movieTypeService.deleteMovieType(movieTypeId))
                .message("Movie type deleted successfully")
                .build();
    }
}

