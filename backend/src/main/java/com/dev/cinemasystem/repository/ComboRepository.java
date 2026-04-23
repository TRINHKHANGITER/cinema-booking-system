package com.dev.cinemasystem.repository;

import com.dev.cinemasystem.entity.Combo;
import com.dev.cinemasystem.enums.ComboStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComboRepository extends JpaRepository<Combo, Integer>, JpaSpecificationExecutor<Combo> {
    List<Combo> findAllByStatus(ComboStatus status);
    boolean existsByComboNameIgnoreCase(String comboName);
    boolean existsByComboNameIgnoreCaseAndComboIdNot(String comboName, Integer comboId);
}
