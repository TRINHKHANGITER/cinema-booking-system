package com.dev.cinemasystem.controller;


import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.ItemListDto;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTickerRequest;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTicketCreationResquest;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTicketResponse;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTicketUpdateResquest;
import com.dev.cinemasystem.enums.PriceTicketStatus;
import com.dev.cinemasystem.service.PriceTicketService;
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

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/price-ticket")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PriceTicketController {
    PriceTicketService priceTicketService;

    @GetMapping("/{priceTicketId}")
    public ApiResponse<PriceTicketResponse> getPriceTicketById(@PathVariable Integer priceTicketId) {
        return ApiResponse.<PriceTicketResponse>builder()
                .message("Láº¥y thÃ´ng tin giÃ¡ vÃ© thÃ nh cÃ´ng")
                .result(priceTicketService.getPriceTicketById(priceTicketId))
                .build();
    }

    @PostMapping
    public ApiResponse<PriceTicketResponse> createPriceTicket(
            @RequestBody @Valid PriceTicketCreationResquest request
    ) {
        return ApiResponse.<PriceTicketResponse>builder()
                .message("Táº¡o giÃ¡ vÃ© thÃ nh cÃ´ng")
                .result(priceTicketService.createPriceTicket(request))
                .build();
    }

    @GetMapping("/all")
    public ApiResponse<PagingDto<PriceTicketResponse>> getAllPriceTickets(
            @RequestParam(required = false) PriceTicketStatus status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PagingDto<PriceTicketResponse>>builder()
                .message("Láº¥y danh sÃ¡ch giÃ¡ vÃ© thÃ nh cÃ´ng")
                .result(priceTicketService.getAllPriceTickets(status, page, size))
                .build();
    }

    @GetMapping("/filter")
    public ApiResponse<PagingDto<PriceTicketResponse>> filterPriceTickets(
            @RequestParam(required = false) Integer priceTicketId,
            @RequestParam(required = false) Integer roomTypeId,
            @RequestParam(required = false) Integer seatTypeId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PagingDto<PriceTicketResponse>>builder()
                .message("Lá»c giÃ¡ vÃ© thÃ nh cÃ´ng")
                .result(priceTicketService.filterPriceTickets(priceTicketId, roomTypeId, seatTypeId, status, page, size))
                .build();
    }

    @GetMapping("/statuses")
    public ApiResponse<ItemListDto<String>> getAllPriceTicketStatuses() {
        List<String> statuses = priceTicketService.getAllPriceTicketStatuses();
        return ApiResponse.<ItemListDto<String>>builder()
                .message("Láº¥y danh sÃ¡ch tráº¡ng thÃ¡i giÃ¡ vÃ© thÃ nh cÃ´ng")
                .result(ItemListDto.<String>builder().items(statuses).build())
                .build();
    }

    @PatchMapping("/{priceTicketId}")
    public ApiResponse<PriceTicketResponse> updatePriceTicket(
            @PathVariable Integer priceTicketId,
            @RequestBody @Valid PriceTicketUpdateResquest request
    ) {
        return ApiResponse.<PriceTicketResponse>builder()
                .message("Cáº­p nháº­t giÃ¡ vÃ© thÃ nh cÃ´ng")
                .result(priceTicketService.updatePriceTicket(priceTicketId, request))
                .build();
    }

    @DeleteMapping("/{priceTicketId}")
    public ApiResponse<Boolean> deletePriceTicket(@PathVariable Integer priceTicketId) {
        return ApiResponse.<Boolean>builder()
                .result(priceTicketService.deletePriceTicket(priceTicketId))
                .message("XÃ³a giÃ¡ vÃ© thÃ nh cÃ´ng")
                .build();
    }

    @GetMapping()
    public ApiResponse<List<PriceTicketResponse>> getPriceTickets() {
        return ApiResponse.<List<PriceTicketResponse>>builder()
                .result(priceTicketService.getPriceTickets())
                .build();
    }

}


