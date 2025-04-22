// components/InfoPanel.jsx
export default function InfoPanel({ playerName, isPlayerTurn, gameTime, algorithm }) {
    // Format time to MM:SS
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
  
    const getAlgorithmName = () => {
      return algorithm === 'minimax' 
        ? 'Minimax with Alpha-Beta Pruning' 
        : 'Monte Carlo Tree Search';
    };
  
    return (
      <div className="w-[420px] bg-white p-4 rounded-lg shadow mb-6 gap-5">
        <div className="flex justify-between items-center">
          <div className="text-lg font-medium text-black">Player: {playerName}</div>
          <div className="text-lg font-medium text-black">Time: {formatTime(gameTime)}</div>
        </div>
        <div className="flex justify-between items-center">
          <div className={`text-lg font-medium ${isPlayerTurn ? 'text-green-600' : 'text-gray-600'}`}>
            {isPlayerTurn ? "Your Turn" : "Computer's Turn"}
          </div>
          <div className="text-sm text-gray-600">
            AI: {getAlgorithmName()}
          </div>
        </div>
      </div>
    );
  }