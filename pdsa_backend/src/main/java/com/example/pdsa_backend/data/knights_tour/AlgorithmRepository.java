package com.example.pdsa_backend.data.knights_tour;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlgorithmRepository extends JpaRepository<Algorithm, Integer> {
    Algorithm findByGameIdAndAlgorithmName(int gameId, String algorithmName);
    List<Algorithm> findByGameId(int gameId);
}
