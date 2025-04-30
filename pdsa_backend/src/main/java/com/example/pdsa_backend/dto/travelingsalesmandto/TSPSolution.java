package com.example.pdsa_backend.dto.travelingsalesmandto;

import java.util.List;

public class TSPSolution {
    private String algorithmName;
    private List<TSPRequest.City> optimizedRoute;
    private int totalDistance;
    private long executionTimeMs;
    private int memoryUsageKb;

    // Getters and setters
    public String getAlgorithmName() {
        return algorithmName;
    }

    public void setAlgorithmName(String algorithmName) {
        this.algorithmName = algorithmName;
    }

    public List<TSPRequest.City> getOptimizedRoute() {
        return optimizedRoute;
    }

    public void setOptimizedRoute(List<TSPRequest.City> optimizedRoute) {
        this.optimizedRoute = optimizedRoute;
    }

    public int getTotalDistance() {
        return totalDistance;
    }

    public void setTotalDistance(int totalDistance) {
        this.totalDistance = totalDistance;
    }

    public long getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(long executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public int getMemoryUsageKb() {
        return memoryUsageKb;
    }

    public void setMemoryUsageKb(int memoryUsageKb) {
        this.memoryUsageKb = memoryUsageKb;
    }
}
