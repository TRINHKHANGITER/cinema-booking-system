package com.dev.cinemasystem.Repository;

import com.dev.cinemasystem.Entity.ShowTime;
import com.dev.cinemasystem.dto.showTimeDTO.ShowTimeSearchDto;
import com.dev.cinemasystem.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;


public interface ShowTimeRepository extends JpaRepository<ShowTime, Integer> {

    Page<ShowTime> findAllByStatus(Status status, Pageable pageable);

    @Query("""
        select (count(st) > 0) from ShowTime st
        where st.room.roomId = :roomId
          and st.status <> com.dev.cinemasystem.enums.Status.CANCELLED
          and st.status <> com.dev.cinemasystem.enums.Status.DELETED
          and st.startTime < :endTime
          and st.endTime   > :startTime
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
          and st.status <> com.dev.cinemasystem.enums.Status.CANCELLED
          and st.status <> com.dev.cinemasystem.enums.Status.DELETED
          and st.startTime < :endTime
          and st.endTime   > :startTime
    """)
    int countOverlappingShowTime(
            Integer showTimeId,
            Integer roomId,
            LocalDateTime startTime,
            LocalDateTime endTime
    );




    @Query("""
    select new com.dev.cinemasystem.dto.showTimeDTO.ShowTimeSearchDto(
      st.showTimeId, st.startTime, st.endTime,
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
    where st.status <> com.dev.cinemasystem.enums.Status.CANCELLED
      and st.status <> com.dev.cinemasystem.enums.Status.DELETED
      and (:keyword is null or lower(m.movieName) like lower(concat('%', :keyword, '%')))
      and (:movieTypeId is null or mt.movieTypeId = :movieTypeId)
      and (:cinemaId is null or c.cinemaId = :cinemaId)
      and (:roomTypeId is null or rt.roomTypeId = :roomTypeId)
      and (:dateFrom is null or function('date', st.startTime) >= :dateFrom)
      and (:dateTo   is null or function('date', st.startTime) <= :dateTo)
      and (:timeFrom is null or function('time', st.startTime) >= :timeFrom)
      and (:timeTo   is null or function('time', st.startTime) <= :timeTo)
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


