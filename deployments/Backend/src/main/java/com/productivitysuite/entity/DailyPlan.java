package com.productivitysuite.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.*;
import java.util.*;

@Entity @Table(name = "daily_plans") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DailyPlan extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Column(name = "plan_date", nullable = false) private LocalDate planDate;
    @Column(nullable = false) @Builder.Default private int version = 1;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 12) @Builder.Default private PlanStatus status = PlanStatus.DRAFT;
    @Column(name = "window_start", nullable = false) private LocalTime windowStart;
    @Column(name = "window_end", nullable = false) private LocalTime windowEnd;
    @Column(nullable = false, length = 30) @Builder.Default private String source = "ai";
    @JdbcTypeCode(SqlTypes.JSON) @Column(nullable = false, columnDefinition = "jsonb") @Builder.Default private List<String> assumptions = new ArrayList<>();
    @Column(columnDefinition = "TEXT") private String summary;
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true) @OrderBy("itemOrder ASC") @Builder.Default private List<PlanItem> items = new ArrayList<>();
    public enum PlanStatus { DRAFT, APPROVED, SUPERSEDED, COMPLETED }
}
