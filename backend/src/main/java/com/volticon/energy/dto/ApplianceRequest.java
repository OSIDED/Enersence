package com.volticon.energy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ApplianceRequest(
        @NotNull Long userId,
        @NotNull Long meterId,
        @NotBlank String applianceName,
        String category,
        @NotNull @Positive Double powerRatingWatts,
        String location
) {}
