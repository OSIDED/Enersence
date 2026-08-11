package com.volticon.energy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appliances")
public class Appliance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appliance_id")
    private Long applianceId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "meter_id")
    private Long meterId;

    @Column(name = "appliance_name", nullable = false)
    private String applianceName;

    private String category;

    @Column(name = "power_rating_watts", nullable = false)
    private Double powerRatingWatts;

    private String location;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // --- Getters and setters ---

    public Long getApplianceId() { return applianceId; }
    public void setApplianceId(Long applianceId) { this.applianceId = applianceId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getMeterId() { return meterId; }
    public void setMeterId(Long meterId) { this.meterId = meterId; }

    public String getApplianceName() { return applianceName; }
    public void setApplianceName(String applianceName) { this.applianceName = applianceName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getPowerRatingWatts() { return powerRatingWatts; }
    public void setPowerRatingWatts(Double powerRatingWatts) { this.powerRatingWatts = powerRatingWatts; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    /** Matches the frontend dropdown label built server-side in Python: "Refrigerator — Kitchen — 150W" */
    public String getLabel() {
        return applianceName + " — " + (location != null ? location : "N/A") + " — " + powerRatingWatts.intValue() + "W";
    }
}
