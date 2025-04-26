package com.example.pdsa_backend.data;

import com.example.pdsa_backend.data.Game;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GameRepository extends JpaRepository<com.example.pdsa_backend.data.Game, Integer> {
    Game findByGameName(String gameName);
}