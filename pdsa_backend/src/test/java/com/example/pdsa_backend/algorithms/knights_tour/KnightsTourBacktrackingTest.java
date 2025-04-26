package com.example.pdsa_backend.algorithms.knights_tour;

import com.example.pdsa_backend.exception.knights_tour.TimeoutException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.lang.reflect.Field;
import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for KnightsTourBacktracking implementation.
 */
public class KnightsTourBacktrackingTest {

    private KnightsTourBacktracking knightsTour;

    @BeforeEach
    void setUp() {
        knightsTour = new KnightsTourBacktracking(5, 5);
    }

    @Test
    void testConstructor() {
        assertEquals(5, knightsTour.rows);
        assertEquals(5, knightsTour.cols);
        assertNotNull(knightsTour.getBoard());
        assertEquals(0, knightsTour.getBranchesCovered());
    }

    @Test
    void testInvalidBoardDimensions() {
        assertThrows(IllegalArgumentException.class, () -> new KnightsTourBacktracking(0, 5));
        assertThrows(IllegalArgumentException.class, () -> new KnightsTourBacktracking(5, 0));
        assertThrows(IllegalArgumentException.class, () -> new KnightsTourBacktracking(-1, -1));
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
        KnightsTourBacktracking largeBoard = new KnightsTourBacktracking(8, 8);
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
            "5, 5, 0, 1, false"    // 1x1 board (trivial solution)
    })
    void testSolveKnightsTour(int rows, int cols, int startRow, int startCol, boolean expectedResult)
            throws TimeoutException {
        knightsTour = new KnightsTourBacktracking(rows, cols);
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
    void testParallelSolutionFinding() throws TimeoutException {
        // Create a board size that's solvable but complex enough to test parallelism
        KnightsTourBacktracking mediumBoard = new KnightsTourBacktracking(6, 6);

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
    void testPrintSolution() throws TimeoutException {
        // This is mostly a coverage test to ensure the method doesn't throw exceptions
        KnightsTourBacktracking smallBoard = new KnightsTourBacktracking(5, 5);
        smallBoard.solveKnightsTour(0, 0);

        assertDoesNotThrow(() -> smallBoard.printSolution());
    }

    @Test
    void testGetBranchesCovered() throws TimeoutException {
        // Solve a small board
        KnightsTourBacktracking smallBoard = new KnightsTourBacktracking(5, 5);
        smallBoard.solveKnightsTour(0, 0);

        // Check that we've covered some branches
        assertTrue(smallBoard.getBranchesCovered() > 0);
    }

    @Test
    void testIsValidMove() throws Exception {
        // We need to use reflection to test this protected method
        Method isValidMoveMethod = AbstractKnightsTour.class.getDeclaredMethod("isValidMove", int.class, int.class);
        isValidMoveMethod.setAccessible(true);

        knightsTour = new KnightsTourBacktracking(5, 5);

        // Test valid move
        assertTrue((Boolean) isValidMoveMethod.invoke(knightsTour, 0, 0));

        Field board = AbstractKnightsTour.class.getDeclaredField("board");
        board.setAccessible(true);
        // Mark a cell as visited and test again
        knightsTour.board[0][0] = 0; // Mark as visited

        // Now the move should be invalid
        assertFalse((Boolean) isValidMoveMethod.invoke(knightsTour, 0, 0));

        // Reset for next tests
        knightsTour = new KnightsTourBacktracking(5, 5);
    }

    @Test
    void testCloneBoard() throws Exception {
        // Use reflection to access protected method
        Method cloneBoardMethod = AbstractKnightsTour.class.getDeclaredMethod("cloneBoard", int[][].class);
        cloneBoardMethod.setAccessible(true);

        // Get the original board
        int[][] originalBoard = knightsTour.getBoard();

        // Clone the board
        int[][] clonedBoard = (int[][]) cloneBoardMethod.invoke(knightsTour, (Object) originalBoard);

        // Verify the clone is a deep copy
        assertNotSame(originalBoard, clonedBoard);

        // Modify the original board
        originalBoard[0][0] = 42;

        // Verify the cloned board is unchanged
        assertNotEquals(42, clonedBoard[0][0]);
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