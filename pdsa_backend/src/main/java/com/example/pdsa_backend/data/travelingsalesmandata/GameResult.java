package com.example.pdsa_backend.data.travelingsalesmandata;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name="gameresult")
public class GameResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="result_id")
    private int resultId;
    @Column(name="game_id")
    private int gameId;
    @Column(name="player_id")
    private int playerId;
    @Column(name="completion_time_seconds")
    private int completionTimeSeconds;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name="created_at")
    private LocalDateTime createdAt;

    //getters and setters

    public int getResultId() {
        return resultId;
    }

    public void setResultId(int resultId) {
        this.resultId = resultId;
    }

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
