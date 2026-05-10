package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.ItemListDto;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.movieDTO.MovieCreationResquest;
import com.dev.cinemasystem.dto.movieDTO.MovieResponse;
import com.dev.cinemasystem.dto.movieDTO.MovieUpdateResquest;
import com.dev.cinemasystem.enums.MovieStatus;
import com.dev.cinemasystem.service.MovieService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/movie")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MovieController {
    MovieService movieService;

    @GetMapping("/{movieId}")
    public ApiResponse<MovieResponse> getMovieByIdAndStatus(
            @PathVariable @Valid Integer movieId,
            @RequestParam(required = false) MovieStatus status
    ) {
        return ApiResponse.<MovieResponse>builder()
                .message("Láº¥y thÃ´ng tin phim thÃ nh cÃ´ng")
                .result(movieService.getMovieById(movieId, status))
                .build();
    }

    @GetMapping("/filter")
    public ApiResponse<PagingDto<MovieResponse>> filterMovies(
            @RequestParam(required = false) Integer movieId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer movieTypeId,
            @RequestParam(required = false) MovieStatus status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PagingDto<MovieResponse>>builder()
                .message("Láº¥y danh sÃ¡ch phim thÃ nh cÃ´ng")
                .result(movieService.filterMovies(movieId, name, movieTypeId, status, page, size))
                .build();
    }

    @GetMapping("/statuses")
    public ApiResponse<ItemListDto<String>> getAllMovieStatuses() {
        List<String> statuses = movieService.getAllMovieStatuses();
        return ApiResponse.<ItemListDto<String>>builder()
                .message("Láº¥y danh sÃ¡ch tráº¡ng thÃ¡i phim thÃ nh cÃ´ng")
                .result(ItemListDto.<String>builder().items(statuses).build())
                .build();
    }

    @GetMapping("/all/{cinemaId}")
    public ApiResponse<PagingDto<MovieResponse>> getAllMovies(
            @PathVariable Integer cinemaId,
            @RequestParam(required = false) Integer movieTypeId,
            @RequestParam(required = false) MovieStatus status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PagingDto<MovieResponse>>builder()
                .message("Láº¥y danh sÃ¡ch phim thÃ nh cÃ´ng")
                .result(movieService.getAllmovies(movieTypeId, status, page, size))
                .build();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<MovieResponse> createMovie(@Valid @ModelAttribute MovieCreationResquest request) {
        return ApiResponse.<MovieResponse>builder()
                .message("Táº¡o phim thÃ nh cÃ´ng")
                .result(movieService.createMovie(request))
                .build();
    }

    @PostMapping(value = "/movie", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<MovieResponse> createMovieLegacy(@Valid @ModelAttribute MovieCreationResquest request) {
        return createMovie(request);
    }

    @PatchMapping(value = "/{movieId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<MovieResponse> updateMovie(
            @PathVariable Integer movieId,
            @Valid @ModelAttribute MovieUpdateResquest request
    ) {
        return ApiResponse.<MovieResponse>builder()
                .message("Cáº­p nháº­t phim thÃ nh cÃ´ng")
                .result(movieService.updateMovie(movieId, request))
                .build();
    }

    @DeleteMapping("/{movieId}")
    public ApiResponse<Boolean> deleteMovie(@PathVariable Integer movieId) {
        return ApiResponse.<Boolean>builder()
                .result(movieService.deleteMovie(movieId))
                .message("XÃ³a phim thÃ nh cÃ´ng")
                .build();
    }
}


