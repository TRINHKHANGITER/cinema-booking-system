package com.dev.cinemasystem.controller;


import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.ItemListDto;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.roomTypeDTO.RoomTypeCreationRequest;
import com.dev.cinemasystem.dto.roomTypeDTO.RoomTypeResponse;
import com.dev.cinemasystem.dto.roomTypeDTO.RoomTypeUpdateRequest;
import com.dev.cinemasystem.enums.RoomTypeStatus;
import com.dev.cinemasystem.service.RoomTypeService;
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

import java.util.List;

@RestController
@RequestMapping("/room-type")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomTypeController {
    RoomTypeService roomTypeService;


    @GetMapping("/{roomTypeId}")
    public ApiResponse<RoomTypeResponse> getRoomTypeById(@PathVariable Integer roomTypeId) {
        return ApiResponse.<RoomTypeResponse>builder()
                .message("Room type retrieved successfully")
                .result(roomTypeService.getRoomTypeById(roomTypeId))
                .build();
    }

    @PostMapping
    public ApiResponse<RoomTypeResponse> createRoomType(@RequestBody @Valid RoomTypeCreationRequest request) {
        return ApiResponse.<RoomTypeResponse>builder()
                .message("Room type created successfully")
                .result(roomTypeService.createRoomType(request))
                .build();
    }

    @GetMapping("/all")
    public ApiResponse<PagingDto<RoomTypeResponse>> getAllRoomTypes(
            @RequestParam(required = false) RoomTypeStatus status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PagingDto<RoomTypeResponse>>builder()
                .message("Room types retrieved successfully")
                .result(roomTypeService.getAllRoomTypes(status, page, size))
                .build();
    }

    @GetMapping("/filter")
    public ApiResponse<PagingDto<RoomTypeResponse>> filterRoomTypes(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PagingDto<RoomTypeResponse>>builder()
                .message("Room types filtered successfully")
                .result(roomTypeService.filterRoomTypes(name, status, page, size))
                .build();
    }

    @GetMapping("/statuses")
    public ApiResponse<ItemListDto<String>> getAllRoomTypeStatuses() {
        List<String> statuses = roomTypeService.getAllRoomTypeStatuses();
        return ApiResponse.<ItemListDto<String>>builder()
                .message("Room type statuses retrieved successfully")
                .result(ItemListDto.<String>builder().items(statuses).build())
                .build();
    }

    @PatchMapping("/{roomTypeId}")
    public ApiResponse<RoomTypeResponse> updateRoomType(
            @PathVariable Integer roomTypeId,
            @RequestBody @Valid RoomTypeUpdateRequest request
    ) {
        return ApiResponse.<RoomTypeResponse>builder()
                .message("Room type updated successfully")
                .result(roomTypeService.updateRoomType(roomTypeId, request))
                .build();
    }

    @DeleteMapping("/{roomTypeId}")
    public ApiResponse<Boolean> deleteRoomType(@PathVariable Integer roomTypeId) {
        return ApiResponse.<Boolean>builder()
                .result(roomTypeService.deleteRoomType(roomTypeId))
                .message("Room type deleted successfully")
                .build();
    }
}

