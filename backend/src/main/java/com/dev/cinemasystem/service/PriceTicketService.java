package com.dev.cinemasystem.service;


import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTickerRequest;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTicketCreationResquest;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTicketResponse;
import com.dev.cinemasystem.dto.priceTicketDTO.PriceTicketUpdateResquest;
import com.dev.cinemasystem.entity.PriceTicket;
import com.dev.cinemasystem.enums.PriceTicketStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.PriceTicketMapper;
import com.dev.cinemasystem.repository.PriceTicketRepository;
import com.dev.cinemasystem.repository.RoomTypeRepository;
import com.dev.cinemasystem.repository.SeatTypeRepository;
import com.dev.cinemasystem.repository.TicketRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PriceTicketService {

    PriceTicketRepository priceTicketRepository;
    RoomTypeRepository roomTypeRepository;
    SeatTypeRepository seatTypeRepository;
    TicketRepository ticketRepository;
    PriceTicketMapper priceTicketMapper;

    public PriceTicketResponse getPriceTicketById(Integer priceTicketId) {
        PriceTicket priceTicket = priceTicketRepository.findById(priceTicketId)
                .orElseThrow(() -> {
                    log.error("PriceTicket with id {} not found", priceTicketId);
                    return new AppException(ErrorCode.PRICE_TICKET_NOT_FOUND);
                });

        return priceTicketMapper.toPriceTicketResponse(priceTicket);
    }

    public PriceTicketResponse createPriceTicket(PriceTicketCreationResquest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        var roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND));

        var seatType = seatTypeRepository.findById(request.getSeatTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.SEAT_TYPE_NOT_FOUND));

        if (priceTicketRepository.findByRoomType_RoomTypeIdAndSeatType_SeatTypeId(
                request.getRoomTypeId(),
                request.getSeatTypeId()
        ) != null) {
            throw new AppException(ErrorCode.PRICE_TICKET_EXISTS);
        }

        PriceTicket priceTicket = priceTicketMapper.toPriceTicketFromPriceTicketCreationRequest(request);
        priceTicket.setRoomType(roomType);
        priceTicket.setSeatType(seatType);
        priceTicket.setStatus(request.getStatus() != null ? request.getStatus() : PriceTicketStatus.ACTIVE);

        PriceTicket savedPriceTicket = priceTicketRepository.save(priceTicket);
        return priceTicketMapper.toPriceTicketResponse(savedPriceTicket);
    }

    public PagingDto<PriceTicketResponse> getAllPriceTickets(
            PriceTicketStatus status,
            Integer page,
            Integer size
    ) {
        return filterPriceTickets(null, null, status != null ? status.name() : null, page, size);
    }

    public PagingDto<PriceTicketResponse> filterPriceTickets(
            Integer roomTypeId,
            Integer seatTypeId,
            String status,
            Integer page,
            Integer size
    ) {
        validatePageAndSize(page, size);

        Pageable pageable = PageRequest.of(page - 1, size);
        Specification<PriceTicket> specification = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (roomTypeId != null) {
                predicates.add(builder.equal(root.get("roomType").get("roomTypeId"), roomTypeId));
            }

            if (seatTypeId != null) {
                predicates.add(builder.equal(root.get("seatType").get("seatTypeId"), seatTypeId));
            }

            if (status != null && !status.isBlank()) {
                predicates.add(builder.equal(root.get("status"), parsePriceTicketStatus(status)));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };

        Page<PriceTicket> priceTicketPage = priceTicketRepository.findAll(specification, pageable);
        List<PriceTicketResponse> responses = priceTicketMapper.toPriceTicketResponseList(priceTicketPage.getContent());

        return PagingDto.<PriceTicketResponse>builder()
                .items(responses)
                .currentPage(priceTicketPage.getNumber() + 1)
                .pageSize(priceTicketPage.getSize())
                .totalItems(priceTicketPage.getTotalElements())
                .totalPages(priceTicketPage.getTotalPages())
                .build();
    }

    public PriceTicketResponse updatePriceTicket(Integer priceTicketId, PriceTicketUpdateResquest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        PriceTicket priceTicket = priceTicketRepository.findById(priceTicketId)
                .orElseThrow(() -> {
                    log.error("PriceTicket with id {} not found", priceTicketId);
                    return new AppException(ErrorCode.PRICE_TICKET_NOT_FOUND);
                });

        Integer targetRoomTypeId = request.getRoomTypeId() != null
                ? request.getRoomTypeId()
                : priceTicket.getRoomType().getRoomTypeId();
        Integer targetSeatTypeId = request.getSeatTypeId() != null
                ? request.getSeatTypeId()
                : priceTicket.getSeatType().getSeatTypeId();

        PriceTicket existingPriceTicket = priceTicketRepository.findByRoomType_RoomTypeIdAndSeatType_SeatTypeId(
                targetRoomTypeId,
                targetSeatTypeId
        );
        if (existingPriceTicket != null && !existingPriceTicket.getPriceTicketId().equals(priceTicketId)) {
            throw new AppException(ErrorCode.PRICE_TICKET_EXISTS);
        }

        if (request.getRoomTypeId() != null) {
            var roomType = roomTypeRepository.findById(request.getRoomTypeId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND));
            priceTicket.setRoomType(roomType);
        }

        if (request.getSeatTypeId() != null) {
            var seatType = seatTypeRepository.findById(request.getSeatTypeId())
                    .orElseThrow(() -> new AppException(ErrorCode.SEAT_TYPE_NOT_FOUND));
            priceTicket.setSeatType(seatType);
        }

        priceTicketMapper.updatePriceTicketInfo(priceTicket, request);

        PriceTicket savedPriceTicket = priceTicketRepository.save(priceTicket);
        return priceTicketMapper.toPriceTicketResponse(savedPriceTicket);
    }

    public boolean deletePriceTicket(Integer priceTicketId) {
        PriceTicket priceTicket = priceTicketRepository.findById(priceTicketId)
                .orElseThrow(() -> {
                    log.error("PriceTicket with id {} not found", priceTicketId);
                    return new AppException(ErrorCode.PRICE_TICKET_NOT_FOUND);
                });

        if (ticketRepository.existsByPriceTicket_PriceTicketId(priceTicketId)) {
            throw new AppException(ErrorCode.PRICE_TICKET_HAS_ACTIVE_TICKETS);
        }

        priceTicket.setStatus(PriceTicketStatus.INACTIVE);
        priceTicketRepository.save(priceTicket);
        return true;
    }

    public List<String> getAllPriceTicketStatuses() {
        return Arrays.stream(PriceTicketStatus.values())
                .map(Enum::name)
                .toList();
    }

    public BigDecimal getPriceByRoomTypeIdAndSeatTypeId(PriceTickerRequest request) {
        PriceTicket ticket = priceTicketRepository.findByRoomType_RoomTypeIdAndSeatType_SeatTypeId(
                request.getRoomTypeId(), request.getSeatTypeId()
        );

        if (ticket == null) {
            throw new AppException(ErrorCode.PRICE_TICKET_NOT_FOUND);
        }

        return ticket.getPrice();
    }

    private PriceTicketStatus parsePriceTicketStatus(String value) {
        try {
            return PriceTicketStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private void validatePageAndSize(Integer page, Integer size) {
        if (page == null || page < 1) {
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }

        if (size == null || size < 1 || size > 100) {
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }
    }

    public List<PriceTicketResponse> getPriceTickets() {
        return priceTicketRepository.findAll().stream().map(
                priceTicketMapper::toPriceTicketResponse).toList();
    }
}
