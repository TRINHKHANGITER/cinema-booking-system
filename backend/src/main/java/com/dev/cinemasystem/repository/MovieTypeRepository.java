package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.MovieType;
import com.dev.cinemasystem.enums.MovieTypeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieTypeRepository extends JpaRepository<MovieType, Integer>{
    Page<MovieType> findAllByStatus(MovieTypeStatus status, Pageable pageable);
    boolean existsByMovieTypeName(String seatTypeName);
    MovieType findByMovieTypeName(String seatTypeName);
}

