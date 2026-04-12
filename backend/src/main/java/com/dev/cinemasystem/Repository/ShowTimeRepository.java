package com.dev.cinemasystem.Repository;

import com.dev.cinemasystem.Entity.ShowTime;
import com.dev.cinemasystem.dto.showTimeDTO.ShowTimeSearchDto;
import com.dev.cinemasystem.enums.ShowTimeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;


public interface ShowTimeRepository extends JpaRepository<ShowTime, Integer> {

    Page<ShowTime> findAllByStatus(ShowTimeStatus status, Pageable pageable);
    Page<ShowTime> findAllByRoom_Cinema_CinemaId(Integer cinemaId, Pageable pageable);
    Page<ShowTime> findAllByRoom_Cinema_CinemaIdAndStatus(Integer cinemaId, ShowTimeStatus status, Pageable pageable);

    @Query("""
        select (count(st) > 0) from ShowTime st
        where st.room.roomId = :roomId
          and st.status <> com.dev.cinemasystem.enums.ShowTimeStatus.CANCELLED
          and function('timestamp', st.releaseDate, st.startTime) < :endTime
          and function('timestamp', st.releaseDate, st.endTime)   > :startTime
    """)
    boolean existsOverlappingShowTime(
            Integer roomId,
            LocalDateTime startTime,
            LocalDateTime endTime
    );

    @Query("""
        select count(st) from ShowTime st
        where st.showTimeId <> :showTimeId
          and st.room.roomId = :roomId
          and st.status <> com.dev.cinemasystem.enums.ShowTimeStatus.CANCELLED
          and function('timestamp', st.releaseDate, st.startTime) < :endTime
          and function('timestamp', st.releaseDate, st.endTime)   > :startTime
    """)
    int countOverlappingShowTime(
            Integer showTimeId,
            Integer roomId,
            LocalDateTime startTime,
            LocalDateTime endTime
    );




    @Query("""
    select new com.dev.cinemasystem.dto.showTimeDTO.ShowTimeSearchDto(
      st.showTimeId,
      function('timestamp', st.releaseDate, st.startTime),
      function('timestamp', st.releaseDate, st.endTime),
      m.movieId, m.movieName, mt.movieTypeName,
      c.cinemaId, c.cinemaName,
      r.roomId, r.roomName, rt.roomTypeName
    )
    from ShowTime st
    join st.movie m
    join m.movieType mt
    join st.room r
    join r.roomType rt
    join r.cinema c
    where st.status <> com.dev.cinemasystem.enums.ShowTimeStatus.CANCELLED
      and (:keyword is null or lower(m.movieName) like lower(concat('%', :keyword, '%')))
      and (:movieTypeId is null or mt.movieTypeId = :movieTypeId)
      and (:cinemaId is null or c.cinemaId = :cinemaId)
      and (:roomTypeId is null or rt.roomTypeId = :roomTypeId)
      and (:dateFrom is null or st.releaseDate >= :dateFrom)
      and (:dateTo   is null or st.releaseDate <= :dateTo)
      and (:timeFrom is null or st.startTime >= :timeFrom)
      and (:timeTo   is null or st.startTime <= :timeTo)
    order by st.startTime
    """)
    Page<ShowTimeSearchDto> searchShowTimes(
            @Param("keyword") String keyword,
            @Param("movieTypeId") Integer movieTypeId,
            @Param("cinemaId") Integer cinemaId,
            @Param("roomTypeId") Integer roomTypeId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("timeFrom") LocalTime timeFrom,
            @Param("timeTo") LocalTime timeTo,
            Pageable pageable
    );

}



