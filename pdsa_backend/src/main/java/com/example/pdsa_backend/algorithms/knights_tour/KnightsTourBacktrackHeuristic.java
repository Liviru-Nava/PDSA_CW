package com.example.pdsa_backend.algorithms.knights_tour;

import com.example.pdsa_backend.algorithms.knights_tour.AbstractKnightsTour;
import com.example.pdsa_backend.exception.knights_tour.TimeoutException;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Implementation of Knight's Tour problem using parallel backtracking with Warnsdorff's heuristic.
 * This combines the exhaustive nature of backtracking with the efficiency of Warnsdorff's rule.
 */
public class KnightsTourBacktrackHeuristic extends AbstractKnightsTour {
    private AtomicBoolean solutionFound;
    private final Object lock = new Object(); // For synchronization
    private final Object maxProgressLock = new Object(); // For synchronizing max progress updates
    private final Random random;
    private AtomicLong branchesCounter = new AtomicLong(0);

    /**
     * Creates a new Knight's Tour solver with the specified board dimensions.
     *
     * @param rows Number of rows on the board
     * @param cols Number of columns on the board
     */
    public KnightsTourBacktrackHeuristic(int rows, int cols) {
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

        if (rows == 1 && cols == 1) {
            board[0][0] = 0;
            return true;
        }

        // Reset the board and solution state
        resetBoard();
        resetMaxProgressBoard();
        solutionFound = new AtomicBoolean(false);
        branchesCounter.set(0);
        branchesCovered = 0;
        maxMovesReached = 0;

        // Mark the starting position
        board[startRow][startCol] = 0;

        // Create a thread pool
        int numThreads = Runtime.getRuntime().availableProcessors();
        ExecutorService executor = Executors.newFixedThreadPool(numThreads);
        List<Future<Boolean>> futures = new ArrayList<>();
        startTime = System.currentTimeMillis();

        // Create tasks for the first set of moves from the starting position
        List<int[]> firstMoves = findNextMovesWithHeuristic(startRow, startCol, board);

        for (int[] move : firstMoves) {
            final int moveRow = move[0];
            final int moveCol = move[1];

            Callable<Boolean> task = () -> {
                // Create a local copy of the board for this thread
                int[][] localBoard = cloneBoard(board);
                localBoard[moveRow][moveCol] = 1; // First move (move number 1)
                branchesCounter.incrementAndGet();

                boolean result = solveKnightsTourUtil(localBoard, moveRow, moveCol, 2);

                if (result && solutionFound.compareAndSet(false, true)) {
                    synchronized (lock) {
                        // Copy solution to main board
                        copyBoard(localBoard, board);
                    }
                    return true;
                }
                return false;
            };

            futures.add(executor.submit(task));
        }

        // Wait for results
        boolean success = false;
        try {
            for (Future<Boolean> future : futures) {
                try {
                    if (future.get(timeoutMs, TimeUnit.MILLISECONDS)) {
                        success = true;
                        break;
                    }
                } catch (Exception e) {
                    // Timeout or interrupted
                }
            }

            if (!success && System.currentTimeMillis() - startTime > timeoutMs) {
                // Update branchesCovered from atomic counter before throwing exception
                branchesCovered = branchesCounter.get();
                throw new TimeoutException("Timeout reached for starting position (" +
                        startRow + ", " + startCol + ")",this);
            }

        } catch (Exception e) {
            if (e instanceof TimeoutException) {
                throw (TimeoutException) e;
            }
        } finally {
            executor.shutdownNow(); // Cancel all running tasks
            try {
                executor.awaitTermination(1, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            // Update branchesCovered from atomic counter
            branchesCovered = branchesCounter.get();
        }

        solved = success;
        return success;
    }

    /**
     * Recursive utility method to solve Knight's Tour using backtracking with Warnsdorff's heuristic.
     *
     * @param localBoard the board state for this branch
     * @param row current row position
     * @param col current column position
     * @param moveCount current move count
     * @return true if a solution is found, false otherwise
     */
    private boolean solveKnightsTourUtil(int[][] localBoard, int row, int col, int moveCount) {
        // Check if another thread found a solution
        if (solutionFound.get()) {
            return false;
        }

        // Update max progress if this path has progressed further
        synchronized (maxProgressLock) {
            if (moveCount > maxMovesReached) {
                maxMovesReached = moveCount;
                copyBoard(localBoard, maxProgressBoard);
            }
        }

        // If all squares are visited, we have a solution
        if (moveCount == rows * cols) {
            return true;
        }

        if (System.currentTimeMillis() - startTime > timeoutMs) {
            return false; // Timeout reached
        }

        // Get next moves ordered by Warnsdorff's heuristic
        List<int[]> nextMoves = findNextMovesWithHeuristic(row, col, localBoard);

        // Try all possible moves from current position
        for (int[] move : nextMoves) {
            int nextRow = move[0];
            int nextCol = move[1];

            localBoard[nextRow][nextCol] = moveCount;

            if (solveKnightsTourUtil(localBoard, nextRow, nextCol, moveCount + 1)) {
                return true;
            }

            localBoard[nextRow][nextCol] = -1; // Backtrack
            branchesCounter.incrementAndGet();
        }
        return false;
    }

    /**
     * Finds the next possible moves ordered by Warnsdorff's heuristic.
     *
     * @param row current row position
     * @param col current column position
     * @param boardState current board state
     * @return list of next possible moves [row, col] ordered by heuristic with randomization
     */
    private List<int[]> findNextMovesWithHeuristic(int row, int col, int[][] boardState) {
        List<int[]> moves = new ArrayList<>();
        List<Integer> degrees = new ArrayList<>();

        // Find all valid moves and their degrees
        for (int i = 0; i < 8; i++) {
            int nextRow = row + ROW_MOVES[i];
            int nextCol = col + COL_MOVES[i];

            if (isValidMove(nextRow, nextCol, boardState)) {
                int degree = countDegree(nextRow, nextCol, boardState);

                // Insert the move in the right position based on degree (sorted)
                int insertIndex = 0;
                while (insertIndex < degrees.size() && degree >= degrees.get(insertIndex)) {
                    insertIndex++;
                }

                moves.add(insertIndex, new int[]{nextRow, nextCol});
                degrees.add(insertIndex, degree);
            }
        }

        // Add randomization - select randomly from moves with the same degree
        if (!moves.isEmpty()) {
            List<int[]> randomizedMoves = new ArrayList<>();
            int currentDegree = degrees.get(0);
            List<int[]> sameDegree = new ArrayList<>();

            for (int i = 0; i < moves.size(); i++) {
                if (degrees.get(i) == currentDegree) {
                    sameDegree.add(moves.get(i));
                } else {
                    // Randomize moves with the same degree
                    while (!sameDegree.isEmpty()) {
                        int randomIndex = random.nextInt(sameDegree.size());
                        randomizedMoves.add(sameDegree.remove(randomIndex));
                    }

                    // Start a new group
                    currentDegree = degrees.get(i);
                    sameDegree.add(moves.get(i));
                }
            }

            // Handle the last group
            while (!sameDegree.isEmpty()) {
                int randomIndex = random.nextInt(sameDegree.size());
                randomizedMoves.add(sameDegree.remove(randomIndex));
            }

            return randomizedMoves;
        }

        return moves;
    }

    /**
     * Gets the random number generator
     *
     * @return the random number generator used by this solver
     */
    public Random getRandom(){
        return random;
    }

    /**
     * Gets the number of branches covered during the search.
     * Overrides the method in AbstractKnightsTour to provide atomic counter value.
     *
     * @return number of branches covered
     */
    @Override
    public long getBranchesCovered() {
        return branchesCovered;
    }
}