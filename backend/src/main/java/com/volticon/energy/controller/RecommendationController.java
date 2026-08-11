package com.volticon.energy.controller;

import com.volticon.energy.entity.Recommendation;
import com.volticon.energy.repository.RecommendationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Spring Boot never generates recommendations itself — it only reads rows
 * that the Python analytics service already wrote (see
 * AnalyticsClientService.triggerAnalysis, called after every saved
 * reading). This controller is purely a read (and mark-as-applied) layer.
 */
@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    private final RecommendationRepository recommendationRepository;

    public RecommendationController(RecommendationRepository recommendationRepository) {
        this.recommendationRepository = recommendationRepository;
    }

    /** Powers the Insights page's "Top Recommendations" list. */
    @GetMapping
    public List<Recommendation> getRecommendations(@RequestParam("user_id") Long userId) {
        return recommendationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /** Powers the "Apply" / "Learn More" button — just deletes it for now (simplest "handled" state). */
    @DeleteMapping("/{id}")
    public void dismissRecommendation(@PathVariable Long id) {
        recommendationRepository.deleteById(id);
    }
}
