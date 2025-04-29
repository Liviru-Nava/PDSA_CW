package com.example.pdsa_backend.service.tohservice;

import com.example.pdsa_backend.data.*;
import com.example.pdsa_backend.data.towerofhanoidata.TowerOfHanoiResult;
import com.example.pdsa_backend.data.towerofhanoidata.TowerOfHanoiResultRepository;
import com.example.pdsa_backend.dto.towerofhanoidto.*;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TowerOfHanoiService {

    private static final Logger logger = LoggerFactory.getLogger(TowerOfHanoiService.class);

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

        // Measure algorithm performance and include results
        Map<String, AlgorithmResultsResponse.AlgorithmResult> algorithmResults = new HashMap<>();
        if (request.getPegCount() == 3) {
            long recursive3PegTime = measureRecursive3Peg(request.getDiskCount());
            long iterative3PegTime = measureIterative3Peg(request.getDiskCount());
            savePerformanceMetrics(gameResult, game, "3-Peg Recursive", recursive3PegTime);
            savePerformanceMetrics(gameResult, game, "3-Peg Iterative", iterative3PegTime);
            response.setRecursive3PegTimeMs(recursive3PegTime);
            response.setIterative3PegTimeMs(iterative3PegTime);

            List<String> recursiveMoves = new ArrayList<>();
            solve3PegRecursive(request.getDiskCount(), 0, 2, 1, recursiveMoves, "ABC");
            AlgorithmResultsResponse.AlgorithmResult recursiveResult = new AlgorithmResultsResponse.AlgorithmResult();
            recursiveResult.setNumOfMoves(recursiveMoves.size());
            recursiveResult.setSequenceOfMoves(String.join(",", recursiveMoves));
            recursiveResult.setExecutionTimeMs(recursive3PegTime);
            algorithmResults.put("3-Peg Recursive", recursiveResult);

            List<String> iterativeMoves = solve3PegIterative(request.getDiskCount());
            AlgorithmResultsResponse.AlgorithmResult iterativeResult = new AlgorithmResultsResponse.AlgorithmResult();
            iterativeResult.setNumOfMoves(iterativeMoves.size());
            iterativeResult.setSequenceOfMoves(String.join(",", iterativeMoves));
            iterativeResult.setExecutionTimeMs(iterative3PegTime);
            algorithmResults.put("3-Peg Iterative", iterativeResult);
        } else {
            long frameStewartTime = measureFrameStewart(request.getDiskCount());
            savePerformanceMetrics(gameResult, game, "4-Peg Frame-Stewart", frameStewartTime);
            response.setFrameStewartTimeMs(frameStewartTime);

            List<String> frameStewartMoves = new ArrayList<>();
            solve4PegFrameStewart(request.getDiskCount(), 0, 3, 1, 2, frameStewartMoves);
            AlgorithmResultsResponse.AlgorithmResult frameStewartResult = new AlgorithmResultsResponse.AlgorithmResult();
            frameStewartResult.setNumOfMoves(frameStewartMoves.size());
            frameStewartResult.setSequenceOfMoves(String.join(",", frameStewartMoves));
            frameStewartResult.setExecutionTimeMs(frameStewartTime);
            algorithmResults.put("4-Peg Frame-Stewart", frameStewartResult);
        }
        response.setAlgorithmResults(algorithmResults);

        response.setValid(true);
        response.setMessage("Solution submitted successfully! You won! Check algorithm results for optimal solutions.");
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
        long executionTime;
        try {
            if (request.getPegCount() == 3) {
                executionTime = measureRecursive3Peg(request.getDiskCount());
                solve3PegRecursive(request.getDiskCount(), 0, 2, 1, moves, "ABC");
            } else {
                executionTime = measureFrameStewart(request.getDiskCount());
                solve4PegFrameStewart(request.getDiskCount(), 0, 3, 1, 2, moves);
            }

            // Validate move sequence
            String validationError = validateMoveSequence(request.getDiskCount(), moves.toArray(new String[0]), request.getPegCount());
            if (validationError != null) {
                logger.error("Invalid move sequence generated: {}", validationError);
                response.setValid(false);
                response.setMessage("Generated move sequence is invalid: " + validationError);
                return response;
            }

            response.setValid(true);
            response.setNumOfMoves(moves.size());
            response.setSequenceOfMoves(String.join(",", moves));
            response.setMessage("Auto-solve sequence generated successfully!");
            response.setExecutionTimeMs(executionTime);
        } catch (Exception e) {
            logger.error("Error generating auto-solve sequence for diskCount={}, pegCount={}: {}",
                    request.getDiskCount(), request.getPegCount(), e.getMessage(), e);
            response.setValid(false);
            response.setMessage("Failed to generate auto-solve sequence: " + e.getMessage());
        }
        return response;
    }

    public AlgorithmResultsResponse getAlgorithmResults(AutoSolveRequest request) {
        AlgorithmResultsResponse response = new AlgorithmResultsResponse();

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

        Map<String, AlgorithmResultsResponse.AlgorithmResult> algorithmResults = new HashMap<>();
        if (request.getPegCount() == 3) {
            // Recursive
            List<String> recursiveMoves = new ArrayList<>();
            long recursiveTime = measureRecursive3Peg(request.getDiskCount());
            solve3PegRecursive(request.getDiskCount(), 0, 2, 1, recursiveMoves, "ABC");
            AlgorithmResultsResponse.AlgorithmResult recursiveResult = new AlgorithmResultsResponse.AlgorithmResult();
            recursiveResult.setNumOfMoves(recursiveMoves.size());
            recursiveResult.setSequenceOfMoves(String.join(",", recursiveMoves));
            recursiveResult.setExecutionTimeMs(recursiveTime);
            algorithmResults.put("3-Peg Recursive", recursiveResult);

            // Iterative
            List<String> iterativeMoves = solve3PegIterative(request.getDiskCount());
            long iterativeTime = measureIterative3Peg(request.getDiskCount());
            AlgorithmResultsResponse.AlgorithmResult iterativeResult = new AlgorithmResultsResponse.AlgorithmResult();
            iterativeResult.setNumOfMoves(iterativeMoves.size());
            iterativeResult.setSequenceOfMoves(String.join(",", iterativeMoves));
            iterativeResult.setExecutionTimeMs(iterativeTime);
            algorithmResults.put("3-Peg Iterative", iterativeResult);
        } else {
            // Frame-Stewart
            List<String> frameStewartMoves = new ArrayList<>();
            long frameStewartTime = measureFrameStewart(request.getDiskCount());
            solve4PegFrameStewart(request.getDiskCount(), 0, 3, 1, 2, frameStewartMoves);
            AlgorithmResultsResponse.AlgorithmResult frameStewartResult = new AlgorithmResultsResponse.AlgorithmResult();
            frameStewartResult.setNumOfMoves(frameStewartMoves.size());
            frameStewartResult.setSequenceOfMoves(String.join(",", frameStewartMoves));
            frameStewartResult.setExecutionTimeMs(frameStewartTime);
            algorithmResults.put("4-Peg Frame-Stewart", frameStewartResult);
        }

        response.setValid(true);
        response.setMessage("Algorithm results generated successfully!");
        response.setAlgorithmResults(algorithmResults);
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
        logger.info("Starting populateTestMetrics");
        String[] usernames = {"user1", "user2", "user3", "user4", "user5"};
        int[] diskCounts = {5, 6, 7, 8};
        int[] pegCounts = {3, 4};
        int iterationCount = 0;

        for (String username : usernames) {
            for (int diskCount : diskCounts) {
                for (int pegCount : pegCounts) {
                    logger.info("Iteration {}: username={}, disks={}, pegs={}", ++iterationCount, username, diskCount, pegCount);
                    TowerOfHanoiRequest request = new TowerOfHanoiRequest();
                    request.setUsername(username);
                    request.setDiskCount(diskCount);
                    request.setPegCount(pegCount);
                    AutoSolveRequest autoSolveRequest = new AutoSolveRequest();
                    autoSolveRequest.setDiskCount(diskCount);
                    autoSolveRequest.setPegCount(pegCount);
                    AutoSolveResponse autoSolveResponse = getAutoSolveSequence(autoSolveRequest);
                    logger.info("AutoSolveResponse: valid={}, moves={}, sequence={}",
                            autoSolveResponse.isValid(), autoSolveResponse.getNumOfMoves(), autoSolveResponse.getSequenceOfMoves());
                    if (autoSolveResponse.isValid()) {
                        request.setSequenceOfMoves(autoSolveResponse.getSequenceOfMoves());
                        request.setNumOfMoves(autoSolveResponse.getNumOfMoves());
                        TowerOfHanoiResponse response = submitSolution(request);
                        logger.info("SubmitSolution Response: valid={}, message={}", response.isValid(), response.getMessage());
                    } else {
                        logger.warn("Skipping invalid auto-solve response");
                    }
                }
            }
        }
        logger.info("Completed populateTestMetrics with {} iterations", iterationCount);
    }

    private String validateMoveSequence(int diskCount, String[] moves, int pegCount) {
        // Enforce minimum moves for 3-peg
        if (pegCount == 3 && moves.length < (1 << diskCount) - 1) {
            return "Invalid move sequence: Too few moves (" + moves.length + ") for " + diskCount + " disks. Minimum is " + ((1 << diskCount) - 1) + ".";
        }

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
            solve3PegRecursive(diskCount, 0, 2, 1, moves, "ABC");
            long endTime = System.nanoTime();
            totalTime += (endTime - startTime);
        }
        return totalTime / (iterations * 1_000);
    }

    private void solve3PegRecursive(int n, int from, int to, int aux, List<String> moves, String pegLabels) {
        if (n == 0) return;
        if (from < 0 || from >= pegLabels.length() || to < 0 || to >= pegLabels.length() || aux < 0 || aux >= pegLabels.length()) {
            throw new IllegalArgumentException("Invalid peg index: from=" + from + ", to=" + to + ", aux=" + aux + ", pegLabels=" + pegLabels);
        }
        solve3PegRecursive(n - 1, from, aux, to, moves, pegLabels);
        String move = pegLabels.charAt(from) + "->" + pegLabels.charAt(to);
        moves.add(move);
        logger.debug("3-Peg move: {}", move);
        solve3PegRecursive(n - 1, aux, to, from, moves, pegLabels);
    }

    //    private long measureIterative3Peg(int diskCount) {
