// utils/gameLogic.js

// Check if there's a winner on the board
export function checkWinner(board) {
  const lines = getWinningLines();
  
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c, d, e] = lines[i];
    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c] &&
      board[a] === board[d] &&
      board[a] === board[e]
    ) {
      return board[a];
    }
  }
  return null;
}

// Get all possible winning line combinations for a 5x5 board
function getWinningLines() {
  const lines = [];
  
  // Horizontal lines
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col <= 0; col++) {
      lines.push([
        row * 5 + col,
        row * 5 + col + 1,
        row * 5 + col + 2,
        row * 5 + col + 3,
        row * 5 + col + 4
      ]);
    }
  }
  
  // Vertical lines
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row <= 0; row++) {
      lines.push([
        row * 5 + col,
        (row + 1) * 5 + col,
        (row + 2) * 5 + col,
        (row + 3) * 5 + col,
        (row + 4) * 5 + col
      ]);
    }
  }
  
  // Diagonal lines (top-left to bottom-right)
  lines.push([0, 6, 12, 18, 24]);
  
  // Diagonal lines (top-right to bottom-left)
  lines.push([4, 8, 12, 16, 20]);
  
  return lines;
}

// Get available moves on the board
export function getAvailableMoves(board) {
  return board
    .map((cell, index) => (cell === null ? index : null))
    .filter((index) => index !== null);
}