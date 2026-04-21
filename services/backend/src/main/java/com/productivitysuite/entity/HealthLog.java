package com.productivitysuite.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "health_logs", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "log_date"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column
    private Short mood;

    @Column(name = "sleep_hours", precision = 4, scale = 2)
    private BigDecimal sleepHours;

    @Column(name = "sleep_quality")
    private Short sleepQuality;

    @Column(name = "water_intake_liters", precision = 4, scale = 2)
    private BigDecimal waterIntakeLiters;

    @Column(name = "weight_kg", precision = 6, scale = 2)
    private BigDecimal weightKg;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
