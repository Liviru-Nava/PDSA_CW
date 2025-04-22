
// components/GameBoard.jsx
export default function GameBoard({ board, onCellClick }) {
    return (
      <div className="grid grid-cols-5 gap-2 bg-gray-200 p-4 rounded-lg shadow-lg">
        {board.map((cell, index) => (
          <div
            key={index}
            onClick={() => onCellClick(index)}
            className={`w-16 h-16 flex items-center justify-center text-2xl font-bold rounded cursor-pointer
              ${cell === null ? 'bg-white hover:bg-gray-100' : 'bg-gray-50'}
              ${cell === 'X' ? 'text-blue-600' : 'text-red-600'}`}
          >
            {cell}
          </div>
        ))}
      </div>
    );
  }