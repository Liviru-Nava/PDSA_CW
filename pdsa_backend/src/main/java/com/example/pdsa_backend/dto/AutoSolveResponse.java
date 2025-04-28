package com.example.pdsa_backend.dto;

public class AutoSolveResponse {
    private boolean valid;
    private String message;
    private int numOfMoves;
    private String sequenceOfMoves;

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public int getNumOfMoves() { return numOfMoves; }
    public void setNumOfMoves(int numOfMoves) { this.numOfMoves = numOfMoves; }
    public String getSequenceOfMoves() { return sequenceOfMoves; }
    public void setSequenceOfMoves(String sequenceOfMoves) { this.sequenceOfMoves = sequenceOfMoves; }
}