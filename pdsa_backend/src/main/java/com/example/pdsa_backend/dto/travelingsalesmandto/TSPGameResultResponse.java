package com.example.pdsa_backend.dto.travelingsalesmandto;

import java.util.List;

public class TSPGameResultResponse {
    private int resultId;
    private String homeCity;
    private List<String> shortestRoute;
    private int shortestDistance;
    private List<TSPAlgorithmPerformance> algorithmPerformances;

    //getters and setters
    public int getResultId() {
        return resultId;
    }

    public void setResultId(int resultId) {
        this.resultId = resultId;
    }

    public String getHomeCity() {
        return homeCity;
    }

    public void setHomeCity(String homeCity) {
        this.homeCity = homeCity;
    }

    public List<String> getShortestRoute() {
        return shortestRoute;
    }

    public void setShortestRoute(List<String> shortestRoute) {
        this.shortestRoute = shortestRoute;
    }

    public int getShortestDistance() {
        return shortestDistance;
    }

    public void setShortestDistance(int shortestDistance) {
        this.shortestDistance = shortestDistance;
    }

    public List<TSPAlgorithmPerformance> getAlgorithmPerformances() {
        return algorithmPerformances;
    }

    public void setAlgorithmPerformances(List<TSPAlgorithmPerformance> algorithmPerformances) {
        this.algorithmPerformances = algorithmPerformances;
    }
}
