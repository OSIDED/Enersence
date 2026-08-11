package com.volticon.energy.repository;

import com.volticon.energy.entity.EnergyReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface EnergyReadingRepository extends JpaRepository<EnergyReading, Long> {

    // Joins to Appliance to filter by the OWNING user, since EnergyReading
    // itself only stores appliance_id, not user_id directly (matches the ERD).
    @Query("""
        SELECT r FROM EnergyReading r
        JOIN Appliance a ON a.applianceId = r.applianceId
        WHERE a.userId = :userId AND r.readingDate = :day
        ORDER BY r.readingTime DESC
        """)
    List<EnergyReading> findTodayReadingsForUser(@Param("userId") Long userId, @Param("day") LocalDate day);

    // Powers the Dashboard's "Usage History (Last 7 Days)" chart with real
    // saved readings instead of placeholder numbers.
    @Query("""
        SELECT r FROM EnergyReading r
        JOIN Appliance a ON a.applianceId = r.applianceId
        WHERE a.userId = :userId AND r.readingDate BETWEEN :startDate AND :endDate
        ORDER BY r.readingDate ASC
        """)
    List<EnergyReading> findReadingsBetween(@Param("userId") Long userId,
                                             @Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate);
    // Powers "Consumption by Category" donut chart — groups readings by
    // the owning appliance's category.
    @Query("""
        SELECT COALESCE(a.category, 'Uncategorized') as category, SUM(r.energyUsedKwh) as total
        FROM EnergyReading r
        JOIN Appliance a ON a.applianceId = r.applianceId
        WHERE a.userId = :userId
        GROUP BY a.category
        """)
    List<Object[]> sumEnergyByCategory(@Param("userId") Long userId);

    // Powers the "Vs. Last Month" stat card — total kWh in a date range.
    @Query("""
        SELECT COALESCE(SUM(r.energyUsedKwh), 0) FROM EnergyReading r
        JOIN Appliance a ON a.applianceId = r.applianceId
        WHERE a.userId = :userId AND r.readingDate BETWEEN :startDate AND :endDate
        """)
    Double sumEnergyBetween(@Param("userId") Long userId,
                             @Param("startDate") LocalDate startDate,
                             @Param("endDate") LocalDate endDate);

    // Same range, but total cost instead of kWh — for the Estimated Bill card.
    @Query("""
        SELECT COALESCE(SUM(r.estimatedCost), 0) FROM EnergyReading r
        JOIN Appliance a ON a.applianceId = r.applianceId
        WHERE a.userId = :userId AND r.readingDate BETWEEN :startDate AND :endDate
        """)
    Double sumCostBetween(@Param("userId") Long userId,
                           @Param("startDate") LocalDate startDate,
                           @Param("endDate") LocalDate endDate);
}

