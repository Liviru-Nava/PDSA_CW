package com.example.pdsa_backend.service;

import com.example.pdsa_backend.data.*;
import com.example.pdsa_backend.data.towerofhanoidata.TowerOfHanoiResult;
import com.example.pdsa_backend.data.towerofhanoidata.TowerOfHanoiResultRepository;
import com.example.pdsa_backend.dto.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TowerOfHanoiService {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private AlgorithmRepository algorithmRepository;

    @Autowired
    private GameResultRepository gameResultRepository;

    @Autowired
    private PerformanceMetricRepository performanceMetricRepository;

    @Autowired
    private TowerOfHanoiResultRepository towerOfHanoiResultRepository;

    @Transactional
    public TowerOfHanoiResponse submitSolution(TowerOfHanoiRequest request) {
        TowerOfHanoiResponse response = new TowerOfHanoiResponse();

        // Validate inputs
        if (request.getUsername() == null || request.getUsername().isEmpty()) {
            response.setValid(false);
            response.setMessage("Username is required.");
            return response;
        }
        if (request.getDiskCount() < 5 || request.getDiskCount() > 10) {
            response.setValid(false);
            response.setMessage("Disk count must be between 5 and 10.");
            return response;
        }
        if (request.getNumOfMoves() <= 0) {
            response.setValid(false);
            response.setMessage("Number of moves must be positive.");
            return response;
        }
        if (request.getSequenceOfMoves() == null || request.getSequenceOfMoves().isEmpty()) {
            response.setValid(false);
            response.setMessage("Move sequence is required.");
            return response;
        }
        if (request.getPegCount() != 3 && request.getPegCount() != 4) {
            response.setValid(false);
            response.setMessage("Peg count must be 3 or 4.");
            return response;
        }

        // Parse and validate move sequence
        String[] moves = request.getSequenceOfMoves().trim().split("[ ,]+");
        moves = Arrays.stream(moves).filter(s -> !s.isEmpty()).toArray(String[]::new);
        if (moves.length != request.getNumOfMoves()) {
            response.setValid(false);
            response.setMessage("Number of moves (" + request.getNumOfMoves() + ") does not match sequence length (" + moves.length + ").");
            return response;
        }

        // Validate move format
        Pattern movePattern = request.getPegCount() == 3 ?
                Pattern.compile("^([A-C])(?:→|->|-| to )([A-C])$", Pattern.CASE_INSENSITIVE) :
                Pattern.compile("^([A-D])(?:→|->|-| to )([A-D])$", Pattern.CASE_INSENSITIVE);
        for (String move : moves) {
            Matcher matcher = movePattern.matcher(move);
            if (!matcher.matches()) {
                response.setValid(false);
                response.setMessage("Invalid move format: " + move + ". Use A→C, A->C, A-C, or A to C.");
                return response;
            }
        }

        // Validate move sequence
        String validationError = validateMoveSequence(request.getDiskCount(), moves, request.getPegCount());
        if (validationError != null) {
            response.setValid(false);
            String errorMessage = validationError;
            if (request.getPegCount() == 4) {
                errorMessage += " Note: For 4-peg with 5 disks, the optimal number of moves is around 9.";
            }
            response.setMessage(errorMessage);
            return response;
        }

        // Find or create player
        Player player = playerRepository.findAll().stream()
                .filter(p -> p.getUsername().equals(request.getUsername()))
                .findFirst()
                .orElse(null);
        if (player == null) {
            player = new Player();
            player.setUsername(request.getUsername());
            player.setRegistrationDate(LocalDateTime.now());
            player.setLastLogin(LocalDateTime.now());
            player = playerRepository.save(player);
        } else {
            player.setLastLogin(LocalDateTime.now());
            playerRepository.save(player);
        }

        // Find game
        Game game = gameRepository.findAll().stream()
                .filter(g -> g.getGameName().equals("Tower of Hanoi"))
                .findFirst()
                .orElse(null);
        if (game == null) {
            game = new Game();
            game.setGameName("Tower of Hanoi");
            game.setDescription("A puzzle to move disks between pegs following specific rules.");
            game = gameRepository.save(game);
        }

        // Save game result
        GameResult gameResult = new GameResult();
        gameResult.setGameId(game.getGameId());
        gameResult.setPlayerId(player.getPlayerId());
        gameResult.setCompletionTimeSeconds(request.getNumOfMoves());
        gameResult.setCreatedAt(LocalDateTime.now());
        gameResult = gameResultRepository.save(gameResult);

        // Save Tower of Hanoi result
        TowerOfHanoiResult tohResult = new TowerOfHanoiResult();
        tohResult.setResultId(gameResult.getResultId());
        tohResult.setNumOfMoves(request.getNumOfMoves());
        tohResult.setSequenceOfMoves(request.getSequenceOfMoves());
        towerOfHanoiResultRepository.save(tohResult);

        // Measure algorithm performance
        if (request.getPegCount() == 3) {
            long recursive3PegTime = measureRecursive3Peg(request.getDiskCount());
            long iterative3PegTime = measureIterative3Peg(request.getDiskCount());
            savePerformanceMetrics(gameResult, game, "3-Peg Recursive", recursive3PegTime);
            savePerformanceMetrics(gameResult, game, "3-Peg Iterative", iterative3PegTime);
            response.setRecursive3PegTimeMs(recursive3PegTime);
            response.setIterative3PegTimeMs(iterative3PegTime);
        } else {
            long frameStewartTime = measureFrameStewart(request.getDiskCount());
            savePerformanceMetrics(gameResult, game, "4-Peg Frame-Stewart", frameStewartTime);
            response.setFrameStewartTimeMs(frameStewartTime);
        }

        response.setValid(true);
        response.setMessage("Solution submitted successfully!");
        return response;
    }

    public AutoSolveResponse getAutoSolveSequence(AutoSolveRequest request) {
        AutoSolveResponse response = new AutoSolveResponse();

        if (request.getDiskCount() < 5 || request.getDiskCount() > 10) {
            response.setValid(false);
            response.setMessage("Disk count must be between 5 and 10.");
            return response;
        }
        if (request.getPegCount() != 3 && request.getPegCount() != 4) {
            response.setValid(false);
            response.setMessage("Peg count must be 3 or 4.");
            return response;
        }

        List<String> moves = new ArrayList<>();
        if (request.getPegCount() == 3) {
            solve3PegRecursive(request.getDiskCount(), 0, 2, 1, moves);
        } else {
            solve4PegFrameStewart(request.getDiskCount(), 0, 3, 1, 2, moves);
        }

        response.setValid(true);
        response.setNumOfMoves(moves.size());
        response.setSequenceOfMoves(String.join(",", moves));
        response.setMessage("Auto-solve sequence generated successfully!");
        return response;
    }

    public PerformanceMetricsResponse getPerformanceMetrics(int rounds) {
        PerformanceMetricsResponse response = new PerformanceMetricsResponse();
        Map<String, Long[]> executionTimes = new HashMap<>();
        Map<String, String> complexityAnalysis = new HashMap<>();

        String[] algorithms = {"3-Peg Recursive", "3-Peg Iterative", "4-Peg Frame-Stewart"};
        for (String algo : algorithms) {
            List<PerformanceMetric> metrics = performanceMetricRepository.findAll().stream()
                    .filter(m -> {
                        Algorithm a = algorithmRepository.findById(m.getAlgorithmId()).orElse(null);
                        return a != null && a.getAlgorithmName().equals(algo);
                    })
                    .sorted((m1, m2) -> m2.getCreatedAt().compareTo(m1.getCreatedAt()))
                    .limit(rounds)
                    .toList();
            Long[] times = new Long[rounds];
            for (int i = 0; i < rounds; i++) {
                times[i] = (i < metrics.size()) ? (long) metrics.get(i).getExecutionTimeMs() : 0L;
            }
            executionTimes.put(algo, times);
        }

        complexityAnalysis.put("3-Peg Recursive", "O(2^n)");
        complexityAnalysis.put("3-Peg Iterative", "O(2^n)");
        complexityAnalysis.put("4-Peg Frame-Stewart", "O(2^sqrt(2n))");

        response.setExecutionTimes(executionTimes);
        response.setComplexityAnalysis(complexityAnalysis);
        return response;
    }

    @Transactional
    public void populateTestMetrics() {
        System.out.println("Starting populateTestMetrics");
        String[] usernames = {"user1", "user2", "user3", "user4", "user5"};
        int[] diskCounts = {5, 6, 7, 8};
        int[] pegCounts = {3, 4};
        int iterationCount = 0;

        for (String username : usernames) {
            for (int diskCount : diskCounts) {
                for (int pegCount : pegCounts) {
                    System.out.println("Iteration " + ++iterationCount + ": username=" + username + ", disks=" + diskCount + ", pegs=" + pegCount);
                    TowerOfHanoiRequest request = new TowerOfHanoiRequest();
                    request.setUsername(username);
                    request.setDiskCount(diskCount);
                    request.setPegCount(pegCount);
                    AutoSolveRequest autoSolveRequest = new AutoSolveRequest();
                    autoSolveRequest.setDiskCount(diskCount);
                    autoSolveRequest.setPegCount(pegCount);
                    AutoSolveResponse autoSolveResponse = getAutoSolveSequence(autoSolveRequest);
                    System.out.println("AutoSolveResponse: valid=" + autoSolveResponse.isValid() + ", moves=" + autoSolveResponse.getNumOfMoves() + ", sequence=" + autoSolveResponse.getSequenceOfMoves());
                    if (autoSolveResponse.isValid()) {
                        request.setSequenceOfMoves(autoSolveResponse.getSequenceOfMoves());
                        request.setNumOfMoves(autoSolveResponse.getNumOfMoves());
                        TowerOfHanoiResponse response = submitSolution(request);
                        System.out.println("SubmitSolution Response: valid=" + response.isValid() + ", message=" + response.getMessage());
                    } else {
                        System.out.println("Skipping invalid auto-solve response");
                    }
                }
            }
        }
        System.out.println("Completed populateTestMetrics with " + iterationCount + " iterations");
    }

    private String validateMoveSequence(int diskCount, String[] moves, int pegCount) {
        List<List<Integer>> poles = new ArrayList<>();
        for (int i = 0; i < pegCount; i++) {
            poles.add(new ArrayList<>());
        }
        for (int i = diskCount; i >= 1; i--) {
            poles.get(0).add(i);
        }

        String pegs = pegCount == 3 ? "ABC" : "ABCD";
        for (int i = 0; i < moves.length; i++) {
            String move = moves[i];
            String[] parts = move.split("→|->|-| to ");
            if (parts.length != 2) {
                return "Invalid move format at move " + (i + 1) + ": " + move;
            }
            int from = pegs.indexOf(parts[0].toUpperCase());
            int to = pegs.indexOf(parts[1].toUpperCase());
            if (from == -1 || to == -1) {
                return "Invalid peg in move " + (i + 1) + ": " + move;
            }

            if (poles.get(from).isEmpty()) {
                return "No disk to move from peg " + parts[0] + " in move " + (i + 1) + ": " + move;
            }

            int disk = poles.get(from).get(poles.get(from).size() - 1);
            if (!poles.get(to).isEmpty() && poles.get(to).get(poles.get(to).size() - 1) < disk) {
                return "Cannot place larger disk " + disk + " on smaller disk on peg " + parts[1] + " in move " + (i + 1) + ": " + move;
            }

            poles.get(from).remove(poles.get(from).size() - 1);
            poles.get(to).add(disk);
        }

        if (poles.get(pegCount - 1).size() != diskCount || !poles.subList(0, pegCount - 1).stream().allMatch(List::isEmpty)) {
            return "Invalid move sequence: Not all disks are on the destination peg.";
        }
        return null;
    }

    private long measureRecursive3Peg(int diskCount) {
        long totalTime = 0;
        int iterations = 1000;
        for (int i = 0; i < iterations; i++) {
            long startTime = System.nanoTime();
            List<String> moves = new ArrayList<>();
            solve3PegRecursive(diskCount, 0, 2, 1, moves);
            long endTime = System.nanoTime();
            totalTime += (endTime - startTime);
        }
        return totalTime / (iterations * 1_000);
    }

    private void solve3PegRecursive(int n, int from, int to, int aux, List<String> moves) {
        if (n == 0) return;
        solve3PegRecursive(n - 1, from, aux, to, moves);
        moves.add("ABCD".charAt(from) + "->" + "ABCD".charAt(to));
        solve3PegRecursive(n - 1, aux, to, from, moves);
    }

    private long measureIterative3Peg(int diskCount) {
        long totalTime = 0;
        int iterations = 1000;
        for (int i = 0; i < iterations; i++) {
            long startTime = System.nanoTime();
            List<String> moves = solve3PegIterative(diskCount);
            long endTime = System.nanoTime();
            totalTime += (endTime - startTime);
        }
        return totalTime / (iterations * 1_000);
    }

    private List<String> solve3PegIterative(int diskCount) {
        List<String> moves = new ArrayList<>();
        int totalMoves = (1 << diskCount) - 1;
        List<List<Integer>> poles = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            poles.add(new ArrayList<>());
        }
        for (int i = diskCount; i >= 1; i--) {
            poles.get(0).add(i);
        }

        for (int i = 1; i <= totalMoves; i++) {
            if (i % 2 == 1) {
                int from = 0, to = diskCount % 2 == 0 ? 1 : 2;
                if (!poles.get(from).isEmpty() && (poles.get(to).isEmpty() || poles.get(to).get(poles.get(to).size() - 1) > 1)) {
                    poles.get(to).add(poles.get(from).remove(poles.get(from).size() - 1));
                    moves.add("A->" + (to == 1 ? "B" : "C"));
                } else {
                    from = to;
                    to = 0;
                    poles.get(to).add(poles.get(from).remove(poles.get(from).size() - 1));
                    moves.add((from == 1 ? "B" : "C") + "->A");
                }
            } else {
                int from = -1, to = -1;
                for (int j = 0; j < 3; j++) {
                    if (!poles.get(j).isEmpty() && poles.get(j).get(poles.get(j).size() - 1) != 1) {
                        from = j;
                        break;
                    }
                }
                if (from != -1) {
                    for (int j = 0; j < 3; j++) {
                        if (j != from && (poles.get(j).isEmpty() || poles.get(j).get(poles.get(j).size() - 1) > poles.get(from).get(poles.get(from).size() - 1))) {
                            to = j;
                            break;
                        }
                    }
                    if (to != -1) {
                        poles.get(to).add(poles.get(from).remove(poles.get(from).size() - 1));
                        moves.add("ABC".charAt(from) + "->" + "ABC".charAt(to));
                    }
                }
            }
        }
        return moves;
    }

    private long measureFrameStewart(int diskCount) {
        long totalTime = 0;
        int iterations = 1000;
        for (int i = 0; i < iterations; i++) {
            long startTime = System.nanoTime();
            List<String> moves = new ArrayList<>();
            solve4PegFrameStewart(diskCount, 0, 3, 1, 2, moves);
            long endTime = System.nanoTime();
            totalTime += (endTime - startTime);
        }
        return totalTime / (iterations * 1_000);
    }

    private void solve4PegFrameStewart(int n, int from, int to, int aux1, int aux2, List<String> moves) {
        if (n == 0) return;
        if (n == 1) {
            moves.add("ABCD".charAt(from) + "->" + "ABCD".charAt(to));
            return;
        }

        if (n > 15) {
            throw new IllegalArgumentException("Disk count too large for recursive solution");
        }

        int k = (int) (Math.sqrt(2 * n + 1) - 1);
        solve4PegFrameStewart(n - k, from, aux1, aux2, to, moves);
        solve3PegRecursive(k, from, to, aux2, moves);
        solve4PegFrameStewart(n - k, aux1, to, from, aux2, moves);
    }

