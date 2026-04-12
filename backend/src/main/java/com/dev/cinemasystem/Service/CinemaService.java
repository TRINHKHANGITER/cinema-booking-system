package com.dev.cinemasystem.Service;

import com.dev.cinemasystem.Entity.Cinema;
import com.dev.cinemasystem.Entity.Province;
import com.dev.cinemasystem.Exception.AppException;
import com.dev.cinemasystem.Exception.ErrorCode;
import com.dev.cinemasystem.Mapper.CinemaMapper;
import com.dev.cinemasystem.Repository.CinemaRepository;
import com.dev.cinemasystem.Repository.ProvinceRepository;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaCreationRequest;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaResponse;
import com.dev.cinemasystem.dto.cinemaDTO.CinemaUpdateRequest;
import com.dev.cinemasystem.enums.CinemaStatus;
import com.dev.cinemasystem.enums.ShowTimeStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CinemaService {
    CinemaRepository cinemaRepository;
    ProvinceRepository provinceRepository;
    CinemaMapper cinemaMapper;

    public CinemaResponse getCinemaById(Integer cinemaId) {
        var cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));
        log.info("Retrieved cinema with id: {}", cinemaId);
        return cinemaMapper.toResponse(cinema);
    }

    public PagingDto<CinemaResponse> getAllCinemas(Integer provinceId, CinemaStatus status, int page, int size) {
        if (page < 1) {
            log.error("Invalid page number: {}", page);
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }
        if (size < 1) {
            log.error("Invalid page size: {}", size);
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Cinema> cinemaPage;

        if (provinceId != null && status != null) {
            cinemaPage = cinemaRepository.findByProvince_ProvinceIdAndStatus(provinceId, status, pageable);
        } else if (provinceId != null) {
            cinemaPage = cinemaRepository.findByProvince_ProvinceId(provinceId, pageable);
        } else if (status != null) {
            cinemaPage = cinemaRepository.findByStatus(status, pageable);
        } else {
            cinemaPage = cinemaRepository.findAll(pageable);
        }

        List<CinemaResponse> cinemaResponses = cinemaMapper.toResponseList(cinemaPage.getContent());
        log.info("Retrieved {} cinemas", cinemaResponses.size());

        return PagingDto.<CinemaResponse>builder()
                .items(cinemaResponses)
                .pageSize(size)
                .currentPage(page)
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
        log.info("Retrieved {} cinemas with filters provinceId={}, isShowing={}, status={}", cinemas.size(), provinceId, isShowing, status);
        return cinemaMapper.toResponseList(cinemas);
    }

    public CinemaResponse createCinema(CinemaCreationRequest request) {
        if (request == null) {
            log.error("Cinema creation request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Province province = provinceRepository.findById(request.getProvinceId())
                .orElseThrow(() -> new AppException(ErrorCode.PROVINCE_NOT_FOUND));

        if (cinemaRepository.existsByCinemaName(request.getCinemaName())) {
            throw new AppException(ErrorCode.CINEMA_ALREADY_EXISTS);
        }

        Cinema cinema = Cinema.builder()
                .cinemaName(request.getCinemaName())
                .province(province)
                .addressText(request.getAddress())
                .description(request.getDescription())
                .status(CinemaStatus.ACTIVE)
                .build();

        cinemaRepository.save(cinema);
        log.info("Created cinema with name: {}", cinema.getCinemaName());
        return cinemaMapper.toResponse(cinema);
    }

    @Transactional
    public CinemaResponse updateCinema(int cinemaId, CinemaUpdateRequest request) {
        Cinema existingCinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));

        if (request == null) {
            log.error("Cinema update request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        cinemaMapper.updateEntityFromRequest(existingCinema, request);

        if (request.getProvinceId() != null) {
            Province province = provinceRepository.findById(request.getProvinceId())
                    .orElseThrow(() -> new AppException(ErrorCode.PROVINCE_NOT_FOUND));
            existingCinema.setProvince(province);
        }

        Cinema saved = cinemaRepository.save(existingCinema);
        log.info("Updated cinema with id={}", saved.getCinemaId());
        return cinemaMapper.toResponse(saved);
    }

    public boolean deleteCinemaById(Integer cinemaId) {
        var cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));
        cinema.setStatus(CinemaStatus.INACTIVE);
        cinemaRepository.save(cinema);
        log.info("Deleted cinema with id: {}", cinemaId);
        return true;
    }
}

