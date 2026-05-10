package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeCreationRequest;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeResponse;
import com.dev.cinemasystem.dto.movieTypeDTO.MovieTypeUpdateRequest;
import com.dev.cinemasystem.entity.MovieType;
import com.dev.cinemasystem.enums.MovieStatus;
import com.dev.cinemasystem.enums.MovieTypeStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.MovieTypeMapper;
import com.dev.cinemasystem.repository.MovieRepository;
import com.dev.cinemasystem.repository.MovieTypeRepository;
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
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MovieTypeService {

    MovieTypeMapper movieTypeMapper;
    MovieTypeRepository movieTypeRepository;
    MovieRepository movieRepository;

    public MovieTypeResponse getMovieTypeById(Integer movieTypeId) {
        MovieType movieType = movieTypeRepository.findById(movieTypeId)
                .orElseThrow(() -> {
                    log.error("Movie type with id {} not found", movieTypeId);
                    return new AppException(ErrorCode.MOVIE_TYPE_NOT_FOUND);
                });

        return movieTypeMapper.toMovieTypeResponse(movieType);
    }

    public MovieTypeResponse createMovieType(MovieTypeCreationRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String normalizedName = request.getMovieTypeName().trim();
        if (movieTypeRepository.existsByMovieTypeNameIgnoreCase(normalizedName)) {
            throw new AppException(ErrorCode.MOVIE_TYPE_NAME_EXISTS);
        }

        MovieType movieType = movieTypeMapper.toMovieTypeFromMovieCreationRequest(request);
        movieType.setMovieTypeName(normalizedName);
        movieType.setStatus(request.getStatus() != null ? request.getStatus() : MovieTypeStatus.ACTIVE);

        MovieType savedMovieType = movieTypeRepository.save(movieType);
        return movieTypeMapper.toMovieTypeResponse(savedMovieType);
    }

    public PagingDto<MovieTypeResponse> getAllMovieTypes(MovieTypeStatus status, Integer page, Integer size) {
        return filterMovieTypes(null, null, status != null ? status.name() : null, page, size);
    }

    public PagingDto<MovieTypeResponse> filterMovieTypes(
            Integer movieTypeId,
            String name,
            String status,
            Integer page,
            Integer size
    ) {
        validatePageAndSize(page, size);

        Pageable pageable = PageRequest.of(page - 1, size);
        Specification<MovieType> specification = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (movieTypeId != null) {
                predicates.add(builder.equal(root.get("movieTypeId"), movieTypeId));
            }

            if (name != null && !name.isBlank()) {
                String keyword = "%" + name.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(builder.like(builder.lower(root.get("movieTypeName")), keyword));
            }

            if (status != null && !status.isBlank()) {
                predicates.add(builder.equal(root.get("status"), parseMovieTypeStatus(status)));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };

        Page<MovieType> movieTypePage = movieTypeRepository.findAll(specification, pageable);
        List<MovieTypeResponse> movieTypeResponses = movieTypeMapper.toMovieTypeResponseList(
                movieTypePage.getContent()
        );

        return PagingDto.<MovieTypeResponse>builder()
                .items(movieTypeResponses)
                .currentPage(movieTypePage.getNumber() + 1)
                .pageSize(movieTypePage.getSize())
                .totalItems(movieTypePage.getTotalElements())
                .totalPages(movieTypePage.getTotalPages())
                .build();
    }

    public MovieTypeResponse updateMovieType(Integer movieTypeId, MovieTypeUpdateRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        MovieType movieType = movieTypeRepository.findById(movieTypeId)
                .orElseThrow(() -> {
                    log.error("Movie type with id {} not found", movieTypeId);
                    return new AppException(ErrorCode.MOVIE_TYPE_NOT_FOUND);
                });

        if (request.getMovieTypeName() != null && !request.getMovieTypeName().isBlank()) {
            String normalizedName = request.getMovieTypeName().trim();
            if (movieTypeRepository.existsByMovieTypeNameIgnoreCaseAndMovieTypeIdNot(
                    normalizedName,
                    movieTypeId
            )) {
                throw new AppException(ErrorCode.MOVIE_TYPE_NAME_EXISTS);
            }
            request.setMovieTypeName(normalizedName);
        }

        movieTypeMapper.updateMovieTypeInfo(movieType, request);
        MovieType savedMovieType = movieTypeRepository.save(movieType);
        return movieTypeMapper.toMovieTypeResponse(savedMovieType);
    }

    public boolean deleteMovieType(Integer movieTypeId) {
        MovieType movieType = movieTypeRepository.findById(movieTypeId)
                .orElseThrow(() -> {
                    log.error("Movie type with id {} not found", movieTypeId);
                    return new AppException(ErrorCode.MOVIE_TYPE_NOT_FOUND);
                });

        boolean hasActiveMovies = movieRepository.existsByMovieType_MovieTypeIdAndStatus(
                movieTypeId,
                MovieStatus.ACTIVE
        );
        if (hasActiveMovies) {
            throw new AppException(ErrorCode.MOVIE_TYPE_HAS_ACTIVE_MOVIES);
        }

        movieType.setStatus(MovieTypeStatus.INACTIVE);
        movieTypeRepository.save(movieType);
        return true;
    }

    public List<String> getAllMovieTypeStatuses() {
        return Arrays.stream(MovieTypeStatus.values())
                .map(Enum::name)
                .toList();
    }

    public List<MovieTypeResponse> getMovieTypesForMovieDropdown(MovieTypeStatus status) {
        List<MovieType> movieTypes = status == null
                ? movieTypeRepository.findAllByOrderByMovieTypeNameAsc()
                : movieTypeRepository.findAllByStatusOrderByMovieTypeNameAsc(status);

        return movieTypeMapper.toMovieTypeResponseList(movieTypes);
    }

    private MovieTypeStatus parseMovieTypeStatus(String value) {
        try {
            return MovieTypeStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
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



