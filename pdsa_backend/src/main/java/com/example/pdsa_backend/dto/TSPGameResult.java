package com.example.pdsa_backend.dto;

import java.util.List;

public class TSPGameResult {
    private int gameId;
    private int playerId;
    private int completionTime;
    private String homeCity;
    private List<String> shortestRoute;
    private int shortestDistance;
    private List<TSPSolution> solutions;

    public int getGameId() {
        return gameId;
    }

    public void setGameId(int gameId) {
        this.gameId = gameId;
    }

    public int getPlayerId() {
        return playerId;
    }

    public void setPlayerId(int playerId) {
        this.playerId = playerId;
    }

    public int getCompletionTime() {
        return completionTime;
    }

    public void setCompletionTime(int completionTime) {
        this.completionTime = completionTime;
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

    public List<TSPSolution> getSolutions() {
        return solutions;
    }

    public void setSolutions(List<TSPSolution> solutions) {
        this.solutions = solutions;
    }
}
