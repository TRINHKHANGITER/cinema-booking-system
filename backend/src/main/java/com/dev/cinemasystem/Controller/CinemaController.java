package com.dev.cinemasystem.Controller;


import com.dev.cinemasystem.Entity.Cinema;
import com.dev.cinemasystem.Service.CinemaService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaCreationRequest;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaResponse;
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
//
//    @PostMapping
//    public ApiResponse<CinemaResponse> createCinema(@RequestBody Cinema cinema) {
//        Cinema createdCinema = cinemaService.createCinema(cinema);
//        return ResponseEntity.status(HttpStatus.CREATED).body(createdCinema);
//    }

    @GetMapping("/{cinemaId}")
    public ApiResponse<CinemaResponse> getCinemaById( @PathVariable Integer cinemaId    ){
        return ApiResponse.<CinemaResponse>builder()
                .message("Cinema retrieved successfully")
                .result( cinemaService.getCinemaById(cinemaId) )
                .build();
    }

    @PostMapping()
    public ApiResponse<CinemaResponse> createCinema(@RequestBody CinemaCreationRequest request) {
        return ApiResponse.<CinemaResponse>builder()
                .message("Cinema created successfully")
                .result(cinemaService.createCinema(request))
                .build();
    }

}
