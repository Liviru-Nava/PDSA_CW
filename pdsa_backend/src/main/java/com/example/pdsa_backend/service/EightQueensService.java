package com.example.pdsa_backend.service;

import com.example.pdsa_backend.data.*;
import com.example.pdsa_backend.data.eightqueensdata.*;
import com.example.pdsa_backend.dto.eightqueens.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Service
public class EightQueensService {
    private static final int BOARD_SIZE = 8;
    private static final int EXPECTED_SOLUTION_COUNT = 92;
    private final Random random = new Random();

    @Autowired
    private EightQueensSolutionRepository solutionRepository;

    @Autowired
    private GameResultRepository gameResultRepository;

    @Autowired
    private EightQueensResultRepository eightQueensResultRepository;

    @Autowired
    private AlgorithmRunRepository algorithmRunRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private AlgorithmRepository algorithmRepository;

    @Autowired
    private PlayerRepository playerRepository;

    public PlayerResponseDTO createPlayer(PlayerRequestDTO request) {
        if (playerRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists.");
        }
        Player player = new Player();
        player.setUsername(request.getUsername());
        player.setRegistrationDate(LocalDateTime.now());
        Player savedPlayer = playerRepository.save(player);
        return new PlayerResponseDTO() {{
            setPlayerId(savedPlayer.getPlayerId());
            setUsername(savedPlayer.getUsername());
            setMessage("Player created successfully.");
        }};
    }

    public void computeSolutionsSequential(int gameId, int algorithmId) {
        long startTime = System.currentTimeMillis();
        List<int[]> solutions = new ArrayList<>();
        int[] board = new int[BOARD_SIZE];
        solveSequential(board, 0, solutions);
        if (!solutionRepository.existsByGameId(gameId)) {
            saveSolutions(solutions, gameId, algorithmId, startTime);
        } else {
            AlgorithmRun run = new AlgorithmRun();
            run.setAlgorithmId(algorithmId);
            run.setExecutionTimeMs(System.currentTimeMillis() - startTime);
            algorithmRunRepository.save(run);
        }
    }

    public void computeSolutionsThreaded(int gameId, int algorithmId) {
        long startTime = System.currentTimeMillis();
        List<int[]> solutions = new CopyOnWriteArrayList<>();
        ExecutorService executor = Executors.newFixedThreadPool(4);
        for (int i = 0; i < BOARD_SIZE; i++) {
            final int firstQueen = i;
            executor.submit(() -> {
                int[] board = new int[BOARD_SIZE];
                board[0] = firstQueen;
                solveSequential(board, 1, solutions);
            });
        }
        executor.shutdown();
        try {
            executor.awaitTermination(1, TimeUnit.MINUTES);
        } catch (InterruptedException e) {
            throw new RuntimeException("Threaded computation interrupted", e);
        }
        if (!solutionRepository.existsByGameId(gameId)) {
            saveSolutions(solutions, gameId, algorithmId, startTime);
        } else {
            AlgorithmRun run = new AlgorithmRun();
            run.setAlgorithmId(algorithmId);
            run.setExecutionTimeMs(System.currentTimeMillis() - startTime);
            algorithmRunRepository.save(run);
        }
    }

    public void computeSolutionsForReport(int gameId, int algorithmId, String type, int runs) {
        for (int i = 0; i < runs; i++) {
            long startTime = System.currentTimeMillis();
            List<int[]> solutions = type.equals("Sequential") ? new ArrayList<>() : new CopyOnWriteArrayList<>();
            int[] board = new int[BOARD_SIZE];
            if (type.equals("Sequential")) {
                solveSequential(board, 0, solutions);
            } else {
                ExecutorService executor = Executors.newFixedThreadPool(4);
                for (int j = 0; j < BOARD_SIZE; j++) {
                    final int firstQueen = j;
                    executor.submit(() -> {
                        int[] boardThread = new int[BOARD_SIZE];
                        boardThread[0] = firstQueen;
                        solveSequential(boardThread, 1, solutions);
                    });
                }
                executor.shutdown();
                try {
                    executor.awaitTermination(1, TimeUnit.MINUTES);
                } catch (InterruptedException e) {
                    throw new RuntimeException("Threaded computation interrupted", e);
                }
            }
            AlgorithmRun run = new AlgorithmRun();
            run.setAlgorithmId(algorithmId);
            run.setExecutionTimeMs(System.currentTimeMillis() - startTime);
            algorithmRunRepository.save(run);
        }
    }

    public AverageReportResponseDTO getAverageReportData() {
        Double sequentialAvg = algorithmRunRepository.findAverageExecutionTimeByAlgorithmId(1);
        Double threadedAvg = algorithmRunRepository.findAverageExecutionTimeByAlgorithmId(2);
        return new AverageReportResponseDTO() {{
            setSequentialAverageMs(sequentialAvg != null ? sequentialAvg : 0.0);
            setThreadedAverageMs(threadedAvg != null ? threadedAvg : 0.0);
        }};
    }

