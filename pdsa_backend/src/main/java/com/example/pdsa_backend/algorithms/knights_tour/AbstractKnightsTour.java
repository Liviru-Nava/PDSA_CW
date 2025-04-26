package com.example.pdsa_backend.algorithms.knights_tour;

import java.util.Arrays;

/**
 * Abstract base class for Knight's Tour implementations.
 * Provides common functionality for board management and move validation.
 */
public abstract class AbstractKnightsTour implements KnightsTourSolver {
    // Possible knight moves (delta row, delta column)
    protected static final int[] ROW_MOVES = {2, 1, -1, -2, -2, -1, 1, 2};
    protected static final int[] COL_MOVES = {1, 2, 2, 1, -1, -2, -2, -1};

    protected final int rows;
    protected final int cols;
    protected final int[][] board;
    protected long startTime;
    protected long timeoutMs = 10000; // 10 seconds timeout by default
    protected long branchesCovered;
    protected boolean solved;

    // Add tracking for maximum progress
    protected int maxMovesReached;
    protected int[][] maxProgressBoard;

    /**
     * Creates a new Knight's Tour solver with the specified board dimensions.
     *
     * @param rows Number of rows on the board
     * @param cols Number of columns on the board
     * @throws IllegalArgumentException if dimensions are not positive
     */
    public AbstractKnightsTour(int rows, int cols) {
        if (rows <= 0 || cols <= 0) {
            throw new IllegalArgumentException("Board dimensions must be positive");
        }

        this.rows = rows;
        this.cols = cols;
        this.board = new int[rows][cols];
        this.branchesCovered = 0;
        this.solved = false;
        this.maxMovesReached = 0;
        this.maxProgressBoard = new int[rows][cols];

        // Initialize board with -1 (unvisited)
        resetBoard();
        resetMaxProgressBoard();
    }

    /**
     * Resets the board to initial state.
     */
    protected void resetBoard() {
        for (int i = 0; i < rows; i++) {
            Arrays.fill(board[i], -1);
        }
    }

    /**
     * Resets the maximum progress board to initial state.
     */
    protected void resetMaxProgressBoard() {
        for (int i = 0; i < rows; i++) {
            Arrays.fill(maxProgressBoard[i], -1);
        }
    }

    /**
     * Gets the current board state.
     *
     * @return 2D array representing the board state
     */
    @Override
    public int[][] getBoard() {
        int[][] copy = new int[rows][cols];
        for (int i = 0; i < rows; i++) {
            System.arraycopy(board[i], 0, copy[i], 0, cols);
        }
        return copy;
    }

    /**
     * Gets the number of branches covered during the search.
     *
     * @return number of branches covered
     */
    @Override
    public long getBranchesCovered() {
        return branchesCovered;
    }

    /**
     * Gets the maximum move count reached during the most recent solve attempt.
     *
     * @return the maximum number of moves placed on the board
     */
    @Override
    public int getMaxMovesReached() {
        return maxMovesReached;
    }

    /**
     * Gets the board state with maximum progress.
     *
     * @return a copy of the board state with maximum progress
     */
    @Override
    public int[][] getMaxProgressBoard() {
        int[][] copy = new int[rows][cols];
        for (int i = 0; i < rows; i++) {
            System.arraycopy(maxProgressBoard[i], 0, copy[i], 0, cols);
        }
        return copy;
    }

    /**
     * Sets the timeout duration for the algorithm.
     *
     * @param timeoutMs timeout in milliseconds
     * @throws IllegalArgumentException if timeout is negative
     */
    @Override
    public void setTimeout(long timeoutMs) {
        if (timeoutMs < 0) {
            throw new IllegalArgumentException("Timeout must be non-negative");
        }
        this.timeoutMs = timeoutMs;
    }

    /**
     * Validates if a position is within the board boundaries.
     *
     * @param row row position to validate
     * @param col column position to validate
     * @throws IllegalArgumentException if position is outside board boundaries
     */
    protected void validatePosition(int row, int col) {
        if (row < 0 || row >= rows || col < 0 || col >= cols) {
            throw new IllegalArgumentException(
                    "Invalid position: (" + row + ", " + col + "). " +
                            "Position must be within board boundaries: [0-" + (rows-1) + "], [0-" + (cols-1) + "]");
        }
    }

    /**
     * Checks if a move is valid (within bounds and unvisited).
     *
     * @param row target row position
     * @param col target column position
     * @return true if the move is valid, false otherwise
     */
    protected boolean isValidMove(int row, int col) {
        return row >= 0 && row < rows && col >= 0 && col < cols && board[row][col] == -1;
    }

    /**
     * Checks if a move is valid on a specific board.
     *
     * @param row target row position
     * @param col target column position
     * @param boardState the board to check
     * @return true if the move is valid, false otherwise
     */
    protected boolean isValidMove(int row, int col, int[][] boardState) {
        return row >= 0 && row < rows && col >= 0 && col < cols && boardState[row][col] == -1;
    }

    /**
     * Counts the number of valid moves from a position (degree).
     *
     * @param row row position
     * @param col column position
     * @return number of valid moves
     */
    protected int countDegree(int row, int col) {
        return countDegree(row, col, board);
    }

    /**
     * Counts the number of valid moves from a position (degree) on a specific board.
     *
     * @param row row position
     * @param col column position
     * @param boardState the board to check
     * @return number of valid moves
     */
    protected int countDegree(int row, int col, int[][] boardState) {
        int count = 0;
        for (int i = 0; i < 8; i++) {
            int nextRow = row + ROW_MOVES[i];
            int nextCol = col + COL_MOVES[i];
            if (isValidMove(nextRow, nextCol, boardState)) {
                count++;
            }
        }
        return count;
    }

    /**
     * Create a deep copy of a board.
     *
     * @param original the original board
     * @return a deep copy of the board
     */
    protected int[][] cloneBoard(int[][] original) {
        int[][] clone = new int[rows][cols];
        for (int i = 0; i < rows; i++) {
            System.arraycopy(original[i], 0, clone[i], 0, cols);
        }
        return clone;
    }

    /**
     * Copy source board to destination board.
     *
     * @param source the source board
     * @param destination the destination board
     */
    protected void copyBoard(int[][] source, int[][] destination) {
        for (int i = 0; i < rows; i++) {
            System.arraycopy(source[i], 0, destination[i], 0, cols);
        }
    }

    /**
     * Updates the maximum progress tracking if the current move count is higher.
     *
     * @param currentBoard the current board state
     * @param moveCount the current move count
     */
    protected void updateMaxProgress(int[][] currentBoard, int moveCount) {
        if (moveCount > maxMovesReached) {
            maxMovesReached = moveCount;
            copyBoard(currentBoard, maxProgressBoard);
        }
    }

    /**
     * Prints the current board solution.
     */
    @Override
    public void printSolution() {
        System.out.println("Knight's Tour Solution (board state):");
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                System.out.printf("%3d ", board[i][j]);
            }
            System.out.println();
        }
    }

    /**
     * Prints the maximum progress board.
     */
    public void printMaxProgressBoard() {
        System.out.println("Maximum Progress Board (max moves reached: " + maxMovesReached + "):");
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                System.out.printf("%3d ", maxProgressBoard[i][j]);
            }
            System.out.println();
        }
    }
}