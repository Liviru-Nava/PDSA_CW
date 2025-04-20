package com.example.pdsa_backend.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TravelingSalesmanResultRepository extends JpaRepository<TravelingSalesmanResult, Integer> {
}
