package com.example.pdsa_backend.service;

import com.example.pdsa_backend.data.*;
import com.example.pdsa_backend.data.towerofhanoidata.TowerOfHanoiResult;
import com.example.pdsa_backend.data.towerofhanoidata.TowerOfHanoiResultRepository;
import com.example.pdsa_backend.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class TowerOfHanoiServiceTest {

    @InjectMocks
    private TowerOfHanoiService towerOfHanoiService;

    @Mock
    private PlayerRepository playerRepository;

    @Mock
    private GameRepository gameRepository;

    @Mock
    private AlgorithmRepository algorithmRepository;

    @Mock
    private GameResultRepository gameResultRepository;

    @Mock
    private PerformanceMetricRepository performanceMetricRepository;

    @Mock
    private TowerOfHanoiResultRepository towerOfHanoiResultRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void submitSolution_ValidInput_Success() {
        // Arrange
        TowerOfHanoiRequest request = new TowerOfHanoiRequest();
        request.setUsername("testUser");
        request.setDiskCount(5);
        request.setPegCount(3);
        request.setNumOfMoves(31);
        request.setSequenceOfMoves("A→C,A→B,C→B,A→C,B→A,B→C,A→C,A→B,C→B,C→A,B→A,C→B,A→C,A→B,C→B,A→C,B→A,B→C,A→C,B→A,C→B,C→A,B→A,B→C,A→C,A→B,C→B,A→C,B→A,B→C,A→C");

        Player player = new Player();
        player.setPlayerId(1);
        player.setUsername("testUser");

        Game game = new Game();
        game.setGameId(2);
        game.setGameName("Tower of Hanoi");

        GameResult gameResult = new GameResult();
        gameResult.setResultId(1);

        Algorithm recursiveAlgorithm = new Algorithm();
        recursiveAlgorithm.setAlgorithmId(1);
        recursiveAlgorithm.setGameId(2);
        recursiveAlgorithm.setAlgorithmName("3-Peg Recursive");

        Algorithm iterativeAlgorithm = new Algorithm();
        iterativeAlgorithm.setAlgorithmId(2);
        iterativeAlgorithm.setGameId(2);
        iterativeAlgorithm.setAlgorithmName("3-Peg Iterative");

        when(playerRepository.findAll()).thenReturn(Collections.singletonList(player));
        when(gameRepository.findAll()).thenReturn(Collections.singletonList(game));
        when(gameResultRepository.save(any(GameResult.class))).thenReturn(gameResult);
        when(algorithmRepository.findAll()).thenReturn(Arrays.asList(recursiveAlgorithm, iterativeAlgorithm));
        when(towerOfHanoiResultRepository.save(any(TowerOfHanoiResult.class))).thenReturn(new TowerOfHanoiResult());
        when(performanceMetricRepository.save(any(PerformanceMetric.class))).thenReturn(new PerformanceMetric());

        // Act
        TowerOfHanoiResponse response = towerOfHanoiService.submitSolution(request);

        // Assert
        assertTrue(response.isValid());
        assertEquals("Solution submitted successfully!", response.getMessage());
        verify(towerOfHanoiResultRepository, times(1)).save(any(TowerOfHanoiResult.class));
        verify(performanceMetricRepository, times(2)).save(any(PerformanceMetric.class));
    }

    @Test
    void submitSolution_InvalidUsername_Failure() {
        // Arrange
        TowerOfHanoiRequest request = new TowerOfHanoiRequest();
        request.setUsername("");
        request.setDiskCount(5);
        request.setPegCount(3);
        request.setNumOfMoves(31);
        request.setSequenceOfMoves("A→C,A→B,C→B,A→C,B→A,B→C,A→C");

        // Act
        TowerOfHanoiResponse response = towerOfHanoiService.submitSolution(request);

        // Assert
        assertFalse(response.isValid());
        assertEquals("Username is required.", response.getMessage());
        verify(towerOfHanoiResultRepository, never()).save(any(TowerOfHanoiResult.class));
    }

    @Test
    void submitSolution_InvalidDiskCount_Failure() {
        // Arrange
        TowerOfHanoiRequest request = new TowerOfHanoiRequest();
        request.setUsername("testUser");
        request.setDiskCount(3);
        request.setPegCount(3);
        request.setNumOfMoves(7);
        request.setSequenceOfMoves("A→C,A→B,C→B,A→C,B→A,B→C,A→C");

        // Act
        TowerOfHanoiResponse response = towerOfHanoiService.submitSolution(request);

        // Assert
        assertFalse(response.isValid());
        assertEquals("Disk count must be between 5 and 10.", response.getMessage());
    }

    @Test
    void submitSolution_InvalidPegCount_Failure() {
        // Arrange
        TowerOfHanoiRequest request = new TowerOfHanoiRequest();
        request.setUsername("testUser");
        request.setDiskCount(5);
        request.setPegCount(5);
        request.setNumOfMoves(7);
        request.setSequenceOfMoves("A→C,A→B,C→B,A→C,B→A,B→C,A→C");

        // Act
        TowerOfHanoiResponse response = towerOfHanoiService.submitSolution(request);

        // Assert
        assertFalse(response.isValid());
        assertEquals("Peg count must be 3 or 4.", response.getMessage());
    }

    @Test
    void submitSolution_InvalidMoveCount_Failure() {
        // Arrange
        TowerOfHanoiRequest request = new TowerOfHanoiRequest();
        request.setUsername("testUser");
        request.setDiskCount(5);
        request.setPegCount(3);
        request.setNumOfMoves(10);
        request.setSequenceOfMoves("A→C,A→B,C→B,A→C,B→A,B→C,A→C");

        // Act
        TowerOfHanoiResponse response = towerOfHanoiService.submitSolution(request);

        // Assert
        assertFalse(response.isValid());
        assertEquals("Number of moves (10) does not match sequence length (7).", response.getMessage());
    }

    @Test
    void submitSolution_InvalidMoveFormat_Failure() {
        // Arrange
        TowerOfHanoiRequest request = new TowerOfHanoiRequest();
        request.setUsername("testUser");
        request.setDiskCount(5);
        request.setPegCount(3);
        request.setNumOfMoves(7);
        request.setSequenceOfMoves("A→C,A→B,C→B,A→C,B→A,B→C,A→X");

        // Act
        TowerOfHanoiResponse response = towerOfHanoiService.submitSolution(request);

        // Assert
        assertFalse(response.isValid());
        assertTrue(response.getMessage().contains("Invalid move format"));
    }

    @Test
    void submitSolution_InvalidMoveSequence_Failure() {
        // Arrange
        TowerOfHanoiRequest request = new TowerOfHanoiRequest();
        request.setUsername("testUser");
        request.setDiskCount(5);
        request.setPegCount(3);
        request.setNumOfMoves(2);
        request.setSequenceOfMoves("A→B,B→A");

        // Act
        TowerOfHanoiResponse response = towerOfHanoiService.submitSolution(request);

        // Assert
        assertFalse(response.isValid());
        assertTrue(response.getMessage().contains("Invalid move sequence"));
    }

    @Test
    void submitSolution_NewPlayer_Success() {
        // Arrange
        TowerOfHanoiRequest request = new TowerOfHanoiRequest();
        request.setUsername("newPlayer");
        request.setDiskCount(5);
        request.setPegCount(3);
        request.setNumOfMoves(31);
        request.setSequenceOfMoves("A→C,A→B,C→B,A→C,B→A,B→C,A→C,A→B,C→B,C→A,B→A,C→B,A→C,A→B,C→B,A→C,B→A,B→C,A→C,B→A,C→B,C→A,B→A,B→C,A→C,A→B,C→B,A→C,B→A,B→C,A→C");

        Player newPlayer = new Player();
        newPlayer.setPlayerId(1);

        Game game = new Game();
        game.setGameId(2);
        game.setGameName("Tower of Hanoi");

        GameResult gameResult = new GameResult();
        gameResult.setResultId(1);

        Algorithm recursiveAlgorithm = new Algorithm();
        recursiveAlgorithm.setAlgorithmId(1);
        recursiveAlgorithm.setGameId(2);
        recursiveAlgorithm.setAlgorithmName("3-Peg Recursive");

        Algorithm iterativeAlgorithm = new Algorithm();
        iterativeAlgorithm.setAlgorithmId(2);
        iterativeAlgorithm.setGameId(2);
        iterativeAlgorithm.setAlgorithmName("3-Peg Iterative");

        when(playerRepository.findAll()).thenReturn(Collections.emptyList());
        when(playerRepository.save(any(Player.class))).thenReturn(newPlayer);
        when(gameRepository.findAll()).thenReturn(Collections.singletonList(game));
        when(gameResultRepository.save(any(GameResult.class))).thenReturn(gameResult);
        when(algorithmRepository.findAll()).thenReturn(Arrays.asList(recursiveAlgorithm, iterativeAlgorithm));
        when(towerOfHanoiResultRepository.save(any(TowerOfHanoiResult.class))).thenReturn(new TowerOfHanoiResult());
        when(performanceMetricRepository.save(any(PerformanceMetric.class))).thenReturn(new PerformanceMetric());

        // Act
        TowerOfHanoiResponse response = towerOfHanoiService.submitSolution(request);

        // Assert
        assertTrue(response.isValid());
        verify(playerRepository, times(1)).save(any(Player.class));
    }

    @Test
    void getAutoSolveSequence_Valid3Peg_Success() {
        // Arrange
        AutoSolveRequest request = new AutoSolveRequest();
        request.setDiskCount(5);
        request.setPegCount(3);

        // Act
        AutoSolveResponse response = towerOfHanoiService.getAutoSolveSequence(request);

        // Assert
        assertTrue(response.isValid());
        assertEquals(31, response.getNumOfMoves());
        assertTrue(response.getSequenceOfMoves().contains("A->"));
    }

    @Test
    void getAutoSolveSequence_Valid4Peg_Success() {
        // Arrange
        AutoSolveRequest request = new AutoSolveRequest();
        request.setDiskCount(5);
        request.setPegCount(4);

        // Act
        AutoSolveResponse response = towerOfHanoiService.getAutoSolveSequence(request);

        // Assert
        assertTrue(response.isValid());
        assertTrue(response.getNumOfMoves() > 0);
        assertTrue(response.getSequenceOfMoves().contains("A->"));
    }

    @Test
    void getAutoSolveSequence_InvalidDiskCount_Failure() {
        // Arrange
        AutoSolveRequest request = new AutoSolveRequest();
        request.setDiskCount(3);
        request.setPegCount(3);

        // Act
        AutoSolveResponse response = towerOfHanoiService.getAutoSolveSequence(request);

        // Assert
        assertFalse(response.isValid());
        assertEquals("Disk count must be between 5 and 10.", response.getMessage());
    }

    @Test
    void getAutoSolveSequence_InvalidPegCount_Failure() {
        // Arrange
        AutoSolveRequest request = new AutoSolveRequest();
        request.setDiskCount(5);
        request.setPegCount(5);

        // Act
        AutoSolveResponse response = towerOfHanoiService.getAutoSolveSequence(request);

        // Assert
        assertFalse(response.isValid());
        assertEquals("Peg count must be 3 or 4.", response.getMessage());
    }

    @Test
    void getPerformanceMetrics_Success() {
        // Arrange
        int rounds = 5;
        PerformanceMetric metric1 = new PerformanceMetric();
        metric1.setMetricId(1);
        metric1.setAlgorithmId(1);
        metric1.setExecutionTimeMs(100);
        metric1.setCreatedAt(LocalDateTime.now().minusSeconds(1));
        PerformanceMetric metric2 = new PerformanceMetric();
        metric2.setMetricId(2);
        metric2.setAlgorithmId(1);
        metric2.setExecutionTimeMs(150);
        metric2.setCreatedAt(LocalDateTime.now());

        Algorithm algorithm = new Algorithm();
        algorithm.setAlgorithmId(1);
        algorithm.setAlgorithmName("3-Peg Recursive");

        when(algorithmRepository.findById(1)).thenReturn(java.util.Optional.of(algorithm));
        when(performanceMetricRepository.findAll()).thenReturn(Arrays.asList(metric1, metric2));

        // Act
        PerformanceMetricsResponse response = towerOfHanoiService.getPerformanceMetrics(rounds);

        // Assert
        assertNotNull(response);
        assertNotNull(response.getExecutionTimes().get("3-Peg Recursive"));
        assertEquals(150, response.getExecutionTimes().get("3-Peg Recursive")[0]); // Latest first
        assertEquals("O(2^n)", response.getComplexityAnalysis().get("3-Peg Recursive"));
    }

    @Test
    void populateTestMetrics_Success() {
        // Arrange
        Player player = new Player();
        player.setPlayerId(1);
        player.setUsername("user1");

        Game game = new Game();
        game.setGameId(2);
        game.setGameName("Tower of Hanoi");

        GameResult gameResult = new GameResult();
        gameResult.setResultId(1);

        Algorithm recursiveAlgorithm = new Algorithm();
        recursiveAlgorithm.setAlgorithmId(1);
        recursiveAlgorithm.setGameId(2);
        recursiveAlgorithm.setAlgorithmName("3-Peg Recursive");

        Algorithm iterativeAlgorithm = new Algorithm();
        iterativeAlgorithm.setAlgorithmId(2);
        iterativeAlgorithm.setGameId(2);
        iterativeAlgorithm.setAlgorithmName("3-Peg Iterative");

        Algorithm frameStewartAlgorithm = new Algorithm();
        frameStewartAlgorithm.setAlgorithmId(3);
        frameStewartAlgorithm.setGameId(2);
        frameStewartAlgorithm.setAlgorithmName("4-Peg Frame-Stewart");

        when(playerRepository.findAll()).thenReturn(Collections.emptyList());
        when(playerRepository.save(any(Player.class))).thenReturn(player);
        when(gameRepository.findAll()).thenReturn(Collections.singletonList(game));
        when(gameResultRepository.save(any(GameResult.class))).thenReturn(gameResult);
        when(algorithmRepository.findAll()).thenReturn(Arrays.asList(recursiveAlgorithm, iterativeAlgorithm, frameStewartAlgorithm));
        when(towerOfHanoiResultRepository.save(any(TowerOfHanoiResult.class))).thenReturn(new TowerOfHanoiResult());
        when(performanceMetricRepository.save(any(PerformanceMetric.class))).thenReturn(new PerformanceMetric());

        // Act
        towerOfHanoiService.populateTestMetrics();

        // Assert
        verify(towerOfHanoiResultRepository, atLeast(1)).save(any(TowerOfHanoiResult.class));
        verify(performanceMetricRepository, atLeast(1)).save(any(PerformanceMetric.class));
    }
}