//    private void savePerformanceMetrics(GameResult gameResult, Game game, String algorithmName, long executionTime) {
//        Algorithm algorithm = algorithmRepository.findAll().stream()
//                .filter(a -> a.getGameId() == game.getGameId() && a.getAlgorithmName().equals(algorithmName))
//                .findFirst()
//                .orElse(null);
//        if (algorithm == null) {
//            algorithm = new Algorithm();
//            algorithm.setGameId(game.getGameId());
//            algorithm.setAlgorithmName(algorithmName);
//            algorithm.setDescription(algorithmName + " algorithm for Tower of Hanoi.");
//            algorithm.setComplexityAnalysis(algorithmName.contains("Frame-Stewart") ? "O(2^sqrt(2n))" : "O(2^n)");
//            algorithm = algorithmRepository.save(algorithm);
//        }
//
//        PerformanceMetric metrics = new PerformanceMetric();
//        metrics.setResultId(gameResult.getResultId());
//        metrics.setAlgorithmId(algorithm.getAlgorithmId());
//        metrics.setExecutionTimeMs((int) executionTime);
//        metrics.setMemoryUsageKb(0);
//        metrics.setCreatedAt(LocalDateTime.now());
//        performanceMetricRepository.save(metrics);
//    }

    private void savePerformanceMetrics(GameResult gameResult, Game game, String algorithmName, long executionTime) {
        Algorithm algorithm = algorithmRepository.findAll().stream()
                .filter(a -> a.getGameId() == game.getGameId() && a.getAlgorithmName().equals(algorithmName))
                .findFirst()
                .orElse(null);
        if (algorithm == null) {
            algorithm = new Algorithm();
            algorithm.setGameId(game.getGameId());
            algorithm.setAlgorithmName(algorithmName);
            algorithm.setDescription(algorithmName + " algorithm for Tower of Hanoi.");
            algorithm.setComplexityAnalysis(algorithmName.contains("Frame-Stewart") ? "O(2^sqrt(2n))" : "O(2^n)");
            algorithm = algorithmRepository.save(algorithm);
        }

        PerformanceMetric metrics = new PerformanceMetric();
        metrics.setResultId(gameResult.getResultId());
        metrics.setAlgorithmId(algorithm.getAlgorithmId());
        metrics.setExecutionTimeMs((int) executionTime);
        metrics.setMemoryUsageKb(0);
        metrics.setCreatedAt(LocalDateTime.now());
        performanceMetricRepository.save(metrics);
    }

}