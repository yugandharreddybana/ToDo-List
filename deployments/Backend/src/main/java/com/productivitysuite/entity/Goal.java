package com.productivitysuite.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private GoalCategory category;

    @Column(name = "target_date")
    private Instant targetDate;

    @Column(nullable = false)
    @Builder.Default
    private int progress = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private GoalStatus status = GoalStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "goal", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<GoalMilestone> milestones = new ArrayList<>();

    public enum GoalCategory { CAREER, HEALTH, PERSONAL, FINANCIAL, LEARNING }
    public enum GoalStatus { ACTIVE, COMPLETED, PAUSED, ARCHIVED }
}
