package com.example.pdsa_backend.controller;

import com.example.pdsa_backend.dto.*;
import com.example.pdsa_backend.service.TowerOfHanoiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TohControllerTest {

    @InjectMocks
    private TohController tohController;

    @Mock
    private TowerOfHanoiService towerOfHanoiService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void submitSolution_Success() {
        // Arrange
        TowerOfHanoiRequest request = new TowerOfHanoiRequest();
        request.setUsername("testUser");
        request.setDiskCount(5);
        request.setPegCount(3);
        request.setNumOfMoves(31);
        request.setSequenceOfMoves("A→C,A→B,C→B,A→C,B→A,B→C,A→C,A→B,C→B,C→A,B→A,C→B,A→C,A→B,C→B,A→C,B→A,B→C,A→C,B→A,C→B,C→A,B→A,B→C,A→C,A→B,C→B,A→C,B→A,B→C,A→C");

        TowerOfHanoiResponse serviceResponse = new TowerOfHanoiResponse();
        serviceResponse.setValid(true);
        serviceResponse.setMessage("Solution submitted successfully!");

        when(towerOfHanoiService.submitSolution(any(TowerOfHanoiRequest.class))).thenReturn(serviceResponse);

        // Act
        ResponseEntity<TowerOfHanoiResponse> response = tohController.submitSolution(request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isValid());
        assertEquals("Solution submitted successfully!", response.getBody().getMessage());
        verify(towerOfHanoiService, times(1)).submitSolution(request);
    }

    @Test
    void getPerformanceMetrics_Success() {
        // Arrange
        int rounds = 10;
        PerformanceMetricsResponse serviceResponse = new PerformanceMetricsResponse();

        when(towerOfHanoiService.getPerformanceMetrics(rounds)).thenReturn(serviceResponse);

        // Act
        ResponseEntity<PerformanceMetricsResponse> response = tohController.getPerformanceMetrics(rounds);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(towerOfHanoiService, times(1)).getPerformanceMetrics(rounds);
    }

    @Test
    void getPerformanceMetrics_InvalidRounds_BadRequest() {
        // Arrange
        int rounds = -1;

        // Act
        ResponseEntity<PerformanceMetricsResponse> response = tohController.getPerformanceMetrics(rounds);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(towerOfHanoiService, never()).getPerformanceMetrics(anyInt());
    }

    @Test
    void getAutoSolveSequence_Success() {
        // Arrange
        AutoSolveRequest request = new AutoSolveRequest();
        request.setDiskCount(5);
        request.setPegCount(3);

        AutoSolveResponse serviceResponse = new AutoSolveResponse();
        serviceResponse.setValid(true);
        serviceResponse.setNumOfMoves(31);
        serviceResponse.setSequenceOfMoves("A->C,A->B,C->B,A->C,B->A,B->C,A->C,...");

        when(towerOfHanoiService.getAutoSolveSequence(any(AutoSolveRequest.class))).thenReturn(serviceResponse);

        // Act
        ResponseEntity<AutoSolveResponse> response = tohController.getAutoSolveSequence(request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isValid());
        assertEquals(31, response.getBody().getNumOfMoves());
        verify(towerOfHanoiService, times(1)).getAutoSolveSequence(request);
    }

    @Test
    void populateTestMetrics_Success() {
        // Arrange
        doNothing().when(towerOfHanoiService).populateTestMetrics();

        // Act
        ResponseEntity<String> response = tohController.populateTestMetrics();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Test metrics populated", response.getBody());
        verify(towerOfHanoiService, times(1)).populateTestMetrics();
    }
}