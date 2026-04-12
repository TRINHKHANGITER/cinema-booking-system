package com.dev.cinemasystem.Entity;


import com.dev.cinemasystem.enums.TicketTypeStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "ticket_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_type_id")
    Integer ticketTypeId;

    @Column(nullable = false, unique = true)
    String ticketTypeName;

    String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    TicketTypeStatus status;

}


