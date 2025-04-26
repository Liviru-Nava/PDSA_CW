package com.example.pdsa_backend.exception.knights_tour;

public class AlgorithmExecutionException extends RuntimeException {
    public AlgorithmExecutionException(String message, Throwable cause) {
        super(message, cause);
    }

    public AlgorithmExecutionException(String message) {
        super(message);
    }
}