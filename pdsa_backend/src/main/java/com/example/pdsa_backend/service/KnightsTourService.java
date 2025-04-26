package com.example.pdsa_backend.service;

import com.example.pdsa_backend.algorithms.AbstractKnightsTour;
import com.example.pdsa_backend.algorithms.KnightsTourBacktrackHeuristic;
import com.example.pdsa_backend.algorithms.KnightsTourBacktracking;
import com.example.pdsa_backend.algorithms.KnightsTourWarnsdorffs;
import com.example.pdsa_backend.data.*;
import com.example.pdsa_backend.data.knights_tour.KnightsTourGameResult;
import com.example.pdsa_backend.data.knights_tour.KnightsTourGameResultRepository;
import com.example.pdsa_backend.data.knights_tour.KnightsTourPerformanceMetrics;
import com.example.pdsa_backend.data.knights_tour.KnightsTourPerformanceMetricsRepository;
import com.example.pdsa_backend.dto.knights_tour.AlgorithmMetric;
import com.example.pdsa_backend.dto.knights_tour.AlgorithmsMetric;
import com.example.pdsa_backend.dto.knights_tour.KTSolution;
import com.example.pdsa_backend.dto.knights_tour.PlayerGameResult;
import com.example.pdsa_backend.exception.AlgorithmExecutionException;
import com.example.pdsa_backend.exception.InvalidParameterException;
import com.example.pdsa_backend.exception.TimeoutException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class KnightsTourService {
    String gameName = "KnightsTour";
    private static final Logger logger = LoggerFactory.getLogger(KnightsTourService.class);
    private static final List<String> SUPPORTED_ALGORITHMS = Arrays.asList("warnsdorffs", "backtracking", "backtrackingheuristic");
    @Autowired
    private PlayerRepository playerRepository;
    @Autowired
    private GameRepository gameRepository;
    @Autowired
    private AlgorithmRepository algorithmRepository;
    @Autowired
    private GameResultRepository gameResultRepository;
    @Autowired
    private KnightsTourGameResultRepository knightsTourGameResultRepository;
    @Autowired
    private PerformanceMetricRepository performanceMetricRepository;
    @Autowired
    KnightsTourPerformanceMetricsRepository knightsTourPerformanceMetricsRepository;

    private int knightsTourGameId;
    private int[] knightsTourAlgorithmIds;

   /**
     * Creates a dummy board for testing or unsupported algorithms
     */
    private int[][] createDummyBoard(int boardSize) {
        int[][] board = new int[boardSize][boardSize];
        int counter = boardSize * boardSize - 1;

        // Fill the board with numbers from 0 to (boardSize^2 - 1)
        for (int i = 0; i < boardSize; i++) {
            for (int j = 0; j < boardSize; j++) {
                board[i][j] = counter--;
            }
        }
        return board;
    }

    /**
     * Generate knight's tour solution using specified algorithm
     *
     * @param boardSize the size of the board (NxN)
     * @param startX starting row position
     * @param startY starting column position
     * @param algorithm algorithm to use
     * @return the solution result
     * @throws InvalidParameterException if input parameters are invalid
     * @throws AlgorithmExecutionException if algorithm execution fails
     */
    public KTSolution generateKnightSolution(int boardSize, int startX, int startY, String algorithm) {
        // Validate input parameters
        validateInputParameters(boardSize, startX, startY, algorithm);

        try {
            if (algorithm.toLowerCase().equals("warnsdorffs") || algorithm.toLowerCase().equals("backtracking") || algorithm.toLowerCase().equals("backtrackingheuristic")) {
                KTSolution sol = solveKnightsTour(boardSize, startX, startY,algorithm);
                logger.info("Solved: {}, Time taken: {} ms, Branches covered: {}",
                        sol.isSolutionFound(), sol.getExecutionTime(), sol.getBranchesCovered());
                return sol;
            } else {
                // For now, just return dummy data for other algorithms
                logger.info("Using dummy implementation for algorithm: {}", algorithm);
                int[][] board = createDummyBoard(boardSize);
                return new KTSolution(boardSize, algorithm, board, false, 1, 2,5);
            }
        } catch (Exception e) {
            logger.error("Error executing Knight's Tour algorithm: {}", e.getMessage(), e);
            throw new AlgorithmExecutionException("Failed to execute Knight's Tour algorithm: " + e.getMessage(), e);
        }
    }

    /**
     * Validate the input parameters
     */
    private void validateInputParameters(int boardSize, int startX, int startY, String algorithm) {
        StringBuilder errors = new StringBuilder();

        if (boardSize <= 0) {
            errors.append("Board size must be positive. ");
        }

        if (startX < 0 || startX >= boardSize) {
            errors.append("Starting X position must be between 0 and " + (boardSize - 1) + ". ");
        }

        if (startY < 0 || startY >= boardSize) {
            errors.append("Starting Y position must be between 0 and " + (boardSize - 1) + ". ");
        }

        if (algorithm == null || algorithm.trim().isEmpty()) {
            errors.append("Algorithm cannot be empty. ");
        } else if (!SUPPORTED_ALGORITHMS.contains(algorithm.toLowerCase())) {
            errors.append("Unsupported algorithm: " + algorithm + ". Supported algorithms are: " +
                    String.join(", ", SUPPORTED_ALGORITHMS) + ". ");
        }

        if (errors.length() > 0) {
            throw new InvalidParameterException(errors.toString().trim());
        }
    }

    /**
     * Solve Knight's Tour using Warnsdorff's algorithm
     */
    private KTSolution solveKnightsTour(int size, int startRow, int startCol,String algorithm ) {
        int board[][] = new int[size][size];
        long timeOut = 3000;
        try {
            AbstractKnightsTour kt;
            if(algorithm.toLowerCase().equals("warnsdorffs"))
                kt = new KnightsTourWarnsdorffs(size, size);
            else if(algorithm.toLowerCase().equals("backtracking"))
                kt = new KnightsTourBacktracking(size, size);
            else if(algorithm.toLowerCase().equals("backtrackingheuristic"))
                kt = new KnightsTourBacktrackHeuristic(size, size);
            else
                throw new InvalidParameterException("Unsupported algorithm: " + algorithm);
            // Set a reasonable timeout based on board size
            //long timeout = Math.min(30000, size * size * 20); // Max 30 seconds or size²*20 ms
            kt.setTimeout(timeOut);

            long startTime = System.currentTimeMillis();
            boolean solved = kt.solveKnightsTour(startRow, startCol);
            long endTime = System.currentTimeMillis();
            long elapsedTime = endTime - startTime;

            return new KTSolution(size, algorithm, kt.getMaxProgressBoard(), solved, kt.getBranchesCovered(), elapsedTime, kt.getMaxMovesReached());
        } catch (TimeoutException e) {
            logger.warn("Knight's Tour algorithm timed out: {}", e.getMessage());
            return new KTSolution(size, algorithm, e.getSolver().getMaxProgressBoard(), false, e.getSolver().getBranchesCovered(), timeOut,
                    e.getSolver().getMaxMovesReached(),"Algorithm timed out: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error in Knight's Tour algorithm: {}", e.getMessage(), e);
            throw new AlgorithmExecutionException("Error executing Knight's Tour algorithm: " + e.getMessage(), e);
        }
    }

    private int getOrCreatePlayer(String username) {
        String validUsername = (username == null || username.trim().isEmpty()) ? "guest" : username;

        Optional<Player> existingPlayerOptional = playerRepository.findByUsername(validUsername);

        if (existingPlayerOptional.isPresent()) {
            Player existingPlayer = existingPlayerOptional.get();
            existingPlayer.setLastLogin(LocalDateTime.now());
            Player updatedPlayer = playerRepository.save(existingPlayer);
            return updatedPlayer.getPlayerId();
        } else {
            Player newPlayer = new Player();
            newPlayer.setUsername(validUsername); // Use validUsername instead of username
            newPlayer.setRegistrationDate(LocalDateTime.now());
            newPlayer.setLastLogin(LocalDateTime.now());
            Player savedPlayer = playerRepository.save(newPlayer);
            return savedPlayer.getPlayerId();
        }
    }

    private int getOrCreateGame() {
        String description = "The Knight's Tour is a mathematical problem involving a chess knight placed on an empty board. The objective is to find a sequence of moves where the knight visits every square exactly once.";

        Game existingGame = gameRepository.findByGameName(gameName);
        if (existingGame != null) {
            return existingGame.getGameId();
        } else {
            Game newGame = new Game();
            newGame.setGameName(gameName);
            newGame.setDescription(description);
            Game savedGame = gameRepository.save(newGame);
            return savedGame.getGameId();
        }
    }

    private int[] getOrCreateAlgorithms() {
        // First, get or create the game to ensure it exists
        int gameId = getOrCreateGame();

        // Define the algorithms for Knight's Tour
        String[][] algorithms = {
                {"Warnsdorff",
                        "Warnsdorff's rule is a heuristic algorithm for solving the Knight's Tour problem. It chooses the next move based on the square with the fewest subsequent moves available.",
                        "Time Complexity: O(n²) where n² is the size of the board. Space Complexity: O(n²)"},

                {"Backtracking",
                        "A recursive algorithm that tries all possible knight moves, backtracking when it reaches a dead end until it finds a complete tour.",
                        "Time Complexity: O(8^(n²)) in worst case where 8 is the maximum possible moves and n² is board size. Space Complexity: O(n²) for the board and recursion stack."},

                {"BacktrackingHeuristic",
                        "A combination of backtracking with heuristics to guide the search more efficiently, prioritizing moves that have fewer next possible positions.",
                        "Time Complexity: O(8^(n²)) in worst case but typically much better than pure backtracking due to heuristics. Space Complexity: O(n²)."}
        };

        int[] algorithmIds = new int[algorithms.length];

        for (int i = 0; i < algorithms.length; i++) {
            String algorithmName = algorithms[i][0];
            String description = algorithms[i][1];
            String complexityAnalysis = algorithms[i][2];

            Algorithm existingAlgorithm = algorithmRepository.findByGameIdAndAlgorithmName(gameId, algorithmName);

            if (existingAlgorithm != null) {
                algorithmIds[i] = existingAlgorithm.getAlgorithmId();
            } else {
                Algorithm newAlgorithm = new Algorithm();
                newAlgorithm.setGameId(gameId);
                newAlgorithm.setAlgorithmName(algorithmName);
                newAlgorithm.setDescription(description);
                newAlgorithm.setComplexityAnalysis(complexityAnalysis);
                Algorithm savedAlgorithm = algorithmRepository.save(newAlgorithm);
                algorithmIds[i] = savedAlgorithm.getAlgorithmId();
            }
        }

        return algorithmIds;
    }

    public PlayerGameResult saveGameResult(PlayerGameResult gameResult) {
        // Convert DTO to entity
        int playerId = getOrCreatePlayer(gameResult.getUsername());
        GameResult result = new GameResult();
        result.setGameId(getOrCreateGame());
        result.setPlayerId(playerId);
        result.setCompletionTimeSeconds((int)gameResult.getGameTime());
        result.setCreatedAt(LocalDateTime.now());

        GameResult savedResult = gameResultRepository.save(result);

        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < gameResult.getBoard().length; i++) {
            for (int j = 0; j < gameResult.getBoard()[i].length; j++) {
                sb.append(gameResult.getBoard()[i][j]);

                // Add comma if not the last element in the entire array
                if (!(i == gameResult.getBoard().length - 1 && j == gameResult.getBoard()[i].length - 1)) {
                    sb.append(",");
                }
            }
        }

        KnightsTourGameResult resultUserResponse = new KnightsTourGameResult();
        resultUserResponse.setResultId(savedResult.getResultId());
        resultUserResponse.setUserSequenceOfMoves(sb.toString());
        resultUserResponse.setBoardSize(gameResult.getBoardSize());
        resultUserResponse.setMovesMade(gameResult.getMoveCount());
        resultUserResponse.setStartX(gameResult.getStartX());
        resultUserResponse.setStartY(gameResult.getStartY());
        resultUserResponse.setHasCompleted(gameResult.getHasCompleted());
        KnightsTourGameResult savedResponse = knightsTourGameResultRepository.save(resultUserResponse);

        if (gameResult.getAlgorithmMetrics() != null && !gameResult.getAlgorithmMetrics().isEmpty()) {
            for (Map.Entry<String, AlgorithmMetric> entry : gameResult.getAlgorithmMetrics().entrySet()) {
                String algorithmName = entry.getKey();
                AlgorithmMetric metric = entry.getValue();

                savePerformanceMetric(
                        savedResult.getResultId(),
                        algorithmName,
                        metric.getExecutionTime(),
                        metric.getMemoryUsage(),
                        metric.getHasCompleted(),
                        metric.getBranchesCovered(),
                        metric.getMaxMovesReached(),
                        metric.getBoard(),
                        metric.getHasTimedOut(),
                        gameResult.getBoardSize()
                );
            }
        }

        PlayerGameResult savedResult2 = new PlayerGameResult();
        savedResult2.setId((long) savedResult.getResultId());

        savedResult2.setUsername(gameResult.getUsername());
        savedResult2.setBoardSize(savedResponse.getBoardSize());
        savedResult2.setMoveCount(savedResponse.getMovesMade());
        savedResult2.setStartX(savedResponse.getStartX());
        savedResult2.setStartY(savedResponse.getStartY());
        savedResult2.setHasCompleted(gameResult.getHasCompleted());
        savedResult2.setGameTime(savedResult.getCompletionTimeSeconds());
        savedResult2.setBoard(gameResult.getBoard());
        savedResult2.setAlgorithmMetrics(gameResult.getAlgorithmMetrics());
        return savedResult2;
    }


    private void savePerformanceMetric(int resultId, String algorithmName, long executionTime, long memoryUsageKb,
                                       boolean hasCompleted, int branchesCovered, int maxMovesReached,int[] movePositionArray,
                                       boolean hasTimedOut, int boardSize) {
        try {
            int algorithmId = getAlgorithmIdByName(algorithmName);

            PerformanceMetric metric = new PerformanceMetric();
            metric.setResultId(resultId);
            metric.setAlgorithmId(algorithmId);
            metric.setExecutionTimeMs((int) executionTime);
            metric.setMemoryUsageKb((int) memoryUsageKb);
            metric.setCreatedAt(LocalDateTime.now());

            PerformanceMetric savedMetric = performanceMetricRepository.save(metric);
            if(savedMetric.getMetricId()>0){
                KnightsTourPerformanceMetrics extraAlgoMetrics = new KnightsTourPerformanceMetrics();
                extraAlgoMetrics.setMetricId(savedMetric.getMetricId());
                extraAlgoMetrics.setHasCompleted(hasCompleted);
                extraAlgoMetrics.setBranchesCovered(branchesCovered);
                extraAlgoMetrics.setMaxMovesReached(maxMovesReached);
                extraAlgoMetrics.setHasTimedOut(hasTimedOut);

                StringBuilder as = new StringBuilder();
                int[] moves = new int[boardSize * boardSize];
                Arrays.fill(moves, -1);
                for (int i = 0; i < movePositionArray.length; i++) {
                    int value = movePositionArray[i];
                    moves[value] = i;
                }
                for (int i = 0; i < boardSize * boardSize; i++) {
                    as.append(moves[i]);
                    if (i < (boardSize * boardSize) - 1) {
                        as.append(",");
                    }
                }
                extraAlgoMetrics.setAlgorithmSequenceOfMoves(as.toString());
                knightsTourPerformanceMetricsRepository.save(extraAlgoMetrics);
            }
            logger.info("Saved extra performance metrics for algorithm: {}, execution time: {} ms", algorithmName, executionTime);
        } catch (Exception e) {
            logger.error("Failed to save performance metrics: {}", e.getMessage(), e);
        }
    }

    private int getAlgorithmIdByName(String algorithmName) {
        if (knightsTourAlgorithmIds == null) {
            knightsTourAlgorithmIds = getOrCreateAlgorithms();
        }
        if (algorithmName.equalsIgnoreCase("warnsdorffs")) {
            return knightsTourAlgorithmIds[0];
        } else if (algorithmName.equalsIgnoreCase("backtracking")) {
            return knightsTourAlgorithmIds[1];
        } else if (algorithmName.equalsIgnoreCase("backtrackingheuristic")) {
            return knightsTourAlgorithmIds[2];
        } else {
            throw new InvalidParameterException("Unknown algorithm: " + algorithmName);
        }
    }

    /**
     * Get performance metrics for the latest Knight's Tour games played by a user
     *
     * @param username the username of the player
     * @return list of algorithm metrics for the latest games
     * @throws IllegalArgumentException if player not found
     */
    public List<AlgorithmsMetric> getPlayerAlgorithmMetrics(String username) throws IllegalArgumentException {
        Player player = playerRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Player not found"));
        System.out.println("Player id: "+player.getPlayerId());
        List<GameResult> latestResults = gameResultRepository.findByPlayerIdOrderByCreatedAtDesc(player.getPlayerId());

        if (latestResults.isEmpty()) {
            return Collections.emptyList();
        }

        List<Algorithm> algorithms = algorithmRepository.findByGameId(gameRepository.findByGameName(gameName).getGameId());
        if (algorithms.isEmpty()) {
            return Collections.emptyList();
        }

        // Create a map to store metrics for each algorithm
        Map<Integer, AlgorithmsMetric> metricsMap = new HashMap<>();

        // Initialize metrics for each algorithm
        for (Algorithm algorithm : algorithms) {
            metricsMap.put(algorithm.getAlgorithmId(), new AlgorithmsMetric(
                    algorithm.getAlgorithmName(),
                    new ArrayList<>(),  // rounds (will be 1,2,3... based on the order)
                    new ArrayList<>(),  // execution times
                    new ArrayList<>(),  // memory usages
                    new ArrayList<>()   // completion status
            ));
        }

        for (GameResult result : latestResults) {
            // For each algorithm, find its performance metrics for this game result
            for (Algorithm algorithm : algorithms) {
                Optional<PerformanceMetric> metricOptional = performanceMetricRepository
                        .findByResultIdAndAlgorithmId(result.getResultId(), algorithm.getAlgorithmId());

                if (metricOptional.isPresent()) {
                    PerformanceMetric metric = metricOptional.get();
                    AlgorithmsMetric algorithmMetric = metricsMap.get(algorithm.getAlgorithmId());

                    // Add data points
                    algorithmMetric.getRounds().add(result.getResultId());
                    algorithmMetric.getExecutionTimes().add(metric.getExecutionTimeMs());
                    algorithmMetric.getMemoryUsages().add(metric.getMemoryUsageKb());

                    // Get specific Knight's Tour metrics for completion status
                    Optional<KnightsTourPerformanceMetrics> ktMetricsOptional =
                            knightsTourPerformanceMetricsRepository.findByMetricId(metric.getMetricId());

                    algorithmMetric.getCompletionStatus().add(
                            ktMetricsOptional.isPresent() && ktMetricsOptional.get().getHasCompleted()
                    );
                }
            }
        }

        System.out.println("Returned "+latestResults.size()+" performance metrics for player "+username+" with player id "+player.getPlayerId()+" for game "+gameName);
        return new ArrayList<>(metricsMap.values());
    }
}