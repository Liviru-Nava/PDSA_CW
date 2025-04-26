package com.example.pdsa_backend.knights_tour;

import java.io.Serializable;

public class KTSolution implements Serializable {
    private final int boardSize;
    private final String algorithm;
    private final int[][] board;
    private final boolean solutionFound;
    private final long branchesCovered;
    private final long executionTime;
    private final String errorMessage;
    private final int maximumMovesMade;

    public KTSolution(int boardSize, String algorithm, int[][] board, boolean solutionFound,
                      long branchesCovered, long executionTime,int maximumMovesMade) {
        this(boardSize, algorithm, board, solutionFound, branchesCovered, executionTime, maximumMovesMade, null);
    }

    public KTSolution(int boardSize, String algorithm, int[][] board, boolean solutionFound,
                      long branchesCovered, long executionTime, int maximumMovesMade, String errorMessage) {
        this.boardSize = boardSize;
        this.algorithm = algorithm;
        this.board = board;
        this.solutionFound = solutionFound;
        this.branchesCovered = branchesCovered;
        this.executionTime = executionTime;
        this.errorMessage = errorMessage;
        this.maximumMovesMade = maximumMovesMade;
    }

    public int getBoardSize() {
        return boardSize;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public int[][] getBoard() {
        return board;
    }

    public boolean isSolutionFound() {
        return solutionFound;
    }

    public long getBranchesCovered() {
        return branchesCovered;
    }

    public long getExecutionTime() {
        return executionTime;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public int getMaximumMovesMade() {
        return maximumMovesMade;
    }
}