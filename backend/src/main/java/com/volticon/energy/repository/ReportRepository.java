package com.volticon.energy.repository;

import com.volticon.energy.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByUserIdOrderByGeneratedAtDesc(Long userId);
}
