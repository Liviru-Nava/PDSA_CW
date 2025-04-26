package com.example.pdsa_backend.data.travelingsalesmandata;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PlayerRepository extends JpaRepository<Player, Integer> {
    boolean existsByUsername(String username);

    Player findByUsername(String username);
}
