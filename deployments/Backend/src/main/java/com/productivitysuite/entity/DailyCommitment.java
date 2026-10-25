package com.productivitysuite.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "daily_commitments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DailyCommitment extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false, length = 200) private String title;
    @Column(name = "start_time", nullable = false) private LocalTime startTime;
    @Column(name = "end_time", nullable = false) private LocalTime endTime;
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "days_of_week", nullable = false, columnDefinition = "smallint[]") @Builder.Default private short[] daysOfWeek = new short[0];
    @Column(name = "is_recurring", nullable = false) @Builder.Default private boolean recurring = true;
    private LocalDate date;
    @Column(name = "is_flexible", nullable = false) @Builder.Default private boolean flexible = false;
}
