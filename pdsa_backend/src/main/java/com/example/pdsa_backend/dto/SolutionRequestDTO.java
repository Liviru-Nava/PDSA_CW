package com.example.pdsa_backend.dto;

import java.time.LocalDateTime;

public class SolutionRequestDTO {
    private int gameId;
    private int playerId;
    private int[] configuration;
    private int completionTimeSeconds;
    private LocalDateTime createdAt;

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

    public int[] getConfiguration() {
        return configuration;
    }

    public void setConfiguration(int[] configuration) {
        this.configuration = configuration;
    }

    public int getCompletionTimeSeconds() {
        return completionTimeSeconds;
    }

    public void setCompletionTimeSeconds(int completionTimeSeconds) {
        this.completionTimeSeconds = completionTimeSeconds;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}