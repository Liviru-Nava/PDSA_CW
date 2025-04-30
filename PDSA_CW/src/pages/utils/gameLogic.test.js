// utils/gameLogic.test.js
import { checkWinner } from './gameLogic';

describe('Game Logic', () => {
  test('checkWinner detects horizontal win', () => {
    const board = Array(25).fill(null);
    // Create a horizontal line of 'X'
    board[0] = 'X';
    board[1] = 'X';
    board[2] = 'X';
    board[3] = 'X';
    board[4] = 'X';
    
    expect(checkWinner(board)).toBeTruthy();
  });
  
  test('checkWinner detects vertical win', () => {
    const board = Array(25).fill(null);
    // Create a vertical line of 'O'
    board[0] = 'O';
    board[5] = 'O';
    board[10] = 'O';
    board[15] = 'O';
    board[20] = 'O';
    
    expect(checkWinner(board)).toBeTruthy();
  });
  
  test('checkWinner detects diagonal win', () => {
    const board = Array(25).fill(null);
    // Create a diagonal line of 'X'
    board[0] = 'X';
    board[6] = 'X';
    board[12] = 'X';
    board[18] = 'X';
    board[24] = 'X';
    
    expect(checkWinner(board)).toBeTruthy();
  });
  
  test('checkWinner returns false for no win', () => {
    const board = Array(25).fill(null);
    board[0] = 'X';
    board[1] = 'O';
    
    expect(checkWinner(board)).toBeFalsy();
  });
});