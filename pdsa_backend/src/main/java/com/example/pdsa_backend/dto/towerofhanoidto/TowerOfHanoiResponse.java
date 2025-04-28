package com.example.pdsa_backend.dto.towerofhanoidto;

public class TowerOfHanoiResponse {
    private boolean valid;
    private String message;
    private long recursive3PegTimeMs;
    private long iterative3PegTimeMs;
    private long frameStewartTimeMs;

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public long getRecursive3PegTimeMs() {
        return recursive3PegTimeMs;
    }

    public void setRecursive3PegTimeMs(long recursive3PegTimeMs) {
        this.recursive3PegTimeMs = recursive3PegTimeMs;
    }

    public long getIterative3PegTimeMs() {
        return iterative3PegTimeMs;
    }

    public void setIterative3PegTimeMs(long iterative3PegTimeMs) {
        this.iterative3PegTimeMs = iterative3PegTimeMs;
    }

    public long getFrameStewartTimeMs() {
        return frameStewartTimeMs;
    }

    public void setFrameStewartTimeMs(long frameStewartTimeMs) {
        this.frameStewartTimeMs = frameStewartTimeMs;
    }

}