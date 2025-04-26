package com.example.pdsa_backend.data.knights_tour;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name="performancemetrics")
public class PerformanceMetric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="metric_id")
    private int metricId;
    @Column(name="result_id")
    private int resultId;
    @Column(name="algorithm_id")
    private int algorithmId;
    @Column(name="execution_time_ms")
    private int executionTimeMs;
    @Column(name="memory_usage_kb")
    private int memoryUsageKb;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name="created_at")
    private LocalDateTime createdAt;

    //getters and setters

    public int getMetricId() {
        return metricId;
    }

    public void setMetricId(int metricId) {
        this.metricId = metricId;
    }

    public int getResultId() {
        return resultId;
    }

    public void setResultId(int resultId) {
        this.resultId = resultId;
    }

    public int getAlgorithmId() {
        return algorithmId;
    }

    public void setAlgorithmId(int algorithmId) {
        this.algorithmId = algorithmId;
    }

    public int getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(int executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public int getMemoryUsageKb() {
        return memoryUsageKb;
    }

    public void setMemoryUsageKb(int memoryUsageKb) {
        this.memoryUsageKb = memoryUsageKb;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
