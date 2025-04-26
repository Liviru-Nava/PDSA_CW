package com.example.pdsa_backend.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

import java.util.List;

public interface GameResultRepository extends JpaRepository<GameResult, Integer> {

    @Query("SELECT g.resultId FROM GameResult g WHERE g.playerId = :playerId AND g.gameId = :gameId ORDER BY g.resultId DESC LIMIT 1")
    int getResultIdByPlayerId(@Param("playerId") int playerId, @Param("gameId") int gameId);

    Optional<GameResult> findTopByPlayerIdAndGameIdOrderByResultIdDesc(int playerId, int gameId);

    List<GameResult> findByPlayerIdOrderByCreatedAtDesc(int playerId);
  
}
