package com.dev.cinemasystem.service;


import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.roomTypeDTO.RoomTypeCreationRequest;
import com.dev.cinemasystem.dto.roomTypeDTO.RoomTypeResponse;
import com.dev.cinemasystem.dto.roomTypeDTO.RoomTypeUpdateRequest;
import com.dev.cinemasystem.entity.RoomType;
import com.dev.cinemasystem.enums.RoomStatus;
import com.dev.cinemasystem.enums.RoomTypeStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.RoomTypeMapper;
import com.dev.cinemasystem.repository.RoomRepository;
import com.dev.cinemasystem.repository.RoomTypeRepository;
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
public class RoomTypeService {

    RoomTypeMapper roomTypeMapper;
    RoomTypeRepository roomTypeRepository;
    RoomRepository roomRepository;

    public RoomTypeResponse getRoomTypeById(Integer roomTypeId) {
        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> {
                    log.error("Room type with id {} not found", roomTypeId);
                    return new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND);
                });

        return roomTypeMapper.toRoomTypeResponse(roomType);
    }

    public RoomTypeResponse createRoomType(RoomTypeCreationRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String normalizedName = request.getRoomTypeName().trim();
        if (roomTypeRepository.existsByRoomTypeNameIgnoreCase(normalizedName)) {
            throw new AppException(ErrorCode.ROOM_TYPE_NAME_EXISTS);
        }

        RoomType roomType = roomTypeMapper.toRoomTypeFromRoomCreationRequest(request);
        roomType.setRoomTypeName(normalizedName);
        roomType.setStatus(request.getStatus() != null ? request.getStatus() : RoomTypeStatus.ACTIVE);

        RoomType savedRoomType = roomTypeRepository.save(roomType);
        return roomTypeMapper.toRoomTypeResponse(savedRoomType);
    }

    public PagingDto<RoomTypeResponse> getAllRoomTypes(RoomTypeStatus status, Integer page, Integer size) {
        return filterRoomTypes(null, status != null ? status.name() : null, page, size);
    }

    public PagingDto<RoomTypeResponse> filterRoomTypes(
            String name,
            String status,
            Integer page,
            Integer size
    ) {
        validatePageAndSize(page, size);

        Pageable pageable = PageRequest.of(page - 1, size);
        Specification<RoomType> specification = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (name != null && !name.isBlank()) {
                String keyword = "%" + name.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(builder.like(builder.lower(root.get("roomTypeName")), keyword));
            }

            if (status != null && !status.isBlank()) {
                predicates.add(builder.equal(root.get("status"), parseRoomTypeStatus(status)));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };

        Page<RoomType> roomTypePage = roomTypeRepository.findAll(specification, pageable);
        List<RoomTypeResponse> roomTypeResponses = roomTypeMapper.toRoomTypeResponseList(roomTypePage.getContent());

        return PagingDto.<RoomTypeResponse>builder()
                .items(roomTypeResponses)
                .currentPage(roomTypePage.getNumber() + 1)
                .pageSize(roomTypePage.getSize())
                .totalItems(roomTypePage.getTotalElements())
                .totalPages(roomTypePage.getTotalPages())
                .build();
    }

    public RoomTypeResponse updateRoomType(Integer roomTypeId, RoomTypeUpdateRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> {
                    log.error("Room type with id {} not found", roomTypeId);
                    return new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND);
                });

        if (request.getRoomTypeName() != null && !request.getRoomTypeName().isBlank()) {
            String normalizedName = request.getRoomTypeName().trim();
            if (roomTypeRepository.existsByRoomTypeNameIgnoreCaseAndRoomTypeIdNot(normalizedName, roomTypeId)) {
                throw new AppException(ErrorCode.ROOM_TYPE_NAME_EXISTS);
            }
            request.setRoomTypeName(normalizedName);
        }

        roomTypeMapper.updateRoomTypeInfo(roomType, request);
        RoomType savedRoomType = roomTypeRepository.save(roomType);
        return roomTypeMapper.toRoomTypeResponse(savedRoomType);
    }

    public boolean deleteRoomType(Integer roomTypeId) {
        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> {
                    log.error("Room type with id {} not found", roomTypeId);
                    return new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND);
                });

        boolean hasActiveRooms = roomRepository.existsByRoomType_RoomTypeIdAndStatus(
                roomTypeId,
                RoomStatus.ACTIVE
        );
        if (hasActiveRooms) {
            throw new AppException(ErrorCode.ROOM_TYPE_HAS_ACTIVE_ROOMS);
        }

        roomType.setStatus(RoomTypeStatus.INACTIVE);
        roomTypeRepository.save(roomType);
        return true;
    }

    public List<String> getAllRoomTypeStatuses() {
        return Arrays.stream(RoomTypeStatus.values())
                .map(Enum::name)
                .toList();
    }

    private RoomTypeStatus parseRoomTypeStatus(String value) {
        try {
            return RoomTypeStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
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
