package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.Cinema;
import com.dev.cinemasystem.enums.CinemaStatus;
import com.dev.cinemasystem.enums.ShowTimeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CinemaRepository extends JpaRepository<Cinema, Integer>, JpaSpecificationExecutor<Cinema> {
    boolean existsByCinemaName(String cinemaName);
    boolean existsByCinemaNameIgnoreCase(String cinemaName);
    boolean existsByCinemaNameIgnoreCaseAndCinemaIdNot(String cinemaName, Integer cinemaId);
    boolean existsByProvince_ProvinceIdAndStatus(Integer provinceId, CinemaStatus status);

    Page<Cinema> findByProvince_ProvinceIdAndStatus(Integer provinceId, CinemaStatus status, Pageable pageable);

    Page<Cinema> findByProvince_ProvinceId(Integer provinceId, Pageable pageable);

    Page<Cinema> findByStatus(CinemaStatus status, Pageable pageable);

    @Query("""
        select c from Cinema c
        where (:provinceId is null or c.province.provinceId = :provinceId)
          and (:status is null or c.status = :status)
        order by c.cinemaName asc
    """)
    List<Cinema> findAllByFilters(
            @Param("provinceId") Integer provinceId,
            @Param("status") CinemaStatus status
    );

    @Query("""
        select c from Cinema c
        where (:provinceId is null or c.province.provinceId = :provinceId)
          and (:status is null or c.status = :status)
          and exists (
            select 1 from ShowTime st
            where st.room.cinema = c
              and st.status = :showTimeStatus
          )
        order by c.cinemaName asc
    """)
    List<Cinema> findAllByFiltersWithShowTimeStatus(
            @Param("provinceId") Integer provinceId,
            @Param("status") CinemaStatus status,
            @Param("showTimeStatus") ShowTimeStatus showTimeStatus
    );
}

