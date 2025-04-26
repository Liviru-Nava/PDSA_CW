package com.example.pdsa_backend.data.knights_tour;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameResultRepository extends JpaRepository<GameResult, Integer> {
    List<GameResult> findByPlayerIdOrderByCreatedAtDesc(int playerId);
}
