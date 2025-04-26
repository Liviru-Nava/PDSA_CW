package com.example.pdsa_backend.controller.travelingsalesmancontroller;

import com.example.pdsa_backend.data.Player;
import com.example.pdsa_backend.dto.travelingsalesmandto.TSPGameResult;
import com.example.pdsa_backend.dto.travelingsalesmandto.TSPRequest;
import com.example.pdsa_backend.dto.travelingsalesmandto.TSPResponse;
import com.example.pdsa_backend.dto.travelingsalesmandto.TSPSolution;
import com.example.pdsa_backend.service.travelingsalesmanservice.TSPService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class TSPControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TSPService tspService;

    @InjectMocks
    private TSPController tspController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    public void testCheckUsername_WhenExists() throws Exception {
        // Setup mock response
        Map<String, Object> response = new HashMap<>();
        response.put("exists", true);
        response.put("playerId", 1);

        when(tspService.usernameExists("existingUser")).thenReturn(response);

        mockMvc = MockMvcBuilders.standaloneSetup(tspController).build();

        mockMvc.perform(get("/check")
                        .param("username", "existingUser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(true))
                .andExpect(jsonPath("$.playerId").value(1));
    }

    @Test
    public void testCheckUsername_WhenNotExists() throws Exception {
        //setup mock response
        Map<String, Object> response = new HashMap<>();
        response.put("exists", false);

        when(tspService.usernameExists("newUser")).thenReturn(response);

        // Replace the real service with the mock for this test
        mockMvc = MockMvcBuilders.standaloneSetup(tspController).build();

        // Act & Assert
        mockMvc.perform(get("/check")
                        .param("username", "newUser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(false))
                .andExpect(jsonPath("$.playerId").doesNotExist());
    }

    @Test
    public void testRegisterPlayer() throws Exception {
        Player inputPlayer = new Player();
        inputPlayer.setUsername("newPlayer");

        Player returnedPlayer = new Player();
        returnedPlayer.setPlayerId(456);
        returnedPlayer.setUsername("newPlayer");

        when(tspService.registerPlayer(anyString())).thenReturn(returnedPlayer);
        mockMvc = MockMvcBuilders.standaloneSetup(tspController).build();

        // Act & Assert
        mockMvc.perform(post("/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inputPlayer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.playerId").value(456))
                .andExpect(jsonPath("$.username").value("newPlayer"));
    }

    @Test
    public void testSolveTSP() throws Exception {
        TSPRequest request = createTestTSPRequest();
        TSPResponse response = createTestTSPResponse();

        when(tspService.solveTSP(any(TSPRequest.class))).thenReturn(response);
        mockMvc = MockMvcBuilders.standaloneSetup(tspController).build();

        // Act & Assert
        mockMvc.perform(post("/solve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.solutions.length()").value(3))
                .andExpect(jsonPath("$.bestSolution.algorithmName").value("Held-Karp (Dynamic Programming)"))
                .andExpect(jsonPath("$.message").value("All algorithms executed successfully"));
    }

    @Test
    public void testSaveGameResult() throws Exception {
        TSPGameResult gameResult = createTestGameResult();

        Map<String, String> saveResponse = new HashMap<>();
        saveResponse.put("message", "Game Result saved successfully!");

        // Fix: Use doReturn().when() pattern for mocking the void method
        doNothing().when(tspService).saveGameResult(any(TSPGameResult.class));
        mockMvc = MockMvcBuilders.standaloneSetup(tspController).build();

        // Act & Assert
        mockMvc.perform(post("/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(gameResult)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Game Result saved successfully!"));
    }


    //HELPER METHODS
    private TSPRequest createTestTSPRequest() {
        // Initialize the TSP request
        TSPRequest request = new TSPRequest();

        // Create home city
        TSPRequest.City homeCity = new TSPRequest.City();
        homeCity.setId(0);
        homeCity.setName("A");
        request.setHomeCity(homeCity);

        // Create selected cities (B through J)
        List<TSPRequest.City> selectedCities = new ArrayList<>();
        for (char c = 'B'; c <= 'J'; c++) {
            TSPRequest.City city = new TSPRequest.City();
            city.setId(c - 'A');
            city.setName(String.valueOf(c));
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

    private TSPResponse createTestTSPResponse() {
        TSPResponse response = new TSPResponse();

        // Create solutions for three algorithms
        List<TSPSolution> solutions = new ArrayList<>();

        // Brute Force solution
        TSPSolution bruteForce = new TSPSolution();
        bruteForce.setAlgorithmName("Brute Force");
        bruteForce.setTotalDistance(450);
        bruteForce.setExecutionTimeMs(2000); // Fixed method name
        bruteForce.setMemoryUsageKb(1024);
        bruteForce.setOptimizedRoute(createOptimizedRoute());
        solutions.add(bruteForce);

        // Nearest Neighbor solution
        TSPSolution nearestNeighbor = new TSPSolution();
        nearestNeighbor.setAlgorithmName("Nearest Neighbor");
        nearestNeighbor.setTotalDistance(470);
        nearestNeighbor.setExecutionTimeMs(50); // Fixed method name
        nearestNeighbor.setMemoryUsageKb(512);
        nearestNeighbor.setOptimizedRoute(createOptimizedRoute());
        solutions.add(nearestNeighbor);

        // Held-Karp solution
        TSPSolution heldKarp = new TSPSolution();
        heldKarp.setAlgorithmName("Held-Karp (Dynamic Programming)");
        heldKarp.setTotalDistance(450);
        heldKarp.setExecutionTimeMs(100); // Fixed method name
        heldKarp.setMemoryUsageKb(768);
        heldKarp.setOptimizedRoute(createOptimizedRoute());
        solutions.add(heldKarp);

        response.setSolutions(solutions);
        response.setBestSolution(heldKarp);
        response.setMessage("All algorithms executed successfully");

        return response;
    }

    private List<TSPRequest.City> createOptimizedRoute() {
        List<TSPRequest.City> optimizedRoute = new ArrayList<>();
        // Create cities B through J for the optimized route
        for (char c = 'B'; c <= 'J'; c++) {
            TSPRequest.City city = new TSPRequest.City();
            city.setId(c - 'A');
            city.setName(String.valueOf(c));
            optimizedRoute.add(city);
        }
        return optimizedRoute;
    }

    private TSPGameResult createTestGameResult() {
        // Create the game result object
        TSPGameResult result = new TSPGameResult();
        result.setGameId(2);
        result.setPlayerId(1);
        result.setHomeCity("A");
        result.setCompletionTime(120);
        result.setShortestDistance(450);

        // Set the shortest route
        List<String> shortestRoute = Arrays.asList("B", "C", "D", "E", "F", "G", "H", "I", "J");
        result.setShortestRoute(shortestRoute);

        // Create solutions for all three algorithms
        List<TSPSolution> solutions = new ArrayList<>();

        // Brute Force solution
        TSPSolution bruteForce = new TSPSolution();
        bruteForce.setAlgorithmName("Brute Force");
        bruteForce.setTotalDistance(450);
        bruteForce.setExecutionTimeMs(2000); // Fixed method name
        bruteForce.setMemoryUsageKb(1024);
        solutions.add(bruteForce);

        // Nearest Neighbor solution
        TSPSolution nearestNeighbor = new TSPSolution();
        nearestNeighbor.setAlgorithmName("Nearest Neighbor");
        nearestNeighbor.setTotalDistance(470);
        nearestNeighbor.setExecutionTimeMs(50); // Fixed method name
        nearestNeighbor.setMemoryUsageKb(512);
        solutions.add(nearestNeighbor);

        // Held-Karp solution
        TSPSolution heldKarp = new TSPSolution();
        heldKarp.setAlgorithmName("Held-Karp (Dynamic Programming)");
        heldKarp.setTotalDistance(450);
        heldKarp.setExecutionTimeMs(80); // Fixed method name
        heldKarp.setMemoryUsageKb(768);
        solutions.add(heldKarp);

        result.setSolutions(solutions);

        return result;
    }
}