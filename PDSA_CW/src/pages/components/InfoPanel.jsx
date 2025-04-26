import React, { useEffect } from 'react';

export default function InfoPanel({ playerName, isPlayerTurn, gameTime, algorithm, onTimeUpdate }) {
    // Format time to MM:SS for display
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
  
    const getAlgorithmName = () => {
      return algorithm === 'Minimax with Alpha-Beta Pruning' 
        ? 'Minimax with Alpha-Beta Pruning' 
        : 'Monte Carlo Tree Search';
    };
    
    // Format the time for display
    const formattedTime = formatTime(gameTime);
    
    // Pass raw integer time back to parent component
    useEffect(() => {
      if (onTimeUpdate) {
        // Just pass the original integer value back
        onTimeUpdate(gameTime);
      }
    }, [gameTime, onTimeUpdate]);
  
    return (
      <div className="w-[420px] bg-white/10 p-4 rounded-lg shadow mb-6 gap-5 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div className="text-lg font-medium text-white">Player: {playerName}</div>
          <div className="text-lg font-medium text-white">Time: {formattedTime}</div>
        </div>
        <div className="flex justify-between items-center">
          <div className={`text-lg font-medium ${isPlayerTurn ? 'text-green-600' : 'text-red-500'}`}>
            {isPlayerTurn ? "Your Turn" : "Computer's Turn"}
          </div>
          <div className="text-sm text-gray-150">
            AI: {getAlgorithmName()}
          </div>
        </div>
      </div>
    );
  }