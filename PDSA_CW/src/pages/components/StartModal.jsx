import { useState, useEffect } from 'react';

export default function StartModal({ onStart }) {
  const [name, setName] = useState('');
  const [algorithm, setAlgorithm] = useState('');
  const [error, setError] = useState('');
  const [algorithms, setAlgorithms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setApiResponse(null);

    if (!name.trim()) {
      setError('Please enter your name');
      setIsSubmitting(false);
      return;
    }
    if (!algorithm) {
      setError('Please select an algorithm');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/pdsa/Tic-Tac-Toe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: name,
          // gameid: 1,    // Uncomment if needed
          // algo: algorithm // Uncomment if needed
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Username exists - we'll proceed with the game
          setApiResponse(`Welcome back, ${name}!`);
        } else {
          throw new Error(data.error || 'Failed to register user');
        }
      } else {
        setApiResponse(`Welcome, ${name}!`);
      }

      // Start the game with the selected algorithm
      onStart(name, algorithm);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchAlgorithms = async () => {
      try {
        const response = await fetch('http://localhost:8081/pdsa/Tic-Tac-Toe');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAlgorithms(data);
        if (data.length > 0) {
          setAlgorithm(data[0].algorithmName);
        }
      } catch (err) {
        setFetchError(err.message);
        console.error('Error fetching algorithms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlgorithms();
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-700/10 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-black">Welcome to Tic-Tac-Toe</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-black mb-2" htmlFor="name">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter your name"
            />
            {error && error.includes('name') && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-black mb-2" htmlFor="algorithm">
              Select Algorithm
            </label>
            <select
              id="algorithm"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={algorithm}
              onChange={(e) => {
                setAlgorithm(e.target.value);
                setError('');
              }}
              disabled={loading || fetchError}
            >
              {loading ? (
                <option value="">Loading algorithms...</option>
              ) : fetchError ? (
                <option value="">Error loading algorithms</option>
              ) : (
                <>
                  <option value="" disabled>Select an algorithm</option>
                  {algorithms.map((algo) => (
                    <option key={`algo-${algo.algorithmId}`} value={algo.algorithmName}>
                      {algo.algorithmName}
                    </option>
                  ))}
                </>
              )}
            </select>
            {error && error.includes('algorithm') && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          {apiResponse && (
            <div className={`mb-4 p-2 rounded text-center ${
              apiResponse.includes('Welcome') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {apiResponse}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition duration-300 disabled:bg-gray-400"
            disabled={loading || isSubmitting || (algorithms.length === 0 && !fetchError)}
          >
            {isSubmitting ? 'Processing...' : 'Start Game'}
          </button>
        </form>
      </div>
    </div>
  );
}