package com.example.pdsa_backend.data.knights_tour;
import jakarta.persistence.*;

@Entity
@Table(name="knightstourresult")
public class KnightsTourGameResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="knight_result_id")
    private int knightResultId;

    @Column(name="result_id")
    private int resultId;

    @Column(name="user_sequence_of_moves")
    private String userSequenceOfMoves;

    @Column(name="board_size")
    private int boardSize;

    @Column(name="moves_made")
    private int movesMade;

    @Column(name = "start_x")
    private int startX;

    @Column(name = "start_y")
    private int startY;

    @Column(name = "has_completed")
    private boolean hasCompleted;

    public int getKnightResultId() {
        return knightResultId;
    }

    public void setKnightResultId(int knightResultId) {
        this.knightResultId = knightResultId;
    }

    public int getResultId() {
        return resultId;
    }

    public void setResultId(int resultId) {
        this.resultId = resultId;
    }

    public String getUserSequenceOfMoves() {
        return userSequenceOfMoves;
    }

    public void setUserSequenceOfMoves(String userSequenceOfMoves) {
        this.userSequenceOfMoves = userSequenceOfMoves;
    }

    public int getBoardSize() {
        return boardSize;
    }

    public void setBoardSize(int boardSize) {
        this.boardSize = boardSize;
    }

    public int getMovesMade() {
        return movesMade;
    }

    public void setMovesMade(int movesMade) {
        this.movesMade = movesMade;
    }

    public int getStartX() {
        return startX;
    }

    public void setStartX(int startX) {
        this.startX = startX;
    }

    public int getStartY() {
        return startY;
    }

    public void setStartY(int startY) {
        this.startY = startY;
    }

    public boolean getHasCompleted() {
        return hasCompleted;
    }

    public void setHasCompleted(boolean hasCompleted) {
        this.hasCompleted = hasCompleted;
    }
}
