package com.example.pdsa_backend.data;


import jakarta.persistence.*;

@Entity
@Table(name="tictactoeresult")
public class TicTacToeResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tictactoe_result_id")
    private int ticTacToeId;

    @Column(name = "result_id")
    private int resultId;

    @Column(name = "board_state")
    private String boardState;

    public int getTicTacToeId() {
        return ticTacToeId;
    }

    public void setTicTacToeId(int ticTacToeId) {
        this.ticTacToeId = ticTacToeId;
    }

    public int getResultId() {
        return resultId;
    }

    public void setResultId(int resultId) {
        this.resultId = resultId;
    }

    public String getBoardState() {
        return boardState;
    }

    public void setBoardState(String boardState) {
        this.boardState = boardState;
    }
}
