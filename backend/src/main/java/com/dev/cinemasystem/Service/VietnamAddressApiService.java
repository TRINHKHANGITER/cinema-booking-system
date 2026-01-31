package com.dev.cinemasystem.Service;

import com.dev.cinemasystem.dto.ProvinceDTO.ProvinceApiDto;
import com.dev.cinemasystem.dto.ProvinceDTO.ProvinceDto;
import com.dev.cinemasystem.dto.wardDTO.WardDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VietnamAddressApiService {

    private final RestClient restClient = RestClient.builder()
            .baseUrl("https://provinces.open-api.vn/api/v2")
            .build();

    // 1 Lấy danh sách tỉnh
    public List<ProvinceDto> getProvinces() {
        return Arrays.asList(
                restClient.get()
                        .uri("/p/")
                        .retrieve()
                        .body(ProvinceDto[].class)
        );
    }

    // Lấy tỉnh + wards (depth = 2)
    public ProvinceApiDto getProvinceWithWards(Integer provinceCode) {
        return restClient.get()
                .uri("/p/{code}?depth=2", provinceCode)
                .retrieve()
                .body(ProvinceApiDto.class);
    }

    //  Nếu chỉ muốn wards
    public List<WardDto> getWardsByProvince(Integer provinceCode) {
        ProvinceApiDto province = getProvinceWithWards(provinceCode);
        return province.getWards();
    }
}