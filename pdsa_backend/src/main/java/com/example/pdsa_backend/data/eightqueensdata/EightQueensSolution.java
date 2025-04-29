package com.example.pdsa_backend.data.eightqueensdata;

import jakarta.persistence.*;

@Entity
@Table(name = "eightqueenssolution")
public class EightQueensSolution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "solution_id")
    private int solutionId;

    @Column(name = "game_id", nullable = false)
    private int gameId;

    @Column(name = "configuration", nullable = false)
    private String configuration;

    @Column(name = "is_recognized", nullable = false)
    private boolean isRecognized;

    public int getSolutionId() {
        return solutionId;
    }

    public void setSolutionId(int solutionId) {
        this.solutionId = solutionId;
    }

    public int getGameId() {
        return gameId;
    }

    public void setGameId(int gameId) {
        this.gameId = gameId;
    }

    public String getConfiguration() {
        return configuration;
    }

    public void setConfiguration(String configuration) {
        this.configuration = configuration;
    }

    public boolean isRecognized() {
        return isRecognized;
    }

    public void setRecognized(boolean recognized) {
        this.isRecognized = recognized;
    }
}