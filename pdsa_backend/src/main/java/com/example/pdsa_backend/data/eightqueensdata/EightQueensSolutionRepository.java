package com.example.pdsa_backend.data.eightqueensdata;


import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EightQueensSolutionRepository extends JpaRepository<EightQueensSolution, Integer> {
    Optional<EightQueensSolution> findByConfigurationAndGameId(String configuration, int gameId);

    boolean existsByConfigurationAndGameId(String configuration, int gameId);

    boolean existsByGameId(int gameId);

    List<EightQueensSolution> findByGameId(int gameId);

    long countByIsRecognizedTrueAndGameId(int gameId);

    long countByGameId(int gameId);
}