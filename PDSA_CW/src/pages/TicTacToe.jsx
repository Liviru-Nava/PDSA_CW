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
  const [allMoveTimes, setAllMoveTimes] = useState([]);
  
  
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
                const currentMoveTime = endTime - startTime;
                
                setMoveTime(currentMoveTime);
                setLastMoveTime(currentMoveTime);
                setAllMoveTimes(prevTimes => [
                  ...prevTimes, 
                  { 
                    moveNumber: prevTimes.length + 1,
                    timeMs: currentMoveTime.toFixed(2) 
                  }
                ]);
                
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
    setAllMoveTimes([]);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 p-4">
      <div
        style={{
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#ffffff",
            textShadow: "0 0 10px #00ffff, 0 0 20px #00ffff",
            fontFamily: "serif",
            fontSize: "38px",
            border: "2px solid white",
            display: "inline-block",
            padding: "10px 25px",
            borderRadius: "8px",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          Tic-Tac-Toe
        </h1>
      </div>
    
    <div className="w-full flex flex-row justify-between bg-gray-100 p-4">
      
      {showStartModal && (
        <StartModal onStart={handleStartGame} />
      )}
      
      {gameStarted && (
        <>
          
          <div className="w-[300px] mt-4">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-600">
                  <th className="border border-gray-300 px-2 py-2">Move</th>
                  <th className="border border-gray-300 px-3 py-2">Time (ms)</th>
                </tr>
              </thead>
              <tbody>
                {allMoveTimes.map((move, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-400' : 'bg-gray-500'}>
                    <td className="border border-gray-300 px-2 py-2 text-center">{move.moveNumber}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">{move.timeMs}</td>
                  </tr>
                ))}
                {allMoveTimes.length === 0 && (
                  <tr>
                    <td colSpan="3" className="border border-gray-300 px-4 py-2 text-center bg-gray-400">No moves yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          


          <div className="mt-4 mb-8">
            <GameBoard 
              board={board} 
              onCellClick={handleCellClick} 
            />
          </div>

          <div className='flex flex-col items-center bg-gray-100 p-4'>
            <InfoPanel 
              playerName={playerName} 
              isPlayerTurn={isPlayerTurn} 
              gameTime={gameTime} 
              algorithm={algorithm}
            />
            
            <div className="w-full flex flex-row items-center justify-between gap-4">
              <button 
                onClick={resetGame}
                className="w-[200px] text-xl font-bold bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-lg"
              >
                Restart
              </button>
              <button 
                onClick={handleEndGame}
                className="w-[200px] text-xl font-bold bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-lg"
              >
                End Game
              </button>
            </div>
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
    </div>
  );
}

export default TicTacToe;