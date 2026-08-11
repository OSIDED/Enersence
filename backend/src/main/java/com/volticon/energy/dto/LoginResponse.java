package com.volticon.energy.dto;

public record LoginResponse(
        Long userId,
        String fullName,
        String email,
        String role
) {}
