package com.example.pdsa_backend.knights_tour;

import java.time.LocalDateTime;
import java.util.Map;

public class PlayerGameResult {
    private Long id;
    private String username;
    private int boardSize;
    private int moveCount;
    private long gameTime; // in seconds
    private boolean hasCompleted;
    private int[][] board;
    private LocalDateTime timestamp;
    private int startX;
    private int startY;
    private Map<String, AlgorithmMetric> algorithmMetrics;

    // Default constructor
    public PlayerGameResult() {
        this.timestamp = LocalDateTime.now();
    }

    // Constructor with fields
    public PlayerGameResult(String username, int boardSize, int moveCount, long gameTime,
                            boolean hasCompleted, int[][] board,int startX, int startY,
                            Map<String, AlgorithmMetric> algorithmMetrics) {
        this.username = username;
        this.boardSize = boardSize;
        this.moveCount = moveCount;
        this.gameTime = gameTime;
        this.hasCompleted = hasCompleted;
        this.board = board;
        this.timestamp = LocalDateTime.now();
        this.startX = startX;
        this.startY = startY;
        this.algorithmMetrics = algorithmMetrics;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public int getBoardSize() {
        return boardSize;
    }

    public void setBoardSize(int boardSize) {
        this.boardSize = boardSize;
    }

    public int getMoveCount() {
        return moveCount;
    }

    public void setMoveCount(int moveCount) {
        this.moveCount = moveCount;
    }

    public long getGameTime() {
        return gameTime;
    }

    public void setGameTime(long gameTime) {
        this.gameTime = gameTime;
    }

    public boolean getHasCompleted() {
        return hasCompleted;
    }

    public void setHasCompleted(boolean hasCompleted) {
        this.hasCompleted = hasCompleted;
    }

    public int[][] getBoard() {
        return board;
    }

    public void setBoard(int[][] board) {
        this.board = board;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public int getStartY() {
        return startY;
    }

    public void setStartY(int startY) {
        this.startY = startY;
    }

    public int getStartX() {
        return startX;
    }

    public void setStartX(int startX) {
        this.startX = startX;
    }

    public boolean isHasCompleted() {
        return hasCompleted;
    }

    public Map<String, AlgorithmMetric> getAlgorithmMetrics() {
        return algorithmMetrics;
    }

    public void setAlgorithmMetrics(Map<String, AlgorithmMetric> algorithmMetrics) {
        this.algorithmMetrics = algorithmMetrics;
    }

    @Override
    public String toString() {
        return "PlayerGameResult{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", boardSize=" + boardSize +
                ", moveCount=" + moveCount +
                ", gameTime=" + gameTime +
                ", completed=" + hasCompleted +
                ", timestamp=" + timestamp +
                '}';
    }
}
