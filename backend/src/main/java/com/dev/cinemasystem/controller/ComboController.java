package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.ItemListDto;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.comboDTO.ComboCreationRequest;
import com.dev.cinemasystem.dto.comboDTO.ComboResponse;
import com.dev.cinemasystem.dto.comboDTO.ComboUpdateRequest;
import com.dev.cinemasystem.service.ComboService;
import com.dev.cinemasystem.enums.ComboStatus;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/combo")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ComboController {
    ComboService comboService;

    @GetMapping
    public ApiResponse<List<ComboResponse>> getCombos(
            @RequestParam(required = false)ComboStatus status
    ) {
        return ApiResponse.<List<ComboResponse>>builder()
                .result(comboService.getCombos(status))
                .build();
    }

    @GetMapping("/filter")
    public ApiResponse<PagingDto<ComboResponse>> filterCombos(
            @RequestParam(required = false) Integer comboId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PagingDto<ComboResponse>>builder()
                .message("Lá»c combo thÃ nh cÃ´ng")
                .result(comboService.filterCombos(comboId, name, status, page, size))
                .build();
    }

    @GetMapping("/statuses")
    public ApiResponse<ItemListDto<String>> getAllComboStatuses() {
        List<String> statuses = comboService.getAllComboStatuses();
        return ApiResponse.<ItemListDto<String>>builder()
                .message("Láº¥y danh sÃ¡ch tráº¡ng thÃ¡i combo thÃ nh cÃ´ng")
                .result(ItemListDto.<String>builder().items(statuses).build())
                .build();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ComboResponse> createCombo(@Valid @ModelAttribute ComboCreationRequest request) {
        return ApiResponse.<ComboResponse>builder()
                .message("Táº¡o combo thÃ nh cÃ´ng")
                .result(comboService.createCombo(request))
                .build();
    }

    @GetMapping("/{comboId}")
    public ApiResponse<ComboResponse> getComboById(@PathVariable Integer comboId) {
        return ApiResponse.<ComboResponse>builder()
                .message("Láº¥y thÃ´ng tin combo thÃ nh cÃ´ng")
                .result(comboService.getComboById(comboId))
                .build();
    }

    @PatchMapping(value = "/{comboId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ComboResponse> updateCombo(
            @PathVariable Integer comboId,
            @Valid @ModelAttribute ComboUpdateRequest request
    ) {
        return ApiResponse.<ComboResponse>builder()
                .message("Cáº­p nháº­t combo thÃ nh cÃ´ng")
                .result(comboService.updateCombo(comboId, request))
                .build();
    }

    @DeleteMapping("/{comboId}")
    public ApiResponse<Boolean> deleteCombo(@PathVariable Integer comboId) {
        return ApiResponse.<Boolean>builder()
                .message("XÃ³a combo thÃ nh cÃ´ng")
                .result(comboService.deleteCombo(comboId))
                .build();
    }
}


