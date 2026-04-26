package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.ShowTimeSeat;
import com.dev.cinemasystem.enums.ShowTimeSeatStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ShowTimeSeatRepository extends JpaRepository<ShowTimeSeat, Integer> {

    @Query("""
        select sts
        from ShowTimeSeat sts
        join fetch sts.seat s
        join fetch s.seatType st
        where sts.showTime.showTimeId = :showTimeId
        order by s.seatRow asc, s.seatColumn asc
    """)
    List<ShowTimeSeat> findSeatMapByShowTimeId(@Param("showTimeId") Integer showTimeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select sts
        from ShowTimeSeat sts
        where sts.showTime.showTimeId = :showTimeId
          and sts.seat.seatId in :seatIds
    """)
    List<ShowTimeSeat> findAllForUpdate(@Param("showTimeId") Integer showTimeId, @Param("seatIds") List<Integer> seatIds);

    List<ShowTimeSeat> findAllByOrder_OrderIdAndStatus(Integer orderId, ShowTimeSeatStatus status);

    List<ShowTimeSeat> findAllByOrder_OrderId(Integer orderId);

    List<ShowTimeSeat> findAllByStatusAndHoldExpiresAtBefore(ShowTimeSeatStatus status, LocalDateTime holdExpiresAt);
    boolean existsBySeat_SeatIdAndStatusAndHoldExpiresAtAfter(
            Integer seatId,
            ShowTimeSeatStatus status,
            LocalDateTime holdExpiresAt
    );

    @Query("""
        select sts
        from ShowTimeSeat sts
        where sts.showTime.showTimeId = :showTimeId
          and sts.status = :status
    """)
    List<ShowTimeSeat> findAllByShowTimeIdAndStatus(
            @Param("showTimeId") Integer showTimeId,
            @Param("status") ShowTimeSeatStatus status
    );

    void deleteByShowTime_ShowTimeId(Integer showTimeId);
}
