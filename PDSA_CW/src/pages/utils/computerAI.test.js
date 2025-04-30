// utils/computerAI.test.js
import { makeComputerMove } from './computerAI';

describe('Computer AI', () => {
  test('makeComputerMove returns a valid move index', async () => {
    const board = Array(25).fill(null);
    // Add some moves to the board
    board[0] = 'X';
    board[6] = 'O';
    
    const moveIndex = await makeComputerMove(board, 'minimax');
    
    // Check that the index is valid (not out of bounds)
    expect(moveIndex).toBeGreaterThanOrEqual(0);
    expect(moveIndex).toBeLessThan(25);
    
    // Check that the move is made on an empty cell
    expect(board[moveIndex]).toBeNull();
  });
  
  // More tests for different AI algorithms
});