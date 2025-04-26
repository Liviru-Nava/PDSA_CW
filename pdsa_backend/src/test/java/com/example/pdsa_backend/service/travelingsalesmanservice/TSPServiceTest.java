package com.example.pdsa_backend.service.travelingsalesmanservice;
import com.example.pdsa_backend.data.travelingsalesmandata.*;
import com.example.pdsa_backend.dto.travelingsalesmandto.TSPGameResult;
import com.example.pdsa_backend.dto.travelingsalesmandto.TSPRequest;
import com.example.pdsa_backend.dto.travelingsalesmandto.TSPResponse;
import com.example.pdsa_backend.dto.travelingsalesmandto.TSPSolution;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TSPServiceTest {

    @Mock
    private PlayerRepository playerRepository;
    @Mock
    private GameResultRepository gameResultRepository;
    @Mock
    private TravelingSalesmanResultRepository travelingSalesmanResultRepository;
    @Mock
    private PerformanceMetricRepository performanceMetricRepository;
    @InjectMocks
    private TSPService tspService;
    @Captor
    private ArgumentCaptor<GameResult> gameResultCaptor;
    @Captor
    private ArgumentCaptor<TravelingSalesmanResult> travelingSalesmanResultCaptor;
    @Captor
    private ArgumentCaptor<PerformanceMetric> performanceMetricCaptor;

    //method to provide a TSP request containing home city, selected cities, distances and shortest distance
    private TSPRequest createTspRequest(){
        //initialize the object
        TSPRequest request = new TSPRequest();

        //add test data to the request
        //create home city
        TSPRequest.City homeCity = new TSPRequest.City();
        homeCity.setId(0);
        homeCity.setName("A");

        request.setHomeCity(homeCity);

        //get the selected cities list
        List<TSPRequest.City> selectedCities = new ArrayList<>();
        for (char c = 'B'; c <= 'J'; c++) {
            TSPRequest.City city = new TSPRequest.City();
            city.setId(c - 'A');
            city.setName(String.valueOf((c)));
            selectedCities.add(city);
        }
        request.setSelectedCities(selectedCities);

        // Create distance matrix
        Map<Integer, Map<Integer, Integer>> distances = new HashMap<>();
        Random random = new Random();

        for (int i = 0; i < 10; i++) {
            Map<Integer, Integer> cityDistances = new HashMap<>();
            for (int j = 0; j < 10; j++) {
                if (i == j) {
                    cityDistances.put(j, 0); // Distance to self is 0
                } else if (j > i) {
                    // Only calculate for upper triangle
                    int distance = 50 + random.nextInt(51); // Random 50-100
                    cityDistances.put(j, distance);
                } else {
                    // Copy from symmetric position
                    cityDistances.put(j, distances.get(j).get(i));
                }
            }
            distances.put(i, cityDistances);
        }
        request.setDistances(distances);
        return request;
    }

    //method to provide the game result to the user
    private TSPGameResult createTestGameResult() {

        //create the game result object and set values
        TSPGameResult result = new TSPGameResult();
        result.setGameId(2);
        result.setPlayerId(1);
        result.setHomeCity("A");
        result.setCompletionTime(120);
        result.setShortestDistance(250);

        //pre-define the shortest route
        List<String> shortestRoute = Arrays.asList("B", "C", "D", "J", "H", "I", "E", "F", "G");
        result.setShortestRoute(shortestRoute);

        //create a solutions object to return the solution to the user
        List<TSPSolution> solutions = new ArrayList<>();

        //brute force solution output
        TSPSolution bruteForce = new TSPSolution();
        bruteForce.setAlgorithmName("Brute Force");
        bruteForce.setTotalDistance(250);
        bruteForce.setExecutionTimeMs(2000);
        bruteForce.setMemoryUsageKb(1024);
        solutions.add(bruteForce);

        TSPSolution nearestNeighbor = new TSPSolution();
        nearestNeighbor.setAlgorithmName("Nearest Neighbor");
        nearestNeighbor.setTotalDistance(270);
        nearestNeighbor.setExecutionTimeMs(50);
        nearestNeighbor.setMemoryUsageKb(512);
        solutions.add(nearestNeighbor);

        TSPSolution heldKarp = new TSPSolution();
        heldKarp.setAlgorithmName("Held-Karp (Dynamic Programming)");
        heldKarp.setTotalDistance(250);
        heldKarp.setExecutionTimeMs(80);
        heldKarp.setMemoryUsageKb(768);
        solutions.add(heldKarp);

        result.setSolutions(solutions);
        return result;
    }

    //test cases
    @Test
    public void testUsernameExists_WhenExists() {
        // Arrange the objects and values
        String username = "existingUser";
        Player mockPlayer = new Player();
        mockPlayer.setPlayerId(1);
        mockPlayer.setUsername(username);

        when(playerRepository.existsByUsername(username)).thenReturn(true);
        when(playerRepository.findByUsername(username)).thenReturn(mockPlayer);

        // Act by calling the method
        Map<String, Object> result = tspService.usernameExists(username);

        // Assert to verify the result
        assertTrue((Boolean) result.get("exists"));
        assertEquals(1, result.get("playerId"));
        verify(playerRepository).existsByUsername(username);
        verify(playerRepository).findByUsername(username);
    }
    @Test
    void testUsernameExists_WhenNotExists() {
        // Arrange
        String username = "newUser";

        // Correct mock setup - user doesn't exist
        when(playerRepository.existsByUsername(username)).thenReturn(false);

        // Act
        Map<String, Object> result = tspService.usernameExists(username);

        // Assert
        assertFalse((Boolean) result.get("exists"));
        assertNull(result.get("playerId"));
        verify(playerRepository).existsByUsername(username);
        verify(playerRepository, never()).findByUsername(anyString());
    }

    @Test
    void testRegisterPlayer() {
        // Arrange
        String username = "newPlayer";
        Player savedPlayer = new Player();
        savedPlayer.setPlayerId(5);
        savedPlayer.setUsername(username);
        savedPlayer.setRegistrationDate(LocalDateTime.now());
        savedPlayer.setLastLogin(LocalDateTime.now());

        when(playerRepository.save(any(Player.class))).thenReturn(savedPlayer);

        // Act
        Player result = tspService.registerPlayer(username);

        // Assert
        assertEquals(username, result.getUsername());
        assertEquals(5, result.getPlayerId());
        assertNotNull(result.getRegistrationDate());
        assertNotNull(result.getLastLogin());

        // Verify the player was saved with correct data
        ArgumentCaptor<Player> playerCaptor = ArgumentCaptor.forClass(Player.class);
        verify(playerRepository).save(playerCaptor.capture());
        assertEquals(username, playerCaptor.getValue().getUsername());
    }

    @Test
    void testSolveTSP() {
        // This is an integration test that tests the actual algorithm implementations
        // Arrange
        TSPRequest request = createTspRequest();

        // Act
        TSPResponse response = tspService.solveTSP(request);

        // Assert
        assertNotNull(response);
        assertNotNull(response.getSolutions());
        assertEquals(3, response.getSolutions().size());
        assertNotNull(response.getBestSolution());

        // Verify we have solutions for all three algorithms
        Set<String> algorithmNames = new HashSet<>();
        for (TSPSolution solution : response.getSolutions()) {
            algorithmNames.add(solution.getAlgorithmName());
            assertNotNull(solution.getOptimizedRoute());
            assertTrue(solution.getTotalDistance() > 0);
            assertTrue(solution.getExecutionTimeMs() > 0);
        }

        assertTrue(algorithmNames.contains("Brute Force"));
        assertTrue(algorithmNames.contains("Nearest Neighbor"));
        assertTrue(algorithmNames.contains("Held-Karp (Dynamic Programming)"));

        // Best solution should have the minimum distance
        int minDistance = Integer.MAX_VALUE;
        for (TSPSolution solution : response.getSolutions()) {
            minDistance = Math.min(minDistance, solution.getTotalDistance());
        }
        assertEquals(minDistance, response.getBestSolution().getTotalDistance());
    }

    @Test
    void testSavingGameResult() {
        // Arrange
        TSPGameResult gameResult = createTestGameResult();

        GameResult savedGameResult = new GameResult();
        savedGameResult.setResultId(42);
        when(gameResultRepository.save(any(GameResult.class))).thenReturn(savedGameResult);

        // Act
        tspService.saveGameResult(gameResult);

        // Assert - verify correct objects were saved
        verify(gameResultRepository).save(gameResultCaptor.capture());
        verify(travelingSalesmanResultRepository).save(travelingSalesmanResultCaptor.capture());
        verify(performanceMetricRepository, times(3)).save(performanceMetricCaptor.capture());

        // Verify game result data
        GameResult capturedGameResult = gameResultCaptor.getValue();
        assertEquals(gameResult.getGameId(), capturedGameResult.getGameId());
        assertEquals(gameResult.getPlayerId(), capturedGameResult.getPlayerId());
        assertEquals(gameResult.getCompletionTime(), capturedGameResult.getCompletionTimeSeconds());

        // Verify TSP result data
        TravelingSalesmanResult capturedTspResult = travelingSalesmanResultCaptor.getValue();
        assertEquals(savedGameResult.getResultId(), capturedTspResult.getResultId());
        assertEquals(gameResult.getHomeCity(), capturedTspResult.getHomeCity());
        assertEquals("A-->B-->C-->D-->J-->H-->I-->E-->F-->G-->A", capturedTspResult.getShortestRoute());
        assertEquals(gameResult.getShortestDistance(), capturedTspResult.getShortestDistance());

        // Verify performance metrics
        List<PerformanceMetric> capturedMetrics = performanceMetricCaptor.getAllValues();
        assertEquals(3, capturedMetrics.size());

        // Check algorithm IDs were mapped correctly
        boolean foundBruteForce = false;
        boolean foundHeldKarp = false;
        boolean foundNearestNeighbor = false;

        for (PerformanceMetric metric : capturedMetrics) {
            assertEquals(savedGameResult.getResultId(), metric.getResultId());

            if (metric.getAlgorithmId() == 1) {
                foundBruteForce = true;
                assertEquals(2000, metric.getExecutionTimeMs());
                assertEquals(1024, metric.getMemoryUsageKb());
            } else if (metric.getAlgorithmId() == 2) {
                foundHeldKarp = true;
                assertEquals(80, metric.getExecutionTimeMs());
                assertEquals(768, metric.getMemoryUsageKb());
            } else if (metric.getAlgorithmId() == 3) {
                foundNearestNeighbor = true;
                assertEquals(50, metric.getExecutionTimeMs());
                assertEquals(512, metric.getMemoryUsageKb());
            }
        }

        assertTrue(foundBruteForce);
        assertTrue(foundHeldKarp);
        assertTrue(foundNearestNeighbor);
    }
}
