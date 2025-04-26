package com.example.pdsa_backend.data.knights_tour;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GameRepository extends JpaRepository<Game, Integer> {
    Game findByGameName(String gameName);
}