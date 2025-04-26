package com.example.pdsa_backend.algorithms.knights_tour;

import com.example.pdsa_backend.exception.knights_tour.TimeoutException;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;


/**
 * Implementation of Knight's Tour problem using Warnsdorff's algorithm.
 * The Knight's Tour is a sequence of moves by a knight on a chessboard
 * such that the knight visits every square exactly once.
 */
public class KnightsTourWarnsdorffs extends AbstractKnightsTour {
    private final Random random;

    /**
     * Creates a new Knight's Tour solver with the specified board dimensions.
     *
     * @param rows Number of rows on the board
     * @param cols Number of columns on the board
     */
    public KnightsTourWarnsdorffs(int rows, int cols) {
        super(rows, cols);
        this.random = new Random();
    }

    /**
     * Attempts to solve the Knight's Tour starting from the specified position.
     *
     * @param startRow starting row position (0-indexed)
     * @param startCol starting column position (0-indexed)
     * @return true if a solution was found, false otherwise
     * @throws TimeoutException if the algorithm exceeds the timeout limit
     */
    @Override
    public boolean solveKnightsTour(int startRow, int startCol) throws TimeoutException {
        validatePosition(startRow, startCol);

        // Reset the board
        resetBoard();

        branchesCovered++;
        startTime = System.currentTimeMillis();
        board[startRow][startCol] = 0;
        int currRow = startRow;
        int currCol = startCol;
        solved = true;

        for (int move = 1; move < rows * cols; move++) {
            if (System.currentTimeMillis() - startTime > timeoutMs) {
                throw new TimeoutException("Timeout reached for starting position (" +
                        startRow + ", " + startCol + ")",this);
            }
            maxMovesReached = move;
            int[] nextMove = findNextMove(currRow, currCol);
            if (nextMove == null) {
                copyBoard(board, maxProgressBoard);
                solved = false;
                return false;
            }
            currRow = nextMove[0];
            currCol = nextMove[1];
            board[currRow][currCol] = move;
        }
        maxMovesReached = rows * cols;
        copyBoard(board, maxProgressBoard);
        return solved;
    }

    /**
     * Finds the next move according to Warnsdorff's heuristic.
     *
     * @param row current row position
     * @param col current column position
     * @return an array containing [nextRow, nextCol] or null if no move is possible
     */
    private int[] findNextMove(int row, int col) {
        int minDegree = Integer.MAX_VALUE;
        List<Integer> candidateIndices = new ArrayList<>();

        for (int i = 0; i < 8; i++) {
            int nextRow = row + ROW_MOVES[i];
            int nextCol = col + COL_MOVES[i];

            if (isValidMove(nextRow, nextCol)) {
                int degree = countDegree(nextRow, nextCol);
                if (degree < minDegree) {
                    minDegree = degree;
                    candidateIndices.clear();
                    candidateIndices.add(i);
                } else if (degree == minDegree) {
                    candidateIndices.add(i);
                }
            }
        }

        if (candidateIndices.isEmpty()) {
            return null;
        }

        // Randomly select from moves with the same minimum degree
        int randomIndex = random.nextInt(candidateIndices.size());
        int selectedMoveIndex = candidateIndices.get(randomIndex);

        return new int[] {row + ROW_MOVES[selectedMoveIndex], col + COL_MOVES[selectedMoveIndex]};
    }
}