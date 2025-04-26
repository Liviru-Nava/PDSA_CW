package com.example.pdsa_backend.algorithms;

/**
 * Interface for Knight's Tour problem solvers.
 * The Knight's Tour is a sequence of moves by a knight on a chessboard
 * such that the knight visits every square exactly once.
 */
public interface KnightsTourSolver {
    /**
     * Attempts to solve the Knight's Tour starting from the specified position.
     *
     * @param startRow starting row position (0-indexed)
     * @param startCol starting column position (0-indexed)
     * @return true if a solution was found, false otherwise
     * @throws Exception if any error occurs during solving
     */
    boolean solveKnightsTour(int startRow, int startCol) throws Exception;

    /**
     * Gets the current board state.
     *
     * @return 2D array representing the board state
     */
    int[][] getBoard();

    /**
     * Gets the number of branches covered during the search.
     *
     * @return number of branches covered
     */
    long getBranchesCovered();

    /**
     * Gets the maximum move count reached during the most recent solve attempt.
     *
     * @return the maximum number of moves placed on the board
     */
    int getMaxMovesReached();

    /**
     * Gets the board state with maximum progress.
     *
     * @return a copy of the board state with maximum progress
     */
    int[][] getMaxProgressBoard();

    /**
     * Prints the current board solution.
     */
    void printSolution();

    /**
     * Sets the timeout duration for the algorithm.
     *
     * @param timeoutMs timeout in milliseconds
     */
    void setTimeout(long timeoutMs);
}