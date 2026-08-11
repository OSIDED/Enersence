package com.volticon.energy.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

/** Body the frontend's "Save Reading" button sends. */
public record ReadingRequest(
        @NotNull Long userId,
        @NotNull Long applianceId,
        @NotNull @DecimalMin("0.0") @DecimalMax("24.0") Double hoursUsed
) {}
