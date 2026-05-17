package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaCreationRequest;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaResponse;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaUpdateRequest;
import com.dev.cinemasystem.entity.Cinema;
import com.dev.cinemasystem.entity.Province;
import com.dev.cinemasystem.enums.CinemaStatus;
import com.dev.cinemasystem.enums.RoomStatus;
import com.dev.cinemasystem.enums.ShowTimeStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.CinemaMapper;
import com.dev.cinemasystem.repository.CinemaRepository;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CinemaService {
    CinemaRepository cinemaRepository;
    ProvinceRepository provinceRepository;
    CinemaMapper cinemaMapper;
    RoomService roomService;


    public Cinema getCinemaEntityById(Integer cinemaId) {
        return cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));
    }

    public boolean existsActiveCinemaByProvinceId(Integer provinceId) {
        return cinemaRepository.existsByProvince_ProvinceIdAndStatus(provinceId, CinemaStatus.ACTIVE);
    }

    public Long countCinemas() {
        return cinemaRepository.count();
    }
    public CinemaResponse getCinemaById(Integer cinemaId) {
        Cinema cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));

        return cinemaMapper.mapCinemaResponse(cinema);
    }

    public PagingDto<CinemaResponse> getAllCinemas(
            Integer provinceId,
            CinemaStatus status,
            Integer page,
            Integer size
    ) {
        return filterCinemas(null, null, provinceId, status != null ? status.name() : null, page, size);
    }

    public PagingDto<CinemaResponse> filterCinemas(
            Integer cinemaId,
            String name,
            Integer provinceId,
            String status,
            Integer page,
            Integer size
    ) {
        validatePageAndSize(page, size);

        Pageable pageable = PageRequest.of(page - 1, size);
        Specification<Cinema> specification = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (cinemaId != null) {
                predicates.add(builder.equal(root.get("cinemaId"), cinemaId));
            }

            if (name != null && !name.isBlank()) {
                String keyword = "%" + name.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(builder.like(builder.lower(root.get("cinemaName")), keyword));
            }

            if (provinceId != null) {
                predicates.add(builder.equal(root.get("province").get("provinceId"), provinceId));
            }

            if (status != null && !status.isBlank()) {
                predicates.add(builder.equal(root.get("status"), parseCinemaStatus(status)));
            }

            if (query != null) {
                query.orderBy(builder.asc(builder.lower(root.get("cinemaName"))));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };

        Page<Cinema> cinemaPage = cinemaRepository.findAll(specification, pageable);
        List<CinemaResponse> cinemaResponses = cinemaMapper.mapCinemaResponses(cinemaPage.getContent());

        return PagingDto.<CinemaResponse>builder()
                .items(cinemaResponses)
                .currentPage(cinemaPage.getNumber() + 1)
                .pageSize(cinemaPage.getSize())
                .totalItems(cinemaPage.getTotalElements())
                .totalPages(cinemaPage.getTotalPages())
                .build();
    }

    public List<CinemaResponse> getCinemas(Integer provinceId, Boolean isShowing, CinemaStatus status) {
        List<Cinema> cinemas;
        if (Boolean.TRUE.equals(isShowing)) {
            cinemas = cinemaRepository.findAllByFiltersWithShowTimeStatus(
                    provinceId,
                    status,
                    ShowTimeStatus.SCHEDULED
            );
        } else {
            cinemas = cinemaRepository.findAllByFilters(provinceId, status);
        }
        return cinemaMapper.mapCinemaResponses(cinemas);
    }

    public CinemaResponse createCinema(CinemaCreationRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String normalizedName = normalizeCinemaName(request.getCinemaName());
        if (cinemaRepository.existsByCinemaNameIgnoreCase(normalizedName)) {
            throw new AppException(ErrorCode.CINEMA_NAME_EXISTS);
        }

        Province province = provinceRepository.findById(request.getProvinceId())
                .orElseThrow(() -> new AppException(ErrorCode.PROVINCE_NOT_FOUND));

        Cinema cinema = cinemaMapper.mapCinemaEntity(request);
        cinema.setCinemaName(normalizedName);
        cinema.setProvince(province);
        cinema.setAddressText(normalizeAddress(request.getAddressText()));
        cinema.setDescription(normalizeOptionalText(request.getDescription()));
        cinema.setStatus(request.getStatus() != null ? request.getStatus() : CinemaStatus.ACTIVE);

        Cinema savedCinema = cinemaRepository.save(cinema);
        return cinemaMapper.mapCinemaResponse(savedCinema);
    }

    @Transactional
    public CinemaResponse updateCinema(Integer cinemaId, CinemaUpdateRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Cinema existingCinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));

        if (request.getCinemaName() != null) {
            String normalizedName = normalizeCinemaName(request.getCinemaName());
            if (cinemaRepository.existsByCinemaNameIgnoreCaseAndCinemaIdNot(normalizedName, cinemaId)) {
                throw new AppException(ErrorCode.CINEMA_NAME_EXISTS);
            }
            request.setCinemaName(normalizedName);
        }

        if (request.getAddressText() != null) {
            request.setAddressText(normalizeAddress(request.getAddressText()));
        }

        if (request.getDescription() != null) {
            request.setDescription(normalizeOptionalText(request.getDescription()));
        }

        cinemaMapper.updateEntityFromRequest(existingCinema, request);

        if (request.getProvinceId() != null) {
            Province province = provinceRepository.findById(request.getProvinceId())
                    .orElseThrow(() -> new AppException(ErrorCode.PROVINCE_NOT_FOUND));
            existingCinema.setProvince(province);
        }

        Cinema savedCinema = cinemaRepository.save(existingCinema);
        return cinemaMapper.mapCinemaResponse(savedCinema);
    }

    public boolean deleteCinemaById(Integer cinemaId) {
        Cinema cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));

        boolean hasActiveRooms = roomService.existsActiveRoomByCinemaId(cinemaId);
        if (hasActiveRooms) {
            throw new AppException(ErrorCode.CINEMA_HAS_ACTIVE_ROOMS);
        }

        cinema.setStatus(CinemaStatus.INACTIVE);
        cinemaRepository.save(cinema);
        return true;
    }

    public List<String> getAllCinemaStatuses() {
        return Arrays.stream(CinemaStatus.values())
                .map(Enum::name)
                .toList();
    }

    private CinemaStatus parseCinemaStatus(String value) {
        try {
            return CinemaStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (Exception exception) {
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

    private String normalizeCinemaName(String value) {
        if (value == null || value.isBlank()) {
            throw new AppException(ErrorCode.CINEMA_BLANK);
        }
        return value.trim();
    }

    private String normalizeAddress(String value) {
        if (value == null || value.isBlank()) {
            throw new AppException(ErrorCode.ADDRESS_BLANK);
        }
        return value.trim();
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }
}





