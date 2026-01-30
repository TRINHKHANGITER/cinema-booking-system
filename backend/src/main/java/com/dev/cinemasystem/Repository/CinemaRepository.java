package com.dev.cinemasystem.Repository;


import com.dev.cinemasystem.Entity.Cinema;
import com.dev.cinemasystem.Entity.Province;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CinemaRepository extends JpaRepository<Cinema, Integer> {
boolean existsByAddress_AddressId(Integer addressId);
}
