
// components/GameBoard.jsx
export default function GameBoard({ board, onCellClick }) {
    return (
      <div className="grid grid-cols-5 gap-3 p-4">
        {board.map((cell, index) => (
          <div
            key={index}
            onClick={() => onCellClick(index)}
            className={`w-24 h-24 flex items-center justify-center text-6xl font-bold rounded cursor-pointer
              ${cell === null ? 'bg-white/50 backdrop-blur-sm p-6 rounded-lg border border-white/20 shadow-lg hover:bg-gray-100' : 'bg-white/90 backdrop-blur-sm'}
              ${cell === 'X' ? 'text-blue-700' : 'text-red-700'}`}
          >
            {cell}
          </div>
        ))}
      </div>
    );
  }