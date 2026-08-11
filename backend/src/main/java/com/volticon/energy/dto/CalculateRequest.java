package com.volticon.energy.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CalculateRequest(
        @NotNull @Positive Double powerRatingWatts,
        @NotNull @DecimalMin("0.0") @DecimalMax("24.0") Double hoursUsed
) {}
