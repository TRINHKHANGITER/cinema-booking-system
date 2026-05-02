package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.ticket.TicketCreationRequest;
import com.dev.cinemasystem.dto.ticket.TicketResponse;
import com.dev.cinemasystem.dto.ticket.TicketStatusUpdateRequest;
import com.dev.cinemasystem.service.TicketService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/ticket")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketController {
    TicketService ticketService;

    @PostMapping
    public ApiResponse<TicketResponse> createTicket(@RequestBody TicketCreationRequest ticketCreationRequest) {
        return ApiResponse.<TicketResponse>builder()
                .result(ticketService.createTicket(ticketCreationRequest))
                .build();
    }

    @PatchMapping("/{ticketId}/status")
    public ApiResponse<TicketResponse> updateTicketStatus(
            @PathVariable Integer ticketId,
            @RequestBody @Valid TicketStatusUpdateRequest request
    ) {
        return ApiResponse.<TicketResponse>builder()
                .message("Cap nhat trang thai ve thanh cong")
                .result(ticketService.updateTicketStatus(ticketId, request.getStatus()))
                .build();
    }

    @GetMapping("/{ticketId}")
    public ApiResponse<TicketResponse> getTicketById(@PathVariable int ticketId) {
        return ApiResponse.<TicketResponse>builder()
                .result(ticketService.getTicketById(ticketId))
                .build();
    }

    @GetMapping
    public ApiResponse<List<TicketResponse>> getTickets() {
        return ApiResponse.<List<TicketResponse>>builder()
                .result(ticketService.getTickets())
                .build();
    }
}
