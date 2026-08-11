package com.volticon.energy.controller;

import com.volticon.energy.dto.ApplianceDto;
import com.volticon.energy.dto.ApplianceRequest;
import com.volticon.energy.service.ApplianceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appliances")
public class ApplianceController {

    private final ApplianceService applianceService;

    public ApplianceController(ApplianceService applianceService) {
        this.applianceService = applianceService;
    }

    /**
     * Powers the "Select Appliance" dropdown on Consumption (all devices)
     * and the Devices page (pass meter_id to scope to one meter).
     */
    @GetMapping
    public List<ApplianceDto> getAppliances(
            @RequestParam("user_id") Long userId,
            @RequestParam(value = "meter_id", required = false) Long meterId
    ) {
        if (meterId != null) {
            return applianceService.getAppliancesForMeter(meterId, userId);
        }
        return applianceService.getAppliancesForUser(userId);
    }

    /** Powers the "Add New Device" popup submit — requires a valid meterId. */
    @PostMapping
    public ResponseEntity<?> addAppliance(@Valid @RequestBody ApplianceRequest request) {
        try {
            return ResponseEntity.ok(applianceService.addAppliance(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }

    /** Powers deleting a device from the Devices page. */
    @DeleteMapping("/{id}")
    public void deleteAppliance(@PathVariable Long id) {
        applianceService.deleteAppliance(id);
    }
}
