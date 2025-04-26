package com.example.pdsa_backend.data.knights_tour;

import jakarta.persistence.*;

@Entity
@Table(name="algorithm")
public class Algorithm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="algorithm_id")
    private int algorithmId;

    @Column(name="game_id")
    private int gameId;

    @Column(name="algorithm_name")
    private String algorithmName;

    @Column(name="description")
    private String description;

    @Column(name="complexity_analysis")
    private String complexityAnalysis;



    //getters and setters
    public int getAlgorithmId() {
        return algorithmId;
    }

    public void setAlgorithmId(int algorithmId) {
        this.algorithmId = algorithmId;
    }

    public int getGameId() {
        return gameId;
    }

    public void setGameId(int gameId) {
        this.gameId = gameId;
    }

    public String getAlgorithmName() {
        return algorithmName;
    }

    public void setAlgorithmName(String algorithmName) {
        this.algorithmName = algorithmName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getComplexityAnalysis() {
        return complexityAnalysis;
    }

    public void setComplexityAnalysis(String complexityAnalysis) {
        this.complexityAnalysis = complexityAnalysis;
    }
}
