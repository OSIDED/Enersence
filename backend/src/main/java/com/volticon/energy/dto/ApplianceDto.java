package com.volticon.energy.dto;

/** Matches the frontend's Appliance type exactly (lib/api.ts). */
public record ApplianceDto(
        Long applianceId,
        Long meterId,
        String applianceName,
        String location,
        Double powerRatingWatts,
        String label
) {}