    public RandomSolutionResponseDTO getRandomSolution(int gameId) {
        List<EightQueensSolution> solutions = solutionRepository.findByGameId(gameId);
        if (solutions.isEmpty()) {
            throw new IllegalStateException("No solutions available for this game.");
        }
        EightQueensSolution randomSolution = solutions.get(random.nextInt(solutions.size()));
        String config = randomSolution.getConfiguration();
        int[] configuration = Arrays.stream(config.substring(1, config.length() - 1).split(", "))
                .mapToInt(Integer::parseInt)
                .toArray();
        return new RandomSolutionResponseDTO() {{
            setConfiguration(configuration);
        }};
    }

    public String submitSolution(SolutionRequestDTO request) {
        int gameId = request.getGameId();
        int playerId = request.getPlayerId();
        int[] configuration = request.getConfiguration();
        if (!validateSolution(configuration)) {
            throw new IllegalArgumentException("Invalid solution: Queens threaten each other or incorrect format.");
        }
        String configString = Arrays.toString(configuration);
        EightQueensSolution solution = solutionRepository.findByConfigurationAndGameId(configString, gameId)
                .orElseThrow(() -> new IllegalArgumentException("This is not a valid solution."));
        if (solution.isRecognized()) {
            return "This solution has already been recognized. Please try a different solution.";
        }
        solution.setRecognized(true);
        solutionRepository.save(solution);

        GameResult gameResult = new GameResult();
        gameResult.setGameId(gameId);
        gameResult.setPlayerId(playerId);
        gameResult.setCompletionTimeSeconds(request.getCompletionTimeSeconds());
        gameResult.setCreatedAt(request.getCreatedAt());
        gameResultRepository.save(gameResult);

        EightQueensResult eightQueensResult = new EightQueensResult();
        eightQueensResult.setResultId(gameResult.getResultId());
        eightQueensResult.setSolutionId(solution.getSolutionId());
        eightQueensResult.setResultValue(configString);
        eightQueensResultRepository.save(eightQueensResult);

        long recognizedCount = solutionRepository.countByIsRecognizedTrueAndGameId(gameId);
        if (recognizedCount >= EXPECTED_SOLUTION_COUNT) {
            resetRecognizedFlags(gameId);
            return "Congratulations! All solutions found! Game reset for new players.";
        }
        return "Solution accepted! Keep going!";
    }

    private void solveSequential(int[] board, int row, List<int[]> solutions) {
        if (row == BOARD_SIZE) {
            solutions.add(board.clone());
            return;
        }
        for (int col = 0; col < BOARD_SIZE; col++) {
            if (isSafe(board, row, col)) {
                board[row] = col;
                solveSequential(board, row + 1, solutions);
            }
        }
    }

    private boolean isSafe(int[] board, int row, int col) {
        for (int i = 0; i < row; i++) {
            int placedCol = board[i];
            if (placedCol == col || Math.abs(placedCol - col) == Math.abs(i - row)) {
                return false;
            }
        }
        return true;
    }

    private void saveSolutions(List<int[]> solutions, int gameId, int algorithmId, long startTime) {
        Game game = gameRepository.findById(gameId).orElseThrow(() -> new IllegalArgumentException("Game not found"));
        for (int[] sol : solutions) {
            String config = Arrays.toString(sol);
            if (!solutionRepository.existsByConfigurationAndGameId(config, gameId)) {
                EightQueensSolution solution = new EightQueensSolution();
                solution.setGameId(gameId);
                solution.setConfiguration(config);
                solution.setRecognized(false);
                solutionRepository.save(solution);
            }
        }
        AlgorithmRun run = new AlgorithmRun();
        run.setAlgorithmId(algorithmId);
        run.setExecutionTimeMs(System.currentTimeMillis() - startTime);
        algorithmRunRepository.save(run);
    }

    private boolean validateSolution(int[] configuration) {
        if (configuration.length != BOARD_SIZE) {
            return false;
        }
        for (int i = 0; i < BOARD_SIZE; i++) {
            for (int j = i + 1; j < BOARD_SIZE; j++) {
                if (configuration[i] == configuration[j] ||
                        Math.abs(configuration[i] - configuration[j]) == Math.abs(i - j)) {
                    return false;
                }
            }
        }
        return true;
    }

    private void resetRecognizedFlags(int gameId) {
        List<EightQueensSolution> solutions = solutionRepository.findByGameId(gameId);
        for (EightQueensSolution solution : solutions) {
            solution.setRecognized(false);
        }
        solutionRepository.saveAll(solutions);
    }
}