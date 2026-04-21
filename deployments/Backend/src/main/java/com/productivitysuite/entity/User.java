package com.productivitysuite.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    @Column(nullable = false, length = 80)
    @Builder.Default
    private String timezone = "UTC";
}
