package com.dev.cinemasystem.service;


import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeCreationRequest;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeResponse;
import com.dev.cinemasystem.dto.seatTypeDTO.SeatTypeUpdateRequest;
import com.dev.cinemasystem.entity.SeatType;
import com.dev.cinemasystem.enums.SeatStatus;
import com.dev.cinemasystem.enums.SeatTypeStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.SeatTypeMapper;
import com.dev.cinemasystem.repository.SeatRepository;
import com.dev.cinemasystem.repository.SeatTypeRepository;
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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatTypeService {

    SeatTypeMapper seatTypeMapper;
    SeatTypeRepository seatTypeRepository;
    SeatRepository seatRepository;

    public SeatTypeResponse getSeatTypeById(Integer seatTypeId) {
        SeatType seatType = seatTypeRepository.findById(seatTypeId)
                .orElseThrow(() -> {
                    log.error("Seat type with id {} not found", seatTypeId);
                    return new AppException(ErrorCode.SEAT_TYPE_NOT_FOUND);
                });

        return seatTypeMapper.toSeatTypeResponse(seatType);
    }

    public SeatTypeResponse createSeatType(SeatTypeCreationRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String normalizedName = request.getSeatTypeName().trim();
        if (seatTypeRepository.existsBySeatTypeNameIgnoreCase(normalizedName)) {
            throw new AppException(ErrorCode.SEAT_TYPE_NAME_EXISTS);
        }

        SeatType seatType = seatTypeMapper.toSeatTypeFromSeatCreationRequest(request);
        seatType.setSeatTypeName(normalizedName);
        seatType.setStatus(request.getStatus() != null ? request.getStatus() : SeatTypeStatus.ACTIVE);

        SeatType savedSeatType = seatTypeRepository.save(seatType);
        return seatTypeMapper.toSeatTypeResponse(savedSeatType);
    }

    public PagingDto<SeatTypeResponse> getAllSeatTypes(SeatTypeStatus status, Integer page, Integer size) {
        return filterSeatTypes(null, null, status != null ? status.name() : null, page, size);
    }

    public PagingDto<SeatTypeResponse> filterSeatTypes(
            Integer seatTypeId,
            String name,
            String status,
            Integer page,
            Integer size
    ) {
        validatePageAndSize(page, size);

        Pageable pageable = PageRequest.of(page - 1, size);
        Specification<SeatType> specification = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (seatTypeId != null) {
                predicates.add(builder.equal(root.get("seatTypeId"), seatTypeId));
            }

            if (name != null && !name.isBlank()) {
                String keyword = "%" + name.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(builder.like(builder.lower(root.get("seatTypeName")), keyword));
            }

            if (status != null && !status.isBlank()) {
                predicates.add(builder.equal(root.get("status"), parseSeatTypeStatus(status)));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };

        Page<SeatType> seatTypePage = seatTypeRepository.findAll(specification, pageable);
        List<SeatTypeResponse> seatTypeResponses = seatTypeMapper.toSeatTypeResponseList(seatTypePage.getContent());

        return PagingDto.<SeatTypeResponse>builder()
                .items(seatTypeResponses)
                .currentPage(seatTypePage.getNumber() + 1)
                .pageSize(seatTypePage.getSize())
                .totalItems(seatTypePage.getTotalElements())
                .totalPages(seatTypePage.getTotalPages())
                .build();
    }

    public SeatTypeResponse updateSeatType(Integer seatTypeId, SeatTypeUpdateRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        SeatType seatType = seatTypeRepository.findById(seatTypeId)
                .orElseThrow(() -> {
                    log.error("Seat type with id {} not found", seatTypeId);
                    return new AppException(ErrorCode.SEAT_TYPE_NOT_FOUND);
                });

        if (request.getSeatTypeName() != null && !request.getSeatTypeName().isBlank()) {
            String normalizedName = request.getSeatTypeName().trim();
            if (seatTypeRepository.existsBySeatTypeNameIgnoreCaseAndSeatTypeIdNot(normalizedName, seatTypeId)) {
                throw new AppException(ErrorCode.SEAT_TYPE_NAME_EXISTS);
            }
            request.setSeatTypeName(normalizedName);
        }

        seatTypeMapper.updateSeatTypeInfo(seatType, request);
        SeatType savedSeatType = seatTypeRepository.save(seatType);
        return seatTypeMapper.toSeatTypeResponse(savedSeatType);
    }

    public boolean deleteSeatType(Integer seatTypeId) {
        SeatType seatType = seatTypeRepository.findById(seatTypeId)
                .orElseThrow(() -> {
                    log.error("Seat type with id {} not found", seatTypeId);
                    return new AppException(ErrorCode.SEAT_TYPE_NOT_FOUND);
                });

        boolean hasActiveSeats = seatRepository.existsBySeatType_SeatTypeIdAndStatus(
                seatTypeId,
                SeatStatus.ACTIVE
        );
        if (hasActiveSeats) {
            throw new AppException(ErrorCode.SEAT_TYPE_HAS_ACTIVE_SEATS);
        }

        seatType.setStatus(SeatTypeStatus.INACTIVE);
        seatTypeRepository.save(seatType);
        return true;
    }

    public List<String> getAllSeatTypeStatuses() {
        return Arrays.stream(SeatTypeStatus.values())
                .map(Enum::name)
                .toList();
    }

    private SeatTypeStatus parseSeatTypeStatus(String value) {
        try {
            return SeatTypeStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
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
}



