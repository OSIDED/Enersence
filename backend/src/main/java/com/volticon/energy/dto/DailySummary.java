package com.volticon.energy.dto;

public record DailySummary(
        Double totalKwh,
        Double totalCost,
        Integer readingsCount
) {}