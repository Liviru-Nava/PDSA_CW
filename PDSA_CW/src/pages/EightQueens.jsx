import { Link } from 'react-router-dom';

const EightQueens = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 to-black flex flex-col items-center justify-center p-4">
      <Link to="/" className="absolute top-6 left-6 text-white flex items-center hover:text-pink-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </Link>
      
      <h1 className="text-5xl font-bold text-center mb-8 text-white">Eight Queens Puzzle</h1>
      
      <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-xl">
        <p className="text-xl text-white">Game implementation coming soon...</p>
      </div>
    </div>
  );
};

export default EightQueens;