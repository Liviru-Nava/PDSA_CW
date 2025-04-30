package com.example.pdsa_backend.data.eightqueensdata;
import jakarta.persistence.*;

@Entity
@Table(name = "algorithmrun")
public class AlgorithmRun {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "run_id")
    private int runId;

    @Column(name = "algorithm_id", nullable = false)
    private int algorithmId;

    @Column(name = "execution_time_ms", nullable = false)
    private long executionTimeMs;

    public int getRunId() {
        return runId;
    }

    public void setRunId(int runId) {
        this.runId = runId;
    }

    public int getAlgorithmId() {
        return algorithmId;
    }

    public void setAlgorithmId(int algorithmId) {
        this.algorithmId = algorithmId;
    }

    public long getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(long executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }
}
