// components/StartModal.jsx
import { useState } from 'react';

export default function StartModal({ onStart }) {
  const [name, setName] = useState('');
  const [algorithm, setAlgorithm] = useState('minimax');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    onStart(name, algorithm);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-black">Welcome to Tic-Tac-Toe</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="algorithm">
              Select Algorithm
            </label>
            <select
              id="algorithm"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
            >
              <option value="minimax">Minimax with Alpha-Beta Pruning</option>
              <option value="mcts">Monte Carlo Tree Search (MCTS)</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition duration-300"
          >
            Start Game
          </button>
        </form>
      </div>
    </div>
  );
}