package com.dev.cinemasystem.Controller;


import com.dev.cinemasystem.Entity.Cinema;
import com.dev.cinemasystem.Service.CinemaService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaCreationRequest;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaResponse;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaUpdateRequest;
import com.dev.cinemasystem.enums.Status;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cinema")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CinemaController {
    CinemaService cinemaService;



    @GetMapping("/{cinemaId}")
    public ApiResponse<CinemaResponse> getCinemaById( @PathVariable Integer cinemaId    ){
        return ApiResponse.<CinemaResponse>builder()
                .message("Cinema retrieved successfully")
                .result( cinemaService.getCinemaById(cinemaId) )
                .build();
    }

    @GetMapping("all/{cinemaId}")
    public ApiResponse<PagingDto<CinemaResponse>> getCinemaWithAllDetailsById(
            @RequestParam (required = false) Integer cinemaId  ,
            @RequestParam (defaultValue = "1") Integer page,
            @RequestParam (defaultValue = "10") Integer size,
            @RequestParam (defaultValue = "ACTIVE") Status status
    ){
        return ApiResponse.<PagingDto<CinemaResponse>>builder()
                .message("Cinema with all details retrieved successfully")
                .result( cinemaService.getAllCinemas(cinemaId, status, page, size) )
                .build();
    }

    @PostMapping()
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
        cinemaService.deleteCinemaById(cinemaId);
        return ApiResponse.<Boolean>builder()
                .message("Cinema deleted successfully")
                .build();
    }





}
