package com.productivitysuite.dto.planning;
import jakarta.validation.constraints.*; import lombok.Data; import java.time.LocalTime; import java.util.UUID;
@Data public class PlanItemRequest { private UUID taskId; @NotBlank @Size(max=200) private String title; @NotNull private LocalTime startTime; @NotNull private LocalTime endTime; @Min(0) @Max(120) private int bufferMinutes=5; @Pattern(regexp="low|medium|high") private String energyLevel="medium"; @Pattern(regexp="task|break|commitment|buffer") private String itemType="task"; private String notes; private int itemOrder; }
