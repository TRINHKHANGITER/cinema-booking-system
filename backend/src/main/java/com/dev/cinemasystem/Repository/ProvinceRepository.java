package com.dev.cinemasystem.Repository;


import com.dev.cinemasystem.Entity.Province;
import com.dev.cinemasystem.Entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProvinceRepository extends JpaRepository<Province, Integer> {
    Optional<Province> findByName(String name);
    Optional<Province> findByCode(Integer code);
    boolean existsByCode(Integer code);
}
