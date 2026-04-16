package com.dev.cinemasystem.Controller;

import com.dev.cinemasystem.Service.ProvinceService;
import com.dev.cinemasystem.dto.apiDTO.ApiResponse;
import com.dev.cinemasystem.dto.provinceDTO.ProvinceResponse;
import com.dev.cinemasystem.enums.ProvinceStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
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
                .message("Provinces retrieved successfully")
                .result(provinceService.getProvinces(status))
                .build();
    }
}
