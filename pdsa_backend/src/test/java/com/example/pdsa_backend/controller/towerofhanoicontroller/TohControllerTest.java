package com.example.pdsa_backend.controller.towerofhanoicontroller;

import com.example.pdsa_backend.controller.tohcontroller.TohController;
import com.example.pdsa_backend.dto.towerofhanoidto.*;
import com.example.pdsa_backend.service.tohservice.TowerOfHanoiService;
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
    void testEndpoint_Success() {
        // Act
        ResponseEntity<String> response = tohController.test();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Test endpoint works", response.getBody());
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
    void submitSolution_InvalidInput_Failure() {
        // Arrange
        TowerOfHanoiRequest request = new TowerOfHanoiRequest();
        request.setUsername("");
        request.setDiskCount(5);
        request.setPegCount(3);
        request.setNumOfMoves(31);
        request.setSequenceOfMoves("A→C,A→B");

        TowerOfHanoiResponse serviceResponse = new TowerOfHanoiResponse();
        serviceResponse.setValid(false);
        serviceResponse.setMessage("Username is required.");

        when(towerOfHanoiService.submitSolution(any(TowerOfHanoiRequest.class))).thenReturn(serviceResponse);

        // Act
        ResponseEntity<TowerOfHanoiResponse> response = tohController.submitSolution(request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isValid());
        assertEquals("Username is required.", response.getBody().getMessage());
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
        assertNotNull(response.getBody());
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
        serviceResponse.setSequenceOfMoves("A->C,A->B,C->B,A->C,B->A,B->C,A->C");

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
    void getAutoSolveSequence_InvalidInput_Failure() {
        // Arrange
        AutoSolveRequest request = new AutoSolveRequest();
        request.setDiskCount(3);
        request.setPegCount(3);

        AutoSolveResponse serviceResponse = new AutoSolveResponse();
        serviceResponse.setValid(false);
        serviceResponse.setMessage("Disk count must be between 5 and 10.");

        when(towerOfHanoiService.getAutoSolveSequence(any(AutoSolveRequest.class))).thenReturn(serviceResponse);

        // Act
        ResponseEntity<AutoSolveResponse> response = tohController.getAutoSolveSequence(request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isValid());
        assertEquals("Disk count must be between 5 and 10.", response.getBody().getMessage());
        verify(towerOfHanoiService, times(1)).getAutoSolveSequence(request);
    }

    @Test
    void getAlgorithmResults_Success() {
        // Arrange
        AutoSolveRequest request = new AutoSolveRequest();
        request.setDiskCount(5);
        request.setPegCount(3);

        AlgorithmResultsResponse serviceResponse = new AlgorithmResultsResponse();
        serviceResponse.setValid(true);
        serviceResponse.setMessage("Algorithm results retrieved successfully!");

        when(towerOfHanoiService.getAlgorithmResults(any(AutoSolveRequest.class))).thenReturn(serviceResponse);

        // Act
        ResponseEntity<AlgorithmResultsResponse> response = tohController.getAlgorithmResults(request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isValid());
        assertEquals("Algorithm results retrieved successfully!", response.getBody().getMessage());
        verify(towerOfHanoiService, times(1)).getAlgorithmResults(request);
    }

    @Test
    void getAlgorithmResults_InvalidInput_Failure() {
        // Arrange
        AutoSolveRequest request = new AutoSolveRequest();
        request.setDiskCount(3);
        request.setPegCount(3);

        AlgorithmResultsResponse serviceResponse = new AlgorithmResultsResponse();
        serviceResponse.setValid(false);
        serviceResponse.setMessage("Disk count must be between 5 and 10.");

        when(towerOfHanoiService.getAlgorithmResults(any(AutoSolveRequest.class))).thenReturn(serviceResponse);

        // Act
        ResponseEntity<AlgorithmResultsResponse> response = tohController.getAlgorithmResults(request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isValid());
        assertEquals("Disk count must be between 5 and 10.", response.getBody().getMessage());
        verify(towerOfHanoiService, times(1)).getAlgorithmResults(request);
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