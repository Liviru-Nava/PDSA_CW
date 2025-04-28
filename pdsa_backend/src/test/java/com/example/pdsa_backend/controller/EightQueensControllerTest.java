package com.example.pdsa_backend.controller;

import com.example.pdsa_backend.dto.*;
import com.example.pdsa_backend.service.EightQueensService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import org.mockito.InjectMocks;

class EightQueensControllerTest {

    @InjectMocks
    private EightQueensController eightQueensController;

    @Mock
    private EightQueensService eightQueensService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createPlayer_Success() {
        // Arrange
        PlayerRequestDTO request = new PlayerRequestDTO();
        request.setUsername("testUser");

        PlayerResponseDTO serviceResponse = new PlayerResponseDTO();
        serviceResponse.setPlayerId(1);
        serviceResponse.setUsername("testUser");
        serviceResponse.setMessage("Player created successfully.");

        when(eightQueensService.createPlayer(any(PlayerRequestDTO.class))).thenReturn(serviceResponse);

        // Act
        ResponseEntity<PlayerResponseDTO> response = eightQueensController.createPlayer(request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getPlayerId());
        assertEquals("testUser", response.getBody().getUsername());
        assertEquals("Player created successfully.", response.getBody().getMessage());
        verify(eightQueensService, times(1)).createPlayer(request);
    }

    @Test
    void submitSolution_Success() {
        // Arrange
        SolutionRequestDTO request = new SolutionRequestDTO();
        request.setGameId(1);
        request.setPlayerId(1);
        request.setConfiguration(new int[]{0, 4, 7, 5, 2, 6, 1, 3});
        request.setCompletionTimeSeconds(120);
        request.setCreatedAt(LocalDateTime.now());

        when(eightQueensService.submitSolution(any(SolutionRequestDTO.class)))
                .thenReturn("Solution accepted! Keep going!");

        // Act
        ResponseEntity<SolutionResponseDTO> response = eightQueensController.submitSolution(request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Solution accepted! Keep going!", response.getBody().getMessage());
        verify(eightQueensService, times(1)).submitSolution(request);
    }

    @Test
    void computeSequential_Success() {
        // Arrange
        int gameId = 1;
        int algorithmId = 1;

        doNothing().when(eightQueensService).computeSolutionsSequential(gameId, algorithmId);

        // Act
        ResponseEntity<String> response = eightQueensController.computeSequential(gameId, algorithmId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Sequential solutions computed successfully.", response.getBody());
        verify(eightQueensService, times(1)).computeSolutionsSequential(gameId, algorithmId);
    }

    @Test
    void computeThreaded_Success() {
        // Arrange
        int gameId = 1;
        int algorithmId = 2;

        doNothing().when(eightQueensService).computeSolutionsThreaded(gameId, algorithmId);

        // Act
        ResponseEntity<String> response = eightQueensController.computeThreaded(gameId, algorithmId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Threaded solutions computed successfully.", response.getBody());
        verify(eightQueensService, times(1)).computeSolutionsThreaded(gameId, algorithmId);
    }

    @Test
    void getRandomSolution_Success() {
        // Arrange
        int gameId = 1;
        RandomSolutionResponseDTO serviceResponse = new RandomSolutionResponseDTO();
        serviceResponse.setConfiguration(new int[]{0, 4, 7, 5, 2, 6, 1, 3});

        when(eightQueensService.getRandomSolution(gameId)).thenReturn(serviceResponse);

        // Act
        ResponseEntity<RandomSolutionResponseDTO> response = eightQueensController.getRandomSolution(gameId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertArrayEquals(new int[]{0, 4, 7, 5, 2, 6, 1, 3}, response.getBody().getConfiguration());
        verify(eightQueensService, times(1)).getRandomSolution(gameId);
    }

    @Test
    void getAverageReportData_Success() {
        // Arrange
        AverageReportResponseDTO serviceResponse = new AverageReportResponseDTO();
        serviceResponse.setSequentialAverageMs(100.0);
        serviceResponse.setThreadedAverageMs(80.0);

        when(eightQueensService.getAverageReportData()).thenReturn(serviceResponse);

        // Act
        ResponseEntity<AverageReportResponseDTO> response = eightQueensController.getAverageReportData();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(100.0, response.getBody().getSequentialAverageMs());
        assertEquals(80.0, response.getBody().getThreadedAverageMs());
        verify(eightQueensService, times(1)).getAverageReportData();
    }
}