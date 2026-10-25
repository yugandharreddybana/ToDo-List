package com.productivitysuite.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.productivitysuite.dto.analytics.AnalyticsSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiReportService {
    private final AnalyticsService analytics;
    private final ObjectMapper json;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    @Value("${app.ai.api-key:}") private String apiKey;
    @Value("${app.ai.base-url:https://integrate.api.nvidia.com/v1}") private String baseUrl;
    @Value("${app.ai.model:nvidia/llama-3.3-nemotron-super-49b-v1.5}") private String model;

    public String generate(UUID userId, LocalDate from, LocalDate to) {
        if (apiKey == null || apiKey.isBlank()) throw new IllegalStateException("NVIDIA_API_KEY is not configured");
        try {
            AnalyticsSummaryResponse measured = analytics.summary(userId, "custom", from, to);
            String prompt = "Analyze these measured productivity metrics for " + from + " through " + to
                + ". Rate 0-10, where 0 means insufficient data; do not infer health, personality, or unobserved activity. "
                + "Give specific praise, one improvement, and one next step. Return ONLY JSON with rating (number), "
                + "wentWell (string array), improve (string array), nextSteps (string array), explanation (string). Data: "
                + json.writeValueAsString(measured);
            String body = json.writeValueAsString(Map.of("model", model, "stream", false, "temperature", 0.2,
                "max_tokens", 700, "messages", new Object[] { Map.of("role", "user", "content", prompt) }));
            HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl.replaceAll("/$", "") + "/chat/completions"))
                .timeout(Duration.ofSeconds(45)).header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(body)).build();
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) throw new IllegalStateException("NVIDIA report request failed with status " + response.statusCode());
            String content = json.readTree(response.body()).path("choices").path(0).path("message").path("content").asText();
            content = content.trim().replaceFirst("^```(?:json)?\\s*", "").replaceFirst("\\s*```$", "");
            JsonNode report = json.readTree(content);
            if (!report.path("rating").isNumber() || report.path("rating").asDouble() < 0 || report.path("rating").asDouble() > 10
                || !report.path("wentWell").isArray() || !report.path("improve").isArray() || !report.path("nextSteps").isArray())
                throw new IllegalStateException("Invalid AI report format");
            String result = "Score: " + report.path("rating").asInt() + "/10. " + report.path("explanation").asText("")
                + " What went well: " + first(report.path("wentWell"))
                + " Improve: " + first(report.path("improve"))
                + " Next: " + first(report.path("nextSteps"));
            return result.length() > 2000 ? result.substring(0, 2000) : result;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("AI report generation interrupted", e);
        } catch (Exception e) {
            throw new IllegalStateException("AI report generation failed", e);
        }
    }

    private String first(JsonNode values) { return values.isEmpty() ? "No observation" : values.path(0).asText(); }
}
