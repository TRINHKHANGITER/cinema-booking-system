package com.dev.cinemasystem.service;


import com.dev.cinemasystem.entity.TicketType;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.TicketTypeMapper;
import com.dev.cinemasystem.repository.TicketTypeRepository;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.ticketTypeDTO.TicketTypeCreationRequest;
import com.dev.cinemasystem.dto.ticketTypeDTO.TicketTypeResponse;
import com.dev.cinemasystem.dto.ticketTypeDTO.TicketTypeUpdateRequest;
import com.dev.cinemasystem.enums.TicketTypeStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketTypeService {

   TicketTypeMapper ticketTypeMapper;

   TicketTypeRepository ticketTypeRepository;




    public TicketTypeResponse getTicketTypeById(Integer ticketTypeId){
        var ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> {
                    log.error("ticket type with id {} not found", ticketTypeId);
                    return new AppException(ErrorCode.TICKET_TYPE_NOT_FOUND);
                });
        log.info("Retrieving ticket type with id: {}", ticketTypeId);
        return ticketTypeMapper.toTicketTypeResponse(ticketType);
    }

    public TicketTypeResponse createTicketType(TicketTypeCreationRequest request){
        if(request == null){
            log.error("ticket type creation request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if(ticketTypeRepository.findByTicketTypeName(request.getTicketTypeName()) != null){
            log.error("ticket type name {} already exists", request.getTicketTypeName());
            throw new AppException(ErrorCode.TICKET_TYPE_NAME_EXISTS);
        }
        var ticketType = ticketTypeMapper.toTicketTypeFromTicketCreationRequest(request);
        ticketType.setStatus(TicketTypeStatus.ACTIVE);
        log.info("Creating ticket type with name: {}", ticketType.getTicketTypeName());
        return ticketTypeMapper.toTicketTypeResponse(ticketTypeRepository.save(ticketType));
    }

    public PagingDto<TicketTypeResponse> getAllTicketTypes( TicketTypeStatus status, Integer page, Integer size){
        if (page < 1) {
            log.error("Invalid page number: {}", page);
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }
        if (size < 1 ) {
            log.error("Invalid page size: {}", size);
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<TicketType> ticketTypePage;
        if(status != null){
            ticketTypePage = ticketTypeRepository.findAllByStatus(status, pageable);
        }else{
            ticketTypePage = ticketTypeRepository.findAll(pageable);
        }

        log.info("Fetching ticket types - page: {}, size: {}", page, size);
        List<TicketTypeResponse> ticketTypeResponses = ticketTypeMapper.toTicketTypeResponseList(ticketTypePage.getContent());
        return  PagingDto.<TicketTypeResponse>builder()
                .items(ticketTypeResponses)
                .currentPage(page)
                .pageSize(size)
                .totalItems(ticketTypePage.getTotalElements())
                .totalPages(ticketTypePage.getTotalPages())
                .build();
    }

    public TicketTypeResponse  updateTicketType(Integer ticketTypeId, TicketTypeUpdateRequest request){
        var ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> {
                    log.error("ticket type with id {} not found", ticketTypeId);
                    return new AppException(ErrorCode.TICKET_TYPE_NOT_FOUND);
                });
        if(request == null){
            log.error("ticket type update request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if(request.getTicketTypeName() != null){
           TicketType tickettype2 = ticketTypeRepository.findByTicketTypeName(request.getTicketTypeName());
            if( tickettype2!= null && tickettype2.getTicketTypeId() != ticketTypeId){
                log.error("ticket type name {} already exists", request.getTicketTypeName());
                throw new AppException(ErrorCode.TICKET_TYPE_NAME_EXISTS);
            }
        }
        log.info("Updating ticket type with id: {}", ticketTypeId);
        ticketTypeMapper.updateTicketTypeInfo(ticketType, request);
        return ticketTypeMapper.toTicketTypeResponse(ticketTypeRepository.save(ticketType));

    }

    public boolean deleteTicketType(Integer ticketTypeId){
        var ticket = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> {
                    log.error("ticketTypeId with id {} not found", ticketTypeId);
                    return new AppException(ErrorCode.TICKET_NOT_FOUND);
                });
        ticket.setStatus(TicketTypeStatus.INACTIVE);
        ticketTypeRepository.save(ticket);
        log.info("Deleted ticket with id: {}", ticketTypeId);
        return true;
    }


}

