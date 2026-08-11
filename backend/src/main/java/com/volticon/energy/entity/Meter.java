package com.volticon.energy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "meters")
public class Meter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "meter_id")
    private Long meterId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "meter_name", nullable = false)
    private String meterName;

    @Column(name = "serial_number")
    private String serialNumber;

    @Column(name = "meter_type")
    private String meterType;

    private String status = "ONLINE";

    @Column(name = "last_reading_kwh")
    private Double lastReadingKwh = 0.0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // --- Getters and setters ---

    public Long getMeterId() { return meterId; }
    public void setMeterId(Long meterId) { this.meterId = meterId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getMeterName() { return meterName; }
    public void setMeterName(String meterName) { this.meterName = meterName; }

    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

    public String getMeterType() { return meterType; }
    public void setMeterType(String meterType) { this.meterType = meterType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getLastReadingKwh() { return lastReadingKwh; }
    public void setLastReadingKwh(Double lastReadingKwh) { this.lastReadingKwh = lastReadingKwh; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
