package com.volticon.energy.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "report_type")
    private String reportType;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "total_consumption_kwh")
    private Double totalConsumptionKwh;

    @Column(name = "estimated_total_cost")
    private Double estimatedTotalCost;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt = LocalDateTime.now();

    // --- Getters and setters ---

    public Long getReportId() { return reportId; }
    public void setReportId(Long reportId) { this.reportId = reportId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Double getTotalConsumptionKwh() { return totalConsumptionKwh; }
    public void setTotalConsumptionKwh(Double totalConsumptionKwh) { this.totalConsumptionKwh = totalConsumptionKwh; }

    public Double getEstimatedTotalCost() { return estimatedTotalCost; }
    public void setEstimatedTotalCost(Double estimatedTotalCost) { this.estimatedTotalCost = estimatedTotalCost; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
