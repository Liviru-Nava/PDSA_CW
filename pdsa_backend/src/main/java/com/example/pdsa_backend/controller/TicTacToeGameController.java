package com.example.pdsa_backend.controller;

import com.example.pdsa_backend.data.Algorithm;
import com.example.pdsa_backend.data.GameResult;
import com.example.pdsa_backend.data.PerformanceMetric;
import com.example.pdsa_backend.data.Player;
import com.example.pdsa_backend.service.TicTicToeGameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.support.Repositories;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class TicTacToeGameController {

    @Autowired
    private TicTicToeGameService gameService;

    //    {"username":"demo_name_03"} without adding algorithm
    //    {"username":"demo_name_03", "gameid":1, "algo":"minimax"} with adding algorithm
    @PostMapping("/Tic-Tac-Toe")
    public ResponseEntity<?> createPlayer(@RequestBody Map<String, String> requestBody){
        String username = requestBody.get("username");
//        int gameId = Integer.parseInt(requestBody.get("gameid"));
//        String algorithmName = requestBody.get("algo");


        if(username == null || username.trim().isEmpty()){
            Map<String, String> error = new HashMap<>();
            error.put("error", "Username is  required.");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        Player existingPlayer = gameService.getPlayerByUsername(username);
        if(existingPlayer != null ){
            gameService.setLastLoginTime(username);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Username already exists");
            return new ResponseEntity<>(error, HttpStatus.CONFLICT);
        }

        gameService.createNewUser(username);
//        gameService.createAlgorithm(gameId, algorithmName);
        Map<String, String> error = new HashMap<>();
        error.put("error","username registered");
        return new ResponseEntity<>(error, HttpStatus.CREATED);
    }

    @GetMapping("/Tic-Tac-Toe")
    public List<Algorithm> getGameAlgorithms(){
        return gameService.getTicTacToeAlgorithms(1);
    }

//    {"username":"demo_name_01", "completedTime":"15", "executionTime":"30", "algorithmName":"Minimax with Alpha-Beta Pruning", "boardState":"Sample data adding"}
    @PostMapping("/Tic-Tac-Toe/game-end")
    public ResponseEntity<?> createGameResult(@RequestBody Map<String, String> requestBody){
        int completedTime = Integer.parseInt(requestBody.get("completedTime"));
        String username = requestBody.get("username");
        int executionTime = Integer.parseInt(requestBody.get("executionTime"));
        String boardState = requestBody.get("boardState");
        String algorithm = requestBody.get("algorithmName");
        int playerId = gameService.getUserId(username);

        if( username != null && !username.trim().isEmpty() && completedTime != 0){
            GameResult createdGame  = gameService.createGameResult(1,playerId,completedTime);

            int resultId = createdGame.getResultId();
            int algorithmId = gameService.getAlgorithmId(algorithm.trim());
            if(resultId != 0 && algorithmId != 0 && executionTime != 0 ){
                gameService.createPerformanceMetrics(resultId, algorithmId, executionTime);

                if(resultId != 0 && boardState != null){
                    gameService.createTicTacToeResult(resultId, boardState);
                    return ResponseEntity.ok("Player data saved.");
                }else{
                    return new ResponseEntity<>("ResultId or Board State data not added.",HttpStatus.BAD_REQUEST);
                }
            }else{
                return new ResponseEntity<>("ResultId, algorithmId or executionTime data not added.",HttpStatus.BAD_REQUEST);
            }
        }else{
            return new ResponseEntity<>("hello data", HttpStatus.BAD_REQUEST);
        }

//        return new ResponseEntity<>("Data is missing.", HttpStatus.BAD_REQUEST);

    }

}
