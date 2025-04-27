package com.example.pdsa_backend.data;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface PerformanceMetricRepository extends JpaRepository<PerformanceMetric, Integer> {
    Optional<PerformanceMetric> findByResultIdAndAlgorithmId(int resultId, int algorithmId);
    List<PerformanceMetric> findByResultId(int resultId);
}
