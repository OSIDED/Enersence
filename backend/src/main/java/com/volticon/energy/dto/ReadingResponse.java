package com.volticon.energy.dto;

/** Matches the frontend's Reading type exactly (lib/api.ts). */
public record ReadingResponse(
        Long readingId,
        String applianceName,
        Double hoursUsed,
        Double energyUsedKwh,
        Double estimatedCost
) {}
