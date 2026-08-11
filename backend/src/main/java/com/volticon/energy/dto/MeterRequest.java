package com.volticon.energy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MeterRequest(
        @NotNull Long userId,
        @NotBlank String meterName,
        String serialNumber,
        String meterType
) {}
