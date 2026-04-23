package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.Combo;
import com.dev.cinemasystem.enums.ComboStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComboRepository extends JpaRepository<Combo, Integer> {
    List<Combo> findAllByStatus(ComboStatus status);
}
