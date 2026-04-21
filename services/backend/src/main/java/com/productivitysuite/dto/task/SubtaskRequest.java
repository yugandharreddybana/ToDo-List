package com.productivitysuite.dto.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SubtaskRequest {
    @NotBlank @Size(max = 200)
    private String title;
    private int order = 0;
}
