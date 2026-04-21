package com.productivitysuite.dto.analytics;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class HeatmapResponse {
    private List<HeatmapCell> cells;

    @Data @Builder
    public static class HeatmapCell {
        private String date; // YYYY-MM-DD
        private int value;   // number of completed tasks
        private int level;   // 0-4 intensity bucket
    }
}
