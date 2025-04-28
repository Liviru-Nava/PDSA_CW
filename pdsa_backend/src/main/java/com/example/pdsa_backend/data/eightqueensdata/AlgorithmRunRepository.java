package com.example.pdsa_backend.data.eightqueensdata;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AlgorithmRunRepository extends JpaRepository<AlgorithmRun, Integer> {
    List<AlgorithmRun> findByAlgorithmId(int algorithmId);

    @Query("SELECT AVG(ar.executionTimeMs) FROM AlgorithmRun ar WHERE ar.algorithmId = :algorithmId")
    Double findAverageExecutionTimeByAlgorithmId(int algorithmId);
}
