package com.example.pdsa_backend.dto.knights_tour;

import java.util.List;

public class AlgorithmsMetric {
    private String algorithmName;
    private List<Integer> rounds;
    private List<Integer> executionTimes;
    private List<Integer> memoryUsages;
    private List<Boolean> completionStatus;

    public AlgorithmsMetric() {
    }

    public AlgorithmsMetric(String algorithmName, List<Integer> rounds, List<Integer> executionTimes,
                            List<Integer> memoryUsages, List<Boolean> completionStatus) {
        this.algorithmName = algorithmName;
        this.rounds = rounds;
        this.executionTimes = executionTimes;
        this.memoryUsages = memoryUsages;
        this.completionStatus = completionStatus;
    }

    public String getAlgorithmName() {
        return algorithmName;
    }

    public void setAlgorithmName(String algorithmName) {
        this.algorithmName = algorithmName;
    }

    public List<Integer> getRounds() {
        return rounds;
    }

    public void setRounds(List<Integer> rounds) {
        this.rounds = rounds;
    }

    public List<Integer> getExecutionTimes() {
        return executionTimes;
    }

    public void setExecutionTimes(List<Integer> executionTimes) {
        this.executionTimes = executionTimes;
    }

    public List<Integer> getMemoryUsages() {
        return memoryUsages;
    }

    public void setMemoryUsages(List<Integer> memoryUsages) {
        this.memoryUsages = memoryUsages;
    }

    public List<Boolean> getCompletionStatus() {
        return completionStatus;
    }

    public void setCompletionStatus(List<Boolean> completionStatus) {
        this.completionStatus = completionStatus;
    }
}
