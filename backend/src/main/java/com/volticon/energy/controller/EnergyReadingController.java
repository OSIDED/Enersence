package com.volticon.energy.controller;

import com.volticon.energy.dto.DailyUsageDto;
import com.volticon.energy.dto.ReadingRequest;
import com.volticon.energy.dto.ReadingResponse;
import com.volticon.energy.service.AnalyticsClientService;
import com.volticon.energy.service.EnergyReadingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/readings")
@CrossOrigin(origins = "*")
public class EnergyReadingController {

    private final EnergyReadingService readingService;
    private final AnalyticsClientService analyticsClient;

    public EnergyReadingController(EnergyReadingService readingService,
                                    AnalyticsClientService analyticsClient) {
        this.readingService = readingService;
        this.analyticsClient = analyticsClient;
    }

    /**
     * Powers the "Save Reading" button. On success, also triggers the
     * Python analytics service to refresh Recommendations for this user —
     * this is the one place Spring Boot calls into your service directly.
     */
    @PostMapping
    public ResponseEntity<?> saveReading(@Valid @RequestBody ReadingRequest request) {
        try {
            ReadingResponse saved = readingService.saveReading(request);

            // Fire-and-forget style call into the analytics service.
            analyticsClient.triggerAnalysis(request.userId());

            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }

    /** Powers the "Today's Logged Appliances" table. */
    @GetMapping("/today")
    public List<ReadingResponse> getTodayReadings(@RequestParam("user_id") Long userId) {
        return readingService.getTodayReadings(userId);
    }

    /** Powers the Dashboard's "Usage History (Last 7 Days)" chart with real data. */
    @GetMapping("/history")
    public List<DailyUsageDto> getWeeklyHistory(@RequestParam("user_id") Long userId) {
        return readingService.getWeeklyUsage(userId);
    }
}
