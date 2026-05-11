package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.dto.dashboardDTO.CinemaRevenueResponse;
import com.dev.cinemasystem.dto.dashboardDTO.ComboRevenueResponse;
import com.dev.cinemasystem.dto.dashboardDTO.MovieRevenueResponse;
import com.dev.cinemasystem.dto.dashboardDTO.MovieTypeRevenueResponse;
import com.dev.cinemasystem.dto.dashboardDTO.OrderStatisticItemResponse;
import com.dev.cinemasystem.entity.Order;
import com.dev.cinemasystem.enums.ComboDetailStatus;
import com.dev.cinemasystem.enums.OrderStatus;
import com.dev.cinemasystem.enums.TicketStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer>, JpaSpecificationExecutor<Order> {
    List<Order> findAllByStatus(OrderStatus status);

    Optional<Order> findTopByUser_UserIdAndShowTime_ShowTimeIdAndStatusOrderByOrderIdDesc(
            Integer userId,
            Integer showTimeId,
            OrderStatus status
    );

    List<Order> findAllByStatusAndExpiredAtBefore(OrderStatus status, LocalDateTime expiredAt);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.orderId = :orderId")
    Optional<Order> findByIdForUpdate(@Param("orderId") Integer orderId);

    @Query("""
        select coalesce(sum(o.totalAmount), 0)
        from Order o
        where o.status = :status
          and o.createdAt >= :startAt
          and o.createdAt <= :endAt
    """)
    BigDecimal sumPaidTotalAmountByCreatedAtRange(
            @Param("status") OrderStatus status,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt
    );

    @Query("""
        select count(o.orderId)
        from Order o
        where o.createdAt >= :startAt
          and o.createdAt <= :endAt
    """)
    Long countOrdersByCreatedAtRange(
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt
    );

    @Query("""
        select coalesce(sum(o.totalAmount), 0)
        from Order o
        where o.createdAt >= :startAt
          and o.createdAt <= :endAt
          and (:status is null or o.status = :status)
    """)
    BigDecimal sumTotalAmountByCreatedAtRangeAndStatus(
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("status") OrderStatus status
    );

    @Query(
            value = """
        select new com.dev.cinemasystem.dto.dashboardDTO.OrderStatisticItemResponse(
            o.orderId,
            coalesce(u.fullName, 'Khách lẻ'),
            m.movieName,
            st.releaseDate,
            st.startTime,
            count(t.ticketId),
            coalesce(o.totalAmount, 0),
            o.status,
            o.createdAt
        )
        from Order o
        left join o.user u
        join o.showTime st
        join st.movie m
        left join Ticket t on t.order = o and t.status = :ticketStatus
        where o.createdAt >= :startAt
          and o.createdAt <= :endAt
          and (:status is null or o.status = :status)
        group by o.orderId, u.fullName, m.movieName, st.releaseDate, st.startTime, o.totalAmount, o.status, o.createdAt
        order by o.createdAt desc, o.orderId desc
    """,
            countQuery = """
        select count(o.orderId)
        from Order o
        where o.createdAt >= :startAt
          and o.createdAt <= :endAt
          and (:status is null or o.status = :status)
    """
    )
    Page<OrderStatisticItemResponse> findOrderStatistics(
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("status") OrderStatus status,
            @Param("ticketStatus") TicketStatus ticketStatus,
            Pageable pageable
    );

    @Query("""
        select new com.dev.cinemasystem.dto.dashboardDTO.CinemaRevenueResponse(
            c.cinemaId,
            c.cinemaName,
            p.provinceId,
            p.provinceName,
            coalesce(sum(o.totalAmount), 0),
            count(o.orderId)
        )
        from Cinema c
        join c.province p
        left join Room r on r.cinema = c
        left join ShowTime st on st.room = r
        left join Order o on o.showTime = st
            and o.status = :status
            and o.createdAt >= :startAt
            and o.createdAt <= :endAt
        where (:provinceId is null or p.provinceId = :provinceId)
          and (:cinemaId is null or c.cinemaId = :cinemaId)
        group by c.cinemaId, c.cinemaName, p.provinceId, p.provinceName
        order by c.cinemaName asc
    """)
    List<CinemaRevenueResponse> findRevenueByCinema(
            @Param("status") OrderStatus status,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("provinceId") Integer provinceId,
            @Param("cinemaId") Integer cinemaId
    );

    @Query("""
        select new com.dev.cinemasystem.dto.dashboardDTO.MovieRevenueResponse(
            m.movieId,
            m.movieName,
            mt.movieTypeId,
            mt.movieTypeName,
            m.releaseDate,
            m.endDate,
            m.status,
            coalesce(sum(o.totalAmount), 0),
            count(o.orderId)
        )
        from Movie m
        join m.movieType mt
        left join ShowTime st on st.movie = m
        left join Order o on o.showTime = st
            and o.status = :status
            and o.createdAt >= :startAt
            and o.createdAt <= :endAt
        where (:movieId is null or m.movieId = :movieId)
        group by m.movieId, m.movieName, mt.movieTypeId, mt.movieTypeName, m.releaseDate, m.endDate, m.status
        order by m.movieName asc
    """)
    List<MovieRevenueResponse> findRevenueByMovie(
            @Param("status") OrderStatus status,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("movieId") Integer movieId
    );

    @Query("""
        select new com.dev.cinemasystem.dto.dashboardDTO.MovieTypeRevenueResponse(
            mt.movieTypeId,
            mt.movieTypeName,
            mt.description,
            mt.status,
            coalesce(sum(o.totalAmount), 0),
            count(o.orderId)
        )
        from MovieType mt
        left join Movie m on m.movieType = mt
        left join ShowTime st on st.movie = m
        left join Order o on o.showTime = st
            and o.status = :status
            and o.createdAt >= :startAt
            and o.createdAt <= :endAt
        where (:categoryId is null or mt.movieTypeId = :categoryId)
        group by mt.movieTypeId, mt.movieTypeName, mt.description, mt.status
        order by mt.movieTypeName asc
    """)
    List<MovieTypeRevenueResponse> findRevenueByMovieType(
            @Param("status") OrderStatus status,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("categoryId") Integer categoryId
    );

    @Query("""
        select new com.dev.cinemasystem.dto.dashboardDTO.ComboRevenueResponse(
            c.comboId,
            c.comboName,
            c.description,
            c.image,
            c.price,
            c.status,
            coalesce(sum(oc.unitPrice * oc.quantity), 0),
            coalesce(sum(oc.quantity), 0),
            count(distinct oc.order.orderId)
        )
        from Combo c
        left join OrderCombo oc on oc.combo = c
            and oc.status = :comboDetailStatus
            and oc.order.status = :orderStatus
            and oc.order.createdAt >= :startAt
            and oc.order.createdAt <= :endAt
        where (:comboId is null or c.comboId = :comboId)
        group by c.comboId, c.comboName, c.description, c.image, c.price, c.status
        order by c.comboName asc
    """)
    List<ComboRevenueResponse> findRevenueByCombo(
            @Param("orderStatus") OrderStatus orderStatus,
            @Param("comboDetailStatus") ComboDetailStatus comboDetailStatus,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("comboId") Integer comboId
    );
}