//        long totalTime = 0;
//        int iterations = 1000;
//        for (int i = 0; i < iterations; i++) {
//            long startTime = System.nanoTime();
//            List<String> moves = solve3PegIterative(diskCount);
//            long endTime = System.nanoTime();
//            totalTime += (endTime - startTime);
//        }
//        return totalTime / (iterations * 1_000);
//    }
    private long measureIterative3Peg(int diskCount) {
        long totalTime = 0;
        int iterations = 1000;
        for (int i = 0; i < iterations; i++) {
            long startTime = System.nanoTime();
            List<String> moves = solve3PegIterative(diskCount); // Uses optimized version
            long endTime = System.nanoTime();
            totalTime += (endTime - startTime);
        }
        return totalTime / (iterations * 1_000);
    }
//    private List<String> solve3PegIterative(int diskCount) {
//        List<String> moves = new ArrayList<>();
//        int totalMoves = (1 << diskCount) - 1; // 2^n - 1
//        List<List<Integer>> poles = new ArrayList<>();
//        for (int i = 0; i < 3; i++) {
//            poles.add(new ArrayList<>());
//        }
//        for (int i = diskCount; i >= 1; i--) {
//            poles.get(0).add(i); // Initialize source peg A with disks
//        }
//
//        // For odd disk count, smallest disk moves A->C->B->A (counterclockwise).
//        // For even disk count, smallest disk moves A->B->C->A (clockwise).
//        boolean isOdd = diskCount % 2 == 1;
//        for (int i = 1; i <= totalMoves; i++) {
//            if (i % 2 == 1) {
//                // Move smallest disk (disk 1)
//                int from = -1, to = -1;
//                for (int j = 0; j < 3; j++) {
//                    if (!poles.get(j).isEmpty() && poles.get(j).get(poles.get(j).size() - 1) == 1) {
//                        from = j;
//                        break;
//                    }
//                }
//                if (isOdd) {
//                    to = (from + 1) % 3; // A->C, C->B, B->A
//                } else {
//                    to = (from + 2) % 3; // A->B, B->C, C->A
//                }
//                poles.get(to).add(poles.get(from).remove(poles.get(from).size() - 1));
//                moves.add("ABC".charAt(from) + "->" + "ABC".charAt(to));
//            } else {
//                // Move another disk (between the other two pegs)
//                int smallestDiskPeg = -1;
//                for (int j = 0; j < 3; j++) {
//                    if (!poles.get(j).isEmpty() && poles.get(j).get(poles.get(j).size() - 1) == 1) {
//                        smallestDiskPeg = j;
//                        break;
//                    }
//                }
//                int peg1 = (smallestDiskPeg + 1) % 3;
//                int peg2 = (smallestDiskPeg + 2) % 3;
//                // Choose source and destination based on disk sizes
//                int from = -1, to = -1;
//                if (poles.get(peg1).isEmpty()) {
//                    from = peg2;
//                    to = peg1;
//                } else if (poles.get(peg2).isEmpty()) {
//                    from = peg1;
//                    to = peg2;
//                } else {
//                    int disk1 = poles.get(peg1).get(poles.get(peg1).size() - 1);
//                    int disk2 = poles.get(peg2).get(poles.get(peg2).size() - 1);
//                    if (disk1 < disk2) {
//                        from = peg1;
//                        to = peg2;
//                    } else {
//                        from = peg2;
//                        to = peg1;
//                    }
//                }
//                if (from != -1 && to != -1) {
//                    poles.get(to).add(poles.get(from).remove(poles.get(from).size() - 1));
//                    moves.add("ABC".charAt(from) + "->" + "ABC".charAt(to));
//                }
//            }
//        }
//        return moves;
//    }

    private List<String> solve3PegIterative(int diskCount) {
        List<String> moves = new ArrayList<>();
        int totalMoves = (1 << diskCount) - 1; // 2^n - 1
        String pegs = "ABC";

        for (int i = 1; i <= totalMoves; i++) {
            // Find the disk to move (smallest disk moves every odd move)
            int disk = 0;
            int moveNumber = i;
            while ((moveNumber & 1) == 0) {
                disk++;
                moveNumber >>= 1;
            }
            // For disk d, move direction depends on parity of (d + diskCount)
            int from, to;
            if ((disk + diskCount) % 2 == 0) {
                // Clockwise: A->B, B->C, C->A
                from = (disk % 3);
                to = ((disk + 1) % 3);
            } else {
                // Counterclockwise: A->C, C->B, B->A
                from = (disk % 3);
                to = ((disk + 2) % 3);
            }
            moves.add(pegs.charAt(from) + "->" + pegs.charAt(to));
        }
        return moves;
    }

    private long measureFrameStewart(int diskCount) {
        long totalTime = 0;
        int iterations = 1000;
        for (int i = 0; i < iterations; i++) {
            long startTime = System.nanoTime();
            List<String> moves = new ArrayList<>();
            try {
                solve4PegFrameStewart(diskCount, 0, 3, 1, 2, moves);
            } catch (Exception e) {
                logger.error("Error in solve4PegFrameStewart for diskCount={}: {}", diskCount, e.getMessage(), e);
                throw e;
            }
            long endTime = System.nanoTime();
            totalTime += (endTime - startTime);
        }
        return totalTime / (iterations * 1_000);
    }

    private void solve4PegFrameStewart(int n, int from, int to, int aux1, int aux2, List<String> moves) {
        logger.debug("solve4PegFrameStewart: n={}, from={}, to={}, aux1={}, aux2={}", n, from, to, aux1, aux2);
        if (n == 0) {
            return;
        }
        if (n == 1) {
            String move = "ABCD".charAt(from) + "->" + "ABCD".charAt(to);
            moves.add(move);
            logger.debug("Added move: {}", move);
            return;
        }

        // Validate peg indices
        if (from < 0 || from > 3 || to < 0 || to > 3 || aux1 < 0 || aux1 > 3 || aux2 < 0 || aux2 > 3) {
            throw new IllegalArgumentException("Invalid peg index: from=" + from + ", to=" + to + ", aux1=" + aux1 + ", aux2=" + aux2);
        }

        // Optimized k calculation
        int k = Math.max(1, (int) Math.round(Math.sqrt(2 * n))); // Ensure k is at least 1
        if (k >= n) {
            k = n - 1; // Prevent invalid recursion
        }
        logger.debug("Calculated k={} for n={}", k, n);

        if (k < 0 || k > n) {
            throw new IllegalStateException("Invalid k value: " + k + " for diskCount: " + n);
        }

        try {
            // Move n-k disks to aux1 using all 4 pegs
            solve4PegFrameStewart(n - k, from, aux1, aux2, to, moves);
            // Map 4-peg indices to 3-peg indices for solve3PegRecursive
            int[] pegMapping = new int[4]; // Maps 4-peg indices to 3-peg indices
            pegMapping[from] = 0; // Map 'from' to A
            pegMapping[to] = 1;   // Map 'to' to B
            pegMapping[aux2] = 2; // Map 'aux2' to C
            String pegLabels = "ABCD".substring(from, from + 1) +
                    "ABCD".substring(to, to + 1) +
                    "ABCD".substring(aux2, aux2 + 1);
            logger.debug("3-Peg recursive call: k={}, from={}, to={}, aux2={}, pegLabels={}", k, from, to, aux2, pegLabels);
            // Move k disks using 3 pegs (from, to, aux2)
            solve3PegRecursive(k, 0, 1, 2, moves, pegLabels);
            // Move n-k disks from aux1 to to using all 4 pegs
            solve4PegFrameStewart(n - k, aux1, to, from, aux2, moves);
        } catch (Exception e) {
            logger.error("Error during recursive calls: n={}, k={}, from={}, to={}, aux1={}, aux2={}: {}",
                    n, k, from, to, aux1, aux2, e.getMessage(), e);
            throw e;
        }
    }

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