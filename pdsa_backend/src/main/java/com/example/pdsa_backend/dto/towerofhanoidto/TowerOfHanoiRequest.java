package com.example.pdsa_backend.dto.towerofhanoidto;

public class TowerOfHanoiRequest {
    private String username;
    private int diskCount;
    private int pegCount;
    private int numOfMoves;
    private String sequenceOfMoves;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public int getDiskCount() { return diskCount; }
    public void setDiskCount(int diskCount) { this.diskCount = diskCount; }
    public int getPegCount() { return pegCount; }
    public void setPegCount(int pegCount) { this.pegCount = pegCount; }
    public int getNumOfMoves() { return numOfMoves; }
    public void setNumOfMoves(int numOfMoves) { this.numOfMoves = numOfMoves; }
    public String getSequenceOfMoves() { return sequenceOfMoves; }
    public void setSequenceOfMoves(String sequenceOfMoves) { this.sequenceOfMoves = sequenceOfMoves; }
}