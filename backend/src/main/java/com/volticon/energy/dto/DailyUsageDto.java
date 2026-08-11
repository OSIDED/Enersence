package com.volticon.energy.dto;

import java.time.LocalDate;

/** One bar in the "Usage History (Last 7 Days)" chart. */
public record DailyUsageDto(
        LocalDate date,
        String dayLabel,
        Double totalKwh
) {}
