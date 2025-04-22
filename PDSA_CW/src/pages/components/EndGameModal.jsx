// components/EndGameModal.jsx
export default function EndGameModal({ winner, onRestart, onExit }) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96 text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-500">
            {winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`}
          </h2>
          
          <p className="mb-6 text-lg text-black">
            {winner === 'Draw' 
              ? "Nobody won this round."
              : `Congratulations to ${winner}!`}
          </p>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={onRestart}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              Play Again
            </button>
            <button
              onClick={onExit}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }