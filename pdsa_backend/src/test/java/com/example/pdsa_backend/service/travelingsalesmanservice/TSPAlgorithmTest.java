package com.example.pdsa_backend.service.travelingsalesmanservice;

import com.example.pdsa_backend.data.travelingsalesmandata.TravelingSalesmanResultRepository;
import com.example.pdsa_backend.dto.travelingsalesmandto.TSPRequest;
import com.example.pdsa_backend.dto.travelingsalesmandto.TSPSolution;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

@ExtendWith(MockitoExtension.class)
public class TSPAlgorithmTest {

    @Mock
    private com.example.pdsa_backend.data.PlayerRepository playerRepository;

    @Mock
    private com.example.pdsa_backend.data.GameResultRepository gameResultRepository;

    @Mock
    private TravelingSalesmanResultRepository travelingSalesmanResultRepository;

    @Mock
    private com.example.pdsa_backend.data.PerformanceMetricRepository performanceMetricRepository;

    @InjectMocks
    private TSPService tspService;

    private static final int CITY_COUNT = 10;
    private static final int MIN_DISTANCE = 50;
    private static final int MAX_DISTANCE = 100;


    private List<TSPRequest.City> createTestCities() {
        List<TSPRequest.City> cities = new ArrayList<>();
        for (int i = 0; i < CITY_COUNT; i++) {
            TSPRequest.City city = new TSPRequest.City();
            city.setId(i);
            city.setName(String.valueOf((char) ('A' + i))); // 'A', 'B', ..., 'J'
            cities.add(city);
        }
        return cities;
    }

    private int[][] generateRandomDistanceMatrix() {
        Random random = new Random(42); // Using seed for reproducibility
        int[][] distanceMatrix = new int[CITY_COUNT][CITY_COUNT];

        for (int i = 0; i < CITY_COUNT; i++) {
            for (int j = i; j < CITY_COUNT; j++) { // Start from i to only fill upper triangle
                if (i == j) {
                    distanceMatrix[i][j] = 0; // Distance to self is 0
                } else {
                    int distance = MIN_DISTANCE + random.nextInt(MAX_DISTANCE - MIN_DISTANCE + 1);
                    distanceMatrix[i][j] = distance; // Set upper triangle
                    distanceMatrix[j][i] = distance; // Mirror to lower triangle
                }
            }
        }
        return distanceMatrix;
    }

    private int[][] generateOptimalPathMatrix() {
        Random random = new Random(42); // Using seed for reproducibility
        int[][] distanceMatrix = new int[CITY_COUNT][CITY_COUNT];

        for (int i = 0; i < CITY_COUNT; i++) {
            for (int j = 0; j < CITY_COUNT; j++) {
                if (i == j) {
                    distanceMatrix[i][j] = 0; // Distance to self is 0
                } else if ((i + 1) % CITY_COUNT == j) {
                    // Next city in the optimal path has a shorter distance
                    distanceMatrix[i][j] = MIN_DISTANCE;
                } else {
                    // Other distances are randomly distributed between MIN_DISTANCE+10 and MAX_DISTANCE
                    distanceMatrix[i][j] = (MIN_DISTANCE + 10) + random.nextInt(MAX_DISTANCE - MIN_DISTANCE - 9);
                }
            }
        }
        return distanceMatrix;
    }

    @Test
    void testBruteForceAlgorithm() {
        List<TSPRequest.City> cities = createTestCities();
        int[][] distanceMatrix = generateOptimalPathMatrix();

        try {
            Method method = TSPService.class.getDeclaredMethod("solveBruteForce", List.class, int[][].class);
            method.setAccessible(true);

            TSPSolution solution = (TSPSolution) method.invoke(tspService, cities, distanceMatrix);

            assertEquals("Brute Force", solution.getAlgorithmName());
            assertEquals(500, solution.getTotalDistance());
            assertEquals(CITY_COUNT - 1, solution.getOptimizedRoute().size());

            // Verify the route follows the optimal path (B, C, D, ..., J)
            for (int i = 0; i < solution.getOptimizedRoute().size(); i++) {
                assertEquals(String.valueOf((char) ('B' + i)), solution.getOptimizedRoute().get(i).getName());
            }

        } catch (Exception e) {
            fail("Exception while testing brute force algorithm: " + e.getMessage());
        }
    }

