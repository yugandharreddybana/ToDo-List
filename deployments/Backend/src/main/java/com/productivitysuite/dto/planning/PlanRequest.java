package com.productivitysuite.dto.planning;
import jakarta.validation.Valid; import jakarta.validation.constraints.*; import lombok.Data; import java.time.*; import java.util.*;
@Data public class PlanRequest { @NotNull private LocalDate planDate; @NotNull private LocalTime windowStart; @NotNull private LocalTime windowEnd; private String source="ai"; private List<String> assumptions=List.of(); private String summary; @NotEmpty @Valid private List<PlanItemRequest> items=List.of(); }
