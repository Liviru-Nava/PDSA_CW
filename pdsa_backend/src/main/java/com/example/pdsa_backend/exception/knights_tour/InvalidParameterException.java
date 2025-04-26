package com.example.pdsa_backend.exception.knights_tour;

public class InvalidParameterException extends RuntimeException {
    public InvalidParameterException(String message) {
        super(message);
    }
}