    @Test
    void testNearestNeighborAlgorithm() {
        List<TSPRequest.City> cities = createTestCities();
        int[][] distanceMatrix = generateOptimalPathMatrix();

        try {
            Method method = TSPService.class.getDeclaredMethod("solveNearestNeighbor", List.class, int[][].class);
            method.setAccessible(true);

            TSPSolution solution = (TSPSolution) method.invoke(tspService, cities, distanceMatrix);

            assertEquals("Nearest Neighbor", solution.getAlgorithmName());
            // The expected total distance would be 9 transitions with distance 50 each = 450
            assertEquals(500, solution.getTotalDistance());
            assertEquals(CITY_COUNT - 1, solution.getOptimizedRoute().size());

            // Verify the route follows the optimal path (B, C, D, ..., J)
            for (int i = 0; i < solution.getOptimizedRoute().size(); i++) {
                assertEquals(String.valueOf((char) ('B' + i)), solution.getOptimizedRoute().get(i).getName());
            }

        } catch (Exception e) {
            fail("Exception while testing nearest neighbor algorithm: " + e.getMessage());
        }
    }

    @Test
    void testHeldKarpAlgorithm() {
        List<TSPRequest.City> cities = createTestCities();
        int[][] distanceMatrix = generateOptimalPathMatrix();

        try {
            Method method = TSPService.class.getDeclaredMethod("solveHeldKarp", List.class, int[][].class);
            method.setAccessible(true);

            TSPSolution solution = (TSPSolution) method.invoke(tspService, cities, distanceMatrix);

            assertEquals("Held-Karp (Dynamic Programming)", solution.getAlgorithmName());
            // The expected total distance would be 9 transitions with distance 50 each = 450
            assertEquals(500, solution.getTotalDistance());
            assertEquals(CITY_COUNT - 1, solution.getOptimizedRoute().size());

            // Verify the route follows the optimal path (B, C, D, ..., J)
            for (int i = 0; i < solution.getOptimizedRoute().size(); i++) {
                assertEquals(String.valueOf((char) ('B' + i)), solution.getOptimizedRoute().get(i).getName());
            }

        } catch (Exception e) {
            fail("Exception while testing Held-Karp algorithm: " + e.getMessage());
        }
    }

    @Test
    void testAllAlgorithmsWithRandomDistances() {
        List<TSPRequest.City> cities = createTestCities();
        int[][] randomDistanceMatrix = generateRandomDistanceMatrix();

        try {
            // Test all three algorithms with the same random distance matrix
            Method bruteForceMethod = TSPService.class.getDeclaredMethod("solveBruteForce", List.class, int[][].class);
            Method nearestNeighborMethod = TSPService.class.getDeclaredMethod("solveNearestNeighbor", List.class, int[][].class);
            Method heldKarpMethod = TSPService.class.getDeclaredMethod("solveHeldKarp", List.class, int[][].class);

            bruteForceMethod.setAccessible(true);
            nearestNeighborMethod.setAccessible(true);
            heldKarpMethod.setAccessible(true);

            TSPSolution bruteForceResult = (TSPSolution) bruteForceMethod.invoke(tspService, cities, randomDistanceMatrix);
            TSPSolution nearestNeighborResult = (TSPSolution) nearestNeighborMethod.invoke(tspService, cities, randomDistanceMatrix);
            TSPSolution heldKarpResult = (TSPSolution) heldKarpMethod.invoke(tspService, cities, randomDistanceMatrix);

            // The brute force and Held-Karp should find the exact optimal solution
            assertEquals(bruteForceResult.getTotalDistance(), heldKarpResult.getTotalDistance(),
                    "Brute force and Held-Karp should find the same optimal distance");

            // Nearest neighbor might not find the optimal solution
            // But we can at least check that it returns a valid solution
            assertEquals(CITY_COUNT - 1, nearestNeighborResult.getOptimizedRoute().size(),
                    "Nearest neighbor should visit all cities");

        } catch (Exception e) {
            fail("Exception while testing all algorithms with random distances: " + e.getMessage());
        }
    }
}