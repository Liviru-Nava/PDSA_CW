package com.example.pdsa_backend.data.travelingsalesmandata;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PerformanceMetricRepository extends JpaRepository<PerformanceMetric, Integer> {
}
