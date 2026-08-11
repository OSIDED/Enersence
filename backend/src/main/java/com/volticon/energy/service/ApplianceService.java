package com.volticon.energy.service;

import com.volticon.energy.dto.ApplianceDto;
import com.volticon.energy.dto.ApplianceRequest;
import com.volticon.energy.entity.Appliance;
import com.volticon.energy.repository.ApplianceRepository;
import com.volticon.energy.repository.MeterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplianceService {

    private final ApplianceRepository applianceRepository;
    private final MeterRepository meterRepository;

    public ApplianceService(ApplianceRepository applianceRepository, MeterRepository meterRepository) {
        this.applianceRepository = applianceRepository;
        this.meterRepository = meterRepository;
    }

    /** Feeds the "Select Appliance" dropdown on Consumption — all of a user's devices, across all meters. */
    public List<ApplianceDto> getAppliancesForUser(Long userId) {
        return applianceRepository.findByUserId(userId).stream().map(this::toDto).toList();
    }

    /** Feeds the Devices page once a specific meter is selected. */
    public List<ApplianceDto> getAppliancesForMeter(Long meterId, Long userId) {
        return applianceRepository.findByMeterIdAndUserId(meterId, userId).stream().map(this::toDto).toList();
    }

    public Appliance getById(Long applianceId) {
        return applianceRepository.findById(applianceId)
                .orElseThrow(() -> new IllegalArgumentException("Appliance not found"));
    }

    /**
     * Powers the "Add New Device" popup submit. Enforces that the target
     * meter actually exists AND belongs to this user before allowing the
     * device to be created — this is the real (server-side) version of the
     * rule "you can't add a device without selecting a meter first." The
     * frontend disabling the button is just UX; this check is what
     * actually protects the data.
     */
    public ApplianceDto addAppliance(ApplianceRequest request) {
        meterRepository.findByMeterIdAndUserId(request.meterId(), request.userId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Please select a valid meter before adding a device."));

        Appliance appliance = new Appliance();
        appliance.setUserId(request.userId());
        appliance.setMeterId(request.meterId());
        appliance.setApplianceName(request.applianceName());
        appliance.setCategory(request.category());
        appliance.setPowerRatingWatts(request.powerRatingWatts());
        appliance.setLocation(request.location());

        Appliance saved = applianceRepository.save(appliance);
        return toDto(saved);
    }

    /**
     * Powers deleting a device. Note: Energy_Readings rows referencing
     * this appliance will fail to delete if a foreign key constraint is
     * in place — that's intentional (keeps historical data honest), see
     * README for the cascade-delete alternative if you'd rather allow it.
     */
    public void deleteAppliance(Long applianceId) {
        applianceRepository.deleteById(applianceId);
    }

    private ApplianceDto toDto(Appliance a) {
        return new ApplianceDto(
                a.getApplianceId(),
                a.getMeterId(),
                a.getApplianceName(),
                a.getLocation(),
                a.getPowerRatingWatts(),
                a.getLabel()
        );
    }
}

