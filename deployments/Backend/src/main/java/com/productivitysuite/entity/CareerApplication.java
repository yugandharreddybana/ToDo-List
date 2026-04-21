package com.productivitysuite.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "career_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareerApplication extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String company;

    @Column(nullable = false, length = 200)
    private String role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private CareerStage status = CareerStage.SAVED;

    @Column(name = "applied_date")
    private Instant appliedDate;

    @Column(name = "salary_min", precision = 12, scale = 2)
    private BigDecimal salaryMin;

    @Column(name = "salary_max", precision = 12, scale = 2)
    private BigDecimal salaryMax;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "USD";

    @Column(length = 512)
    private String url;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "contact_name", length = 120)
    private String contactName;

    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(name = "next_follow_up")
    private Instant nextFollowUp;

    public enum CareerStage { SAVED, APPLIED, PHONE_SCREEN, INTERVIEW, OFFER, REJECTED }
}
