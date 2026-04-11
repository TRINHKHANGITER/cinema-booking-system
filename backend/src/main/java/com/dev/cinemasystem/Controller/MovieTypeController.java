package com.dev.cinemasystem.Controller;


import com.dev.cinemasystem.Service.MovieTypeService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeCreationRequest;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeResponse;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeUpdateRequest;
import com.dev.cinemasystem.enums.MovieTypeStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/movie-type")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MovieTypeController {
    MovieTypeService movieTypeService;


    @GetMapping("/{movieTypeId}")
    public ApiResponse<MovieTypeResponse> getMovieTypeById(@PathVariable Integer movieTypeId    ) {
        return ApiResponse.<MovieTypeResponse>builder()
                .message("Movie retrieved successfully")
                .result(movieTypeService.getMovieTypeById(movieTypeId))
                .build();
    }

    @PostMapping
    public ApiResponse<MovieTypeResponse> createMovie(@RequestBody MovieTypeCreationRequest request) {
        return ApiResponse.<MovieTypeResponse>builder()
                .message("Movie created successfully")
                .result(movieTypeService.createMovieType(request))
                .build();
    }

    @GetMapping("/all")
    public ApiResponse<PagingDto<MovieTypeResponse>> getAllMovies(
            @RequestParam (required = false)MovieTypeStatus status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size

    ) {
        return ApiResponse.<PagingDto<MovieTypeResponse>>builder()
                .message("Movies retrieved successfully")
                .result(movieTypeService.getAllMovieTypes(status,page, size))
                .build();
    }

    @PatchMapping("/{movieTypeId}")
    public ApiResponse<MovieTypeResponse> updateMovie(@PathVariable Integer movieTypeId, @RequestBody MovieTypeUpdateRequest request) {
        return ApiResponse.<MovieTypeResponse>builder()
                .message("Movie updated successfully")
                .result(movieTypeService.updateMovieType(movieTypeId, request))
                .build();
    }




    @DeleteMapping("/{movieTypeId}")
    public ApiResponse<Boolean> deleteMovie(@PathVariable Integer movieTypeId) {
        return ApiResponse.<Boolean>builder()
                .result(movieTypeService.deleteMovieType(movieTypeId))
                .message("Movie deleted successfully")
                .build();
    }

}

