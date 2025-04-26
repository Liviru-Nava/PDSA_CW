package com.example.pdsa_backend.data;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameResultRepository extends JpaRepository<GameResult, Integer> {
    List<GameResult> findByPlayerIdOrderByCreatedAtDesc(int playerId);
}
