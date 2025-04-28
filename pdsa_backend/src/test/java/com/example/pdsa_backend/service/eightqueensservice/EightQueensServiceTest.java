package com.example.pdsa_backend.service.eightqueensservice;

import com.example.pdsa_backend.data.*;
import com.example.pdsa_backend.data.eightqueensdata.*;
import com.example.pdsa_backend.dto.*;
import com.example.pdsa_backend.dto.eightqueens.*;
import com.example.pdsa_backend.service.EightQueensService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class EightQueensServiceTest {

    @InjectMocks
    private EightQueensService eightQueensService;

    @Mock
    private EightQueensSolutionRepository solutionRepository;

    @Mock
    private GameResultRepository gameResultRepository;

    @Mock
    private EightQueensResultRepository eightQueensResultRepository;

    @Mock
    private AlgorithmRunRepository algorithmRunRepository;

    @Mock
    private GameRepository gameRepository;

    @Mock
    private AlgorithmRepository algorithmRepository;

    @Mock
    private PlayerRepository playerRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createPlayer_ValidInput_Success() {
        // Arrange
        PlayerRequestDTO request = new PlayerRequestDTO();
        request.setUsername("testUser");

        Player player = new Player();
        player.setPlayerId(1);
        player.setUsername("testUser");
        player.setRegistrationDate(LocalDateTime.now());

        when(playerRepository.findByUsername("testUser")).thenReturn(Optional.empty());
        when(playerRepository.save(any(Player.class))).thenReturn(player);

        // Act
        PlayerResponseDTO response = eightQueensService.createPlayer(request);

        // Assert
        assertNotNull(response, "Response should not be null");
        assertEquals(1, response.getPlayerId(), "Player ID should be 1");
        assertEquals("testUser", response.getUsername(), "Username should match");
        assertEquals("Player created successfully.", response.getMessage(), "Message should match");
        verify(playerRepository, times(1)).findByUsername("testUser");
        verify(playerRepository, times(1)).save(any(Player.class));
    }

    @Test
    void createPlayer_UsernameExists_Failure() {
        // Arrange
        PlayerRequestDTO request = new PlayerRequestDTO();
        request.setUsername("testUser");

        when(playerRepository.findByUsername("testUser")).thenReturn(Optional.of(new Player()));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> eightQueensService.createPlayer(request));
        verify(playerRepository, times(1)).findByUsername("testUser");
        verify(playerRepository, never()).save(any(Player.class));
    }

    @Test
    void submitSolution_ValidSolution_Success() {
        // Arrange
        SolutionRequestDTO request = new SolutionRequestDTO();
        request.setGameId(1);
        request.setPlayerId(1);
        request.setConfiguration(new int[]{0, 4, 7, 5, 2, 6, 1, 3});
        request.setCompletionTimeSeconds(120);
        request.setCreatedAt(LocalDateTime.now());

        Game game = new Game();
        game.setGameId(1);

        EightQueensSolution solution = new EightQueensSolution();
        solution.setSolutionId(1);
        solution.setConfiguration(Arrays.toString(new int[]{0, 4, 7, 5, 2, 6, 1, 3}));
        solution.setRecognized(false);

        GameResult gameResult = new GameResult();
        gameResult.setResultId(1);

        when(solutionRepository.findByConfigurationAndGameId(eq("[0, 4, 7, 5, 2, 6, 1, 3]"), eq(1)))
                .thenReturn(Optional.of(solution));
        when(gameRepository.findById(1)).thenReturn(Optional.of(game));
        when(gameResultRepository.save(any(GameResult.class))).thenReturn(gameResult);
        when(solutionRepository.countByIsRecognizedTrueAndGameId(1)).thenReturn(91L);
        when(eightQueensResultRepository.save(any(EightQueensResult.class))).thenReturn(new EightQueensResult());

        // Act
        String response = eightQueensService.submitSolution(request);

        // Assert
        assertEquals("Solution accepted! Keep going!", response);
        verify(solutionRepository, times(1)).save(solution);
        verify(gameResultRepository, times(1)).save(any(GameResult.class));
        verify(eightQueensResultRepository, times(1)).save(any(EightQueensResult.class));
    }

    @Test
    void submitSolution_InvalidSolution_Failure() {
        // Arrange
        SolutionRequestDTO request = new SolutionRequestDTO();
        request.setGameId(1);
        request.setPlayerId(1);
        request.setConfiguration(new int[]{0, 1, 2, 3, 4, 5, 6, 7}); // Invalid: queens threaten
        request.setCompletionTimeSeconds(120);
        request.setCreatedAt(LocalDateTime.now());

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> eightQueensService.submitSolution(request));
        verify(solutionRepository, never()).save(any(EightQueensSolution.class));
    }

    @Test
    void submitSolution_RecognizedSolution_Failure() {
        // Arrange
        SolutionRequestDTO request = new SolutionRequestDTO();
        request.setGameId(1);
        request.setPlayerId(1);
        request.setConfiguration(new int[]{0, 4, 7, 5, 2, 6, 1, 3});
        request.setCompletionTimeSeconds(120);
        request.setCreatedAt(LocalDateTime.now());

        EightQueensSolution solution = new EightQueensSolution();
        solution.setConfiguration(Arrays.toString(new int[]{0, 4, 7, 5, 2, 6, 1, 3}));
        solution.setRecognized(true);

        when(solutionRepository.findByConfigurationAndGameId(eq("[0, 4, 7, 5, 2, 6, 1, 3]"), eq(1)))
                .thenReturn(Optional.of(solution));

        // Act
        String response = eightQueensService.submitSolution(request);

        // Assert
        assertEquals("This solution has already been recognized. Please try a different solution.", response);
        verify(solutionRepository, never()).save(any(EightQueensSolution.class));
    }

    @Test
    void getRandomSolution_Success() {
        // Arrange
        int gameId = 1;
        EightQueensSolution solution = new EightQueensSolution();
        solution.setConfiguration("[0, 4, 7, 5, 2, 6, 1, 3]");

        when(solutionRepository.findByGameId(gameId)).thenReturn(Arrays.asList(solution));

        // Act
        RandomSolutionResponseDTO response = eightQueensService.getRandomSolution(gameId);

        // Assert
        assertArrayEquals(new int[]{0, 4, 7, 5, 2, 6, 1, 3}, response.getConfiguration());
        verify(solutionRepository, times(1)).findByGameId(gameId);
    }

    @Test
    void getAverageReportData_Success() {
        // Arrange
        when(algorithmRunRepository.findAverageExecutionTimeByAlgorithmId(1)).thenReturn(100.0);
        when(algorithmRunRepository.findAverageExecutionTimeByAlgorithmId(2)).thenReturn(80.0);

        // Act
        AverageReportResponseDTO response = eightQueensService.getAverageReportData();

        // Assert
        assertEquals(100.0, response.getSequentialAverageMs());
        assertEquals(80.0, response.getThreadedAverageMs());
        verify(algorithmRunRepository, times(1)).findAverageExecutionTimeByAlgorithmId(1);
        verify(algorithmRunRepository, times(1)).findAverageExecutionTimeByAlgorithmId(2);
    }
}