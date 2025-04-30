import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './TowerOfHanoi.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TowerOfHanoi = () => {
  const [username, setUsername] = useState('');
  const [pegCount, setPegCount] = useState(3);
  const [diskCount, setDiskCount] = useState(5);
  const [diskSelectionMode, setDiskSelectionMode] = useState('Random');
  const [manualDiskCount, setManualDiskCount] = useState('');
  const [numOfMoves, setNumOfMoves] = useState('');
  const [moveSequence, setMoveSequence] = useState('');
  const [poles, setPoles] = useState([[], [], [], []]);
  const [heldDisk, setHeldDisk] = useState(null);
  const [fromPoleIndex, setFromPoleIndex] = useState(null);
  const [moveCount, setMoveCount] = useState(0);
  const [isWin, setIsWin] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(300);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [rounds, setRounds] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [popupMessage, setPopupMessage] = useState(null);
  const [winPopup, setWinPopup] = useState(null);
  const intervalRef = useRef(null);
  const starsContainerRef = useRef(null);

  // Peg labels (A is source, C/D is destination)
  const pegLabels = pegCount === 3 ? ['C', 'B', 'A'] : ['D', 'C', 'B', 'A'];

  // Starry background with parallax
  useEffect(() => {
    const container = starsContainerRef.current;
    if (!container) return;
    container.innerHTML = '';
    const numStars = 400;
    for (let i = 0; i < numStars; i++) {
      const star = document.createElement('div');
      const size = Math.random();
      const depth = Math.random();
      star.className = `absolute rounded-full bg-white animate-twinkle`;
      star.style.width = `${size < 0.5 ? 1 : size < 0.75 ? 2 : size < 0.9 ? 3 : 4}px`;
      star.style.height = star.style.width;
      star.style.top = `${Math.random() * 100}vh`;
      star.style.left = `${Math.random() * 100}vw`;
      star.style.opacity = `${0.4 + depth * 0.6}`;
      star.style.transform = `translateZ(${depth * 15}px)`;
      star.style.animationDelay = `${Math.random() * 4}s`;
      if (Math.random() > 0.6) {
        const hue = Math.floor(Math.random() * 360);
        star.style.backgroundColor = `hsl(${hue}, 80%, 90%)`;
        star.style.boxShadow = `0 0 8px hsl(${hue}, 80%, 90%)`;
      }
      container.appendChild(star);
    }
    for (let i = 0; i < 10; i++) {
      const shootingStar = document.createElement('div');
      shootingStar.className = 'absolute w-1 h-1 bg-white shadow-glow animate-shoot';
      shootingStar.style.top = `${Math.random() * 40}vh`;
      shootingStar.style.left = `${Math.random() * 100}vw`;
      shootingStar.style.animationDelay = `${Math.random() * 12}s`;
      container.appendChild(shootingStar);
    }
    const colors = ['rgba(255,100,50,0.15)', 'rgba(50,150,255,0.15)', 'rgba(150,50,255,0.15)'];
    for (let i = 0; i < 4; i++) {
      const nebula = document.createElement('div');
      nebula.className = 'absolute w-64 h-64 rounded-full blur-3xl opacity-40 animate-drift';
      nebula.style.top = `${Math.random() * 80}vh`;
      nebula.style.left = `${Math.random() * 80}vw`;
      nebula.style.backgroundColor = colors[i % colors.length];
      container.appendChild(nebula);
    }

    const handleMouseMove = (e) => {
      const stars = container.querySelectorAll('.absolute');
      stars.forEach((star) => {
        const depth = parseFloat(star.style.transform.match(/translateZ\((.*?)\)/)?.[1]) || 0;
        const speed = depth / 40;
        star.style.transform = `translate(${e.clientX * speed}px, ${e.clientY * speed}px) translateZ(${depth}px)`;
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Initialize game based on disk selection mode
  useEffect(() => {
    let newDiskCount = diskCount;
    if (diskSelectionMode === 'Random') {
      newDiskCount = Math.floor(Math.random() * 6) + 5; // Random between 5 and 10
      setDiskCount(newDiskCount);
    } else if (manualDiskCount && parseInt(manualDiskCount) >= 5 && parseInt(manualDiskCount) <= 10) {
      newDiskCount = parseInt(manualDiskCount);
      setDiskCount(newDiskCount);
    }
    const newPoles = Array(4).fill().map(() => []);
    for (let i = newDiskCount; i >= 1; i--) {
      newPoles[pegCount - 1].push(i); // Source peg (A)
    }
    setPoles(newPoles);
    setHeldDisk(null);
    setFromPoleIndex(null);
    setMoveCount(0);
    setMoveSequence('');
    setNumOfMoves('');
    setIsWin(false);
    setErrorMessage('');
    setSuccessMessage('');
    setPopupMessage(null);
    setWinPopup(null);
  }, [diskCount, pegCount, diskSelectionMode, manualDiskCount]);

  // Fetch algorithm results on win
  const fetchAlgorithmResults = async () => {
    try {
      const response = await axios.post('http://localhost:8081/pdsa/tower-of-hanoi/algorithm-results', {
        diskCount,
        pegCount,
      });
      if (response.data.valid) {
        setWinPopup({
          message: 'You won! Here are the optimal solutions:',
          algorithmResults: response.data.algorithmResults,
        });
      } else {
        setPopupMessage({ type: 'error', message: response.data.message });
        setTimeout(() => setPopupMessage(null), 3000);
      }
    } catch (error) {
      console.error('Algorithm results error:', error);
      setPopupMessage({ type: 'error', message: 'Failed to fetch algorithm results.' });
      setTimeout(() => setPopupMessage(null), 3000);
    }
  };

  const checkWinCondition = (updatedPoles) => {
    if (updatedPoles[0].length === diskCount) { // Destination peg (C or D)
      setIsWin(true);
      fetchAlgorithmResults();
      if (starsContainerRef.current) {
        for (let i = 0; i < 30; i++) {
          setTimeout(() => {
            const victoryStar = document.createElement('div');
            victoryStar.className = 'absolute w-2 h-2 bg-yellow-300 rounded-full shadow-glow animate-pop';
            victoryStar.style.top = `${10 + Math.random() * 80}vh`;
            victoryStar.style.left = `${10 + Math.random() * 80}vw`;
            starsContainerRef.current.appendChild(victoryStar);
            setTimeout(() => {
              if (starsContainerRef.current && victoryStar.parentNode === starsContainerRef.current) {
                starsContainerRef.current.removeChild(victoryStar);
              }
            }, 2500);
          }, i * 150);
        }
      }
    }
  };

  const handlePoleClick = (index) => {
    if (isWin) return;
    const newPoles = [...poles];
    if (heldDisk === null) {
      const poleDisks = [...newPoles[index]];
      if (poleDisks.length > 0) {
        const topDisk = poleDisks.pop();
        newPoles[index] = poleDisks;
        setHeldDisk(topDisk);
        setFromPoleIndex(index);
        setPoles(newPoles);
      }
    } else {
      const poleDisks = [...newPoles[index]];
      const topDisk = poleDisks.length > 0 ? poleDisks[poleDisks.length - 1] : null;
      if (topDisk === null || topDisk > heldDisk) {
        poleDisks.push(heldDisk);
        newPoles[index] = poleDisks;
        const fromPeg = pegLabels[fromPoleIndex];
        const toPeg = pegLabels[index];
        setMoveSequence((prev) => {
          const newSequence = prev ? `${prev}, ${fromPeg}->${toPeg}` : `${fromPeg}->${toPeg}`;
          return newSequence;
        });
        setHeldDisk(null);
        setFromPoleIndex(null);
        setPoles(newPoles);
        setMoveCount((prev) => {
          const newCount = prev + 1;
          checkWinCondition(newPoles);
          return newCount;
        });
      } else {
        const poleElement = document.querySelectorAll('.pole-container')[index];
        poleElement.classList.add('animate-shake', 'bg-red-600');
        setTimeout(() => {
          poleElement.classList.remove('animate-shake', 'bg-red-600');
        }, 400);
        setPopupMessage({
          type: 'error',
          message: 'Cannot place a larger disk on a smaller one!',
        });
        setTimeout(() => setPopupMessage(null), 3000);
      }
    }
  };

  const handleRestart = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const resetPoles = Array(4).fill().map(() => []);
    for (let i = diskCount; i >= 1; i--) {
      resetPoles[pegCount - 1].push(i);
    }
    setPoles(resetPoles);
    setHeldDisk(null);
    setFromPoleIndex(null);
    setMoveCount(0);
    setMoveSequence('');
    setNumOfMoves('');
    setIsWin(false);
    setErrorMessage('');
    setSuccessMessage('');
    setPopupMessage(null);
    setWinPopup(null);
  };

  const handleAutoSolve = async () => {
    if (!username) {
      setPopupMessage({ type: 'error', message: 'Please enter a username.' });
      setTimeout(() => setPopupMessage(null), 3000);
      return;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    handleRestart();
    try {
      const response = await axios.post('http://localhost:8081/pdsa/tower-of-hanoi/auto-solve', {
        diskCount,
        pegCount,
      });
      if (response.data.valid) {
        const { numOfMoves, sequenceOfMoves } = response.data;
        setNumOfMoves(numOfMoves);
        setMoveSequence(sequenceOfMoves);
        setMoveCount(numOfMoves);
        const moves = sequenceOfMoves.split(',').map((move) => move.trim());
        let newPoles = Array(4).fill().map(() => []);
        for (let i = diskCount; i >= 1; i--) {
          newPoles[pegCount - 1].push(i);
        }
        let stepIndex = 0;
        intervalRef.current = setInterval(() => {
          if (stepIndex >= moves.length) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            checkWinCondition(newPoles);
            fetchAlgorithmResults();
            return;
          }
          const move = moves[stepIndex];
          const match = move.match(/^([A-D])(?:→|->|-| to )([A-D])$/i);
          if (!match) {
            setPopupMessage({ type: 'error', message: `Invalid move format from auto-solve: ${move}` });
            setTimeout(() => setPopupMessage(null), 3000);
            clearInterval(intervalRef.current);
            return;
          }
          const fromPeg = match[1].toUpperCase();
          const toPeg = match[2].toUpperCase();
          const fromIndex = pegLabels.indexOf(fromPeg);
          const toIndex = pegLabels.indexOf(toPeg);
          if (fromIndex === -1 || toIndex === -1) {
            setPopupMessage({ type: 'error', message: `Invalid peg in auto-solve move: ${move}` });
            setTimeout(() => setPopupMessage(null), 3000);
            clearInterval(intervalRef.current);
            return;
          }
          const disk = newPoles[fromIndex].pop();
          if (!disk) {
            setPopupMessage({
              type: 'error',
              message: `No disk to move from peg ${fromPeg} in auto-solve step ${stepIndex + 1}`,
            });
            setTimeout(() => setPopupMessage(null), 3000);
            clearInterval(intervalRef.current);
            return;
          }
          newPoles[toIndex].push(disk);
          setPoles([...newPoles]);
          stepIndex++;
        }, autoPlaySpeed);
      } else {
        setPopupMessage({ type: 'error', message: response.data.message });
        setTimeout(() => setPopupMessage(null), 3000);
      }
    } catch (error) {
      console.error('Auto-solve error:', error);
      setPopupMessage({ type: 'error', message: 'Failed to fetch auto-solve sequence.' });
      setTimeout(() => setPopupMessage(null), 3000);
    }
  };

  const handleSubmit = async () => {
    if (!username) {
      setPopupMessage({ type: 'error', message: 'Please enter a username.' });
      setTimeout(() => setPopupMessage(null), 3000);
      return;
    }
    if (!numOfMoves || parseInt(numOfMoves) <= 0) {
      setPopupMessage({ type: 'error', message: 'Please enter a valid number of moves.' });
      setTimeout(() => setPopupMessage(null), 3000);
      return;
    }
    if (!moveSequence.trim()) {
      setPopupMessage({ type: 'error', message: 'Please enter a move sequence or play the game.' });
      setTimeout(() => setPopupMessage(null), 3000);
      return;
    }
    try {
      const response = await axios.post('http://localhost:8081/pdsa/tower-of-hanoi/submit', {
        username,
        diskCount,
        pegCount,
        numOfMoves: parseInt(numOfMoves),
        sequenceOfMoves: moveSequence.trim(),
      });
      if (response.data.valid) {
        setPopupMessage({ type: 'success', message: response.data.message });
        setErrorMessage('');
        setWinPopup({
          message: 'You won! Here are the optimal solutions:',
          algorithmResults: response.data.algorithmResults,
        });
      } else {
        setPopupMessage({ type: 'error', message: response.data.message });
        setSuccessMessage('');
      }
      setTimeout(() => setPopupMessage(null), 3000);
    } catch (error) {
      console.error('Submit error:', error);
      setPopupMessage({ type: 'error', message: 'Failed to submit solution.' });
      setTimeout(() => setPopupMessage(null), 3000);
    }
  };

  const handleFetchMetrics = async () => {
    if (!rounds || parseInt(rounds) <= 0) {
      setPopupMessage({ type: 'error', message: 'Please enter a valid number of rounds.' });
      setTimeout(() => setPopupMessage(null), 3000);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:8081/pdsa/tower-of-hanoi/performance-metrics?rounds=${rounds}`);
      setMetrics(response.data);
      setErrorMessage('');
    } catch (error) {
      console.error('Fetch metrics error:', error);
      setPopupMessage({ type: 'error', message: 'Failed to fetch performance metrics.' });
      setTimeout(() => setPopupMessage(null), 3000);
    }
  };

  const handleManualDiskCountChange = (e) => {
    const value = e.target.value;
    if (value === '' || (parseInt(value) >= 5 && parseInt(value) <= 10)) {
      setManualDiskCount(value);
      if (value) setDiskCount(parseInt(value));
    }
  };

  const minMoves = pegCount === 3 ? Math.pow(2, diskCount) - 1 : Math.floor(Math.pow(2, Math.sqrt(2 * diskCount)));
  const progress = Math.min((moveCount / minMoves) * 100, 100);

  // Chart data
  const chartData = metrics
    ? {
        labels: Array.from({ length: rounds }, (_, i) => i + 1),
        datasets: [
          {
            label: '3-Peg Recursive',
            data: metrics.executionTimes['3-Peg Recursive'],
            borderColor: '#00d4ff',
            backgroundColor: 'rgba(0, 212, 255, 0.3)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 8,
          },
          {
            label: '3-Peg Iterative',
            data: metrics.executionTimes['3-Peg Iterative'],
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46, 204, 113, 0.3)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 8,
          },
          {
            label: '4-Peg Frame-Stewart',
            data: metrics.executionTimes['4-Peg Frame-Stewart'],
            borderColor: '#f1c40f',
            backgroundColor: 'rgba(241, 196, 15, 0.3)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 8,
          },
        ],
      }
    : { labels: [], datasets: [] };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#fff', font: { family: 'Montserrat', size: 14 } },
      },
      title: {
        display: true,
        text: 'Algorithm Performance Metrics',
        color: '#fff',
        font: { family: 'Orbitron', size: 20 },
        padding: { bottom: 20 },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleFont: { family: 'Orbitron', size: 14 },
        bodyFont: { family: 'Montserrat', size: 12 },
        padding: 10,
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Round', color: '#fff', font: { family: 'Montserrat', size: 14 } },
        ticks: { color: '#fff', font: { family: 'Montserrat' } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        title: { display: true, text: 'Execution Time (ms)', color: '#fff', font: { family: 'Montserrat', size: 14 } },
        ticks: { color: '#fff', font: { family: 'Montserrat' } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
      axis: 'x',
    },
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-indigo-900 overflow-hidden animate-gradient">
      <div ref={starsContainerRef} className="fixed inset-0 pointer-events-none"></div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="dark" />
      <Link
        to="/"
        className="absolute top-6 left-6 text-white flex items-center hover:text-cyan-300 transition-colors duration-300"
        aria-label="Back to Dashboard"
      >
        <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </Link>
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-900 p-8 rounded-xl max-w-lg text-white shadow-2xl border border-cyan-500 animate-bounce-in">
            <h2 className="text-3xl font-bold mb-6 font-orbitron text-cyan-400">Welcome to Tower of Hanoi</h2>
            <p className="mb-6 text-lg">
              Your mission is to move all disks from the source peg (A) to the destination peg (C or D):
            </p>
            <ul className="list-disc pl-6 mb-6 text-base">
              <li>Click a peg to pick up or place a disk.</li>
              <li>Only one disk can be moved at a time.</li>
              <li>A larger disk cannot be placed on a smaller disk.</li>
              <li>Choose Random or Manual disk selection and adjust pegs/speed.</li>
            </ul>
            <button
              onClick={() => setShowTutorial(false)}
              className="p-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-transform transform hover:scale-105 shadow-lg"
            >
              Begin Adventure
            </button>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto p-6 relative">
        <h1 className="text-6xl font-bold text-center mb-10 text-white font-orbitron drop-shadow-lg">Tower of Hanoi</h1>

        {/* Side Popup for Errors/Success */}
        {popupMessage && (
          <div className={`fixed top-1/4 right-6 w-80 p-6 rounded-xl shadow-2xl animate-slide-in text-white z-50
            ${popupMessage.type === 'error' ? 'bg-red-600 border-red-400' : 'bg-green-600 border-green-400'}`}>
            <div className="flex items-center">
              <span className="text-2xl mr-3">{popupMessage.type === 'error' ? '❌' : '✅'}</span>
              <p className="text-lg font-montserrat">{popupMessage.message}</p>
            </div>
          </div>
        )}

        {/* Win Popup */}
        {winPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-900 p-8 rounded-xl max-w-2xl text-white shadow-2xl border border-cyan-500 animate-bounce-in">
              <h2 className="text-3xl font-bold mb-6 font-orbitron text-cyan-400">{winPopup.message}</h2>
              {Object.entries(winPopup.algorithmResults).map(([algo, result]) => (
                <div key={algo} className="mb-4">
                  <h3 className="text-xl font-bold">{algo}</h3>
                  <p>Minimum Moves: {result.numOfMoves}</p>
                  <p>Execution Time: {result.executionTimeMs} ms</p>
                  <p className="text-sm break-words">Sequence: {result.sequenceOfMoves}</p>
                </div>
              ))}
              <button
                onClick={() => setWinPopup(null)}
                className="p-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-gray-800 bg-opacity-60 backdrop-blur-xl p-6 rounded-xl mb-6 shadow-xl">
          <div className="flex flex-col">
            <label className="text-white font-bold mb-2 text-lg">Pegs:</label>
            <select
              value={pegCount}
              onChange={(e) => setPegCount(parseInt(e.target.value))}
              className="p-3 rounded-lg bg-gray-900 text-white border border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
              aria-label="Select number of pegs"
            >
              <option value={3}>3 Pegs</option>
              <option value={4}>4 Pegs</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-white font-bold mb-2 text-lg">Disk Selection:</label>
            <select
              value={diskSelectionMode}
              onChange={(e) => setDiskSelectionMode(e.target.value)}
              className="p-3 rounded-lg bg-gray-900 text-white border border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
              aria-label="Select disk selection mode"
            >
              <option value="Random">Random</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
          {diskSelectionMode === 'Manual' && (
            <div className="flex flex-col">
              <label className="text-white font-bold mb-2 text-lg">Disk Count (5-10):</label>
              <input
                type="number"
                min="5"
                max="10"
                value={manualDiskCount}
                onChange={handleManualDiskCountChange}
                placeholder="Enter disk count"
                className={`p-3 rounded-lg bg-gray-900 text-white border-2 
                  ${manualDiskCount >= 5 && manualDiskCount <= 10 ? 'border-green-500' : 'border-red-500'} 
                  focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300`}
                aria-label="Enter disk count"
              />
              {(manualDiskCount < 5 || manualDiskCount > 10) && (
                <p className="text-red-400 text-sm mt-2">Enter a number between 5 and 10</p>
              )}
            </div>
          )}
          <div className="flex flex-col">
            <label className="text-white font-bold mb-2 text-lg">Speed:</label>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={1050 - autoPlaySpeed}
              onChange={(e) => setAutoPlaySpeed(1050 - parseInt(e.target.value))}
              className="w-full accent-cyan-500 h-2 rounded-lg"
              aria-label="Adjust auto-solve speed"
            />
          </div>
          <button
            onClick={handleRestart}
            className="flex items-center justify-center p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105 shadow-lg"
            aria-label="Restart game"
          >
            <span className="mr-2">🔁</span> Restart
          </button>
          <button
            onClick={handleAutoSolve}
            className="flex items-center justify-center p-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-transform transform hover:scale-105 shadow-lg"
            aria-label="Auto solve"
          >
            <span className="mr-2">🤖</span> Auto Solve
          </button>
          <div className="flex items-center text-white font-bold text-lg">
            Moves: <span className="ml-3 bg-gray-700 px-3 py-1 rounded-lg shadow">{moveCount}</span>
          </div>
        </div>

        <div className="w-full bg-gray-800 rounded-lg h-3 mt-6 overflow-hidden">
          <div
            className="h-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
            aria-label={`Progress: ${Math.round(progress)}%`}
          ></div>
          <p className="text-white text-base mt-2 text-center font-montserrat">
            Progress: {Math.round(progress)}% (Min Moves: {minMoves})
          </p>
        </div>

        <div className="relative flex justify-around mb-6 pb-16 px-6">
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg"></div>
          {poles.slice(0, pegCount).map((pole, poleIndex) => (
            <div
              key={poleIndex}
              className="pole-container relative w-28 h-80 flex flex-col items-center cursor-pointer hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200"
              onClick={() => handlePoleClick(poleIndex)}
              role="button"
              tabIndex={0}
              aria-label={`Peg ${pegLabels[poleIndex]} with ${pole.length} disks`}
              onKeyDown={(e) => e.key === 'Enter' && handlePoleClick(poleIndex)}
            >
              <div className="absolute bottom-6 w-3 h-72 bg-gradient-to-b from-yellow-400 to-orange-600 rounded-full shadow-glow animate-pulse"></div>
              <div className="absolute bottom-1 text-white font-bold text-lg">{pegLabels[poleIndex]}</div>
              {pole.map((diskSize, diskIndex) => (
                <div
                  key={`disk-${poleIndex}-${diskIndex}`}
                  className={`absolute h-7 rounded-full shadow-xl transition-transform duration-300 
                    bg-gradient-to-r from-cyan-500 to-blue-700 border-2 border-cyan-300 
                    hover:scale-110 transform ${heldDisk === diskSize && fromPoleIndex === poleIndex ? 'animate-pulse' : ''} disk-${diskSize}`}
                  style={{
                    bottom: `${diskIndex * 28 + 24}px`,
                    zIndex: 10 - diskSize,
                    width: `${24 + diskSize * 14}px`,
                  }}
                >
                  <div className="flex items-center justify-center h-full text-sm text-white font-bold drop-shadow">
                    {diskSize}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {heldDisk && (
          <div className="fixed top-6 left-6 bg-gray-900 bg-opacity-90 text-white p-4 rounded-xl font-bold text-lg border-2 border-cyan-400 shadow-glow animate-pulse">
            🎯 Holding: Disk {heldDisk}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-800 bg-opacity-60 backdrop-blur-xl p-6 rounded-xl mb-6 shadow-xl">
          <div className="flex flex-col">
            <label className="text-white font-bold mb-2 text-lg">Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className={`p-3 rounded-lg bg-gray-900 text-white border-2 
                ${username ? 'border-green-500' : 'border-red-500'} 
                focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
              aria-label="Enter username"
            />
            {!username && (
              <p className="text-red-400 text-sm mt-2">Username is required</p>
            )}
          </div>
          <div className="flex flex-col">
            <label className="text-white font-bold mb-2 text-lg">Number of Moves:</label>
            <input
              type="number"
              min="1"
              value={numOfMoves}
              onChange={(e) => setNumOfMoves(e.target.value)}
              placeholder="Enter number"
              className={`p-3 rounded-lg bg-gray-900 text-white border-2 
                ${numOfMoves > 0 ? 'border-green-500' : 'border-red-500'} 
                focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
              aria-label="Enter number of moves"
            />
            {numOfMoves <= 0 && (
              <p className="text-red-400 text-sm mt-2">Enter a valid number</p>
            )}
          </div>
          <div className="flex flex-col md:col-span-2 lg:col-span-1">
            <label className="text-white font-bold mb-2 text-lg">Move Sequence:</label>
            <textarea
              value={moveSequence}
              onChange={(e) => setMoveSequence(e.target.value)}
              placeholder="e.g., A->B, B->C"
              rows="4"
              className="p-3 rounded-lg bg-gray-900 text-white border-2 border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 resize-y transition-all duration-300"
              aria-label="Enter move sequence"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="md:col-span-2 lg:col-span-3 flex items-center justify-center p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 shadow-lg text-lg"
            aria-label="Submit solution"
          >
            <span className="mr-2">✓</span> Submit
          </button>
        </div>

        <div className="bg-gray-800 bg-opacity-60 backdrop-blur-xl p-6 rounded-xl shadow-xl">
          <h2 className="text-3xl font-bold text-white font-orbitron mb-6">Performance Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col">
              <label className="text-white font-bold mb-2 text-lg">Number of Rounds:</label>
              <input
                type="number"
                min="1"
                value={rounds}
                onChange={(e) => setRounds(e.target.value)}
                placeholder="Enter rounds"
                className={`p-3 rounded-lg bg-gray-900 text-white border-2 
                  ${rounds > 0 ? 'border-green-500' : 'border-red-500'} 
                  focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300`}
                aria-label="Enter number of rounds"
              />
              {rounds <= 0 && (
                <p className="text-red-400 text-sm mt-2">Enter a valid number</p>
              )}
            </div>
            <button
              onClick={handleFetchMetrics}
              className="flex items-center justify-center p-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-transform transform hover:scale-105 shadow-lg text-lg"
              aria-label="Fetch performance metrics"
            >
              <span className="mr-2">📊</span> Fetch Metrics
            </button>
          </div>
          {metrics && (
            <div className="bg-gray-900 bg-opacity-90 p-6 rounded-xl shadow-2xl">
              <Line data={chartData} options={chartOptions} />
              <div className="mt-6 text-white">
                <h3 className="text-xl font-bold mb-3 font-orbitron">What This Data Means</h3>
                <p className="text-base">
                  The chart displays execution times (in milliseconds) for the last {rounds} runs of three algorithms:
                </p>
                <ul className="list-disc pl-6 mt-3 text-base">
                  <li>
                    <strong>3-Peg Recursive (O(2^n))</strong>: Recursive approach for 3 pegs, computationally expensive.
                  </li>
                  <li>
                    <strong>3-Peg Iterative (O(2^n))</strong>: Iterative approach, potentially more efficient.
                  </li>
                  <li>
                    <strong>4-Peg Frame-Stewart (O(2^√(2n)))</strong>: Efficient for 4 pegs, lower complexity.
                  </li>
                </ul>
                <p className="mt-3 italic text-base">
                  Compare algorithm efficiency for your setup (Disks: {diskCount}, Pegs: {pegCount}).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TowerOfHanoi;