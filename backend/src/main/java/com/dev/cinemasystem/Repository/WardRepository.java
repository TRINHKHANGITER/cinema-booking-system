package com.dev.cinemasystem.Repository;


import com.dev.cinemasystem.Entity.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WardRepository extends JpaRepository<Ward, Integer> {
    Optional<Ward> findByName(String name);
    Optional<Ward> findByCode(Integer code);
    boolean existsByCode(Integer code);
}
