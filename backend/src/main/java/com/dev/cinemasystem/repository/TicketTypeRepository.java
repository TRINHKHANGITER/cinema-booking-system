package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.TicketType;
import com.dev.cinemasystem.enums.TicketTypeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketTypeRepository extends JpaRepository<TicketType, Integer>{
    Page<TicketType> findAllByStatus(TicketTypeStatus status, Pageable pageable);
    boolean existsByTicketTypeName(String ticketTypeName);
    TicketType findByTicketTypeName(String ticketTypeName);
}

