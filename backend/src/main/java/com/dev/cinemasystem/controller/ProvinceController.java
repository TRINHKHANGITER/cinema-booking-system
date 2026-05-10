package com.dev.cinemasystem.controller;

import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.apiDTO.ItemListDto;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.provinceDTO.ProvinceCreationRequest;
import com.dev.cinemasystem.dto.provinceDTO.ProvinceResponse;
import com.dev.cinemasystem.dto.provinceDTO.ProvinceUpdateRequest;
import com.dev.cinemasystem.enums.ProvinceStatus;
import com.dev.cinemasystem.service.ProvinceService;
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
@RequestMapping("/province")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProvinceController {
    ProvinceService provinceService;

    @GetMapping
    public ApiResponse<List<ProvinceResponse>> getProvinces(
            @RequestParam(required = false) ProvinceStatus status
    ) {
        return ApiResponse.<List<ProvinceResponse>>builder()
                .message("Láº¥y danh sÃ¡ch tá»‰nh/thÃ nh thÃ nh cÃ´ng")
                .result(provinceService.getProvinces(status))
                .build();
    }

    @GetMapping("/item-list")
    public ApiResponse<ItemListDto<ProvinceResponse>> getProvincesAsItemList(
            @RequestParam(required = false) ProvinceStatus status
    ) {
        return ApiResponse.<ItemListDto<ProvinceResponse>>builder()
                .message("Láº¥y danh sÃ¡ch tá»‰nh/thÃ nh thÃ nh cÃ´ng")
                .result(ItemListDto.<ProvinceResponse>builder()
                        .items(provinceService.getProvinces(status))
                        .build())
                .build();
    }

    @GetMapping("/{provinceId}")
    public ApiResponse<ProvinceResponse> getProvinceById(@PathVariable Integer provinceId) {
        return ApiResponse.<ProvinceResponse>builder()
                .message("Láº¥y thÃ´ng tin tá»‰nh/thÃ nh thÃ nh cÃ´ng")
                .result(provinceService.getProvinceById(provinceId))
                .build();
    }

    @PostMapping
    public ApiResponse<ProvinceResponse> createProvince(@RequestBody @Valid ProvinceCreationRequest request) {
        return ApiResponse.<ProvinceResponse>builder()
                .message("Táº¡o tá»‰nh/thÃ nh thÃ nh cÃ´ng")
                .result(provinceService.createProvince(request))
                .build();
    }

    @GetMapping("/all")
    public ApiResponse<PagingDto<ProvinceResponse>> getAllProvinces(
            @RequestParam(required = false) ProvinceStatus status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PagingDto<ProvinceResponse>>builder()
                .message("Láº¥y danh sÃ¡ch tá»‰nh/thÃ nh thÃ nh cÃ´ng")
                .result(provinceService.getAllProvinces(status, page, size))
                .build();
    }

    @GetMapping("/filter")
    public ApiResponse<PagingDto<ProvinceResponse>> filterProvinces(
            @RequestParam(required = false) Integer provinceId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PagingDto<ProvinceResponse>>builder()
                .message("Lá»c tá»‰nh/thÃ nh thÃ nh cÃ´ng")
                .result(provinceService.filterProvinces(provinceId, name, status, page, size))
                .build();
    }

    @GetMapping("/statuses")
    public ApiResponse<ItemListDto<String>> getAllProvinceStatuses() {
        List<String> statuses = provinceService.getAllProvinceStatuses();
        return ApiResponse.<ItemListDto<String>>builder()
                .message("Láº¥y danh sÃ¡ch tráº¡ng thÃ¡i tá»‰nh/thÃ nh thÃ nh cÃ´ng")
                .result(ItemListDto.<String>builder().items(statuses).build())
                .build();
    }

    @PatchMapping("/{provinceId}")
    public ApiResponse<ProvinceResponse> updateProvince(
            @PathVariable Integer provinceId,
            @RequestBody @Valid ProvinceUpdateRequest request
    ) {
        return ApiResponse.<ProvinceResponse>builder()
                .message("Cáº­p nháº­t tá»‰nh/thÃ nh thÃ nh cÃ´ng")
                .result(provinceService.updateProvince(provinceId, request))
                .build();
    }

    @DeleteMapping("/{provinceId}")
    public ApiResponse<Boolean> deleteProvince(@PathVariable Integer provinceId) {
        return ApiResponse.<Boolean>builder()
                .result(provinceService.deleteProvince(provinceId))
                .message("XÃ³a tá»‰nh/thÃ nh thÃ nh cÃ´ng")
                .build();
    }
}


