package com.example.pdsa_backend.data;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, Integer> {
    Optional<Player> findByUsername(String username);

    @Modifying
    @Transactional
    @Query("UPDATE Player p SET p.lastLogin = :lastLogin WHERE p.username = :username")
    void setLastLoginByUsername(@Param("username") String username, @Param("lastLogin")LocalDateTime lastLogin);

    @Query("SELECT p.playerId From Player p WHERE p.username = :username")
    int getPlayerIdByUsername(@Param("username") String username);
}
