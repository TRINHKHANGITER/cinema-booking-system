package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.Movie;
import com.dev.cinemasystem.enums.MovieStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;


public interface MovieRepository extends JpaRepository<Movie, Integer>, JpaSpecificationExecutor<Movie> {

    Page<Movie> findAllByStatusAndMovieType_MovieTypeId(MovieStatus status, Integer movieTypeId, Pageable pageable);

    Optional<Movie> findByMovieId(Integer movieId);
    Optional<Movie> findByMovieIdAndStatus(Integer movieId, MovieStatus status);
    Page<Movie> findAllByStatus(MovieStatus status, Pageable pageable);
    Page<Movie> findAllByMovieType_MovieTypeId(Integer movieTypeId, Pageable pageable);
    boolean existsByMovieType_MovieTypeIdAndStatus(Integer movieTypeId, MovieStatus status);
    boolean existsByMovieNameIgnoreCase(String movieName);
    boolean existsByMovieNameIgnoreCaseAndMovieIdNot(String movieName, Integer movieId);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndMovieIdNot(String slug, Integer movieId);
}


