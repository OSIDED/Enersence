package com.volticon.energy.controller;

import com.volticon.energy.dto.MeterRequest;
import com.volticon.energy.entity.Meter;
import com.volticon.energy.repository.MeterRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meters")
@CrossOrigin(origins = "*")
public class MeterController {

    private final MeterRepository meterRepository;

    public MeterController(MeterRepository meterRepository) {
        this.meterRepository = meterRepository;
    }

    /** Powers "Connected Meters" on the Dashboard. */
    @GetMapping
    public List<Meter> getMeters(@RequestParam("user_id") Long userId) {
        return meterRepository.findByUserId(userId);
    }

    /** Powers the "Add New Meter" popup form submit. */
    @PostMapping
    public Meter addMeter(@Valid @RequestBody MeterRequest request) {
        Meter meter = new Meter();
        meter.setUserId(request.userId());
        meter.setMeterName(request.meterName());
        meter.setSerialNumber(request.serialNumber());
        meter.setMeterType(request.meterType());
        meter.setStatus("SYNCING"); // new meters start as syncing, like the reference UI
        meter.setLastReadingKwh(0.0);
        return meterRepository.save(meter);
    }

    /** Powers deleting a meter after selecting it on the Dashboard. */
    @DeleteMapping("/{id}")
    public void deleteMeter(@PathVariable Long id) {
        meterRepository.deleteById(id);
    }
}
