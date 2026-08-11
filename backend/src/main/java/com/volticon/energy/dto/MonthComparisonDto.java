package com.volticon.energy.dto;

/** "Vs. Last Month" stat card + Estimated Bill. */
public record MonthComparisonDto(
        Double currentMonthKwh,
        Double previousMonthKwh,
        Double kwhChange,
        Double percentChange,
        Double estimatedBill
) {}
