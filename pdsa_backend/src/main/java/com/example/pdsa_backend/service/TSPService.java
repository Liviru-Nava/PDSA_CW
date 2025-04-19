package com.example.pdsa_backend.service;

import com.example.pdsa_backend.dto.TSPRequest;
import com.example.pdsa_backend.dto.TSPResponse;
import com.example.pdsa_backend.dto.TSPSolution;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
public class TSPService {

    public TSPResponse solveTSP(TSPRequest request) {
        // Create thread pool of three threads
        ExecutorService executorService = Executors.newFixedThreadPool(3);

        //Add the home city first and then the selected city sequence
        List<TSPRequest.City> cities = new ArrayList<>();
        cities.add(request.getHomeCity());
        cities.addAll(request.getSelectedCities());

        //create a distance matrix
        int[][] distanceMatrix = createDistanceMatrix(cities, request.getDistances());

        // Print column headers
        System.out.print("\t"); // initial tab for top-left empty corner
        for (int i = 0; i < distanceMatrix.length; i++) {
            char colHeader = (char) ('A' + i);
            System.out.print(colHeader + "\t");
        }
        System.out.println();

        // Print rows with row headers
        for (int i = 0; i < distanceMatrix.length; i++) {
            char rowHeader = (char) ('A' + i);
            System.out.print(rowHeader + "\t"); // Print row header
            for (int j = 0; j < distanceMatrix[i].length; j++) {
                System.out.print(distanceMatrix[i][j] + "\t");
            }
            System.out.println();
        }

        //Create threads for each algorithm and submit to executorService
        Future<TSPSolution> bruteForceThread = executorService.submit(() -> solveBruteForce(cities, distanceMatrix));
        Future<TSPSolution> nearestNeighborThread = executorService.submit(() -> solveNearestNeighbor(cities, distanceMatrix));
        Future<TSPSolution> heldKarpThread = executorService.submit(() -> solveHeldKarp(cities, distanceMatrix));

        //get responses and solutions
        TSPResponse response = new TSPResponse();
        List<TSPSolution> solutions = new ArrayList<>();

        try {
            solutions.add(bruteForceThread.get(30, TimeUnit.SECONDS));
            solutions.add(nearestNeighborThread.get(30, TimeUnit.SECONDS));
            solutions.add(heldKarpThread.get(30, TimeUnit.SECONDS));

            response.setSolutions(solutions);
            response.setMessage("All algorithms executed successfully");

            //Find minimum distance
            int minDistance = solutions.stream()
                    .mapToInt(TSPSolution::getTotalDistance)
                    .min()
                    .orElse(Integer.MAX_VALUE);

            //Find solutions that have the minimum distance
            List<TSPSolution> minDistanceSolutions = solutions.stream()
                    .filter(solution -> solution.getTotalDistance() == minDistance)
                    .collect(Collectors.toList());

            //find the one with minimum execution time
            TSPSolution bestSolution = minDistanceSolutions.stream()
                    .min(Comparator.comparing(TSPSolution::getExecutionTimeMs))
                    .orElse(minDistanceSolutions.get(0)); // fallback, safe


            response.setBestSolution(bestSolution);

        } catch (Exception e) {
            e.printStackTrace();
            response.setMessage("Error executing algorithms: " + e.getMessage());
        } finally {
            //close the thread pool
            executorService.shutdown();
        }

        //return the response (solutions, best solutions and message)
        return response;
    }

