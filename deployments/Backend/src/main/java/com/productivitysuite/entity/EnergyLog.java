package com.productivitysuite.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name = "energy_logs") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EnergyLog {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Column(name = "logged_at", nullable = false) @Builder.Default private Instant loggedAt = Instant.now();
    @Column(nullable = false) private short energy;
    private Short mood;
    @Column(nullable = false, length = 20) @Builder.Default private String source = "manual";
    @Column(columnDefinition = "TEXT") private String notes;
}
