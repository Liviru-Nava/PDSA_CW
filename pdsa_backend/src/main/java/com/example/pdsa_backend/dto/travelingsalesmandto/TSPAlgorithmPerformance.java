package com.example.pdsa_backend.dto.travelingsalesmandto;

public class TSPAlgorithmPerformance {
    private int algorithmId;
    private String algorithmName;
    private int executionTimeMs;
    private int memoryUsageKb;

    //getters and setters
    public int getAlgorithmId() {
        return algorithmId;
    }

    public void setAlgorithmId(int algorithmId) {
        this.algorithmId = algorithmId;
    }

    public String getAlgorithmName() {
        return algorithmName;
    }

    public void setAlgorithmName(String algorithmName) {
        this.algorithmName = algorithmName;
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
}
