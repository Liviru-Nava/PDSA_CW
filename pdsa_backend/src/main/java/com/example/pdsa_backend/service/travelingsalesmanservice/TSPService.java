package com.example.pdsa_backend.service.travelingsalesmanservice;

import com.example.pdsa_backend.data.travelingsalesmandata.*;
import com.example.pdsa_backend.dto.travelingsalesmandto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
public class TSPService {

    @Autowired
    private PlayerRepository playerRepository;
    @Autowired
    GameResultRepository gameResultRepository;
    @Autowired
    TravelingSalesmanResultRepository travelingSalesmanResultRepository;
    @Autowired
    private PerformanceMetricRepository performanceMetricRepository;

    @Autowired
    private AlgorithmRepository algorithmRepository;



    //----------------------------------CHECK USERNAME---------------------------------------------//
    public Map<String, Object> usernameExists(String username) {
        //create a key value map to store responses
        Map<String, Object> userResult = new HashMap<>();

        boolean userExists = playerRepository.existsByUsername(username);
        userResult.put("exists", userExists);

        if (userExists) {
            // Retrieve the player ID only if the username exists
            Player player = playerRepository.findByUsername(username);
            userResult.put("playerId", player.getPlayerId());
        }
        return userResult;
    }

    public Player registerPlayer(String username) {
        Player player = new Player();
        player.setUsername(username);
        player.setRegistrationDate(LocalDateTime.now());
        player.setLastLogin(LocalDateTime.now());
        return playerRepository.save(player);
    }

    //----------------------------------END CHECK USERNAME---------------------------------------------//


    //----------------------------------SOLVE THE ALGORITHMS------------------------------------------//
    public TSPResponse solveTSP(TSPRequest request) {
        //get responses and solutions
        TSPResponse response = new TSPResponse();
        List<TSPSolution> solutions = new ArrayList<>();

        //validate the request
        if(request.getHomeCity() == null || request.getSelectedCities() == null || request.getDistances() == null || request.getTotalDistance() == 0){
            response.setMessage("The Home City, Distances and Selected Cities are empty!");
            return response;
        }

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

        try {
            solutions.add(bruteForceThread.get(30, TimeUnit.SECONDS));
            solutions.add(nearestNeighborThread.get(30, TimeUnit.SECONDS));
            solutions.add(heldKarpThread.get(30, TimeUnit.SECONDS));

            response.setSolutions(solutions);
            response.setMessage("All algorithms executed successfully");

            //Find minimum distance (this removes Nearest Neighbor)
            int minDistance = solutions.stream()
                    .mapToInt(TSPSolution::getTotalDistance)
                    .min()
                    .orElse(Integer.MAX_VALUE);

            //Find solutions that have the minimum distance (Brute and Dynamic)
            List<TSPSolution> minDistanceSolutions = solutions.stream()
                    .filter(solution -> solution.getTotalDistance() == minDistance)
                    .collect(Collectors.toList());

            //find the one with minimum execution time
            TSPSolution bestSolution = minDistanceSolutions.stream()
                    .min(Comparator.comparing(TSPSolution::getExecutionTimeMs))
                    .orElse(minDistanceSolutions.get(0));


            response.setBestSolution(bestSolution);

        }catch(TimeoutException ex){
            ex.printStackTrace();
            response.setMessage("One of the algorithms timed out after 30 seconds!");
        }
        catch (Exception e) {
            e.printStackTrace();
            response.setMessage("Error executing algorithms: " + e.getMessage());
        } finally {
            //close the thread pool
            executorService.shutdown();
        }

        //return the response (solutions, best solutions and message)
        return response;
    }

