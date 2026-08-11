package com.volticon.energy.dto;

public record CalculateResponse(
        Double energyUsedKwh,
        Double estimatedCost,
        Double ratePerKwh
) {}
