import React, { useEffect, useCallback } from "react";

export default function GameBoard({ board, onCellClick, onGameEnd }) {
  // Memoized function to transform 1D array to 2D array (5x5)
  const convert1DTo2D = useCallback((flatArray) => {
    const result = [];
    for (let i = 0; i < 5; i++) {
      result.push(flatArray.slice(i * 5, (i + 1) * 5));
    }
    return result;
  }, []);

  // Memoized game end check to prevent unnecessary recalculations
  const checkGameEnd = useCallback(() => {
    try {
      const isBoardFull = !board.includes(null);
      
      if (isBoardFull) {
        const board2D = convert1DTo2D(board);
        onGameEnd(board2D);
      }
    } catch (error) {
      console.error("Error in game end check:", error);
      // You could add more sophisticated error handling here
    }
  }, [board, convert1DTo2D, onGameEnd]);

  // Call checkGameEnd only when board changes
  useEffect(() => {
    checkGameEnd();
  }, [board, checkGameEnd]);

  return (
    <div className="grid grid-cols-5 gap-3 p-4">
      {board.map((cell, index) => (
        <div
          key={index}
          onClick={() => onCellClick(index)}
          className={`w-24 h-24 flex items-center justify-center text-6xl font-bold rounded cursor-pointer
            ${cell === null ? 'bg-white/50 backdrop-blur-sm p-6 rounded-lg border border-white/20 shadow-lg hover:bg-gray-100' : 'bg-white/90 backdrop-blur-sm'}
            ${cell === 'X' ? 'text-blue-700' : 'text-red-700'}`}
          aria-label={`Cell ${index} ${cell ? `containing ${cell}` : 'empty'}`}
        >
          {cell}
        </div>
      ))}
    </div>
  );
}