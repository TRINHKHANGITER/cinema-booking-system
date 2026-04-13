package com.dev.cinemasystem.Service;

import com.dev.cinemasystem.Entity.Movie;
import com.dev.cinemasystem.Exception.AppException;
import com.dev.cinemasystem.Exception.ErrorCode;
import com.dev.cinemasystem.Mapper.MovieMapper;
import com.dev.cinemasystem.Repository.MovieRepository;
import com.dev.cinemasystem.Repository.MovieTypeRepository;
import com.dev.cinemasystem.dto.apiDTO.PagingDto;
import com.dev.cinemasystem.dto.movieDTO.MovieCreationResquest;
import com.dev.cinemasystem.dto.movieDTO.MovieResponse;
import com.dev.cinemasystem.dto.movieDTO.MovieUpdateResquest;
import com.dev.cinemasystem.enums.MovieStatus;
import com.dev.cinemasystem.utils.FileStoreUtil;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Paths;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MovieService {

    final MovieRepository movieRepository;
    final MovieMapper movieMapper;
    final MovieTypeRepository movieTypeRepository;

    @Value("${storage.image-dir}")
    String imageDir;

    private String toSlug(String value) {
        if (value == null) return null;
        return value.trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-{2,}", "-");
    }

    private void applyUploadedImage(Movie movie, MultipartFile image, boolean overwriteExisting) {
        if (image == null || image.isEmpty()) return;

        String imageName = FileStoreUtil.saveKeepingNameWithSuffix(image, Paths.get(imageDir));
        if (overwriteExisting || movie.getImageLandscape() == null || movie.getImageLandscape().isBlank()) {
            movie.setImageLandscape(imageName);
        }
        if (overwriteExisting || movie.getImagePortrait() == null || movie.getImagePortrait().isBlank()) {
            movie.setImagePortrait(imageName);
        }
    }

    public MovieResponse getMovieById(Integer movieId, MovieStatus status) {
        var movie = movieRepository.findByMovieIdAndStatus(movieId, status)
                .orElseThrow(() -> {
                    log.error("Movie with id {} not found", movieId);
                    return new AppException(ErrorCode.MOVIE_NOT_FOUND);
                });
        log.info("Retrieving movie with id: {}", movieId);
        return movieMapper.toMovieResponse(movie);
    }

    public MovieResponse createMovie(MovieCreationResquest request) {
        if (request == null) throw new AppException(ErrorCode.INVALID_REQUEST);

        var movieType = movieTypeRepository.findById(request.getMovieTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_TYPE_NOT_FOUND));

        var movie = movieMapper.toMovieFromMovieCreationRequest(request);
        movie.setMovieType(movieType);
        movie.setStatus(MovieStatus.ACTIVE);

        applyUploadedImage(movie, request.getImage(), false);

        if ((movie.getTrailerUrl() == null || movie.getTrailerUrl().isBlank())
                && request.getVideoTrailer() != null
                && !request.getVideoTrailer().isBlank()) {
            movie.setTrailerUrl(request.getVideoTrailer());
        }
        if (movie.getSlug() == null || movie.getSlug().isBlank()) {
            movie.setSlug(toSlug(movie.getMovieName()));
        }

        movieRepository.save(movie);
        return movieMapper.toMovieResponse(movie);
    }

    public PagingDto<MovieResponse> getAllmovies(Integer movieTypeId, MovieStatus status, Integer page, Integer size) {
        if (page < 1) {
            log.error("Invalid page number: {}", page);
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }
        if (size < 1) {
            log.error("Invalid page size: {}", size);
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Movie> moviePage;
        if (status != null && movieTypeId != null) {
            moviePage = movieRepository.findAllByStatusAndMovieType_MovieTypeId(status, movieTypeId, pageable);
        } else if (status != null) {
            moviePage = movieRepository.findAllByStatus(status, pageable);
        } else if (movieTypeId != null) {
            moviePage = movieRepository.findAllByMovieType_MovieTypeId(movieTypeId, pageable);
        } else {
            moviePage = movieRepository.findAll(pageable);
        }

        log.info("Fetching movies - page: {}, size: {}", page, size);
        List<MovieResponse> movieResponses = movieMapper.toMovieResponseList(moviePage.getContent());
        return PagingDto.<MovieResponse>builder()
                .items(movieResponses)
                .currentPage(page)
                .pageSize(size)
                .totalItems(moviePage.getTotalElements())
                .totalPages(moviePage.getTotalPages())
                .build();
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

        movieMapper.updateMovieInfo(movie, request);

        if (request.getMovieTypeId() != null) {
            var movieType = movieTypeRepository.findById(request.getMovieTypeId()).orElseThrow(() -> {
                log.error("Movie type with id {} not found", request.getMovieTypeId());
                return new AppException(ErrorCode.MOVIE_TYPE_NOT_FOUND);
            });
            movie.setMovieType(movieType);
        }

        applyUploadedImage(movie, request.getImage(), true);

        if ((movie.getTrailerUrl() == null || movie.getTrailerUrl().isBlank())
                && request.getVideoTrailer() != null
                && !request.getVideoTrailer().isBlank()) {
            movie.setTrailerUrl(request.getVideoTrailer());
        }
        if (movie.getSlug() == null || movie.getSlug().isBlank()) {
            movie.setSlug(toSlug(movie.getMovieName()));
        }

        log.info("Updating movie with id: {}", movieId);
        return movieMapper.toMovieResponse(movieRepository.save(movie));
    }

    public boolean deleteMovie(Integer movieId) {
        var movie = movieRepository.findById(movieId)
                .orElseThrow(() -> {
                    log.error("Movie with id {} not found", movieId);
                    return new AppException(ErrorCode.MOVIE_NOT_FOUND);
                });
        movie.setStatus(MovieStatus.INACTIVE);
        movieRepository.save(movie);
        log.info("Deleted movie with id: {}", movieId);
        return true;
    }
}
