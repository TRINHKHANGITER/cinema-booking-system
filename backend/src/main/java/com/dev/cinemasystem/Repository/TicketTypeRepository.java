package com.dev.cinemasystem.Repository;

import com.dev.cinemasystem.Entity.TicketType;
import com.dev.cinemasystem.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketTypeRepository extends JpaRepository<TicketType, Integer>{
    Page<TicketType> findAllByStatus(Status status, Pageable pageable);
    boolean existsByTicketTypeName(String ticketTypeName);
    TicketType findByTicketTypeName(String ticketTypeName);
}
