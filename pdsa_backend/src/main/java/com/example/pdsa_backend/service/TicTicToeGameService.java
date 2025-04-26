package com.example.pdsa_backend.service;

import com.example.pdsa_backend.data.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TicTicToeGameService {

    @Autowired
    private PlayerRepository playerRepo;

    @Autowired
    private AlgorithmRepository algorithmRepo;

    @Autowired
    private GameResultRepository gameResultRepo;

    @Autowired
    private PerformanceMetricRepository performanceRepo;

    @Autowired
    private TicTacToeResultRepository ticTacToeResultRepo;

    public Player createNewUser(String username){
        Player player = new Player();
        player.setUsername(username);
        player.setRegistrationDate(LocalDateTime.now());
        player.setLastLogin(LocalDateTime.now());
        return playerRepo.save(player);
    }

    public Player getPlayerByUsername(String username){
        Optional<Player> playerOptional = playerRepo.findByUsername(username);
        return playerOptional.orElse(null);
    }

    public void setLastLoginTime(String username){
        playerRepo.setLastLoginByUsername(username, LocalDateTime.now());
    }

    public List<Algorithm> getTicTacToeAlgorithms(int gameid){
        return algorithmRepo.getTicTacToeGameAlgorithms(gameid);
    }

//    public Algorithm createAlgorithm(int gameId, String algorithmName){
//        Algorithm algo = new Algorithm();
//        algo.setGameId(gameId);
//        algo.setAlgorithmName(algorithmName);
//        return algorithmRepo.save(algo);
//    }


    public GameResult createGameResult(int gameid, int playerid, int completetime){
        GameResult game = new GameResult();
        game.setGameId(gameid);
        game.setPlayerId(playerid);
        game.setCompletionTimeSeconds(completetime);
        game.setCreatedAt(LocalDateTime.now());
        return gameResultRepo.save(game);
    }

    public int getUserId(String username){
        return playerRepo.getPlayerIdByUsername(username);
    }

    public int getAlgorithmId(String algorithmName){
        return algorithmRepo.getAlgorithumIdByGameId(algorithmName);
    }

    public int getResultId(int playerId, int gameId){
        return gameResultRepo.getResultIdByPlayerId(playerId, gameId);
    }

    public void createPerformanceMetrics(int resultId, int algorithmId, int executionTime){
        PerformanceMetric performance = new PerformanceMetric();
        performance.setResultId(resultId);
        performance.setAlgorithmId(algorithmId);
        performance.setExecutionTimeMs(executionTime);
        performance.setCreatedAt(LocalDateTime.now());
        performanceRepo.save(performance);
    }

    public void createTicTacToeResult(int resultId, String boardState){
        TicTacToeResult ticTacToe = new TicTacToeResult();
        ticTacToe.setResultId(resultId);
        ticTacToe.setBoardState(boardState);
        ticTacToeResultRepo.save(ticTacToe);
    }


}
