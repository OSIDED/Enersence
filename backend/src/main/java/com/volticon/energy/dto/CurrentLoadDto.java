package com.volticon.energy.dto;

/** Powers the Dashboard's "Current Power Load" stat card. */
public record CurrentLoadDto(
        Double currentLoadKw,
        Integer activeDeviceCount
) {}