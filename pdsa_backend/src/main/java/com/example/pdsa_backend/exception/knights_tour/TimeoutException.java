package com.example.pdsa_backend.exception.knights_tour;

import com.example.pdsa_backend.algorithms.knights_tour.KnightsTourSolver;

/**
 * Custom exception for timeout during algorithm execution.
 */
public class TimeoutException extends Exception {
    KnightsTourSolver solver;
    public TimeoutException(String message, KnightsTourSolver solver) {
        super(message);
        this.solver = solver;
    }
    public KnightsTourSolver getSolver(){
        return solver;
    }
}