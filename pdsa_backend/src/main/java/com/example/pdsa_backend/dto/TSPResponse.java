package com.example.pdsa_backend.dto;

import java.util.List;

public class TSPResponse {
    private List<TSPSolution> solutions;
    private TSPSolution bestSolution;
    private String message;

    // Getters and setters
    public List<TSPSolution> getSolutions() {
        return solutions;
    }

    public void setSolutions(List<TSPSolution> solutions) {
        this.solutions = solutions;
    }

    public TSPSolution getBestSolution() {
        return bestSolution;
    }

    public void setBestSolution(TSPSolution bestSolution) {
        this.bestSolution = bestSolution;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}