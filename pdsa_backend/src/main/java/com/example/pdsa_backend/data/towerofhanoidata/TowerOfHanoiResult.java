package com.example.pdsa_backend.data.towerofhanoidata;

import jakarta.persistence.*;

@Entity
@Table(name = "towerofhanoiresult")
public class TowerOfHanoiResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "toh_result_id")
    private int tohResultId;

    @Column(name = "result_id")
    private int resultId;

    @Column(name = "num_of_moves")
    private int numOfMoves;

    @Column(name = "sequence_of_moves", columnDefinition = "TEXT")
    private String sequenceOfMoves;

    public int getTohResultId() { return tohResultId; }
    public void setTohResultId(int tohResultId) { this.tohResultId = tohResultId; }
    public int getResultId() { return resultId; }
    public void setResultId(int resultId) { this.resultId = resultId; }
    public int getNumOfMoves() { return numOfMoves; }
    public void setNumOfMoves(int numOfMoves) { this.numOfMoves = numOfMoves; }
    public String getSequenceOfMoves() { return sequenceOfMoves; }
    public void setSequenceOfMoves(String sequenceOfMoves) { this.sequenceOfMoves = sequenceOfMoves; }
}