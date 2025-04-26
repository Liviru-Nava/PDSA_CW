package com.example.pdsa_backend.data.knights_tour;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KnightsTourPerformanceMetricsRepository extends JpaRepository<com.example.pdsa_backend.data.knights_tour.KnightsTourPerformanceMetrics, Integer> {
    Optional<KnightsTourPerformanceMetrics> findByMetricId(int metricId);
}
