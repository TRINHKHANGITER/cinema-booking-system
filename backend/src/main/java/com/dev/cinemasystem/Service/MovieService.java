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
import com.dev.cinemasystem.enums.Status;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MovieService {

    MovieRepository movieRepository;
    MovieMapper movieMapper;
    MovieTypeRepository movieTypeRepository;




    public MovieResponse getMovieById(Integer movieId){
        var movie = movieRepository.findById(movieId)
                .orElseThrow(() -> {
                    log.error("Movie with id {} not found", movieId);
                    return new AppException(ErrorCode.MOVIE_NOT_FOUND);
                });
        log.info("Retrieving movie with id: {}", movieId);
        return movieMapper.toMovieResponse(movie);
    }

    public  MovieResponse createMovie(MovieCreationResquest request){
        if(request == null){
            log.error("Movie creation request is null");
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        var movieType = movieTypeRepository.findById(request.getMovieTypeId()).orElseThrow(() -> {
            log.error("Movie type with id {} not found", request.getMovieTypeId());
            return new AppException(ErrorCode.MOVIE_TYPE_NOT_FOUND);
        });

        var movie = movieMapper.toMovieFromMovieCreationRequest(request);
        movie.setMovieType(movieType);
        movie.setStatus(Status.active);
        movieRepository.save(movie);
        return movieMapper.toMovieResponse(movieRepository.save(movie));
    }

    public PagingDto<MovieResponse> getAllmovies( Integer movieTypeId, Status status, Integer page, Integer size){
        if (page < 1) {
            log.error("Invalid page number: {}", page);
            throw new AppException(ErrorCode.INVALID_PAGE_NUMBER);
        }
        if (size < 1 ) {
            log.error("Invalid page size: {}", size);
            throw new AppException(ErrorCode.INVALID_PAGE_SIZE);
        }
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Movie> moviePage ;
        if(status != null && movieTypeId != null){
            moviePage = movieRepository.findAllByStatusAndMovieType_MovieTypeId(status, movieTypeId, pageable);
        }else if(status != null){
            moviePage = movieRepository.findAllByStatus( status, pageable);
        }else if(movieTypeId != null){
            moviePage = movieRepository.findAllByMovieType_MovieTypeId( movieTypeId, pageable);
        }else {
            moviePage = movieRepository.findAll(pageable);
        }

        log.info("Fetching movies - page: {}, size: {}", page, size);
        List<MovieResponse> movieResponses = movieMapper.toMovieResponseList(moviePage.getContent());
        return  PagingDto.<MovieResponse>builder()
                .items(movieResponses)
                .currentPage(page)
                .pageSize(size)
                .totalItems(moviePage.getTotalElements())
                .totalPages(moviePage.getTotalPages())
                .build();
    }

    public MovieResponse  updateMovie(Integer movieId, MovieCreationResquest request){
        var movie = movieRepository.findById(movieId)
                .orElseThrow(() -> {
                    log.error("Movie with id {} not found", movieId);
                    return new AppException(ErrorCode.MOVIE_NOT_FOUND);
                });

        var movieType = movieTypeRepository.findById(request.getMovieTypeId()).orElseThrow(() -> {
            log.error("Movie type with id {} not found", request.getMovieTypeId());
            return new AppException(ErrorCode.MOVIE_TYPE_NOT_FOUND);
        });
        movieMapper.updateMovieInfo( movie, request);
        movie.setMovieType(movieType);
        log.info("Updating movie with id: {}", movieId);
        return movieMapper.toMovieResponse(movieRepository.save(movie));
    }

    public boolean deleteMovie(Integer movieId){
        var movie = movieRepository.findById(movieId)
                .orElseThrow(() -> {
                    log.error("Movie with id {} not found", movieId);
                    return new AppException(ErrorCode.MOVIE_NOT_FOUND);
                });
        movie.setStatus(Status.deleted);
        movieRepository.save(movie);
        log.info("Deleted movie with id: {}", movieId);
        return true;
    }


}
