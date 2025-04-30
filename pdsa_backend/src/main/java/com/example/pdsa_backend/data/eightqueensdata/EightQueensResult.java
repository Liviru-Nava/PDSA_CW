package com.example.pdsa_backend.data.eightqueensdata;

import jakarta.persistence.*;

@Entity
@Table(name = "eightqueensresult")
public class EightQueensResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "eight_queens_result_id")
    private int eightQueensResultId;

    @Column(name = "result_id", nullable = false)
    private int resultId;

    @Column(name = "solution_id", nullable = false)
    private int solutionId;

    @Column(name = "result_value", nullable = false)
    private String resultValue;

    public int getEightQueensResultId() {
        return eightQueensResultId;
    }

    public void setEightQueensResultId(int eightQueensResultId) {
        this.eightQueensResultId = eightQueensResultId;
    }

    public int getResultId() {
        return resultId;
    }

    public void setResultId(int resultId) {
        this.resultId = resultId;
    }

    public int getSolutionId() {
        return solutionId;
    }

    public void setSolutionId(int solutionId) {
        this.solutionId = solutionId;
    }

    public String getResultValue() {
        return resultValue;
    }

    public void setResultValue(String resultValue) {
        this.resultValue = resultValue;
    }
}
