package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.Movie;
import com.dev.cinemasystem.enums.MovieStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface MovieRepository extends JpaRepository<Movie, Integer> {

    Page<Movie> findAllByStatusAndMovieType_MovieTypeId(MovieStatus status, Integer movieTypeId, Pageable pageable);

    Optional<Movie> findByMovieIdAndStatus(Integer movieId, MovieStatus status);
    Page<Movie> findAllByStatus(MovieStatus status, Pageable pageable);
    Page<Movie> findAllByMovieType_MovieTypeId(Integer movieTypeId, Pageable pageable);
}