    // HELPER METHOD TO GET THE MEMORY USAGE
    private int measureMemoryUsage() {
        // Force multiple garbage collections to stabilize memory
        for (int i = 0; i < 5; i++) {
            System.gc();
            try {
                Thread.sleep(100); // Give GC time to work
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        Runtime runtime = Runtime.getRuntime();
        return (int)((runtime.totalMemory() - runtime.freeMemory()) / 1024);
    }

    //HELPER METHOD TO CREATE DISTANCE MATRIX FOR ALGORITHMS (we get cities and distance matrix from frontend request)
    private int[][] createDistanceMatrix(List<TSPRequest.City> cities, Map<Integer, Map<Integer, Integer>> distances) {

        //initialize distance matrix
        int n = cities.size();
        int[][] distanceMatrix = new int[n][n];

        // Fill distance matrix
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i == j) {
                    distanceMatrix[i][j] = 0;
                } else {
                    int cityId1 = cities.get(i).getId();
                    int cityId2 = cities.get(j).getId();
                    distanceMatrix[i][j] = distances.get(cityId1).get(cityId2); //get the distance from the map (check cityId1->cityId2 distance)
                }
            }
        }
        //return the created distance matrix
        return distanceMatrix;
    }

    // BRUTE FORCE ALGORITHM (we receive the list of cities and the distance matrix)
    private TSPSolution solveBruteForce(List<TSPRequest.City> cities, int[][] distanceMatrix) {
        TSPSolution solution = new TSPSolution();   //has algorithm name, optimized route, total distance and executionTime
        solution.setAlgorithmName("Brute Force");

        try{
            //get the memory before
            int memoryBefore = measureMemoryUsage();

            //start the time of solving the algorithm
            long startTime = System.currentTimeMillis();

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

            // Generate permutations with size check for memory safety
            List<List<Integer>> permutations;
            try {
                permutations = generatePermutations(toVisit);
            } catch (OutOfMemoryError e) {
                throw new RuntimeException("Not enough memory to generate permutations", e);
            }

//        // Before the loop, print the original path (home -> home) FOR PRINTING PURPOSE
//        System.out.println("Row 0: Path: " + cities.get(0).getName() + " -> " + cities.get(0).getName() + " | Distance: 0");
//        int rowNumber = 1; // Start row numbering from 1 for permutations

            //find the best
            for (List<Integer> perm : permutations) {
                int currentDistance = 0;
                int prev = homeIndex;

//            // For printing the path
//            List<String> path = new ArrayList<>();
//            path.add(cities.get(prev).getName()); // Start from home city FOR PRINTING PURPOSE

                for (int city : perm) {
                    currentDistance += distanceMatrix[prev][city];
                    prev = city;
//                path.add(cities.get(city).getName()); // Add the visited city name FOR PRINTING PURPOSE
                }

                // Add distance back to home
                currentDistance += distanceMatrix[prev][homeIndex];
//            path.add(cities.get(homeIndex).getName()); // Return to home city for PRINTING PURPOSE

//            // Print the path and the total distance with row number
//            System.out.println("Row " + rowNumber + ": Path: " + String.join(" -> ", path) + " | Distance: " + currentDistance);
//            rowNumber++; // Increment row number for next permutation
                if (currentDistance < bestDistance) {
                    bestDistance = currentDistance;

                    // Reconstruct path with actual city objects
                    bestPath = new ArrayList<>();
                    for (int cityIndex : perm) {
                        bestPath.add(cities.get(cityIndex));
                    }
                }
            }

            // Get memory after execution
            int memoryAfter = measureMemoryUsage();

            // Calculate memory used by this algorithm execution
            int memoryUsed = Math.max(0, memoryAfter - memoryBefore);

            solution.setOptimizedRoute(bestPath);
            solution.setTotalDistance(bestDistance);
            solution.setExecutionTimeMs(System.currentTimeMillis() - startTime); // Just a placeholder, will be more accurate in real implementation
            solution.setMemoryUsageKb(memoryUsed);

        }catch(Exception ex){
            throw new RuntimeException("Brute force algorithm failed: " + ex.getMessage(), ex);
        }
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
            original.add(first); //add the first to the end of the original
        }

        return result;
    }

    // NEAREST NEIGHBOR ALGORITHM
    private TSPSolution solveNearestNeighbor(List<TSPRequest.City> cities, int[][] distanceMatrix) {
        TSPSolution solution = new TSPSolution(); //has algorithm name, optimized route, total distance and executionTime
        solution.setAlgorithmName("Nearest Neighbor");

        try{
            //get the memory before
            int memoryBefore = measureMemoryUsage();

            //start time of the algorithm
            long startTime = System.currentTimeMillis();

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

            // Get memory after execution
            int memoryAfter = measureMemoryUsage();

            // Calculate memory used by this algorithm execution
            int memoryUsed = Math.max(0, memoryAfter - memoryBefore);

            solution.setOptimizedRoute(path);
            solution.setTotalDistance(totalDistance);
            solution.setExecutionTimeMs(System.currentTimeMillis() - startTime);
            solution.setMemoryUsageKb(memoryUsed);

        }catch(Exception ex){
            throw new RuntimeException("Nearest Neighbor algorithm failed: " + ex.getMessage(), ex);
        }

        return solution;
    }

    // HELD-KARP ALGORITHM (Dynamic Programming Approach)
    private TSPSolution solveHeldKarp(List<TSPRequest.City> cities, int[][] distanceMatrix) {
        TSPSolution solution = new TSPSolution(); //has algorithm name, optimized route, total distance and executionTime
        solution.setAlgorithmName("Held-Karp (Dynamic Programming)");

        try{
            //get the memory before
            int memoryBefore = measureMemoryUsage();

            //start time of the algorithm
            long startTime = System.currentTimeMillis();

            int n = cities.size();  //10
            int homeIndex = 0;      //home is at 0

            // Initialize memoization table
            // dp[mask][last] = minimum distance of path covering all cities in mask and ending at city 'last'
            Map<Integer, Map<Integer, Integer>> dp = new HashMap<>();
            // parent[mask][last] = city visited before 'last' in optimal path represented by mask
            Map<Integer, Map<Integer, Integer>> parent = new HashMap<>();

            // Base case: starting at city 0 (home)
            for (int i = 1; i < n; i++) {
                int mask = 1 << i; //mask with only city i (when i = 1, mask = 2,
                Map<Integer, Integer> innerMap = dp.getOrDefault(mask, new HashMap<>());
                innerMap.put(i, distanceMatrix[homeIndex][i]);
                dp.put(mask, innerMap);

                Map<Integer, Integer> innerParent = parent.getOrDefault(mask, new HashMap<>());
                innerParent.put(i, homeIndex);
                parent.put(mask, innerParent);
            }

            // Iterate over all possible subsets of cities (excluding home)
            int allVisited = (1 << n) - 2; //1024- 2 = 1022 meaning B-J cities are visited except home

            for (int mask = 3; mask <= allVisited; mask++) {
                // Check if mask is a valid subset (has the right number of bits)
                if (Integer.bitCount(mask) <= 1) continue;  //initial loop mask is 3 -> 1's in 3 is 2

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
            
            //reverse the list for proper path generation
            Collections.reverse(path);

            // Get memory after execution
            int memoryAfter = measureMemoryUsage();

            // Calculate memory used by this algorithm execution
            int memoryUsed = Math.max(0, memoryAfter - memoryBefore);

            solution.setOptimizedRoute(path);
            solution.setTotalDistance(minTotalDist);
            solution.setExecutionTimeMs(System.currentTimeMillis() - startTime);
            solution.setMemoryUsageKb(memoryUsed);
        }catch(Exception ex){
            throw new RuntimeException("Nearest Neighbor algorithm failed: " + ex.getMessage(), ex);
        }
        return solution;
    }

    //----------------------------------END SOLVE THE ALGORITHMS------------------------------------------//




    //-----------------------------------------SAVE THE DATA TO DATABASE RECORDS----------------------------------------
    public TSPGameResultResponse saveGameResult(TSPGameResult request) {
        try{
            //Make sure the shortest route starts and ends with the home city
            List<String> completeRoute = new ArrayList<>(request.getShortestRoute());

            for(String route : completeRoute){
                System.out.print(route + " -> ");
            }

            // Check then add if home city not at the top of the list
            if (completeRoute.isEmpty() || !completeRoute.get(0).equals(request.getHomeCity())) {
                completeRoute.add(0, request.getHomeCity()); // Add home city at the beginning if not already there
            }

            // Check and add if the home city is not at the end of the list
            if (completeRoute.size() < 2 || !completeRoute.get(completeRoute.size() - 1).equals(request.getHomeCity())) {
                completeRoute.add(request.getHomeCity()); // Add home city at the end if not already there
            }

            // Convert the list of optimal routes to one string
            String routeString = String.join("-->", completeRoute);
            System.out.println("\n"+routeString);

            //first save the game result
            GameResult gameResult = new GameResult();
            gameResult.setGameId(request.getGameId());
            gameResult.setPlayerId(request.getPlayerId());
            gameResult.setCompletionTimeSeconds(request.getCompletionTime());
            gameResult.setCreatedAt(LocalDateTime.now());

            //get the saved data
            GameResult gameResultResponse = gameResultRepository.save(gameResult);

            //then save the traveling salesman result
            TravelingSalesmanResult travelingSalesmanResult = new TravelingSalesmanResult();
            travelingSalesmanResult.setResultId(gameResultResponse.getResultId());
            travelingSalesmanResult.setHomeCity(request.getHomeCity());
            travelingSalesmanResult.setShortestRoute(routeString);
            travelingSalesmanResult.setShortestDistance(request.getShortestDistance());

            //save the traveling salesman result
            travelingSalesmanResultRepository.save(travelingSalesmanResult);

            // Save performance metrics for each algorithm
            savePerformanceMetrics(gameResultResponse.getResultId(), request.getSolutions());

            List<TSPAlgorithmPerformance> algorithmPerformances = getAlgorithmPerformances(gameResultResponse.getResultId());

            // Create response object
            TSPGameResultResponse response = new TSPGameResultResponse();
            response.setResultId(gameResultResponse.getResultId());
            response.setHomeCity(request.getHomeCity());
            response.setShortestRoute(completeRoute);
            response.setShortestDistance(request.getShortestDistance());
            response.setAlgorithmPerformances(algorithmPerformances);

            System.out.println("TSP results and game results table saved!");

            return response;

        }catch(Exception ex){
            ex.printStackTrace();
            System.out.println(ex.getMessage());
        }
        return null;
    }

    //HELPER METHOD TO SAVE PERFORMANCE METRIC
    private void savePerformanceMetrics(int resultId, List<TSPSolution> solutions) {
        try {
            for (TSPSolution solution : solutions) {
                PerformanceMetric metric = new PerformanceMetric();
                metric.setResultId(resultId);

                // Set algorithm ID based on algorithm name
                switch (solution.getAlgorithmName()) {
                    case "Brute Force":
                        metric.setAlgorithmId(1);
                        break;
                    case "Held-Karp (Dynamic Programming)":
                        metric.setAlgorithmId(2);
                        break;
                    case "Nearest Neighbor":
                        metric.setAlgorithmId(3);
                        break;
                    default:
                        continue; // Skip unknown algorithms
                }

                metric.setExecutionTimeMs((int) solution.getExecutionTimeMs());
                metric.setMemoryUsageKb(solution.getMemoryUsageKb());
                metric.setCreatedAt(LocalDateTime.now());

                performanceMetricRepository.save(metric);
            }
            System.out.println("Performance metrics saved for all algorithms!");
        } catch (Exception ex) {
            ex.printStackTrace();
            System.out.println("Error saving performance metrics: " + ex.getMessage());
        }
    }

    //HELPER METHOD TO GET ALGORITHM PERFORMANCE
    private List<TSPAlgorithmPerformance> getAlgorithmPerformances(int resultId) {
        List<TSPAlgorithmPerformance> performances = new ArrayList<>();

        // Query for performance metrics with result_id
        List<PerformanceMetric> metrics = performanceMetricRepository.findByResultId(resultId);

        for (PerformanceMetric metric : metrics) {
            // Get algorithm information using algorithm_id
            Algorithm algorithm = algorithmRepository.findById(metric.getAlgorithmId())
                    .orElseThrow(() -> new RuntimeException("Algorithm not found for ID: " + metric.getAlgorithmId()));

            // Create DTO with necessary information
            TSPAlgorithmPerformance dto = new TSPAlgorithmPerformance();
            dto.setAlgorithmId(algorithm.getAlgorithmId());
            dto.setAlgorithmName(algorithm.getAlgorithmName());
            dto.setExecutionTimeMs(metric.getExecutionTimeMs());
            dto.setMemoryUsageKb(metric.getMemoryUsageKb());

            performances.add(dto);
        }

        return performances;
    }
}