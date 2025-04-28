package com.example.pdsa_backend.dto;

import java.util.Map;

public class PerformanceMetricsResponse {
    private Map<String, Long[]> executionTimes;
    private Map<String, String> complexityAnalysis;

    public Map<String, Long[]> getExecutionTimes() { return executionTimes; }
    public void setExecutionTimes(Map<String, Long[]> executionTimes) { this.executionTimes = executionTimes; }
    public Map<String, String> getComplexityAnalysis() { return complexityAnalysis; }
    public void setComplexityAnalysis(Map<String, String> complexityAnalysis) { this.complexityAnalysis = complexityAnalysis; }
}