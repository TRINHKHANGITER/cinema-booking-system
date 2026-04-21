package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.ticket.TicketCreationRequest;
import com.dev.cinemasystem.dto.ticket.TicketResponse;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.service.TicketService;
import com.dev.cinemasystem.enums.TicketStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ticket")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketController {
    TicketService ticketService;

    @PostMapping
    public ApiResponse<TicketResponse> createTicket(TicketCreationRequest ticketCreationRequest) {
        return ApiResponse.<TicketResponse>builder()
                .result(ticketService.createTicket(ticketCreationRequest))
                .build();
    }

    @GetMapping("/{ticketId}")
    public ApiResponse<TicketResponse> getTicketById(@PathVariable int ticketId) {
        return ApiResponse.<TicketResponse>builder()
                .result(ticketService.getTicketById(ticketId))
                .build();
    }

    @GetMapping()
    public ApiResponse<List<TicketResponse>> getTickets(@RequestParam(required = false)TicketStatus status) {
        return  ApiResponse.<List<TicketResponse>>builder()
                .result(ticketService.getTickets(status))
                .build();
    }
}
