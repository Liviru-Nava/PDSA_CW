package com.example.pdsa_backend.dto.knights_tour;

public class AlgorithmMetric {
    private long executionTime;
    private long memoryUsage;
    private int branchesCovered;
    private int maxMovesReached;
    private boolean hasCompleted;
    private int[] board;
    boolean hasTimedOut = false;

    public AlgorithmMetric() {
    }

    public AlgorithmMetric(long executionTime, long memoryUsage, int branchesCovered,
                           int maxMovesReached, boolean completed,int[] board, boolean hasTimedOut) {
        this.executionTime = executionTime;
        this.memoryUsage = memoryUsage;
        this.branchesCovered = branchesCovered;
        this.maxMovesReached = maxMovesReached;
        this.hasCompleted = completed;
        this.board = board;
        this.hasTimedOut = hasTimedOut;
    }

    // Getters and setters
    public long getExecutionTime() {
        return executionTime;
    }

    public void setExecutionTime(long executionTime) {
        this.executionTime = executionTime;
    }

    public long getMemoryUsage() {
        return memoryUsage;
    }

    public void setMemoryUsage(long memoryUsage) {
        this.memoryUsage = memoryUsage;
    }

    public int getBranchesCovered() {
        return branchesCovered;
    }

    public void setBranchesCovered(int branchesCovered) {
        this.branchesCovered = branchesCovered;
    }

    public int getMaxMovesReached() {
        return maxMovesReached;
    }

    public void setMaxMovesReached(int maxMovesReached) {
        this.maxMovesReached = maxMovesReached;
    }

    public boolean getHasCompleted() {
        return hasCompleted;
    }

    public void setHasCompleted(boolean hasCompleted) {
        this.hasCompleted = hasCompleted;
    }

    public int[] getBoard() {
        return board;
    }

    public void setBoard(int[] board) {
        this.board = board;
    }

    public boolean getHasTimedOut() {
        return hasTimedOut;
    }

    public void setHasTimedOut(boolean hasTimedOut) {
        this.hasTimedOut = hasTimedOut;
    }
}
