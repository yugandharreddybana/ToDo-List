package com.productivitysuite.dto.planning;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.*;

@Data
public class CommitmentRequest {
    @NotBlank @Size(max = 200) private String title;
    @NotNull private LocalTime startTime;
    @NotNull private LocalTime endTime;
    private short[] daysOfWeek = new short[0];
    private boolean recurring = true;
    private LocalDate date;
    private boolean flexible = false;
}
