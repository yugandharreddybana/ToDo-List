package com.productivitysuite.dto.session;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.Instant;

@Data
public class SessionUpdateRequest {
    @NotNull private Instant endTime;
    @NotNull private Boolean completed;
    @Min(0) private Integer actualSeconds;
    @Size(max = 5000) private String notes;
}
