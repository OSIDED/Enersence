package com.volticon.energy.dto;

/** One slice of the "Consumption by Category" donut chart. */
public record CategoryBreakdownDto(
        String category,
        Double totalKwh,
        Double percentage
) {}
