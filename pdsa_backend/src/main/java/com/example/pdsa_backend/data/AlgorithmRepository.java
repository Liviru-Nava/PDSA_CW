package com.example.pdsa_backend.data;

import com.example.pdsa_backend.data.Algorithm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlgorithmRepository extends JpaRepository<com.example.pdsa_backend.data.Algorithm, Integer> {
    com.example.pdsa_backend.data.Algorithm findByGameIdAndAlgorithmName(int gameId, String algorithmName);
    List<Algorithm> findByGameId(int gameId);
}
