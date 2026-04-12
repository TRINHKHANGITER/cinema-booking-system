package com.dev.cinemasystem.Controller;


import com.dev.cinemasystem.Service.TicketTypeService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.ticketTypeDTO.TicketTypeCreationRequest;
import com.dev.cinemasystem.dto.ticketTypeDTO.TicketTypeResponse;
import com.dev.cinemasystem.dto.ticketTypeDTO.TicketTypeUpdateRequest;
import com.dev.cinemasystem.enums.TicketTypeStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/ticket-type")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketTypeController {
    TicketTypeService ticketTypeService;


    @GetMapping("/{ticketTypeId}")
    public ApiResponse<TicketTypeResponse> getTicketTypeById(@PathVariable Integer ticketTypeId    ) {
        return ApiResponse.<TicketTypeResponse>builder()
                .message("Ticket retrieved successfully")
                .result(ticketTypeService.getTicketTypeById(ticketTypeId))
                .build();
    }

    @PostMapping
    public ApiResponse<TicketTypeResponse> createTicket(@RequestBody TicketTypeCreationRequest request) {
        return ApiResponse.<TicketTypeResponse>builder()
                .message("Ticket created successfully")
                .result(ticketTypeService.createTicketType(request))
                .build();
    }

    @GetMapping("/all")
    public ApiResponse<PagingDto<TicketTypeResponse>> getAllTickets(
            @RequestParam (required = false)TicketTypeStatus status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size

    ) {
        return ApiResponse.<PagingDto<TicketTypeResponse>>builder()
                .message("Tickets retrieved successfully")
                .result(ticketTypeService.getAllTicketTypes(status,page, size))
                .build();
    }

    @PatchMapping("/{ticketTypeId}")
    public ApiResponse<TicketTypeResponse> updateTicket(@PathVariable Integer ticketTypeId, @RequestBody TicketTypeUpdateRequest request) {
        return ApiResponse.<TicketTypeResponse>builder()
                .message("Ticket updated successfully")
                .result(ticketTypeService.updateTicketType(ticketTypeId, request))
                .build();
    }




    @DeleteMapping("/{ticketTypeId}")
    public ApiResponse<Boolean> deleteTicket(@PathVariable Integer ticketTypeId) {
        return ApiResponse.<Boolean>builder()
                .result(ticketTypeService.deleteTicketType(ticketTypeId))
                .message("Ticket deleted successfully")
                .build();
    }

}

