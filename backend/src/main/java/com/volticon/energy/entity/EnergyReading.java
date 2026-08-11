package com.volticon.energy.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "energy_readings")
public class EnergyReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reading_id")
    private Long readingId;

    @Column(name = "appliance_id", nullable = false)
    private Long applianceId;

    @Column(name = "reading_date", nullable = false)
    private LocalDate readingDate = LocalDate.now();

    @Column(name = "reading_time")
    private LocalTime readingTime = LocalTime.now();

    @Column(name = "duration_hours", nullable = false)
    private Double durationHours;

    @Column(name = "energy_used_kwh", nullable = false)
    private Double energyUsedKwh;

    @Column(name = "estimated_cost", nullable = false)
    private Double estimatedCost;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // --- Getters and setters ---

    public Long getReadingId() { return readingId; }
    public void setReadingId(Long readingId) { this.readingId = readingId; }

    public Long getApplianceId() { return applianceId; }
    public void setApplianceId(Long applianceId) { this.applianceId = applianceId; }

    public LocalDate getReadingDate() { return readingDate; }
    public void setReadingDate(LocalDate readingDate) { this.readingDate = readingDate; }

    public LocalTime getReadingTime() { return readingTime; }
    public void setReadingTime(LocalTime readingTime) { this.readingTime = readingTime; }

    public Double getDurationHours() { return durationHours; }
    public void setDurationHours(Double durationHours) { this.durationHours = durationHours; }

    public Double getEnergyUsedKwh() { return energyUsedKwh; }
    public void setEnergyUsedKwh(Double energyUsedKwh) { this.energyUsedKwh = energyUsedKwh; }

    public Double getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(Double estimatedCost) { this.estimatedCost = estimatedCost; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
