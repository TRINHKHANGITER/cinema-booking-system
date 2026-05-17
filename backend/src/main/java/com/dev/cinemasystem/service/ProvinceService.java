package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.provinceDTO.ProvinceCreationRequest;
import com.dev.cinemasystem.dto.provinceDTO.ProvinceResponse;
import com.dev.cinemasystem.dto.provinceDTO.ProvinceUpdateRequest;
import com.dev.cinemasystem.entity.Province;
import com.dev.cinemasystem.enums.CinemaStatus;
import com.dev.cinemasystem.enums.ProvinceStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.ProvinceMapper;
import com.dev.cinemasystem.repository.ProvinceRepository;
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
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProvinceService {
    ProvinceRepository provinceRepository;
    ProvinceMapper provinceMapper;
    CinemaService cinemaService;


    public Province getProvinceEntityById(Integer provinceId) {
        return provinceRepository.findById(provinceId)
                .orElseThrow(() -> new AppException(ErrorCode.PROVINCE_NOT_FOUND));
    }
    public List<ProvinceResponse> getProvinces(ProvinceStatus status) {
        List<Province> provinces = status == null
                ? provinceRepository.findAll()
                : provinceRepository.findAllByStatus(status);

        return provinces.stream()
                .sorted(Comparator.comparing(Province::getProvinceName, String.CASE_INSENSITIVE_ORDER))
                .map(provinceMapper::toProvinceResponse)
                .toList();
    }

    public ProvinceResponse getProvinceById(Integer provinceId) {
        Province province = provinceRepository.findById(provinceId)
                .orElseThrow(() -> new AppException(ErrorCode.PROVINCE_NOT_FOUND));

        return provinceMapper.toProvinceResponse(province);
    }

    public ProvinceResponse createProvince(ProvinceCreationRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String normalizedName = request.getProvinceName().trim();
        if (provinceRepository.existsByProvinceNameIgnoreCase(normalizedName)) {
            throw new AppException(ErrorCode.PROVINCE_NAME_EXISTS);
        }

        Province province = provinceMapper.toProvinceFromProvinceCreationRequest(request);
        province.setProvinceName(normalizedName);
        province.setStatus(request.getStatus() != null ? request.getStatus() : ProvinceStatus.ACTIVE);

        Province savedProvince = provinceRepository.save(province);
        return provinceMapper.toProvinceResponse(savedProvince);
    }

    public PagingDto<ProvinceResponse> getAllProvinces(ProvinceStatus status, Integer page, Integer size) {
        return filterProvinces(null, null, status != null ? status.name() : null, page, size);
    }

    public PagingDto<ProvinceResponse> filterProvinces(
            Integer provinceId,
            String name,
            String status,
            Integer page,
            Integer size
    ) {
        validatePageAndSize(page, size);

        Pageable pageable = PageRequest.of(page - 1, size);
        Specification<Province> specification = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (provinceId != null) {
                predicates.add(builder.equal(root.get("provinceId"), provinceId));
            }

            if (name != null && !name.isBlank()) {
                String keyword = "%" + name.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(builder.like(builder.lower(root.get("provinceName")), keyword));
            }

            if (status != null && !status.isBlank()) {
                predicates.add(builder.equal(root.get("status"), parseProvinceStatus(status)));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };

        Page<Province> provincePage = provinceRepository.findAll(specification, pageable);
        List<ProvinceResponse> provinceResponses = provinceMapper.toProvinceResponseList(provincePage.getContent());

        return PagingDto.<ProvinceResponse>builder()
                .items(provinceResponses)
                .currentPage(provincePage.getNumber() + 1)
                .pageSize(provincePage.getSize())
                .totalItems(provincePage.getTotalElements())
                .totalPages(provincePage.getTotalPages())
                .build();
    }

    public ProvinceResponse updateProvince(Integer provinceId, ProvinceUpdateRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Province province = provinceRepository.findById(provinceId)
                .orElseThrow(() -> new AppException(ErrorCode.PROVINCE_NOT_FOUND));

        if (request.getProvinceName() != null && !request.getProvinceName().isBlank()) {
            String normalizedName = request.getProvinceName().trim();
            if (provinceRepository.existsByProvinceNameIgnoreCaseAndProvinceIdNot(normalizedName, provinceId)) {
                throw new AppException(ErrorCode.PROVINCE_NAME_EXISTS);
            }
            request.setProvinceName(normalizedName);
        }

        provinceMapper.updateProvinceInfo(province, request);
        Province savedProvince = provinceRepository.save(province);
        return provinceMapper.toProvinceResponse(savedProvince);
    }

    public boolean deleteProvince(Integer provinceId) {
        Province province = provinceRepository.findById(provinceId)
                .orElseThrow(() -> new AppException(ErrorCode.PROVINCE_NOT_FOUND));

        boolean hasActiveCinemas = cinemaService.existsActiveCinemaByProvinceId(provinceId);
        if (hasActiveCinemas) {
            throw new AppException(ErrorCode.PROVINCE_HAS_ACTIVE_CINEMAS);
        }

        province.setStatus(ProvinceStatus.INACTIVE);
        provinceRepository.save(province);
        return true;
    }

    public List<String> getAllProvinceStatuses() {
        return Arrays.stream(ProvinceStatus.values())
                .map(Enum::name)
                .toList();
    }

    private ProvinceStatus parseProvinceStatus(String value) {
        try {
            return ProvinceStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
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