    //HELPER METHOD TO CREATE DISTANCE MATRIX FOR ALGORITHMS (we get cities and distance matrix from frontend request)
    private int[][] createDistanceMatrix(List<TSPRequest.City> cities, Map<Integer, Map<Integer, Integer>> distances) {

        //initialize distance matrix
        int n = cities.size();
        int[][] distanceMatrix = new int[n][n];

        // Map city IDs to their index in the cities list
        Map<Integer, Integer> cityIdToIndex = new HashMap<>();
        for (int i = 0; i < cities.size(); i++) {
            cityIdToIndex.put(cities.get(i).getId(), i);
        }

        // Fill distance matrix
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i == j) {
                    distanceMatrix[i][j] = 0;
                } else {
                    int cityId1 = cities.get(i).getId();    //get the id of the first city
                    int cityId2 = cities.get(j).getId();    //get the id of the second city
                    distanceMatrix[i][j] = distances.get(cityId1).get(cityId2); //get the distance from the map (check cityId1->cityId2 distance)
                }
            }
        }

        //return the created distance matrix
        return distanceMatrix;
    }

    // BRUTE FORCE ALGORITHM (we receive the list of cities and the distance matrix)
    private TSPSolution solveBruteForce(List<TSPRequest.City> cities, int[][] distanceMatrix) {
        //start the time of solving the algorithm
        long startTime = System.currentTimeMillis();

        TSPSolution solution = new TSPSolution();   //has algorithm name, optimized route, total distance and executionTime
        solution.setAlgorithmName("Brute Force");

        int n = cities.size();
        int homeIndex = 0; // Home city is always at index 0

        //add the cities to visit in order except the home city
        List<Integer> toVisit = new ArrayList<>();
        for (int i = 1; i < n; i++) {
            toVisit.add(i);
        }

        //make the best path and the best distance null
        List<TSPRequest.City> bestPath = null;
        int bestDistance = Integer.MAX_VALUE;

        // Generate all permutations into a list of integer lists and find the best one
        List<List<Integer>> permutations = generatePermutations(toVisit);

        //find the best
        for (List<Integer> perm : permutations) {
            int currentDistance = 0;
            int prev = homeIndex;

            for (int city : perm) {
                currentDistance += distanceMatrix[prev][city];
                prev = city;
            }

            // Add distance back to home
            currentDistance += distanceMatrix[prev][homeIndex];

            if (currentDistance < bestDistance) {
                bestDistance = currentDistance;

                // Reconstruct path with actual city objects
                bestPath = new ArrayList<>();
                bestPath.add(cities.get(homeIndex)); // Start with home

                for (int cityIndex : perm) {
                    bestPath.add(cities.get(cityIndex));
                }

                bestPath.add(cities.get(homeIndex)); // Return to home
            }
        }

        // Remove home city from beginning and end for consistent return format
        bestPath.remove(0);
        bestPath.remove(bestPath.size() - 1);

        solution.setOptimizedRoute(bestPath);
        solution.setTotalDistance(bestDistance);
        solution.setExecutionTimeMs(System.currentTimeMillis() - startTime); // Just a placeholder, will be more accurate in real implementation

        return solution;
    }

    // Generate all permutations of a list using Heap's algorithm
    private List<List<Integer>> generatePermutations(List<Integer> original) {
        List<List<Integer>> result = new ArrayList<>();

        // Base case
        if (original.size() <= 1) {
            result.add(new ArrayList<>(original));
            return result;
        }

        // Recursive case
        for (int i = 0; i < original.size(); i++) {
            Integer first = original.remove(0);
            List<List<Integer>> perms = generatePermutations(original);

            for (List<Integer> perm : perms) {
                perm.add(0, first);
            }

            result.addAll(perms);
            original.add(first); // backtrack
        }

        return result;
    }

    // NEAREST NEIGHBOR ALGORITHM
    private TSPSolution solveNearestNeighbor(List<TSPRequest.City> cities, int[][] distanceMatrix) {
        //start time of the algorithm
        long startTime = System.currentTimeMillis();

        TSPSolution solution = new TSPSolution(); //has algorithm name, optimized route, total distance and executionTime
        solution.setAlgorithmName("Nearest Neighbor");

        int n = cities.size();
        boolean[] visited = new boolean[n];
        List<TSPRequest.City> path = new ArrayList<>();
        int totalDistance = 0;

        int current = 0; // Start from home city
        visited[current] = true;

        // Visit all cities
        for (int i = 0; i < n - 1; i++) {
            int nearest = -1;
            int minDistance = Integer.MAX_VALUE;

            // Find nearest unvisited city
            for (int j = 0; j < n; j++) {
                if (!visited[j] && distanceMatrix[current][j] < minDistance) {
                    nearest = j;
                    minDistance = distanceMatrix[current][j];
                }
            }

            // Add city to path
            visited[nearest] = true;
            path.add(cities.get(nearest));
            totalDistance += minDistance;
            current = nearest;
        }

        // Return to home city
        totalDistance += distanceMatrix[current][0];

        solution.setOptimizedRoute(path);
        solution.setTotalDistance(totalDistance);
        solution.setExecutionTimeMs(System.currentTimeMillis() - startTime);

        return solution;
    }

    // HELD-KARP ALGORITHM (Dynamic Programming Approach)
    private TSPSolution solveHeldKarp(List<TSPRequest.City> cities, int[][] distanceMatrix) {
        //start time of the algorithm
        long startTime = System.currentTimeMillis();

        TSPSolution solution = new TSPSolution(); //has algorithm name, optimized route, total distance and executionTime
        solution.setAlgorithmName("Held-Karp (Dynamic Programming)");

        int n = cities.size();
        int homeIndex = 0;

        // Initialize memoization table
        // dp[mask][last] = minimum distance of path covering all cities in mask and ending at city 'last'
        Map<Integer, Map<Integer, Integer>> dp = new HashMap<>();
        // parent[mask][last] = city visited before 'last' in optimal path represented by mask
        Map<Integer, Map<Integer, Integer>> parent = new HashMap<>();

        // Base case: starting at city 0 (home)
        for (int i = 1; i < n; i++) {
            int mask = 1 << i; // mask with only city i
            Map<Integer, Integer> innerMap = dp.getOrDefault(mask, new HashMap<>());
            innerMap.put(i, distanceMatrix[homeIndex][i]);
            dp.put(mask, innerMap);

            Map<Integer, Integer> innerParent = parent.getOrDefault(mask, new HashMap<>());
            innerParent.put(i, homeIndex);
            parent.put(mask, innerParent);
        }

        // Iterate over all possible subsets of cities (excluding home)
        int allVisited = (1 << n) - 2; // All cities visited except home (0)

        for (int mask = 3; mask <= allVisited; mask++) {
            // Check if mask is a valid subset (has the right number of bits)
            if (Integer.bitCount(mask) <= 1) continue;

            for (int last = 1; last < n; last++) {
                // Check if city 'last' is in current subset
                if ((mask & (1 << last)) == 0) continue;

                // Previous mask without city 'last'
                int prevMask = mask & ~(1 << last);
                int minDist = Integer.MAX_VALUE;
                int minPrev = -1;

                // Try all possible cities before 'last'
                for (int prev = 1; prev < n; prev++) {
                    if ((prevMask & (1 << prev)) == 0) continue;

                    int distance = dp.get(prevMask).get(prev) + distanceMatrix[prev][last];
                    if (distance < minDist) {
                        minDist = distance;
                        minPrev = prev;
                    }
                }

                // Update dp table
                Map<Integer, Integer> innerMap = dp.getOrDefault(mask, new HashMap<>());
                innerMap.put(last, minDist);
                dp.put(mask, innerMap);

                // Update parent pointers
                Map<Integer, Integer> innerParent = parent.getOrDefault(mask, new HashMap<>());
                innerParent.put(last, minPrev);
                parent.put(mask, innerParent);
            }
        }

        // Find optimal last city
        int minTotalDist = Integer.MAX_VALUE;
        int lastCity = -1;

        for (int i = 1; i < n; i++) {
            int distance = dp.get(allVisited).get(i) + distanceMatrix[i][homeIndex];
            if (distance < minTotalDist) {
                minTotalDist = distance;
                lastCity = i;
            }
        }

        // Reconstruct path
        List<TSPRequest.City> path = new ArrayList<>();
        int mask = allVisited;
        int current = lastCity;

        while (current != homeIndex) {
            path.add(0, cities.get(current)); // Add to front of list
            int next = parent.get(mask).get(current);
            mask = mask & ~(1 << current);
            current = next;
        }

        solution.setOptimizedRoute(path);
        solution.setTotalDistance(minTotalDist);
        solution.setExecutionTimeMs(System.currentTimeMillis() - startTime);

        return solution;
    }
}