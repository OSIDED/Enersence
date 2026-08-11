package com.volticon.energy.controller;

import com.volticon.energy.dto.CalculateRequest;
import com.volticon.energy.dto.CalculateResponse;
import com.volticon.energy.service.ConsumptionCalculator;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/calculate")
@CrossOrigin(origins = "*")
public class CalculateController {

    private final ConsumptionCalculator calculator;

    public CalculateController(ConsumptionCalculator calculator) {
        this.calculator = calculator;
    }

    /** Powers the live preview panel — called on every keystroke, no DB write. */
    @PostMapping
    public CalculateResponse calculate(@Valid @RequestBody CalculateRequest request) {
        double kwh = calculator.calculateEnergyKwh(request.powerRatingWatts(), request.hoursUsed());
        double cost = calculator.calculateCost(kwh);
        return new CalculateResponse(kwh, cost, calculator.getRatePerKwh());
    }
}
