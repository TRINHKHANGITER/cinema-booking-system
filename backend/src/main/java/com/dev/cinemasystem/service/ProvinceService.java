package com.dev.cinemasystem.service;

import com.dev.cinemasystem.repository.ProvinceRepository;
import com.dev.cinemasystem.dto.provinceDTO.ProvinceResponse;
import com.dev.cinemasystem.enums.ProvinceStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProvinceService {
    ProvinceRepository provinceRepository;

    public List<ProvinceResponse> getProvinces(ProvinceStatus status) {
        var provinces = status == null
                ? provinceRepository.findAll()
                : provinceRepository.findAllByStatus(status);

        var sortedProvinces = provinces.stream()
                .sorted(Comparator.comparing(province -> province.getProvinceName(), String.CASE_INSENSITIVE_ORDER))
                .map(province -> ProvinceResponse.builder()
                        .provinceId(province.getProvinceId())
                        .provinceName(province.getProvinceName())
                        .status(province.getStatus())
                        .build())
                .toList();

        log.info("Retrieved {} provinces with status={}", sortedProvinces.size(), status);
        return sortedProvinces;
    }
}
