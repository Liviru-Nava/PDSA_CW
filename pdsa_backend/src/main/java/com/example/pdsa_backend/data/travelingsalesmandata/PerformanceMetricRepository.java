package com.example.pdsa_backend.data.travelingsalesmandata;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PerformanceMetricRepository extends JpaRepository<PerformanceMetric, Integer> {
    Optional<PerformanceMetric> findByResultIdAndAlgorithmId(int resultId, int algorithmId);
    List<PerformanceMetric> findByResultId(int resultId);
}
