package com.volticon.energy.service;

import com.volticon.energy.dto.CategoryBreakdownDto;
import com.volticon.energy.dto.DailyUsageDto;
import com.volticon.energy.dto.MonthComparisonDto;
import com.volticon.energy.dto.ReadingRequest;
import com.volticon.energy.dto.ReadingResponse;
import com.volticon.energy.entity.Appliance;
import com.volticon.energy.entity.EnergyReading;
import com.volticon.energy.repository.EnergyReadingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class EnergyReadingService {

    private final EnergyReadingRepository readingRepository;
    private final ApplianceService applianceService;
    private final ConsumptionCalculator calculator;

    public EnergyReadingService(EnergyReadingRepository readingRepository,
                                 ApplianceService applianceService,
                                 ConsumptionCalculator calculator) {
        this.readingRepository = readingRepository;
        this.applianceService = applianceService;
        this.calculator = calculator;
    }

    /**
     * Powers the "Save Reading" button. Validates the appliance belongs to
     * the user (same security check as the Python version), computes
     * kWh/cost, and persists.
     */
    public ReadingResponse saveReading(ReadingRequest request) {
        Appliance appliance = applianceService.getById(request.applianceId());

        if (!appliance.getUserId().equals(request.userId())) {
            throw new IllegalArgumentException("Please select an appliance and enter valid hours");
        }

        double kwh = calculator.calculateEnergyKwh(appliance.getPowerRatingWatts(), request.hoursUsed());
        double cost = calculator.calculateCost(kwh);

        EnergyReading reading = new EnergyReading();
        reading.setApplianceId(appliance.getApplianceId());
        reading.setReadingDate(LocalDate.now());
        reading.setReadingTime(LocalTime.now());
        reading.setDurationHours(request.hoursUsed());
        reading.setEnergyUsedKwh(kwh);
        reading.setEstimatedCost(cost);

        EnergyReading saved = readingRepository.save(reading);

        return new ReadingResponse(
                saved.getReadingId(),
                appliance.getApplianceName(),
                saved.getDurationHours(),
                saved.getEnergyUsedKwh(),
                saved.getEstimatedCost()
        );
    }

    /** Powers the "Today's Logged Appliances" table. */
    public List<ReadingResponse> getTodayReadings(Long userId) {
        return readingRepository.findTodayReadingsForUser(userId, LocalDate.now()).stream()
                .map(r -> {
                    Appliance appliance = applianceService.getById(r.getApplianceId());
                    return new ReadingResponse(
                            r.getReadingId(),
                            appliance.getApplianceName(),
                            r.getDurationHours(),
                            r.getEnergyUsedKwh(),
                            r.getEstimatedCost()
                    );
                })
                .toList();
    }

    /**
     * Powers the Dashboard's "Usage History (Last 7 Days)" chart with real
     * saved readings — sums energyUsedKwh per day, filling in 0 for days
     * with no readings so the chart always shows exactly 7 bars.
     */
    public List<DailyUsageDto> getWeeklyUsage(Long userId) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(6);

        List<EnergyReading> readings = readingRepository.findReadingsBetween(userId, start, end);

        Map<LocalDate, Double> totalsByDay = new LinkedHashMap<>();
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            totalsByDay.put(d, 0.0);
        }
        for (EnergyReading r : readings) {
            totalsByDay.merge(r.getReadingDate(), r.getEnergyUsedKwh(), Double::sum);
        }

        return totalsByDay.entrySet().stream()
                .map(e -> new DailyUsageDto(
                        e.getKey(),
                        e.getKey().getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                        Math.round(e.getValue() * 100.0) / 100.0
                ))
                .toList();
    }

    /**
     * Powers the Reports page's "Consumption by Category" donut chart.
     * This is where Pattern Recognition shows up concretely: grouping raw
     * transactional readings into category-level usage patterns the user
     * can act on (e.g. "Cooling is 45% of my usage").
     */
    public List<CategoryBreakdownDto> getCategoryBreakdown(Long userId) {
        List<Object[]> rows = readingRepository.sumEnergyByCategory(userId);
        double total = rows.stream().mapToDouble(r -> ((Number) r[1]).doubleValue()).sum();

        return rows.stream()
                .map(r -> {
                    String category = (String) r[0];
                    double kwh = ((Number) r[1]).doubleValue();
                    double pct = total > 0 ? Math.round((kwh / total) * 1000.0) / 10.0 : 0.0;
                    return new CategoryBreakdownDto(category, Math.round(kwh * 100.0) / 100.0, pct);
                })
                .sorted((a, b) -> Double.compare(b.totalKwh(), a.totalKwh()))
                .toList();
    }

    /**
     * Powers the "Vs. Last Month" and "Estimated Bill" cards with real
     * month-over-month comparison instead of static numbers.
     */
    public MonthComparisonDto getMonthComparison(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate currentStart = today.minusDays(29);
        LocalDate previousEnd = currentStart.minusDays(1);
        LocalDate previousStart = previousEnd.minusDays(29);

        double currentKwh = readingRepository.sumEnergyBetween(userId, currentStart, today);
        double previousKwh = readingRepository.sumEnergyBetween(userId, previousStart, previousEnd);
        double currentCost = readingRepository.sumCostBetween(userId, currentStart, today);

        double change = currentKwh - previousKwh;
        double pctChange = previousKwh > 0 ? Math.round((change / previousKwh) * 1000.0) / 10.0 : 0.0;

        return new MonthComparisonDto(
                Math.round(currentKwh * 100.0) / 100.0,
                Math.round(previousKwh * 100.0) / 100.0,
                Math.round(change * 100.0) / 100.0,
                pctChange,
                Math.round(currentCost * 100.0) / 100.0
        );
    }
}

