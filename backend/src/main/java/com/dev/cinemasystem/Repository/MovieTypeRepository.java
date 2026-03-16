package com.dev.cinemasystem.Repository;

import com.dev.cinemasystem.Entity.MovieType;
import com.dev.cinemasystem.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieTypeRepository extends JpaRepository<MovieType, Integer>{
    Page<MovieType> findAllByStatus(Status status, Pageable pageable);
    boolean existsByMovieTypeName(String seatTypeName);
    MovieType findByMovieTypeName(String seatTypeName);
}
