// utils/computerAI.js
import { checkWinner, getAvailableMoves } from './gameLogic';

// Main function to make computer move based on selected algorithm
export async function makeComputerMove(board, algorithm) {
  if (algorithm === 'minimax') {
    return findBestMoveMinimaxAlphaBeta(board);
  } else {
    return findBestMoveMCTS(board);
  }
}

// Minimax with Alpha-Beta Pruning Implementation
function findBestMoveMinimaxAlphaBeta(board) {
  // For 5x5 board, we need to limit the depth to avoid performance issues
  const MAX_DEPTH = 2;
  
  let bestScore = -Infinity;
  let bestMove = null;
  const availableMoves = getAvailableMoves(board);
  
  // For each available move, calculate score using minimax with alpha-beta pruning
  for (const move of availableMoves) {
    // Create a new board with the move
    const newBoard = [...board];
    newBoard[move] = 'O';
    
    // Calculate score using minimax
    const score = minimax(newBoard, MAX_DEPTH, false, -Infinity, Infinity);
    
    // Update best move if current move has a better score
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
}

// Minimax algorithm with alpha-beta pruning
function minimax(board, depth, isMaximizing, alpha, beta) {
  // Check for terminal state
  const winner = checkWinner(board);
  if (winner === 'O') return 100 + depth;
  if (winner === 'X') return -100 - depth;
  if (!board.includes(null) || depth === 0) return 0;
  
  const availableMoves = getAvailableMoves(board);
  
  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = 'O';
      const score = minimax(newBoard, depth - 1, false, alpha, beta);
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = 'X';
      const score = minimax(newBoard, depth - 1, true, alpha, beta);
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return minScore;
  }
}

// Monte Carlo Tree Search Implementation
function findBestMoveMCTS(board) {
  // MCTS parameters
  const ITERATIONS = 1000;
  const EXPLORATION_PARAM = Math.sqrt(2);
  
  // Create root node
  const rootNode = {
    board: [...board],
    visits: 0,
    wins: 0,
    children: [],
    unexploredMoves: getAvailableMoves(board),
    move: null,
    parent: null,
    playerTurn: false // Computer's turn (O)
  };
  
  // Run MCTS for a fixed number of iterations
  for (let i = 0; i < ITERATIONS; i++) {
    // 1. Selection
    let node = selection(rootNode, EXPLORATION_PARAM);
    
    // 2. Expansion
    if (node.unexploredMoves.length > 0 && !checkWinner(node.board)) {
      node = expansion(node);
    }
    
    // 3. Simulation
    const winner = simulation(node);
    
    // 4. Backpropagation
    backpropagation(node, winner);
  }
  
  // Select the child of the root with the highest number of visits
  let bestChild = null;
  let mostVisits = -1;
  
  for (const child of rootNode.children) {
    if (child.visits > mostVisits) {
      mostVisits = child.visits;
      bestChild = child;
    }
  }
  
  // Return the move of the best child
  return bestChild ? bestChild.move : getAvailableMoves(board)[0];
}

// MCTS Helper Functions
function selection(node, explorationParam) {
  // If node has unexplored moves or is a terminal node, return it
  if (node.unexploredMoves.length > 0 || node.children.length === 0 || checkWinner(node.board)) {
    return node;
  }
  
  // Otherwise, select the child with the highest UCB1 value
  let bestChild = null;
  let bestUCB1 = -Infinity;
  
  for (const child of node.children) {
    // Calculate UCB1 value
    const ucb1 = (child.wins / child.visits) + 
      explorationParam * Math.sqrt(Math.log(node.visits) / child.visits);
    
    if (ucb1 > bestUCB1) {
      bestUCB1 = ucb1;
      bestChild = child;
    }
  }
  
  // Recursively select from the best child
  return selection(bestChild, explorationParam);
}

function expansion(node) {
  // Choose a random unexplored move
  const randomIndex = Math.floor(Math.random() * node.unexploredMoves.length);
  const move = node.unexploredMoves[randomIndex];
  
  // Remove the move from unexplored moves
  node.unexploredMoves.splice(randomIndex, 1);
  
  // Create a new board with the move
  const newBoard = [...node.board];
  newBoard[move] = node.playerTurn ? 'X' : 'O';
  
  // Create a new child node
  const childNode = {
    board: newBoard,
    visits: 0,
    wins: 0,
    children: [],
    unexploredMoves: getAvailableMoves(newBoard),
    move: move,
    parent: node,
    playerTurn: !node.playerTurn
  };
  
  // Add the child to the node's children
  node.children.push(childNode);
  
  return childNode;
}

function simulation(node) {
  // Create a copy of the board
  const board = [...node.board];
  let playerTurn = node.playerTurn;
  
  // Get available moves
  let availableMoves = getAvailableMoves(board);
  
  // Play until the game is over
  while (availableMoves.length > 0 && !checkWinner(board)) {
    // Choose a random move
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    const move = availableMoves[randomIndex];
    
    // Make the move
    board[move] = playerTurn ? 'X' : 'O';
    
    // Switch player
    playerTurn = !playerTurn;
    
    // Update available moves
    availableMoves = getAvailableMoves(board);
  }
  
  // Return the winner
  return checkWinner(board);
}

function backpropagation(node, winner) {
  // Update the node's statistics
  node.visits++;
  
  // Computer (O) wins
  if (winner === 'O') {
    node.wins++;
  }
  // Draw is counted as half a win
  else if (winner === null && !node.board.includes(null)) {
    node.wins += 0.5;
  }
  
  // Propagate the result up the tree
  if (node.parent) {
    backpropagation(node.parent, winner);
  }
}
