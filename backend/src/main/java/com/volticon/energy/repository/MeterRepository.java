package com.volticon.energy.repository;

import com.volticon.energy.entity.Meter;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MeterRepository extends JpaRepository<Meter, Long> {
    List<Meter> findByUserId(Long userId);
    Optional<Meter> findByMeterIdAndUserId(Long meterId, Long userId);
}
