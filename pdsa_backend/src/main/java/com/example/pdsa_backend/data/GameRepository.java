package com.example.pdsa_backend.data;

import org.springframework.data.jpa.repository.JpaRepository;


public interface GameRepository extends JpaRepository<Game, Integer> {
}