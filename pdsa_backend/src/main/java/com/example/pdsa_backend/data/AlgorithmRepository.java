package com.example.pdsa_backend.data;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AlgorithmRepository extends JpaRepository<Algorithm, Integer> {

    @Query("SELECT a FROM Algorithm a WHERE a.gameId = :gameid ")
    List<Algorithm> getTicTacToeGameAlgorithms(@Param("gameid") int gameid);

    @Query("SELECT a.algorithmId FROM Algorithm a WHERE a.algorithmName = :algorithmName")
    int getAlgorithumIdByGameId(@Param("algorithmName") String algorithmName);
}
