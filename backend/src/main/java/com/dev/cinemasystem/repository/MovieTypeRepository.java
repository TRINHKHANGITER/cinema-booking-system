package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.MovieType;
import com.dev.cinemasystem.enums.MovieTypeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface MovieTypeRepository extends JpaRepository<MovieType, Integer>, JpaSpecificationExecutor<MovieType> {
    Page<MovieType> findAllByStatus(MovieTypeStatus status, Pageable pageable);
    List<MovieType> findAllByStatusOrderByMovieTypeNameAsc(MovieTypeStatus status);
    List<MovieType> findAllByOrderByMovieTypeNameAsc();
    boolean existsByMovieTypeNameIgnoreCase(String movieTypeName);
    boolean existsByMovieTypeNameIgnoreCaseAndMovieTypeIdNot(String movieTypeName, Integer movieTypeId);
}

