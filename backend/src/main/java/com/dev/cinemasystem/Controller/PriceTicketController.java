package com.dev.cinemasystem.Controller;


import com.dev.cinemasystem.Service.PriceTicketService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTicketCreationResquest;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTicketResponse;
import com.dev.cinemasystem.enums.Status;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/price-ticket")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PriceTicketController {
    PriceTicketService priceTicketService;


    @GetMapping("/{priceTicketId}")
    public ApiResponse<PriceTicketResponse> getPriceTicketById(@PathVariable @Valid Integer priceTicketId    ) {
        return ApiResponse.<PriceTicketResponse>builder()
                .message("PriceTicket retrieved successfully")
                .result(priceTicketService.getPriceTicketById(priceTicketId))
                .build();
    }

    @PostMapping
    public ApiResponse<PriceTicketResponse> createPriceTicket(@RequestBody @Valid PriceTicketCreationResquest request) {
        return ApiResponse.<PriceTicketResponse>builder()
                .message("PriceTicket created successfully")
                .result(priceTicketService.createPriceTicket(request))
                .build();
    }

    @PatchMapping("/{priceTicketId}")
    public ApiResponse<PriceTicketResponse> updatePriceTicket(@PathVariable Integer priceTicketId, @RequestBody @Valid PriceTicketCreationResquest request) {
        return ApiResponse.<PriceTicketResponse>builder()
                .message("PriceTicket updated successfully")
                .result(priceTicketService.updatePriceTicket(priceTicketId, request))
                .build();
    }




    @DeleteMapping("/{priceTicketId}")
    public ApiResponse<Boolean> deletePriceTicket(@PathVariable Integer priceTicketId) {
        return ApiResponse.<Boolean>builder()
                .result(priceTicketService.deletePriceTicket(priceTicketId))
                .message("PriceTicket deleted successfully")
                .build();
    }

}
