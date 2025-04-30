package com.example.pdsa_backend.controller;


import com.example.pdsa_backend.dto.eightqueens.*;
import com.example.pdsa_backend.service.EightQueensService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/eightqueens")
public class EightQueensController {

    @Autowired
    private EightQueensService eightQueensService;

    /**
     * Create a new player.
     */
    @PostMapping("/players")
    public ResponseEntity<PlayerResponseDTO> createPlayer(@RequestBody PlayerRequestDTO request) {
        PlayerResponseDTO response = eightQueensService.createPlayer(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Submit a user solution.
     */
    @PostMapping("/solutions")
    public ResponseEntity<SolutionResponseDTO> submitSolution(@RequestBody SolutionRequestDTO request) {
        String message = eightQueensService.submitSolution(request);
        SolutionResponseDTO response = new SolutionResponseDTO();
        response.setMessage(message);
        return ResponseEntity.ok(response);
    }

    /**
     * Initialize solutions using Sequential Backtracking.
     */
    @PostMapping("/compute/sequential/{gameId}/{algorithmId}")
    public ResponseEntity<String> computeSequential(@PathVariable int gameId, @PathVariable int algorithmId) {
        eightQueensService.computeSolutionsSequential(gameId, algorithmId);
        return ResponseEntity.ok("Sequential solutions computed successfully.");
    }

    /**
     * Initialize solutions using Threaded Backtracking.
     */
    @PostMapping("/compute/threaded/{gameId}/{algorithmId}")
    public ResponseEntity<String> computeThreaded(@PathVariable int gameId, @PathVariable int algorithmId) {
        eightQueensService.computeSolutionsThreaded(gameId, algorithmId);
        return ResponseEntity.ok("Threaded solutions computed successfully.");
    }

    /**
     * Run algorithm for report (e.g., 10 runs).
     */
    @PostMapping("/compute/report")
    public ResponseEntity<String> computeForReport(@RequestBody ReportRequestDTO request) {
        eightQueensService.computeSolutionsForReport(
                request.getGameId(),
                request.getAlgorithmType().equals("Sequential") ? 9 : 10,
                request.getAlgorithmType(),
                request.getRuns()
        );
        return ResponseEntity.ok("Report computation completed for " + request.getAlgorithmType());
    }

    /**
     * Get a random solution for the game.
     */
    @GetMapping("/solutions/random/{gameId}")
    public ResponseEntity<RandomSolutionResponseDTO> getRandomSolution(@PathVariable int gameId) {
        RandomSolutionResponseDTO response = eightQueensService.getRandomSolution(gameId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get average execution times for both algorithms for the report chart.
     */
    @GetMapping("/report/average")
    public ResponseEntity<AverageReportResponseDTO> getAverageReportData() {
        AverageReportResponseDTO response = eightQueensService.getAverageReportData();
        return ResponseEntity.ok(response);
    }
}
