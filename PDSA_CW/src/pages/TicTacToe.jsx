// App.jsx
import { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import StartModal from './components/StartModal';
import EndGameModal from './components/EndGameModal';
import InfoPanel from './components/InfoPanel';
import { checkWinner } from './utils/gameLogic';
import { makeComputerMove } from './utils/computerAI';

function TicTacToe() {
  const [board, setBoard] = useState(Array(25).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [playerName, setPlayerName] = useState('');
  const [algorithm, setAlgorithm] = useState('minimax');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showStartModal, setShowStartModal] = useState(true);
  const [showEndGameModal, setShowEndGameModal] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [moveTime, setMoveTime] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  
  // Start game timer
  useEffect(() => {
    let interval;
    if (gameStarted && !gameOver) {
      interval = setInterval(() => {
        setGameTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  // Handle computer's turn
  useEffect(() => {
    if (gameStarted && !isPlayerTurn && !gameOver) {
      const timer = setTimeout(() => {
        const startTime = performance.now();
        const newBoard = [...board];
        
        makeComputerMove(newBoard, algorithm)
          .then(moveIndex => {
            if (moveIndex !== null && newBoard[moveIndex] === null) {
              newBoard[moveIndex] = 'O';
              const endTime = performance.now();
              setMoveTime(endTime - startTime);
              setLastMoveTime(endTime - startTime);
              setBoard(newBoard);
              
              const result = checkWinner(newBoard);
              if (result) {
                setWinner('Computer');
                setGameOver(true);
                setShowEndGameModal(true);
              } else if (!newBoard.includes(null)) {
                setWinner('Draw');
                setGameOver(true);
                setShowEndGameModal(true);
              } else {
                setIsPlayerTurn(true);
              }
            }
          });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [board, isPlayerTurn, gameStarted, gameOver, algorithm]);

  const handleCellClick = (index) => {
    if (!gameStarted || !isPlayerTurn || board[index] !== null || gameOver) {
      return;
    }
    
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    
    const result = checkWinner(newBoard);
    if (result) {
      setWinner(playerName);
      setGameOver(true);
      setShowEndGameModal(true);
    } else if (!newBoard.includes(null)) {
      setWinner('Draw');
      setGameOver(true);
      setShowEndGameModal(true);
    } else {
      setIsPlayerTurn(false);
    }
  };

  const handleStartGame = (name, selectedAlgorithm) => {
    setPlayerName(name);
    setAlgorithm(selectedAlgorithm);
    setShowStartModal(false);
    setGameStarted(true);
    resetGame();
  };

  const resetGame = () => {
    setBoard(Array(25).fill(null));
    setIsPlayerTurn(true);
    setGameOver(false);
    setWinner(null);
    setGameTime(0);
    setMoveTime(0);
    setLastMoveTime(0);
  };

  const handleRestartGame = () => {
    setShowEndGameModal(false);
    setShowStartModal(true);
    resetGame();
    setGameStarted(false);
  };

  const handleEndGame = () => {
    setShowEndGameModal(false);
    setShowStartModal(true);
    resetGame();
    setGameStarted(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">5x5 Tic-Tac-Toe</h1>
      
      {showStartModal && (
        <StartModal onStart={handleStartGame} />
      )}
      
      {gameStarted && (
        <>
          <InfoPanel 
            playerName={playerName} 
            isPlayerTurn={isPlayerTurn} 
            gameTime={gameTime} 
            algorithm={algorithm}
          />
          
          <div className="mt-4 mb-8">
            <GameBoard 
              board={board} 
              onCellClick={handleCellClick} 
            />
          </div>
          
          <div className="mb-6">
            <p className="text-lg font-medium">
              Last computer move time: {lastMoveTime.toFixed(2)} ms
            </p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={resetGame}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              Restart
            </button>
            <button 
              onClick={handleEndGame}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
            >
              End Game
            </button>
          </div>
        </>
      )}
      
      {showEndGameModal && (
        <EndGameModal 
          winner={winner} 
          onRestart={handleRestartGame} 
          onExit={handleEndGame}
        />
      )}
    </div>
  );
}

export default TicTacToe;