package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.PriceTicket;
import com.dev.cinemasystem.entity.ShowTime;
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
import java.util.Collection;
import java.util.List;
import java.util.Optional;


public interface ShowTimeRepository extends JpaRepository<ShowTime, Integer> {

    Page<ShowTime> findAllByStatus(ShowTimeStatus status, Pageable pageable);
    Page<ShowTime> findAllByRoom_Cinema_CinemaId(Integer cinemaId, Pageable pageable);
    Page<ShowTime> findAllByRoom_Cinema_CinemaIdAndStatus(Integer cinemaId, ShowTimeStatus status, Pageable pageable);

    @Query("""
        select st
        from ShowTime st
        join st.room r
        join r.cinema c
        join c.province p
        join st.movie m
        join m.movieType mt
        where (:provinceId is null or p.provinceId = :provinceId)
          and (:cinemaId is null or c.cinemaId = :cinemaId)
          and (:movieTypeId is null or mt.movieTypeId = :movieTypeId)
          and (
                :releaseDate is null
                or (:releaseDateCondition = 'GT' and st.releaseDate > :releaseDate)
                or (:releaseDateCondition = 'GTE' and st.releaseDate >= :releaseDate)
                or (:releaseDateCondition = 'EQ' and st.releaseDate = :releaseDate)
              )
          and (:name is null or lower(m.movieName) like lower(concat('%', :name, '%')))
          and (:movieId is null or m.movieId = :movieId)
          and (:status is null or st.status = :status)
    """)
    Page<ShowTime> findAllByFilters(
            @Param("provinceId") Integer provinceId,
            @Param("cinemaId") Integer cinemaId,
            @Param("movieTypeId") Integer movieTypeId,
            @Param("releaseDate") LocalDate releaseDate,
            @Param("releaseDateCondition") String releaseDateCondition,
            @Param("name") String name,
            @Param("movieId") Integer movieId,
            @Param("status") ShowTimeStatus status,
            Pageable pageable
    );

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
      concat(concat(st.releaseDate, 'T'), st.startTime),
      concat(concat(st.releaseDate, 'T'), st.endTime),
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

    @Query(
            value = """
        select st
        from ShowTime st
        join st.room r
        join r.cinema c
        join c.province p
        join st.movie m
        join m.movieType mt
        where (:provinceId is null or p.provinceId = :provinceId)
          and (:cinemaId is null or c.cinemaId = :cinemaId)
          and (:movieTypeId is null or mt.movieTypeId = :movieTypeId)
          and (
                :releaseDate is null
                or (:releaseDateCondition = 'GT' and st.releaseDate > :releaseDate)
                or (:releaseDateCondition = 'GTE' and st.releaseDate >= :releaseDate)
                or (:releaseDateCondition = 'EQ' and st.releaseDate = :releaseDate)
              )
          and (:name is null or lower(m.movieName) like lower(concat('%', :name, '%')))
          and (:movieId is null or m.movieId = :movieId)
          and (:status is null or st.status = :status)
          and not exists (
                select 1
                from ShowTime st2
                join st2.room r2
                join r2.cinema c2
                join c2.province p2
                join st2.movie m2
                join m2.movieType mt2
                where m2.movieId = m.movieId
                  and (:provinceId is null or p2.provinceId = :provinceId)
                  and (:cinemaId is null or c2.cinemaId = :cinemaId)
                  and (:movieTypeId is null or mt2.movieTypeId = :movieTypeId)
                  and (
                        :releaseDate is null
                        or (:releaseDateCondition = 'GT' and st2.releaseDate > :releaseDate)
                        or (:releaseDateCondition = 'GTE' and st2.releaseDate >= :releaseDate)
                        or (:releaseDateCondition = 'EQ' and st2.releaseDate = :releaseDate)
                      )
                  and (:name is null or lower(m2.movieName) like lower(concat('%', :name, '%')))
                  and (:movieId is null or m2.movieId = :movieId)
                  and (:status is null or st2.status = :status)
                  and (
                       st2.releaseDate < st.releaseDate
                       or (st2.releaseDate = st.releaseDate and st2.startTime < st.startTime)
                       or (st2.releaseDate = st.releaseDate and st2.startTime = st.startTime and st2.showTimeId < st.showTimeId)
                  )
          )
    """,
            countQuery = """
        select count(distinct m.movieId)
        from ShowTime st
        join st.room r
        join r.cinema c
        join c.province p
        join st.movie m
        join m.movieType mt
        where (:provinceId is null or p.provinceId = :provinceId)
          and (:cinemaId is null or c.cinemaId = :cinemaId)
          and (:movieTypeId is null or mt.movieTypeId = :movieTypeId)
          and (
                :releaseDate is null
                or (:releaseDateCondition = 'GT' and st.releaseDate > :releaseDate)
                or (:releaseDateCondition = 'GTE' and st.releaseDate >= :releaseDate)
                or (:releaseDateCondition = 'EQ' and st.releaseDate = :releaseDate)
              )
          and (:name is null or lower(m.movieName) like lower(concat('%', :name, '%')))
          and (:movieId is null or m.movieId = :movieId)
          and (:status is null or st.status = :status)
    """
    )
    Page<ShowTime> findAllByFiltersWithUniqueMovie(
            @Param("provinceId") Integer provinceId,
            @Param("cinemaId") Integer cinemaId,
            @Param("movieTypeId") Integer movieTypeId,
            @Param("releaseDate") LocalDate releaseDate,
            @Param("releaseDateCondition") String releaseDateCondition,
            @Param("name") String name,
            @Param("movieId") Integer movieId,
            @Param("status") ShowTimeStatus status,
            Pageable pageable
    );

    @Query("""
        select st
        from ShowTime st
        join st.room r
        join r.cinema c
        join c.province p
        join st.movie m
        join m.movieType mt
        where m.movieId in :movieIds
          and (:provinceId is null or p.provinceId = :provinceId)
          and (:cinemaId is null or c.cinemaId = :cinemaId)
          and (:movieTypeId is null or mt.movieTypeId = :movieTypeId)
          and (
                :releaseDate is null
                or (:releaseDateCondition = 'GT' and st.releaseDate > :releaseDate)
                or (:releaseDateCondition = 'GTE' and st.releaseDate >= :releaseDate)
                or (:releaseDateCondition = 'EQ' and st.releaseDate = :releaseDate)
              )
          and (:name is null or lower(m.movieName) like lower(concat('%', :name, '%')))
          and (:movieId is null or m.movieId = :movieId)
          and (:status is null or st.status = :status)
        order by m.movieId, st.releaseDate, st.startTime, st.showTimeId
    """)
    List<ShowTime> findAllByFiltersAndMovieIds(
            @Param("provinceId") Integer provinceId,
            @Param("cinemaId") Integer cinemaId,
            @Param("movieTypeId") Integer movieTypeId,
            @Param("releaseDate") LocalDate releaseDate,
            @Param("releaseDateCondition") String releaseDateCondition,
            @Param("name") String name,
            @Param("movieId") Integer movieId,
            @Param("status") ShowTimeStatus status,
            @Param("movieIds") List<Integer> movieIds
    );

    List<ShowTime> findAllByMovie_MovieIdOrderByReleaseDateAscStartTimeAscShowTimeIdAsc(Integer movieId);
    boolean existsByMovie_MovieIdAndStatusIn(Integer movieId, Collection<ShowTimeStatus> statuses);


}



