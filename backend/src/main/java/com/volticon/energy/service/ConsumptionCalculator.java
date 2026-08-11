package com.volticon.energy.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * The kWh/cost math — deliberately kept identical to Python's
 * analytics.calculate_consumption() so the two services never disagree:
 *
 *   energy_kwh = (power_rating_watts / 1000) * hours_used
 *   cost       = energy_kwh * rate_per_kwh
 */
@Component
public class ConsumptionCalculator {

    @Value("${rate.per.kwh.ghs:1.50}")
    private double ratePerKwh;

    public double calculateEnergyKwh(double powerRatingWatts, double hoursUsed) {
        return Math.round((powerRatingWatts / 1000.0) * hoursUsed * 10000.0) / 10000.0;
    }

    public double calculateCost(double energyKwh) {
        return Math.round(energyKwh * ratePerKwh * 100.0) / 100.0;
    }

    public double getRatePerKwh() {
        return ratePerKwh;
    }
}
