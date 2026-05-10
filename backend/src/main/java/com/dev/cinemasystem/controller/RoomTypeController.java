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
@RequestMapping({"/room-type", "/roomType"})
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomTypeController {
    RoomTypeService roomTypeService;

    @GetMapping
    public ApiResponse<ItemListDto<RoomTypeResponse>> getRoomTypesForRoomDropdown(
            @RequestParam(required = false) Integer provinceId,
            @RequestParam(required = false) Integer cinemaId,
            @RequestParam(required = false, name = "cinema") Integer cinema,
            @RequestParam(required = false) RoomTypeStatus status
    ) {
        Integer resolvedCinemaId = cinemaId != null ? cinemaId : cinema;
        return ApiResponse.<ItemListDto<RoomTypeResponse>>builder()
                .message("Lấy danh sách loại phòng thành công")
                .result(ItemListDto.<RoomTypeResponse>builder()
                        .items(roomTypeService.getRoomTypesForRoomDropdown(provinceId, resolvedCinemaId, status))
                        .build())
                .build();
    }


    @GetMapping("/{roomTypeId}")
    public ApiResponse<RoomTypeResponse> getRoomTypeById(@PathVariable Integer roomTypeId) {
        return ApiResponse.<RoomTypeResponse>builder()
                .message("Lấy thông tin loại phòng thành công")
                .result(roomTypeService.getRoomTypeById(roomTypeId))
                .build();
    }

    @PostMapping
    public ApiResponse<RoomTypeResponse> createRoomType(@RequestBody @Valid RoomTypeCreationRequest request) {
        return ApiResponse.<RoomTypeResponse>builder()
                .message("Tạo loại phòng thành công")
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
                .message("Lấy danh sách loại phòng thành công")
                .result(roomTypeService.getAllRoomTypes(status, page, size))
                .build();
    }

    @GetMapping("/filter")
    public ApiResponse<PagingDto<RoomTypeResponse>> filterRoomTypes(
            @RequestParam(required = false) Integer roomTypeId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PagingDto<RoomTypeResponse>>builder()
                .message("Lọc loại phòng thành công")
                .result(roomTypeService.filterRoomTypes(roomTypeId, name, status, page, size))
                .build();
    }

    @GetMapping("/statuses")
    public ApiResponse<ItemListDto<String>> getAllRoomTypeStatuses() {
        List<String> statuses = roomTypeService.getAllRoomTypeStatuses();
        return ApiResponse.<ItemListDto<String>>builder()
                .message("Lấy danh sách trạng thái loại phòng thành công")
                .result(ItemListDto.<String>builder().items(statuses).build())
                .build();
    }

    @PatchMapping("/{roomTypeId}")
    public ApiResponse<RoomTypeResponse> updateRoomType(
            @PathVariable Integer roomTypeId,
            @RequestBody @Valid RoomTypeUpdateRequest request
    ) {
        return ApiResponse.<RoomTypeResponse>builder()
                .message("Cập nhật loại phòng thành công")
                .result(roomTypeService.updateRoomType(roomTypeId, request))
                .build();
    }

    @DeleteMapping("/{roomTypeId}")
    public ApiResponse<Boolean> deleteRoomType(@PathVariable Integer roomTypeId) {
        return ApiResponse.<Boolean>builder()
                .result(roomTypeService.deleteRoomType(roomTypeId))
                .message("Xóa loại phòng thành công")
                .build();
    }
}


