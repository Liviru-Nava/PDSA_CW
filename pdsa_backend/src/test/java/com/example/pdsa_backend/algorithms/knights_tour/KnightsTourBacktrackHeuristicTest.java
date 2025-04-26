package com.example.pdsa_backend.algorithms.knights_tour;

import com.example.pdsa_backend.exception.knights_tour.TimeoutException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.lang.reflect.Method;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for KnightsTourBacktrackHeuristic implementation.
 */
public class KnightsTourBacktrackHeuristicTest {

    private KnightsTourBacktrackHeuristic knightsTour;

    @BeforeEach
    void setUp() {
        knightsTour = new KnightsTourBacktrackHeuristic(5, 5);
    }

    @Test
    void testConstructor() {
        assertEquals(5, knightsTour.rows);
        assertEquals(5, knightsTour.cols);
        assertNotNull(knightsTour.getBoard());
        assertEquals(0, knightsTour.getBranchesCovered());
        assertNotNull(knightsTour.getRandom(), "Random object should be initialized in constructor");
    }

    @Test
    void testInvalidBoardDimensions() {
        assertThrows(IllegalArgumentException.class, () -> new KnightsTourBacktrackHeuristic(0, 5));
        assertThrows(IllegalArgumentException.class, () -> new KnightsTourBacktrackHeuristic(5, 0));
        assertThrows(IllegalArgumentException.class, () -> new KnightsTourBacktrackHeuristic(-1, -1));
    }

    @Test
    void testInvalidStartingPosition() {
        assertThrows(IllegalArgumentException.class, () -> knightsTour.solveKnightsTour(-1, 0));
        assertThrows(IllegalArgumentException.class, () -> knightsTour.solveKnightsTour(0, -1));
        assertThrows(IllegalArgumentException.class, () -> knightsTour.solveKnightsTour(5, 0));
        assertThrows(IllegalArgumentException.class, () -> knightsTour.solveKnightsTour(0, 5));
    }

    @Test
    void testTimeout() {
        KnightsTourBacktrackHeuristic largeBoard = new KnightsTourBacktrackHeuristic(8, 8);
        largeBoard.setTimeout(1); // 1ms timeout, should cause timeout

        assertThrows(TimeoutException.class, () -> largeBoard.solveKnightsTour(0, 0));
    }

    @Test
    void testSetTimeout() {
        knightsTour.setTimeout(5000);
        assertEquals(5000, knightsTour.timeoutMs);

        assertThrows(IllegalArgumentException.class, () -> knightsTour.setTimeout(-1000));
    }

    @ParameterizedTest
    @CsvSource({
            "5, 5, 0, 0, true",   // 5x5 board from top-left corner
            "5, 5, 2, 2, true",   // 5x5 board from center
            "3, 3, 0, 0, false",  // 3x3 board has no solution
            "1, 1, 0, 0, true"    // 1x1 board (trivial solution)
    })
    void testSolveKnightsTour(int rows, int cols, int startRow, int startCol, boolean expectedResult)
            throws TimeoutException {
        knightsTour = new KnightsTourBacktrackHeuristic(rows, cols);
        knightsTour.setTimeout(10000); // 10 seconds should be enough for these tests

        boolean result = knightsTour.solveKnightsTour(startRow, startCol);
        assertEquals(expectedResult, result);

        if (result) {
            // Verify the solution
            int[][] board = knightsTour.getBoard();
            verifyKnightsTourSolution(board, rows, cols, startRow, startCol);
        }
    }

