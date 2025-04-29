package com.example.pdsa_backend.controller.tohcontroller;

import com.example.pdsa_backend.dto.towerofhanoidto.*;
import com.example.pdsa_backend.service.tohservice.TowerOfHanoiService;
//import jakarta.validation.Valid;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/tower-of-hanoi")
public class TohController {

    @Autowired
    private TowerOfHanoiService towerOfHanoiService;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Test endpoint works");
    }

    @PostMapping("/submit")
    public ResponseEntity<TowerOfHanoiResponse> submitSolution(@Valid @RequestBody TowerOfHanoiRequest request) {
        TowerOfHanoiResponse response = towerOfHanoiService.submitSolution(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/performance-metrics")
    public ResponseEntity<PerformanceMetricsResponse> getPerformanceMetrics(
            @RequestParam(value = "rounds", defaultValue = "10") int rounds) {
        if (rounds < 1) {
            return ResponseEntity.badRequest().body(new PerformanceMetricsResponse());
        }
        PerformanceMetricsResponse response = towerOfHanoiService.getPerformanceMetrics(rounds);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auto-solve")
    public ResponseEntity<AutoSolveResponse> getAutoSolveSequence(@Valid @RequestBody AutoSolveRequest request) {
        AutoSolveResponse response = towerOfHanoiService.getAutoSolveSequence(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/algorithm-results")
    public ResponseEntity<AlgorithmResultsResponse> getAlgorithmResults(@Valid @RequestBody AutoSolveRequest request) {
        AlgorithmResultsResponse response = towerOfHanoiService.getAlgorithmResults(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/test-populate-metrics")
    public ResponseEntity<String> populateTestMetrics() {
        towerOfHanoiService.populateTestMetrics();
        return ResponseEntity.ok("Test metrics populated");
    }
}