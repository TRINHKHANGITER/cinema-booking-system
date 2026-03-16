package com.dev.cinemasystem.Repository;


import com.dev.cinemasystem.Entity.Address;
import com.dev.cinemasystem.Entity.Cinema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {
    Optional<Address> findByProvince_CodeAndWard_Code(Integer provinceId, Integer wardId);
}
