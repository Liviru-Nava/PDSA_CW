package com.example.pdsa_backend.dto;

public class AverageReportResponseDTO {
    private double sequentialAverageMs;
    private double threadedAverageMs;

    public double getSequentialAverageMs() {
        return sequentialAverageMs;
    }

    public void setSequentialAverageMs(double sequentialAverageMs) {
        this.sequentialAverageMs = sequentialAverageMs;
    }

    public double getThreadedAverageMs() {
        return threadedAverageMs;
    }

    public void setThreadedAverageMs(double threadedAverageMs) {
        this.threadedAverageMs = threadedAverageMs;
    }
}