package com.productivitysuite.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "habits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Habit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private HabitFrequency frequency = HabitFrequency.DAILY;

    @Column(nullable = false)
    @Builder.Default
    private int streak = 0;

    @Column(nullable = false, length = 7)
    @Builder.Default
    private String color = "#5B9BD5";

    @Column(nullable = false, length = 40)
    @Builder.Default
    private String icon = "activity";

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    public enum HabitFrequency { DAILY, WEEKLY }
}
