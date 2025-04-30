package com.example.pdsa_backend.dto.towerofhanoidto;


import java.util.Map;

public class AlgorithmResultsResponse {
    private boolean valid;
    private String message;
    private Map<String, AlgorithmResult> algorithmResults;


    public static class AlgorithmResult {
        private int numOfMoves;
        private String sequenceOfMoves;
        private long executionTimeMs;

        public int getNumOfMoves() {
            return numOfMoves;
        }

        public void setNumOfMoves(int numOfMoves) {
            this.numOfMoves = numOfMoves;
        }

        public String getSequenceOfMoves() {
            return sequenceOfMoves;
        }

        public void setSequenceOfMoves(String sequenceOfMoves) {
            this.sequenceOfMoves = sequenceOfMoves;
        }

        public long getExecutionTimeMs() {
            return executionTimeMs;
        }

        public void setExecutionTimeMs(long executionTimeMs) {
            this.executionTimeMs = executionTimeMs;
        }
    }

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

    public Map<String, AlgorithmResult> getAlgorithmResults() {
        return algorithmResults;
    }

    public void setAlgorithmResults(Map<String, AlgorithmResult> algorithmResults) {
        this.algorithmResults = algorithmResults;
    }
}