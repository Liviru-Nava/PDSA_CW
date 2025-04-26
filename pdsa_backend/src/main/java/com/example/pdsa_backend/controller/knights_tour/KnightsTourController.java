package com.example.pdsa_backend.controller.knights_tour;

import com.example.pdsa_backend.dto.knights_tour.*;
import com.example.pdsa_backend.exception.knights_tour.AlgorithmExecutionException;
import com.example.pdsa_backend.exception.knights_tour.InvalidParameterException;
import com.example.pdsa_backend.service.knights_tour.KnightsTourService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/knights-tour")
@CrossOrigin(origins = "http://localhost:5173")
@Validated
public class KnightsTourController {
    private static final Logger logger = LoggerFactory.getLogger(KnightsTourController.class);

    private final KnightsTourService ktService;

    @Autowired
    public KnightsTourController(KnightsTourService ktService) {
        this.ktService = ktService;
    }

    /**
     * Solve a single Knight's Tour
     *
     * @param request the request body containing board size, starting position, and algorithm
     * @return the solution data
     */
    @PostMapping("/solve")
    public ResponseEntity<KTSolution> solve(@RequestBody KTRequest request) {
        logger.info("Received request to solve Knight's Tour: {}", request);

        KTSolution solution = ktService.generateKnightSolution(
                request.getBoardSize(),
                request.getStartX(),
                request.getStartY(),
                request.getAlgorithm()
        );



        if (solution.getErrorMessage() != null && !solution.isSolutionFound()){
            HttpHeaders headers = new HttpHeaders();
            headers.add("X-Error-Type", "no-solution-found");
            headers.add("Access-Control-Expose-Headers", "X-Error-Type");
            return new ResponseEntity<>(solution, headers,HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return ResponseEntity.ok(solution);
    }

    /**
     * Save player game results
     *
     * @param gameResult the game result data from the player
     * @return success response with the saved game result
     */
    @PostMapping("/save-result")
    public ResponseEntity<Map<String, Object>> saveGameResult(@RequestBody PlayerGameResult gameResult) {
        logger.info("Received request to save game result: {}", gameResult);

        try {
            // Validate input
            if (gameResult.getUsername() == null || gameResult.getUsername().trim().isEmpty()) {
                throw new InvalidParameterException("Username cannot be empty");
            }

            if (gameResult.getBoardSize() < 5 || gameResult.getBoardSize() > 8) {
                throw new InvalidParameterException("Board size must be between 5 and 8");
            }

            if (gameResult.getBoard() == null || gameResult.getBoard().length != gameResult.getBoardSize() ||
                    gameResult.getBoard()[0].length != gameResult.getBoardSize()) {
                throw new InvalidParameterException("Invalid board dimensions");
            }

            // Save game result using service
            PlayerGameResult savedResult = ktService.saveGameResult(gameResult);

            // Return success response
            Map<String, Object> response = Map.of(
                    "success", true,
                    "message", "Game result saved successfully",
                    "gameResult", savedResult
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error saving game result: {}", e.getMessage(), e);
            throw e; // Will be caught by exception handlers below
        }
    }

    /**
     * Get performance metrics for the latest Knight's Tour games played by a user
     *
     * @param username the username of the player
     * @return list of algorithm metrics for the latest games
     */
    @GetMapping("/metrics/{username}")
    public ResponseEntity<?> getPlayerMetrics(@PathVariable String username) {
        logger.info("Received request to get metrics for player: {}", username);

        try {
            List<AlgorithmsMetric> metrics = ktService.getPlayerAlgorithmMetrics(username);
            if (metrics.isEmpty()) {
                return ResponseEntity.ok().body(new HashMap<String, String>() {{
                    put("message", "No game results found for this player");
                }});
            }
            return ResponseEntity.ok().body(metrics);
        } catch (IllegalArgumentException e) {
            logger.error("Error getting metrics for player {}: {}", username, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new HashMap<String, String>() {{
                put("error", e.getMessage());
            }});
        } catch (Exception e) {
            logger.error("Error getting metrics for player {}: {}", username, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HashMap<String, String>() {{
                put("error", "Sorry, we could not find any resources");
            }});
        }
    }

    /**
     * Handle validation exceptions
     */
    @ExceptionHandler(InvalidParameterException.class)
    public ResponseEntity<ErrorResponse> handleInvalidParameterException(InvalidParameterException e) {
        logger.warn("Invalid parameters in request: {}", e.getMessage());
        ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid parameters",
                e.getMessage()
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle algorithm execution exceptions
     */
    @ExceptionHandler(AlgorithmExecutionException.class)
    public ResponseEntity<ErrorResponse> handleAlgorithmExecutionException(AlgorithmExecutionException e) {
        logger.error("Algorithm execution error: {}", e.getMessage(), e);
        ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Algorithm execution failed",
                e.getMessage()
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle all other exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        logger.error("Unexpected error: {}", e.getMessage(), e);
        ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Unexpected error",
                "An unexpected error occurred. Please try again later."
        );

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}