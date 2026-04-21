package com.dev.cinemasystem.controller;


import com.dev.cinemasystem.service.MovieService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.movieDTO.MovieCreationResquest;
import com.dev.cinemasystem.dto.movieDTO.MovieResponse;
import com.dev.cinemasystem.dto.movieDTO.MovieUpdateResquest;
import com.dev.cinemasystem.enums.MovieStatus;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;


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
                @RequestParam (defaultValue = "ACTIVE") MovieStatus  status
        
        ) {
        return ApiResponse.<MovieResponse>builder()
                .message("Movie retrieved successfully")
                .result(movieService.getMovieById(movieId, status))
                .build();
    }


    @PostMapping(value = "/movie", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<MovieResponse> createMovie(@Valid @ModelAttribute MovieCreationResquest request) {
        return ApiResponse.<MovieResponse>builder()
                .message("Movie created successfully")
                .result(movieService.createMovie(request))
                .build();
    }

    @GetMapping("/all/{cinemaId}")
    public ApiResponse<PagingDto<MovieResponse>> getAllMovies(
            @RequestParam (required = false) Integer cinemaId,
            @RequestParam (required = false) Integer movieTypeId,
            @RequestParam (required = false)MovieStatus status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size

    ) {
        return ApiResponse.<PagingDto<MovieResponse>>builder()
                .message("Movies retrieved successfully")
                .result(movieService.getAllmovies( movieTypeId, status,page, size))
                .build();
    }

    @PatchMapping(value = "/{movieId}",  consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<MovieResponse> updateMovie(@PathVariable Integer movieId,
                                                  @Valid @ModelAttribute MovieUpdateResquest request) {
        return ApiResponse.<MovieResponse>builder()
                .message("Movie updated successfully")
                .result(movieService.updateMovie(movieId, request))
                .build();
    }




    @DeleteMapping("/{movieId}")
    public ApiResponse<Boolean> deleteMovie(@PathVariable Integer movieId) {
        return ApiResponse.<Boolean>builder()
                .result(movieService.deleteMovie(movieId))
                .message("Movie deleted successfully")
                .build();
    }

}

