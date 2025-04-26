package com.example.pdsa_backend.data;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, Integer> {
    boolean existsByUsername(String username);

    Optional<Player> findByUsername(String username);
}