    @Test
    void testRandomization() throws TimeoutException {
        // We'll solve the same board multiple times and check if the solutions are different
        // due to randomization
        KnightsTourBacktrackHeuristic board1 = new KnightsTourBacktrackHeuristic(5, 5);
        KnightsTourBacktrackHeuristic board2 = new KnightsTourBacktrackHeuristic(5, 5);

        // Set reasonably long timeouts
        board1.setTimeout(10000);
        board2.setTimeout(10000);

        // Solve both boards
        boolean result1 = board1.solveKnightsTour(0, 0);
        boolean result2 = board2.solveKnightsTour(0, 0);

        // Both should find a solution
        assertTrue(result1);
        assertTrue(result2);

        // Check if solutions are different (with high probability they should be)
        // If by chance they are the same, test would fail, but this is unlikely with randomization
        boolean solutionsDiffer = false;
        int[][] solution1 = board1.getBoard();
        int[][] solution2 = board2.getBoard();

        outerLoop:
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                if (solution1[i][j] != solution2[i][j]) {
                    solutionsDiffer = true;
                    break outerLoop;
                }
            }
        }

        assertTrue(solutionsDiffer, "With randomization, solutions should differ with high probability");

        // Verify both solutions are valid
        verifyKnightsTourSolution(solution1, 5, 5, 0, 0);
        verifyKnightsTourSolution(solution2, 5, 5, 0, 0);
    }

    @Test
    void testBoardReset() throws TimeoutException {
        // First attempt to solve
        knightsTour.solveKnightsTour(0, 0);

        // Get the solution board
        int[][] firstSolution = knightsTour.getBoard();

        // Try solving again from a different position
        knightsTour.solveKnightsTour(1, 1);

        // Get the new solution board
        int[][] secondSolution = knightsTour.getBoard();

        // Verify the boards are different
        boolean boardsAreDifferent = false;
        for (int i = 0; i < knightsTour.rows && !boardsAreDifferent; i++) {
            for (int j = 0; j < knightsTour.cols; j++) {
                if (firstSolution[i][j] != secondSolution[i][j]) {
                    boardsAreDifferent = true;
                    break;
                }
            }
        }
        assertTrue(boardsAreDifferent, "Board should be reset between solutions");
    }

    @Test
    void testPerformanceComparison() throws TimeoutException {
        // Create instances of both algorithms
        int size = 6; // Choose a moderate size that both algorithms can solve
        KnightsTourBacktracking backtracking = new KnightsTourBacktracking(size, size);
        KnightsTourBacktrackHeuristic backtrackHeuristic = new KnightsTourBacktrackHeuristic(size, size);
        KnightsTourWarnsdorffs warnsdorffs = new KnightsTourWarnsdorffs(size, size);

        // Set a reasonable timeout
        backtracking.setTimeout(30000); // 30 seconds
        backtrackHeuristic.setTimeout(30000);
        warnsdorffs.setTimeout(30000);

        // Solve with pure backtracking
        long startTime = System.currentTimeMillis();
        boolean backtrackResult = backtracking.solveKnightsTour(0, 0);
        long backtrackTime = System.currentTimeMillis() - startTime;

        // Solve with hybrid approach
        startTime = System.currentTimeMillis();
        boolean heuristicResult = backtrackHeuristic.solveKnightsTour(0, 0);
        long heuristicTime = System.currentTimeMillis() - startTime;

        // Solve with pure Warnsdorff's
        startTime = System.currentTimeMillis();
        boolean warnsdorffsResult = warnsdorffs.solveKnightsTour(0, 0);
        long warnsdorffsTime = System.currentTimeMillis() - startTime;

        // Just log the results for comparison (not a strict assertion since performance can vary)
        System.out.println("Performance comparison on " + size + "x" + size + " board:");
        System.out.println("Pure Backtracking: " + backtrackTime + "ms, solution found: " + backtrackResult);
        System.out.println("Backtrack Heuristic: " + heuristicTime + "ms, solution found: " + heuristicResult);
        System.out.println("Pure Warnsdorff's: " + warnsdorffsTime + "ms, solution found: " + warnsdorffsResult);

        // All should find a solution
        assertTrue(backtrackResult);
        assertTrue(heuristicResult);
        assertTrue(warnsdorffsResult);

        // Note: We don't strictly assert that the hybrid is faster, as that can be environment-dependent
        // But we can verify that all found solutions are valid
        verifyKnightsTourSolution(backtracking.getBoard(), size, size, 0, 0);
        verifyKnightsTourSolution(backtrackHeuristic.getBoard(), size, size, 0, 0);
        verifyKnightsTourSolution(warnsdorffs.getBoard(), size, size, 0, 0);
    }

    @Test
    void testParallelSolutionFinding() throws TimeoutException {
        // Create a board size that's solvable but complex enough to test parallelism
        KnightsTourBacktrackHeuristic mediumBoard = new KnightsTourBacktrackHeuristic(6, 6);

        // Solve the tour
        boolean result = mediumBoard.solveKnightsTour(0, 0);

        // Assert the solution was found
        assertTrue(result);

        // Check that we've covered some branches
        assertTrue(mediumBoard.getBranchesCovered() > 0);

        // Verify the solution
        int[][] board = mediumBoard.getBoard();
        verifyKnightsTourSolution(board, 6, 6, 0, 0);
    }

    @Test
    void testFindNextMovesWithHeuristic() throws Exception {
        // We need to use reflection to test this private method
        Method findNextMovesMethod = KnightsTourBacktrackHeuristic.class.getDeclaredMethod(
                "findNextMovesWithHeuristic", int.class, int.class, int[][].class);
        findNextMovesMethod.setAccessible(true);

        // Create a simple test board where some cells are already visited
        int[][] testBoard = new int[5][5];
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                testBoard[i][j] = -1; // Mark all as unvisited
            }
        }
        testBoard[2][2] = 0; // Mark center as visited

        // Test from position (0,0)
        @SuppressWarnings("unchecked")
        List<int[]> moves = (List<int[]>) findNextMovesMethod.invoke(knightsTour, 0, 0, testBoard);

        // Should have 2 possible moves from (0,0): (1,2) and (2,1)
        assertEquals(2, moves.size());

        // With randomization, we can't easily predict the order, but we should have both moves
        Set<String> expectedMoves = new HashSet<>();
        expectedMoves.add("1,2");
        expectedMoves.add("2,1");

        Set<String> actualMoves = new HashSet<>();
        for (int[] move : moves) {
            actualMoves.add(move[0] + "," + move[1]);
        }

        assertEquals(expectedMoves, actualMoves, "Should contain the expected moves regardless of order");

        // Test multiple runs to verify randomization
        boolean orderChangedAtLeastOnce = false;
        String firstMoveFirstRun = moves.get(0)[0] + "," + moves.get(0)[1];

        // Try several times to see if order changes
        for (int i = 0; i < 10 && !orderChangedAtLeastOnce; i++) {
            @SuppressWarnings("unchecked")
            List<int[]> newMoves = (List<int[]>) findNextMovesMethod.invoke(knightsTour, 0, 0, testBoard);
            String firstMoveNewRun = newMoves.get(0)[0] + "," + newMoves.get(0)[1];

            if (!firstMoveFirstRun.equals(firstMoveNewRun)) {
                orderChangedAtLeastOnce = true;
                break;
            }
        }

        // This is a probabilistic test - there's a chance it might fail if we're unlucky
        assertTrue(orderChangedAtLeastOnce, "Move order should change in multiple runs due to randomization");
    }

    @Test
    void testLargeBoardPerformance() throws TimeoutException {
        // Test on a larger board where the heuristic should make a significant difference
        KnightsTourBacktrackHeuristic largeBoard = new KnightsTourBacktrackHeuristic(7, 7);
        largeBoard.setTimeout(60000); // 60 seconds

        boolean result = largeBoard.solveKnightsTour(0, 0);

        // The test is mainly to see if it completes within the timeout
        assertTrue(result);
        verifyKnightsTourSolution(largeBoard.getBoard(), 7, 7, 0, 0);
    }

    @Test
    void testPrintSolution() throws TimeoutException {
        // This is mostly a coverage test to ensure the method doesn't throw exceptions
        KnightsTourBacktrackHeuristic smallBoard = new KnightsTourBacktrackHeuristic(5, 5);
        smallBoard.solveKnightsTour(0, 0);

        // We can't easily test the console output, but we can ensure it doesn't throw an exception
        assertDoesNotThrow(() -> smallBoard.printSolution());
    }

    /**
     * Helper method to verify that a Knight's Tour solution is valid.
     */
    private void verifyKnightsTourSolution(int[][] board, int rows, int cols, int startRow, int startCol) {
        // Check that the starting position is marked as move 0
        assertEquals(0, board[startRow][startCol]);

        // Check that each cell has been visited exactly once
        boolean[] visited = new boolean[rows * cols];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                int moveNumber = board[i][j];
                assertTrue(moveNumber >= 0 && moveNumber < rows * cols,
                        "Move number should be in range [0, " + (rows * cols - 1) + "]");
                assertFalse(visited[moveNumber], "Each move number should appear exactly once");
                visited[moveNumber] = true;
            }
        }

        // Check that each move is valid (knight's move)
        for (int move = 0; move < rows * cols - 1; move++) {
            int[] pos1 = findPosition(board, move);
            int[] pos2 = findPosition(board, move + 1);

            // Calculate the difference in coordinates
            int rowDiff = Math.abs(pos1[0] - pos2[0]);
            int colDiff = Math.abs(pos1[1] - pos2[1]);

            // Check if it's a valid knight's move (2,1) or (1,2)
            boolean validMove = (rowDiff == 2 && colDiff == 1) || (rowDiff == 1 && colDiff == 2);
            assertTrue(validMove, "Move from " + move + " to " + (move + 1) + " is not a valid knight's move");
        }
    }

    /**
     * Helper method to find the position of a move number in the board.
     */
    private int[] findPosition(int[][] board, int moveNumber) {
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < board[i].length; j++) {
                if (board[i][j] == moveNumber) {
                    return new int[]{i, j};
                }
            }
        }
        return null; // Should never reach here if the board is valid
    }
}