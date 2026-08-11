package com.volticon.energy.controller;

import com.volticon.energy.dto.CategoryBreakdownDto;
import com.volticon.energy.dto.MonthComparisonDto;
import com.volticon.energy.entity.Report;
import com.volticon.energy.repository.ReportRepository;
import com.volticon.energy.service.AnalyticsClientService;
import com.volticon.energy.service.EnergyReadingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportRepository reportRepository;
    private final AnalyticsClientService analyticsClient;
    private final EnergyReadingService readingService;

    public ReportController(ReportRepository reportRepository,
                             AnalyticsClientService analyticsClient,
                             EnergyReadingService readingService) {
        this.reportRepository = reportRepository;
        this.analyticsClient = analyticsClient;
        this.readingService = readingService;
    }

    /** Powers the "Historical Monthly Bills" table on the Reports page. */
    @GetMapping
    public List<Report> getReports(@RequestParam("user_id") Long userId) {
        return reportRepository.findByUserIdOrderByGeneratedAtDesc(userId);
    }

    /** Powers the "Consumption by Category" donut chart with real data. */
    @GetMapping("/category-breakdown")
    public List<CategoryBreakdownDto> getCategoryBreakdown(@RequestParam("user_id") Long userId) {
        return readingService.getCategoryBreakdown(userId);
    }

    /** Powers "Vs. Last Month" and "Estimated Bill" cards with real data. */
    @GetMapping("/month-comparison")
    public MonthComparisonDto getMonthComparison(@RequestParam("user_id") Long userId) {
        return readingService.getMonthComparison(userId);
    }

    /**
     * Powers "Export All" — asks the Python service to compute a fresh
     * monthly report row right now, instead of waiting for a scheduled job.
     * Returns the updated list so the frontend can refresh immediately.
     */
    @PostMapping("/generate")
    public List<Report> generateReport(@RequestParam("user_id") Long userId) {
        analyticsClient.triggerMonthlyReport(userId);
        return reportRepository.findByUserIdOrderByGeneratedAtDesc(userId);
    }
}
