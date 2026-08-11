package com.volticon.energy.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

/**
 * The ONE place Spring Boot talks to the Python analytics service.
 * Everything else in this backend (appliances, readings) works entirely
 * against Postgres directly — this class is the single seam where the two
 * services actually integrate.
 *
 * Called after a new reading is saved (see EnergyReadingController), so
 * recommendations stay fresh without needing a separate cron job.
 */
@Service
public class AnalyticsClientService {

    private final WebClient webClient;

    public AnalyticsClientService(@Value("${analytics.service.base-url}") String baseUrl) {
        this.webClient = WebClient.builder().baseUrl(baseUrl).build();
    }

    /**
     * Triggers POST /api/analytics/run on the Python service — asks it to
     * re-run high-usage detection and refresh the Recommendations table
     * for this user. Spring Boot doesn't need the response for anything;
     * it just re-reads Recommendations from Postgres afterward like normal.
     */
    public void triggerAnalysis(Long userId) {
        try {
            webClient.post()
                    .uri("/api/analytics/run")
                    .bodyValue(Map.of("user_id", userId, "high_usage_threshold_kwh", 5.0))
                    .retrieve()
                    .toBodilessEntity()
                    .block(); // synchronous call is fine here — this fires right after a save,
                              // and we don't want the request to return before analysis starts.
        } catch (Exception e) {
            // Don't let a down analytics service break the Save Reading button.
            // Log and move on — recommendations just won't refresh this time.
            System.err.println("Analytics service unreachable: " + e.getMessage());
        }
    }

    /** Triggers a monthly Report row to be generated for this user. */
    public void triggerMonthlyReport(Long userId) {
        try {
            webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/analytics/reports/generate-monthly")
                            .queryParam("user_id", userId)
                            .build())
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            System.err.println("Analytics service unreachable: " + e.getMessage());
        }
    }
}
