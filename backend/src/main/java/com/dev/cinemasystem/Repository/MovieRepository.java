package com.dev.cinemasystem.Repository;

import com.dev.cinemasystem.Entity.Movie;
import com.dev.cinemasystem.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;


public interface MovieRepository extends JpaRepository<Movie, Integer> {

    Page<Movie> findAllByStatusAndMovieType_MovieTypeId(Status status, Integer movieTypeId, Pageable pageable);

    Page<Movie> findAllByStatus(Status status, Pageable pageable);
    Page<Movie> findAllByMovieType_MovieTypeId(Integer movieTypeId, Pageable pageable);
}

