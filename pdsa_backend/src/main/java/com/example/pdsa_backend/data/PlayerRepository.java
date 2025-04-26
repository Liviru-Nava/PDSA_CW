package com.example.pdsa_backend.data;

import com.example.pdsa_backend.data.Player;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, Integer> {
    Optional<Player> findByUsername(String username);
}
