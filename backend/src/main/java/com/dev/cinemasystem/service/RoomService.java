package com.dev.cinemasystem.service;


import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.roomDTO.RoomCreationResquest;
import com.dev.cinemasystem.dto.roomDTO.RoomResponse;
import com.dev.cinemasystem.dto.roomDTO.RoomUpdateResquest;
import com.dev.cinemasystem.entity.Room;
import com.dev.cinemasystem.enums.RoomStatus;
import com.dev.cinemasystem.enums.SeatStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.RoomMapper;
import com.dev.cinemasystem.repository.CinemaRepository;
import com.dev.cinemasystem.repository.RoomRepository;
import com.dev.cinemasystem.repository.RoomTypeRepository;
import com.dev.cinemasystem.repository.SeatRepository;
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
public class RoomService {

    RoomRepository roomRepository;
    RoomMapper roomMapper;
    CinemaRepository cinemaRepository;
    RoomTypeRepository roomTypeRepository;
    SeatRepository seatRepository;




    public RoomResponse getRoomById(Integer roomId) {
        var room = roomRepository.findById(roomId)
                .orElseThrow(() -> {
                    log.error("Room with id {} not found", roomId);
                    return new AppException(ErrorCode.ROOM_NOT_FOUND);
                });
        log.info("Retrieving room with id: {}", roomId);
        return roomMapper.toRoomResponse(room);
    }

    public List<RoomResponse> getRooms(Integer cinemaId, RoomStatus status) {
        List<Room> rooms;

        if (cinemaId != null && status != null) {
            rooms = roomRepository.findAllByCinema_CinemaIdAndStatusOrderByRoomNameAsc(cinemaId, status);
        } else if (cinemaId != null) {
            rooms = roomRepository.findAllByCinema_CinemaIdOrderByRoomNameAsc(cinemaId);
        } else if (status != null) {
            rooms = roomRepository.findAllByStatusOrderByRoomNameAsc(status);
        } else {
            rooms = roomRepository.findAllByOrderByRoomNameAsc();
        }

        return roomMapper.toRoomResponseList(rooms);
    }

    public RoomResponse createRoom(RoomCreationResquest request) {
        if (request == null) {
            log.error("Room creation request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        var cinema = cinemaRepository.findById(request.getCinemaId()).orElseThrow(() -> {
            log.error("Cinema with id {} not found", request.getCinemaId());
            return new AppException(ErrorCode.CINEMA_NOT_FOUND);
        });

        var roomType = roomTypeRepository.findById(request.getRoomTypeId()).orElseThrow(() -> {
            log.error("Room type with id {} not found", request.getRoomTypeId());
            return new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND);
        });

        String normalizedRoomName = normalizeRoomName(request.getRoomName());
        var room = roomMapper.toRoomFromRoomCreationRequest(request);
        room.setRoomName(normalizedRoomName);
        room.setCinema(cinema);
        room.setRoomType(roomType);
        room.setStatus(request.getStatus() != null ? request.getStatus() : RoomStatus.ACTIVE);

        log.info("Creating room with name: {}", room.getRoomName());
        return roomMapper.toRoomResponse(roomRepository.save(room));
    }

    public PagingDto<RoomResponse> filterRooms(
            Integer roomId,
            Integer provinceId,
            Integer cinemaId,
            Integer roomTypeId,
            String name,
            RoomStatus status,
            Integer page,
            Integer size
    ) {
        if (page < 1) {
            log.error("Invalid page number: {}", page);
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }

        if (size < 1 || size > 100) {
            log.error("Invalid page size: {}", size);
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }

        Pageable pageable = PageRequest.of(page - 1, size);

        Specification<Room> specification = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (roomId != null) {
                predicates.add(builder.equal(root.get("roomId"), roomId));
            }

            if (provinceId != null) {
                predicates.add(builder.equal(root.get("cinema").get("province").get("provinceId"), provinceId));
            }

            if (cinemaId != null) {
                predicates.add(builder.equal(root.get("cinema").get("cinemaId"), cinemaId));
            }

            if (roomTypeId != null) {
                predicates.add(builder.equal(root.get("roomType").get("roomTypeId"), roomTypeId));
            }

            if (name != null && !name.isBlank()) {
                String keyword = "%" + name.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(builder.like(builder.lower(root.get("roomName")), keyword));
            }

            if (status != null) {
                predicates.add(builder.equal(root.get("status"), status));
            }

            if (query != null) {
                query.orderBy(builder.asc(builder.lower(root.get("roomName"))));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };

        Page<Room> roomPage = roomRepository.findAll(specification, pageable);

        log.info("Fetching rooms - page: {}, size: {}", page, size);
        List<RoomResponse> roomResponses = roomMapper.toRoomResponseList(roomPage.getContent());
        return PagingDto.<RoomResponse>builder()
                .items(roomResponses)
                .currentPage(roomPage.getNumber() + 1)
                .pageSize(roomPage.getSize())
                .totalItems(roomPage.getTotalElements())
                .totalPages(roomPage.getTotalPages())
                .build();
    }

    public RoomResponse updateRoom(Integer roomId, RoomUpdateResquest request) {
        if (request == null) {
            log.error("Room update request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        var room = roomRepository.findById(roomId)
                .orElseThrow(() -> {
                    log.error("Room with id {} not found", roomId);
                    return new AppException(ErrorCode.ROOM_NOT_FOUND);
                });

        if (request.getRoomName() != null) {
            request.setRoomName(normalizeRoomName(request.getRoomName()));
        }

        roomMapper.updateRoomInfo(room, request);

        if (request.getCinemaId() != null) {
            var cinema = cinemaRepository.findById(request.getCinemaId()).orElseThrow(() -> {
                log.error("Cinema with id {} not found", request.getCinemaId());
                return new AppException(ErrorCode.CINEMA_NOT_FOUND);
            });
            room.setCinema(cinema);
        }

        if (request.getRoomTypeId() != null) {
            var roomType = roomTypeRepository.findById(request.getRoomTypeId()).orElseThrow(() -> {
                log.error("Room type with id {} not found", request.getRoomTypeId());
                return new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND);
            });
            room.setRoomType(roomType);
        }

        log.info("Updating room with id: {}", roomId);
        return roomMapper.toRoomResponse(roomRepository.save(room));
    }

    public boolean deleteRoom(Integer roomId) {
        var room = roomRepository.findById(roomId)
                .orElseThrow(() -> {
                    log.error("Room with id {} not found", roomId);
                    return new AppException(ErrorCode.ROOM_NOT_FOUND);
                });

        boolean hasActiveSeats = seatRepository.existsByRoom_RoomIdAndStatus(roomId, SeatStatus.ACTIVE);
        if (hasActiveSeats) {
            throw new AppException(ErrorCode.ROOM_HAS_ACTIVE_SEATS);
        }

        room.setStatus(RoomStatus.INACTIVE);
        roomRepository.save(room);
        log.info("Deleted room with id: {}", roomId);
        return true;
    }

    public List<String> getAllRoomStatuses() {
        return Arrays.stream(RoomStatus.values())
                .map(Enum::name)
                .toList();
    }

    private String normalizeRoomName(String roomName) {
        if (roomName == null || roomName.isBlank()) {
            throw new AppException(ErrorCode.ROOM_NAME_BLANK);
        }
        return roomName.trim();
    }

}



