package com.dev.cinemasystem.service;

import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.movieDTO.MovieCreationResquest;
import com.dev.cinemasystem.dto.movieDTO.MovieResponse;
import com.dev.cinemasystem.dto.movieDTO.MovieUpdateResquest;
import com.dev.cinemasystem.entity.Movie;
import com.dev.cinemasystem.enums.MovieStatus;
import com.dev.cinemasystem.enums.ShowTimeStatus;
import com.dev.cinemasystem.exception.AppException;
import com.dev.cinemasystem.exception.ErrorCode;
import com.dev.cinemasystem.mapper.MovieMapper;
import com.dev.cinemasystem.repository.MovieRepository;
import com.dev.cinemasystem.repository.MovieTypeRepository;
import com.dev.cinemasystem.repository.ShowTimeRepository;
import com.dev.cinemasystem.utils.FileStoreUtil;
import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MovieService {

    List<ShowTimeStatus> ACTIVE_SHOWTIME_STATUSES = List.of(
            ShowTimeStatus.SCHEDULED,
            ShowTimeStatus.SELLING
    );

    MovieRepository movieRepository;
    MovieMapper movieMapper;
    MovieTypeRepository movieTypeRepository;
    ShowTimeRepository showTimeRepository;

    @Value("${storage.image-movie-imageLandscape-dir}")
    @NonFinal
    String imageMovieLandscapeDir;

    @Value("${storage.image-movie-imagePortrait-dir}")
    @NonFinal
    String imageMoviePortraitDir;

    public MovieResponse getMovieById(Integer movieId, MovieStatus status) {
        Movie movie = status == null
                ? movieRepository.findById(movieId)
                .orElseThrow(() -> {
                    log.error("Movie with id {} not found", movieId);
                    return new AppException(ErrorCode.MOVIE_NOT_FOUND);
                })
                : movieRepository.findByMovieIdAndStatus(movieId, status)
                .orElseThrow(() -> {
                    log.error("Movie with id {} and status {} not found", movieId, status);
                    return new AppException(ErrorCode.MOVIE_NOT_FOUND);
                });

        log.info("Retrieving movie with id: {}", movieId);
        return movieMapper.toMovieResponse(movie);
    }

    public MovieResponse createMovie(MovieCreationResquest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        request.setMovieName(normalizeRequiredText(request.getMovieName(), ErrorCode.MOVIE_NAME_BLANK));
        request.setDescription(normalizeRequiredText(request.getDescription(), ErrorCode.DESCRIPTION_BLANK));
        request.setSlug(normalizeOptionalText(request.getSlug()));
        request.setTrailerUrl(normalizeOptionalText(request.getTrailerUrl()));
        request.setCountry(normalizeOptionalText(request.getCountry()));
        request.setProducer(normalizeOptionalText(request.getProducer()));
        request.setDirector(normalizeOptionalText(request.getDirector()));
        request.setActors(normalizeOptionalText(request.getActors()));

        validateMovieDates(request.getReleaseDate(), request.getEndDate());

        if (movieRepository.existsByMovieNameIgnoreCase(request.getMovieName())) {
            throw new AppException(ErrorCode.MOVIE_NAME_EXISTS);
        }

        var movieType = movieTypeRepository.findById(request.getMovieTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_TYPE_NOT_FOUND));

        var movie = movieMapper.toMovieFromMovieCreationRequest(request);
        movie.setMovieType(movieType);
        movie.setSlug(generateUniqueSlug(movie.getMovieName(), null));
        movie.setStatus(request.getStatus());

        Movie savedMovie = movieRepository.save(movie);
        savedMovie = applyMovieImagesAndSave(
                savedMovie,
                request.getImageLandscape(),
                request.getImagePortrait()
        );
        return movieMapper.toMovieResponse(savedMovie);
    }

    public PagingDto<MovieResponse> filterMovies(
            String name,
            Integer movieTypeId,
            MovieStatus status,
            Integer page,
            Integer size
    ) {
        validatePageAndSize(page, size);

        Pageable pageable = PageRequest.of(page - 1, size);
        Specification<Movie> specification = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (name != null && !name.isBlank()) {
                String keyword = "%" + name.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(builder.like(builder.lower(root.get("movieName")), keyword));
            }

            if (movieTypeId != null) {
                predicates.add(builder.equal(root.get("movieType").get("movieTypeId"), movieTypeId));
            }

            if (status != null) {
                predicates.add(builder.equal(root.get("status"), status));
            }

            if (query != null) {
                query.orderBy(builder.asc(builder.lower(root.get("movieName"))));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };

        Page<Movie> moviePage = movieRepository.findAll(specification, pageable);
        List<MovieResponse> movieResponses = movieMapper.toMovieResponseList(moviePage.getContent());

        return PagingDto.<MovieResponse>builder()
                .items(movieResponses)
                .currentPage(moviePage.getNumber() + 1)
                .pageSize(moviePage.getSize())
                .totalItems(moviePage.getTotalElements())
                .totalPages(moviePage.getTotalPages())
                .build();
    }

    public PagingDto<MovieResponse> getAllmovies(Integer movieTypeId, MovieStatus status, Integer page, Integer size) {
        return filterMovies(null, movieTypeId, status, page, size);
    }

    public MovieResponse updateMovie(Integer movieId, MovieUpdateResquest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        var movie = movieRepository.findById(movieId)
                .orElseThrow(() -> {
                    log.error("Movie with id {} not found", movieId);
                    return new AppException(ErrorCode.MOVIE_NOT_FOUND);
                });

        if (request.getMovieName() != null) {
            String normalizedMovieName = normalizeRequiredText(request.getMovieName(), ErrorCode.MOVIE_NAME_BLANK);
            if (movieRepository.existsByMovieNameIgnoreCaseAndMovieIdNot(normalizedMovieName, movieId)) {
                throw new AppException(ErrorCode.MOVIE_NAME_EXISTS);
            }
            request.setMovieName(normalizedMovieName);
        }

        if (request.getDescription() != null) {
            request.setDescription(normalizeRequiredText(request.getDescription(), ErrorCode.DESCRIPTION_BLANK));
        }

        if (request.getSlug() != null) {
            request.setSlug(normalizeOptionalText(request.getSlug()));
        }
        if (request.getTrailerUrl() != null) {
            request.setTrailerUrl(normalizeOptionalText(request.getTrailerUrl()));
        }
        if (request.getCountry() != null) {
            request.setCountry(normalizeOptionalText(request.getCountry()));
        }
        if (request.getProducer() != null) {
            request.setProducer(normalizeOptionalText(request.getProducer()));
        }
        if (request.getDirector() != null) {
            request.setDirector(normalizeOptionalText(request.getDirector()));
        }
        if (request.getActors() != null) {
            request.setActors(normalizeOptionalText(request.getActors()));
        }

        LocalDate resolvedReleaseDate = request.getReleaseDate() != null
                ? request.getReleaseDate()
                : movie.getReleaseDate();
        LocalDate resolvedEndDate = request.getEndDate() != null
                ? request.getEndDate()
                : movie.getEndDate();
        validateMovieDates(resolvedReleaseDate, resolvedEndDate);

        movieMapper.updateMovieInfo(movie, request);

        if (request.getMovieTypeId() != null) {
            var movieType = movieTypeRepository.findById(request.getMovieTypeId()).orElseThrow(() -> {
                log.error("Movie type with id {} not found", request.getMovieTypeId());
                return new AppException(ErrorCode.MOVIE_TYPE_NOT_FOUND);
            });
            movie.setMovieType(movieType);
        }

        if (request.getMovieName() != null || movie.getSlug() == null || movie.getSlug().isBlank()) {
            movie.setSlug(generateUniqueSlug(movie.getMovieName(), movieId));
        }

        log.info("Updating movie with id: {}", movieId);
        Movie savedMovie = movieRepository.save(movie);
        savedMovie = applyMovieImagesAndSave(
                savedMovie,
                request.getImageLandscape(),
                request.getImagePortrait()
        );
        return movieMapper.toMovieResponse(savedMovie);
    }

    public boolean deleteMovie(Integer movieId) {
        var movie = movieRepository.findById(movieId)
                .orElseThrow(() -> {
                    log.error("Movie with id {} not found", movieId);
                    return new AppException(ErrorCode.MOVIE_NOT_FOUND);
                });

        boolean hasActiveShowTimes = showTimeRepository.existsByMovie_MovieIdAndStatusIn(
                movieId,
                ACTIVE_SHOWTIME_STATUSES
        );
        if (hasActiveShowTimes) {
            throw new AppException(ErrorCode.MOVIE_HAS_ACTIVE_SHOWTIMES);
        }

        movie.setStatus(MovieStatus.INACTIVE);
        movieRepository.save(movie);
        log.info("Deleted movie with id: {}", movieId);
        return true;
    }

    public List<String> getAllMovieStatuses() {
        return Arrays.stream(MovieStatus.values())
                .map(Enum::name)
                .toList();
    }

    private void validatePageAndSize(Integer page, Integer size) {
        if (page == null || page < 1) {
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }
        if (size == null || size < 1 || size > 100) {
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }
    }

    private void validateMovieDates(LocalDate releaseDate, LocalDate endDate) {
        if (releaseDate == null) {
            throw new AppException(ErrorCode.RELEASE_DATE_BLANK);
        }
        if (endDate == null) {
            throw new AppException(ErrorCode.END_DATE_BLANK);
        }
        if (endDate.isBefore(releaseDate)) {
            throw new AppException(ErrorCode.MOVIE_END_DATE_INVALID);
        }
    }

    private String normalizeRequiredText(String value, ErrorCode errorCode) {
        if (value == null || value.isBlank()) {
            throw new AppException(errorCode);
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

    private String toSlug(String value) {
        if (value == null) {
            return null;
        }
        String normalized = Normalizer.normalize(value.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('\u0111', 'd')
                .replace('\u0110', 'd');

        String slug = normalized
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-+|-+$", "");

        return slug.isBlank() ? "movie" : slug;
    }

    private String generateUniqueSlug(String movieName, Integer movieId) {
        String baseSlug = toSlug(movieName);
        String nextSlug = baseSlug;
        int counter = 2;

        while (isSlugTaken(nextSlug, movieId)) {
            nextSlug = baseSlug + "-" + counter;
            counter++;
        }

        return nextSlug;
    }

    private boolean isSlugTaken(String slug, Integer movieId) {
        if (movieId == null) {
            return movieRepository.existsBySlug(slug);
        }
        return movieRepository.existsBySlugAndMovieIdNot(slug, movieId);
    }

    private Movie applyMovieImagesAndSave(
            Movie movie,
            MultipartFile imageLandscape,
            MultipartFile imagePortrait
    ) {
        boolean changed = false;

        if (imageLandscape != null && !imageLandscape.isEmpty()) {
            movie.setImageLandscape(saveMovieImage(movie.getMovieId(), imageLandscape, imageMovieLandscapeDir));
            changed = true;
        }

        if (imagePortrait != null && !imagePortrait.isEmpty()) {
            movie.setImagePortrait(saveMovieImage(movie.getMovieId(), imagePortrait, imageMoviePortraitDir));
            changed = true;
        }

        return changed ? movieRepository.save(movie) : movie;
    }

    private String saveMovieImage(Integer movieId, MultipartFile image, String imageDirConfig) {
        try {
            Path imageDir = Paths.get(imageDirConfig).toAbsolutePath().normalize();
            return FileStoreUtil.saveWithBaseNameOverwrite(image, imageDir, String.valueOf(movieId));
        } catch (RuntimeException exception) {
            log.error("Failed to save movie image for movie id {}", movieId, exception);
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }
}
