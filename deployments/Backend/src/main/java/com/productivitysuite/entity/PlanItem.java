package com.productivitysuite.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;
import java.util.UUID;
@Entity @Table(name = "plan_items") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlanItem {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "plan_id", nullable = false) private DailyPlan plan;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "task_id") private Task task;
    @Column(nullable = false, length = 200) private String title;
    @Column(name = "start_time", nullable = false) private LocalTime startTime;
    @Column(name = "end_time", nullable = false) private LocalTime endTime;
    @Column(name = "buffer_minutes", nullable = false) @Builder.Default private int bufferMinutes = 5;
    @Column(name = "energy_level", nullable = false, length = 12) @Builder.Default private String energyLevel = "medium";
    @Column(name = "item_type", nullable = false, length = 20) @Builder.Default private String itemType = "task";
    @Column(nullable = false, length = 20) @Builder.Default private String status = "planned";
    @Column(columnDefinition = "TEXT") private String notes;
    @Column(name = "item_order", nullable = false) private int itemOrder;
}
