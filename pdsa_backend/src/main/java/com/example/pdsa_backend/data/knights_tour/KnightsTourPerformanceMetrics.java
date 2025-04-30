package com.example.pdsa_backend.data.knights_tour;

import jakarta.persistence.*;

@Entity
@Table(name = "knightstourperformancemetrics")
public class KnightsTourPerformanceMetrics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "knights_tour_performance_metric_id")
    private int knightsTourPerformanceMetricId;

    @Column(name="metric_id")
    private int metricId;

    @Column(name="algorithm_sequence_of_moves")
    private String algorithmSequenceOfMoves;

    @Column(name="max_moves_reached")
    private int maxMovesReached;

    @Column(name="branches_covered")
    private int branchesCovered;

    @Column(name = "has_completed")
    private boolean hasCompleted;

    @Column(name = "has_timed_out")
    private boolean hasTimedOut;

    public int getKnightsTourPerformanceMetricId() {
        return knightsTourPerformanceMetricId;
    }

    public void setKnightsTourPerformanceMetricId(int knightsTourPerformanceMetricId) {
        this.knightsTourPerformanceMetricId = knightsTourPerformanceMetricId;
    }

    public int getMetricId() {
        return metricId;
    }

    public void setMetricId(int metric_id) {
        this.metricId = metric_id;
    }

    public String getAlgorithmSequenceOfMoves() {
        return algorithmSequenceOfMoves;
    }

    public void setAlgorithmSequenceOfMoves(String algorithmSequenceOfMoves) {
        this.algorithmSequenceOfMoves = algorithmSequenceOfMoves;
    }

    public int getMaxMovesReached() {
        return maxMovesReached;
    }

    public void setMaxMovesReached(int maxMovesReached) {
        this.maxMovesReached = maxMovesReached;
    }

    public int getBranchesCovered() {
        return branchesCovered;
    }

    public void setBranchesCovered(int branchesCovered) {
        this.branchesCovered = branchesCovered;
    }

    public boolean getHasCompleted() {
        return hasCompleted;
    }

    public void setHasCompleted(boolean hasCompleted) {
        this.hasCompleted = hasCompleted;
    }

    public boolean getHasTimedOut() {
        return hasTimedOut;
    }

    public void setHasTimedOut(boolean hasTimedOut) {
        this.hasTimedOut = hasTimedOut;
    }
}
