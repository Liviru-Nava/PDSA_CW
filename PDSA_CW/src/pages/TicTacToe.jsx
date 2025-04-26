// App.jsx
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GameBoard from './components/GameBoard';
import StartModal from './components/StartModal';
import EndGameModal from './components/EndGameModal';
import InfoPanel from './components/InfoPanel';
import { checkWinner } from './utils/gameLogic';
import { makeComputerMove } from './utils/computerAI';

function TicTacToe() {
  const mountRef = useRef(null);
  const [board, setBoard] = useState(Array(25).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [playerName, setPlayerName] = useState('');
  const [algorithm, setAlgorithm] = useState('Minimax with Alpha-Beta Pruning');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showStartModal, setShowStartModal] = useState(true);
  const [showEndGameModal, setShowEndGameModal] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [moveTime, setMoveTime] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [allMoveTimes, setAllMoveTimes] = useState([]);
  const [capturedGameTime, setCapturedGameTime] = useState(0);

  const handleTimeUpdate = (timeInteger) => {
    setCapturedGameTime(timeInteger);
  };

  //3D Background
  useEffect(() => {
      // ThreeJS setup
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      
      // Store DOM element reference for cleanup
      const rendererDomElement = renderer.domElement;
      
      renderer.setSize(width, height);
      renderer.setClearColor(0x0000, 0);
      mountRef.current.appendChild(rendererDomElement);
      
      // Camera position
      camera.position.z = 15;
      
      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 10, 10);
      scene.add(directionalLight);
      
      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.7;
      controls.enableZoom = false;
      
      // Create background elements
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 2000;
      
      const posArray = new Float32Array(particlesCount * 3);
      for (let i = 0; i < particlesCount * 6; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 4));
      
      // Create particle system with gradient colors
      const createParticleSystem = (count, range) => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 4);
        const colors = new Float32Array(count * 4);
        
        const colorPalette = [
          new THREE.Color('#FF6B6B'),
          new THREE.Color('#4ECDC4'),
          new THREE.Color('#FFD166'),
          new THREE.Color('#F06292'),
          new THREE.Color('#6A0572')
        ];
        
        for (let i = 0; i < count * 3; i += 3) {
          positions[i] = (Math.random() - 0.5) * range;
          positions[i+1] = (Math.random() - 0.5) * range;
          positions[i+2] = (Math.random() - 0.5) * range;
          
          // Randomly select a color from the palette
          const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
          colors[i] = color.r;
          colors[i+1] = color.g;
          colors[i+2] = color.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
          size: 0.2,
          vertexColors: true,
          transparent: true,
          opacity: 0.7
        });
        
        return new THREE.Points(geometry, material);
      };
      
      // Create main particle system
      const particleSystem = createParticleSystem(1500, 50);
      scene.add(particleSystem);
      
      // Add floating geometric shapes
      const createFloatingShape = (geometry, color, position, rotation) => {
        const material = new THREE.MeshPhongMaterial({
          color: color,
          transparent: true,
          opacity: 0.4,
          wireframe: true
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...position);
        mesh.rotation.set(...rotation);
        scene.add(mesh);
        
        return mesh;
      };
      
      // Create geometric shapes with game colors
      const shapes = [
        createFloatingShape(
          new THREE.IcosahedronGeometry(15, 0),
          0xFF6B6B,
          [28, -5, -12],
          [0, 0, 0]
        ),
        createFloatingShape(
          new THREE.OctahedronGeometry(8, 0),
          0x4ECDC4,
          [-20, 10, -5],
          [0, 0, 0]
        ),
        createFloatingShape(
          new THREE.TetrahedronGeometry(6, 0),
          0xFFD166,
          [10, 20, -12],
          [0, 0, 0]
        ),
        createFloatingShape(
          new THREE.DodecahedronGeometry(14, 0),
          0xF06292,
          [-22, -24, -10],
          [0, 0, 0]
        )
      ];
      
      // Animation
      const animate = () => {
        controls.update();
        
        // Rotate particle system
        particleSystem.rotation.x += 0.0002;
        particleSystem.rotation.y += 0.0003;
        
        // Rotate shapes
        shapes.forEach((shape, index) => {
          const speed = 0.001 * (index + 1);
          shape.rotation.x += speed;
          shape.rotation.y += speed * 0.8;
          shape.rotation.z += speed * 0.5;
        });
        
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };
      
      animate();
      
      const handleResize = () => {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        if (mountRef.current && mountRef.current.contains(rendererDomElement)) {
          mountRef.current.removeChild(rendererDomElement);
        }
        renderer.dispose();
      };
    }, []);
  
  
  // Start game timer
  useEffect(() => {
    let interval;
    if (gameStarted && !gameOver) {
      interval = setInterval(() => {
        setGameTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

    // Handle computer's turn
    useEffect(() => {
      if (gameStarted && !isPlayerTurn && !gameOver) {
        const timer = setTimeout(() => {
          const startTime = performance.now();
          const newBoard = [...board];
          
          makeComputerMove(newBoard, algorithm)
            .then(moveIndex => {
              if (moveIndex !== null && newBoard[moveIndex] === null) {
                newBoard[moveIndex] = 'O';
                const endTime = performance.now();
                const currentMoveTime = endTime - startTime;
                
                setMoveTime(currentMoveTime);
                setLastMoveTime(currentMoveTime);
                setAllMoveTimes(prevTimes => [
                  ...prevTimes, 
                  { 
                    moveNumber: prevTimes.length + 1,
                    timeMs: currentMoveTime.toFixed(2) 
                  }
                ]);
                
                setBoard(newBoard);
                
                const result = checkWinner(newBoard);
                if (result) {
                  setWinner('Computer');
                  setGameOver(true);
                  setShowEndGameModal(true);
                } else if (!newBoard.includes(null)) {
                  setWinner('Draw');
                  setGameOver(true);
                  setShowEndGameModal(true);
                } else {
                  setIsPlayerTurn(true);
                }
              }
            });
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }, [board, isPlayerTurn, gameStarted, gameOver, algorithm]);

  const handleCellClick = (index) => {
    if (!gameStarted || !isPlayerTurn || board[index] !== null || gameOver) {
      return;
    }
    
    const newBoard = [...board];
    newBoard[index] = 'X';
    
    setBoard(newBoard);
    
    const result = checkWinner(newBoard);
    if (result) {
      setWinner(playerName);
      setGameOver(true);
      setShowEndGameModal(true);
    } else if (!newBoard.includes(null)) {
      setWinner('Draw');
      setGameOver(true);
      setShowEndGameModal(true);
    } else {
      setIsPlayerTurn(false);
    }
  };

  const handleStartGame = (name, selectedAlgorithm) => {
    setPlayerName(name);
    setAlgorithm(selectedAlgorithm);
    setShowStartModal(false);
    setGameStarted(true);
    resetGame();
  };

  const resetGame = () => {
    setBoard(Array(25).fill(null));
    setIsPlayerTurn(true);
    setGameOver(false);
    setWinner(null);
    setGameTime(0);
    setMoveTime(0);
    setLastMoveTime(0);
    setAllMoveTimes([]);
  };

  const handleRestartGame = () => {
    setShowEndGameModal(false);
    setShowStartModal(true);
    resetGame();
    setGameStarted(false);
  };

  const handleEndGame = () => {
    setShowEndGameModal(false);
    setShowStartModal(true);
    resetGame();
    setGameStarted(false);
  };

  //add a useEffect that watches for showEndGameModal changes
  useEffect(() => {
    if (showEndGameModal && winner === playerName) {
      // Create a 2D representation of the board
      const board2D = [];
      for (let i = 0; i < 5; i++) {
        board2D.push(board.slice(i * 5, (i + 1) * 5));
      }
      
      // Get all X and O positions in order
      const xPositions = [];
      const oPositions = [];
      
      board.forEach((cell, index) => {
        if (cell === 'X') {
          xPositions.push(index);
        } else if (cell === 'O') {
          oPositions.push(index);
        }
      });
      
      // Create moves array in chronological order
      const moves = [];
      const maxMoves = Math.max(xPositions.length, oPositions.length);
      
      for (let i = 0; i < maxMoves; i++) {
        if (i < xPositions.length) {
          moves.push({ symbol: 'X', position: xPositions[i] });
        }
        if (i < oPositions.length) {
          moves.push({ symbol: 'O', position: oPositions[i] });
        }
      }
      
      // Create a comprehensive game state object
      const gameState = {
        finalBoard: board,
        board2D: board2D,
        moves: moves,
        playerMoves: xPositions,
        algorithmMoves: oPositions,
        moveCount: moves.length
      };

      const totalTime = allMoveTimes.reduce((sum, move) => sum + Math.floor(Number(move.timeMs)), 0);
      console.log(totalTime);
      console.log(capturedGameTime)
      
      // Stringify the game state to send to backend
      const boardState = JSON.stringify(gameState);
      
      console.log("Final game state:", gameState);
      
      const fetchAlgorithms = async () => {
        try {
          const response = await fetch('http://localhost:8081/pdsa/Tic-Tac-Toe/game-end', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: playerName,
              completedTime: capturedGameTime,
              executionTime: totalTime,
              algorithmName: algorithm,
              boardState: boardState
            })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("Server response:", data);
        } catch (err) {
          console.error('Error sending game data:', err);
        }
      };
    
      fetchAlgorithms();
    }
  }, [showEndGameModal, board, playerName, algorithm]);


  const handleGameEnd = (board2D) => {
    // Do something with the 2D board
    console.log("Game ended with board:", board2D);
    // You can save it to state, process it, etc.
    
    // Maybe add state to store the 2D board if needed
    // const [finalBoard2D, setFinalBoard2D] = useState(null);
    // setFinalBoard2D(board2D);
  };

  return (
    <div className="min-h-screen bg-[#01051df5] text-white overflow-hidden">

      {/* 3D Background */}
      <div 
        ref={mountRef} 
        className="fixed inset-0 z-0"
      />

      <div className='relative z-10'>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className='w-full mt-6'>
            <h1 className='relative left-[570px]'
              style={{
                color: "#ffffff",
                textShadow: "0 0 10px #00ffff, 0 0 20px #00ffff",
                fontFamily: "serif",
                fontSize: "54px",
                border: "2px solid white",
                display: "inline-block",
                padding: "10px 25px",
                borderRadius: "8px",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
              }}
            >
              Tic-Tac-Toe
            </h1>
          </div>
        
        <div className="w-full h-[590px] flex flex-row justify-center gap-16 p-4">
          
          {showStartModal && (
            <StartModal onStart={handleStartGame} />
          )}
          
          {gameStarted && (
            <>
              
              <div className="w-[300px] mt-8">
                <div className="rounded-md overflow-hidden">
                  <table className="w-full border-none">
                    <thead>
                      <tr className="'bg-white/40 backdrop-blur-sm p-6 rounded-lg border border-white/20 shadow-lg">
                        <th className="px-2 py-2">Move</th>
                        <th className="px-3 py-2">Time (ms)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allMoveTimes.map((move, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-400/10 backdrop-blur-sm' : 'bg-gray-500/5 backdrop-blur-sm'}>
                          <td className="px-2 py-2 text-center">{move.moveNumber}</td>
                          <td className="px-3 py-2 text-center">{move.timeMs}</td>
                        </tr>
                      ))}
              
                      {allMoveTimes.length === 0 && (
                        <tr>
                          <td colSpan="3" className="px-4 py-2 text-center bg-gray-400/30 backdrop-blur-sm">No moves yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
    
              <div className="mt-4 mb-8">
                <GameBoard 
                  board={board} 
                  onCellClick={handleCellClick}
                />
              </div>
    
              <div className='flex flex-col items-center p-4 mt-4'>
              <InfoPanel 
                playerName={playerName} 
                isPlayerTurn={isPlayerTurn} 
                gameTime={gameTime} 
                algorithm={algorithm}
                onTimeUpdate={handleTimeUpdate}
              />
                
                <div className="w-full flex flex-row items-center justify-between gap-4">
                  <button 
                    onClick={resetGame}
                    className="w-[200px] text-xl font-bold bg-green-500/50 backdrop-blur-sm hover:bg-green-600/50 text-white px-6 py-4 rounded-lg"
                  >
                    Restart
                  </button>
                  <button 
                    onClick={handleEndGame}
                    className="w-[200px] text-xl font-bold bg-red-500/50 backdrop-blur-sm hover:bg-red-600/50 text-white px-6 py-4 rounded-lg"
                  >
                    End Game
                  </button>
                </div>
              </div>
    
              
            </>
          )}
          
          {showEndGameModal && (
            <EndGameModal
              winner={winner} 
              onRestart={handleRestartGame} 
              onExit={handleEndGame}
              onGameEnd={handleGameEnd}
            />
          )}
        </div>
        </div>
      </div>
    </div>  
      
  );
}

export default TicTacToe;