package com.example.pdsa_backend.algorithms.knights_tour;

import com.example.pdsa_backend.exception.knights_tour.TimeoutException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class KnightsTourWarnsdorffsTest {

    private KnightsTourWarnsdorffs knightsTour;
    private final ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

    @BeforeEach
    void setUp() {
        System.setOut(new PrintStream(outputStream));
    }

    @Test
    @DisplayName("Constructor initializes board correctly")
    void testConstructorInitialization() {
        // Given
        knightsTour = new KnightsTourWarnsdorffs(5, 5);

        // When
        int[][] board = knightsTour.getBoard();

        // Then
        assertEquals(5, board.length);
        assertEquals(5, board[0].length);

        // Check that all cells are initialized to -1
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                assertEquals(-1, board[i][j]);
            }
        }
    }

    @Test
    @DisplayName("Constructor rejects invalid dimensions")
    void testConstructorRejectsInvalidDimensions() {
        // Then
        assertThrows(IllegalArgumentException.class, () -> new KnightsTourWarnsdorffs(0, 5));
        assertThrows(IllegalArgumentException.class, () -> new KnightsTourWarnsdorffs(5, 0));
        assertThrows(IllegalArgumentException.class, () -> new KnightsTourWarnsdorffs(-1, 5));
        assertThrows(IllegalArgumentException.class, () -> new KnightsTourWarnsdorffs(5, -1));
    }

    @Test
    @DisplayName("Invalid starting position throws exception")
    void testInvalidStartingPosition() {
        // Given
        knightsTour = new KnightsTourWarnsdorffs(5, 5);

        // When & Then
        Exception exception1 = assertThrows(IllegalArgumentException.class,
                () -> knightsTour.solveKnightsTour(-1, 0));
        assertTrue(exception1.getMessage().contains("Invalid position"));

        Exception exception2 = assertThrows(IllegalArgumentException.class,
                () -> knightsTour.solveKnightsTour(0, -1));
        assertTrue(exception2.getMessage().contains("Invalid position"));

        Exception exception3 = assertThrows(IllegalArgumentException.class,
                () -> knightsTour.solveKnightsTour(5, 0));
        assertTrue(exception3.getMessage().contains("Invalid position"));

        Exception exception4 = assertThrows(IllegalArgumentException.class,
                () -> knightsTour.solveKnightsTour(0, 5));
        assertTrue(exception4.getMessage().contains("Invalid position"));
    }

    @Test
    @DisplayName("Successful tour on standard 5x5 board")
    void testSuccessfulTourOn5x5() throws TimeoutException {
        // Given
        knightsTour = new KnightsTourWarnsdorffs(5, 5);

        // When
        boolean result = knightsTour.solveKnightsTour(0, 0); // 0,0 has the highest tours on 5x5 board

        // Then
        assertTrue(result);

        // Verify that each cell has been visited exactly once
        int[][] board = knightsTour.getBoard();
        boolean[] visited = new boolean[25];

        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                int moveNumber = board[i][j];
                assertTrue(moveNumber >= 0 && moveNumber < 25); // verify if they are within the bounds
                assertFalse(visited[moveNumber]); // verify each number is unique
                visited[moveNumber] = true;
            }
        }

        // Verify that all moves form valid knight moves
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                if (board[i][j] < 24) { // Not the last move
                    boolean foundNextMove = false;
                    for (int x = 0; x < 5; x++) {
                        for (int y = 0; y < 5; y++) {
                            if (board[x][y] == board[i][j] + 1) {
                                // Check if it's a valid knight move
                                int rowDiff = Math.abs(i - x);
                                int colDiff = Math.abs(j - y);
                                assertTrue((rowDiff == 1 && colDiff == 2) || (rowDiff == 2 && colDiff == 1));
                                foundNextMove = true;
                            }
                        }
                    }
                    assertTrue(foundNextMove);
                }
            }
        }
    }

    @ParameterizedTest
    @CsvSource({
            "3, 3, 0, 0, false",  // 3x3 is too small for a complete tour
            "4, 4, 0, 0, false",  // 4x4 is not possible
            "5, 5, 0, 0, true",   // 5x5 is possible
            "6, 6, 0, 0, true",   // 6x6 is possible
            "8, 8, 0, 0, true"    // 8x8 is the standard chess board
    })
    @DisplayName("Test different board sizes")
    void testDifferentBoardSizes(int rows, int cols, int startRow, int startCol, boolean expected) {
        // Given
        knightsTour = new KnightsTourWarnsdorffs(rows, cols);

        try {
            // When
            boolean result = knightsTour.solveKnightsTour(startRow, startCol);

            // Then
            assertEquals(expected, result);
        } catch (TimeoutException e) {
            // Consider timeout as a failure to solve
            assertFalse(expected, "Expected to solve but got timeout exception");
        }
    }

    @Test
    @DisplayName("Test branches covered counter")
    void testBranchesCovered() {
        // Given
        knightsTour = new KnightsTourWarnsdorffs(5, 5);

        try {
            // When
            knightsTour.solveKnightsTour(4, 4);

            // Then
            assertTrue(knightsTour.getBranchesCovered() > 0);
        } catch (TimeoutException e) {
            fail("Shouldn't timeout on a 5x5 board");
        }
    }

    @Test
    @DisplayName("Test timeout mechanism")
    void testTimeout() {
        // Given
        knightsTour = new KnightsTourWarnsdorffs(200, 200);

        // Set a very short timeout
        knightsTour.setTimeout(1); // 1ms timeout

        // Then
        assertThrows(TimeoutException.class,
                () -> knightsTour.solveKnightsTour(0, 0));
    }

    @Test
    @DisplayName("Test timeout setter with invalid value")
    void testTimeoutSetterWithInvalidValue() {
        // Given
        knightsTour = new KnightsTourWarnsdorffs(5, 5);

        // Then
        assertThrows(IllegalArgumentException.class, () -> knightsTour.setTimeout(-1));
    }

    @ParameterizedTest
    @DisplayName("Test for unsolvable scenario")
    @CsvSource({
            "3, 3, 0, 0",
            "3, 3, 2, 2",
            "5, 5, 0, 1",
            "5, 5, 1, 4"
    })
    void testUnsolvableScenario(int rows, int cols, int startX, int startY) {
        // Create a minimal board where we know a tour is impossible
        knightsTour = new KnightsTourWarnsdorffs(rows, cols);

        try {
            boolean result = knightsTour.solveKnightsTour(startX, startY);
            assertFalse(result);
        } catch (TimeoutException e) {
            // Consider timeout as a failure to solve as well considering a small board size
            fail("Got a timeout exception instead of false result");
        }
    }

    @Test
    @DisplayName("Test printSolution output format")
    void testPrintSolution() {
        // Given
        int rows = 5, cols = 5;
        knightsTour = new KnightsTourWarnsdorffs(rows, cols);

        // When
        knightsTour.printSolution();

        // Then
        String output = outputStream.toString();
        assertTrue(output.contains("Knight's Tour Solution"));
    }

    @ParameterizedTest
    @CsvSource({
            "5, 5, 0, 0, true",
            "5, 5, 2, 2, true",
            "5, 5, 4, 4, true"
    })
    @DisplayName("Test solving from different starting positions")
    void testDifferentStartingPositions(int rows, int cols, int startRow, int startCol, boolean expected) {
        // Given
        knightsTour = new KnightsTourWarnsdorffs(rows, cols);

        try {
            // When
            boolean result = knightsTour.solveKnightsTour(startRow, startCol);

            // Then
            assertEquals(expected, result);

            // Additional verification for successful tours
            if (expected) {
                int[][] board = knightsTour.getBoard();
                assertEquals(0, board[startRow][startCol], "Starting position should be marked with 0");

                // Verify all cells are filled (no -1 values)
                for (int i = 0; i < rows; i++) {
                    for (int j = 0; j < cols; j++) {
                        assertTrue(board[i][j] >= 0, "All cells should be visited");
                    }
                }
            }
        } catch (TimeoutException e) {
            fail("Shouldn't timeout on a 5x5 board");
        }
    }

    @ParameterizedTest
    @CsvSource({
            "0, 0, true",   // Valid corner position
            "4, 4, true",   // Valid corner position
            "2, 2, true",   // Valid center position
            "-1, 0, false", // Invalid row (below bounds)
            "0, -1, false", // Invalid column (below bounds)
            "5, 0, false",  // Invalid row (above bounds)
            "0, 5, false",  // Invalid column (above bounds)
    })
    @DisplayName("Test isValidMove with various positions")
    void testIsValidMove(int row, int col, boolean expected) throws Exception {
        // Use reflection to access the private method
        knightsTour = new KnightsTourWarnsdorffs(5, 5);
        Method isValidMoveMethod = AbstractKnightsTour.class.getDeclaredMethod("isValidMove", int.class, int.class);
        isValidMoveMethod.setAccessible(true);

        // When
        boolean result = (boolean) isValidMoveMethod.invoke(knightsTour, row, col);

        assertEquals(expected, result);
    }

    @Test
    @DisplayName("Test validatePosition method")
    void testValidatePosition() throws Exception {
        // Use reflection to access the private method
        knightsTour = new KnightsTourWarnsdorffs(5, 5);
        Method validatePositionMethod = AbstractKnightsTour.class.getDeclaredMethod("validatePosition", int.class, int.class);
        validatePositionMethod.setAccessible(true);

        // Valid positions should not throw exception
        assertDoesNotThrow(() -> validatePositionMethod.invoke(knightsTour, 0, 0));
        assertDoesNotThrow(() -> validatePositionMethod.invoke(knightsTour, 4, 4));

        // Invalid positions should throw IllegalArgumentException
        assertThrows(Exception.class, () -> validatePositionMethod.invoke(knightsTour, -1, 0));
        assertThrows(Exception.class, () -> validatePositionMethod.invoke(knightsTour, 0, -1));
        assertThrows(Exception.class, () -> validatePositionMethod.invoke(knightsTour, 5, 0));
        assertThrows(Exception.class, () -> validatePositionMethod.invoke(knightsTour, 0, 5));
    }

    @RepeatedTest(5)
    @DisplayName("Test findNextMove randomization")
    void testFindNextMoveRandomization() throws Exception {
        // Use reflection to access the private method
        Method findNextMoveMethod = KnightsTourWarnsdorffs.class.getDeclaredMethod("findNextMove", int.class, int.class);
        findNextMoveMethod.setAccessible(true);

        // Run multiple times and collect results
        Set<String> uniqueMoves = new HashSet<>();
        final int ATTEMPTS = 20;

        // From center (2,2), there are 8 possible knight moves
        for (int i = 0; i < ATTEMPTS; i++) {
            knightsTour = new KnightsTourWarnsdorffs(5, 5); // Fresh board
            int[] move = (int[]) findNextMoveMethod.invoke(knightsTour, 2, 2);
            uniqueMoves.add(move[0] + "," + move[1]);
        }

        // Should get different results due to randomization
        // With enough attempts, we should see at least 2 different move choices
        assertTrue(uniqueMoves.size() >= 2,
                "Expected randomization to produce multiple different moves, but got: " + uniqueMoves);
    }

    @Test
    @DisplayName("Test findNextMove returns null for dead ends")
    void testFindNextMoveReturnsNullForDeadEnds() throws Exception {
        // Use reflection to access private methods and fields
        Method findNextMoveMethod = KnightsTourWarnsdorffs.class.getDeclaredMethod("findNextMove", int.class, int.class);
        findNextMoveMethod.setAccessible(true);

        Field boardField = AbstractKnightsTour.class.getDeclaredField("board");
        boardField.setAccessible(true);

        knightsTour = new KnightsTourWarnsdorffs(5, 5);
        int[][] board = (int[][]) boardField.get(knightsTour);

        // Mark all possible knight moves from position (2,2) as visited
        board[0][1] = 21;
        board[0][3] = 11;
        board[1][0] = 15;
        board[1][4] = 17;
        board[3][0] = 9;
        board[3][4] = 23;
        board[4][1] = 19;
        board[4][3] = 13;

        // When
        int[] move = (int[]) findNextMoveMethod.invoke(knightsTour, 2, 2);

        // Then
        assertNull(move, "Expected null when no valid moves are available");
    }

    @Test
    @DisplayName("Test defensive copy of board")
    void testDefensiveCopy() throws Exception {
        // Given
        knightsTour = new KnightsTourWarnsdorffs(5, 5);

        // Access the internal field using reflection
        Field boardField = AbstractKnightsTour.class.getDeclaredField("board");
        boardField.setAccessible(true);

        // When
        int[][] returnedBoard = knightsTour.getBoard();
        // Modify the returned board
        returnedBoard[0][1] = 100;

        // Then
        // Get the actual internal board via reflection
        int[][] internalBoard = (int[][]) boardField.get(knightsTour);

        // Verify that the modification didn't affect the internal state
        assertNotEquals(100, internalBoard[0][1], "Internal board should not be affected by modifications to returned board");

        // Also verify that we got a different array instance
        assertNotSame(returnedBoard, internalBoard, "getBoard() should return a copy, not the internal array");
    }
}