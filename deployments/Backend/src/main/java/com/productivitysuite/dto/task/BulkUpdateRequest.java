package com.productivitysuite.dto.task;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BulkUpdateRequest {
    @NotEmpty @Size(max = 500)
    private List<UUID> ids;
    private TaskRequest patch;
}
