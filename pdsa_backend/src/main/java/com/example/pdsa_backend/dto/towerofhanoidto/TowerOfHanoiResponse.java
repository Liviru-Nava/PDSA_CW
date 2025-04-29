package com.example.pdsa_backend.dto.towerofhanoidto;

import java.util.Map;

public class TowerOfHanoiResponse {
    private boolean valid;
    private String message;
    private Long recursive3PegTimeMs;
    private Long iterative3PegTimeMs;
    private Long frameStewartTimeMs;
    private Map<String, AlgorithmResultsResponse.AlgorithmResult> algorithmResults;


    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getRecursive3PegTimeMs() {
        return recursive3PegTimeMs;
    }

    public void setRecursive3PegTimeMs(Long recursive3PegTimeMs) {
        this.recursive3PegTimeMs = recursive3PegTimeMs;
    }

    public Long getIterative3PegTimeMs() {
        return iterative3PegTimeMs;
    }

    public void setIterative3PegTimeMs(Long iterative3PegTimeMs) {
        this.iterative3PegTimeMs = iterative3PegTimeMs;
    }

    public Long getFrameStewartTimeMs() {
        return frameStewartTimeMs;
    }

    public void setFrameStewartTimeMs(Long frameStewartTimeMs) {
        this.frameStewartTimeMs = frameStewartTimeMs;
    }

    public Map<String, AlgorithmResultsResponse.AlgorithmResult> getAlgorithmResults() {
        return algorithmResults;
    }

    public void setAlgorithmResults(Map<String, AlgorithmResultsResponse.AlgorithmResult> algorithmResults) {
        this.algorithmResults = algorithmResults;
    }
}