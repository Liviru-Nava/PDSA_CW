import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextureLoader } from 'three';

const EightQueens = () => {
  // State variables
  const [username, setUsername] = useState(localStorage.getItem('eightQueensUsername') || '');
  const [playerId, setPlayerId] = useState(localStorage.getItem('eightQueensPlayerId') || null);
  const [gameId, setGameId] = useState(4);
  const [board, setBoard] = useState(Array(8).fill(-1));
  const [message, setMessage] = useState('');
  const [isUserRegistered, setIsUserRegistered] = useState(!!localStorage.getItem('eightQueensUsername'));
  const [isLoading, setIsLoading] = useState(false);
  const [completionTimeSeconds, setCompletionTimeSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [algorithmRuns, setAlgorithmRuns] = useState(5);
  const [threats, setThreats] = useState([]);
  const [placedQueens, setPlacedQueens] = useState(0);

  // Refs
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const queenModelsRef = useRef([]);
  const boardTilesRef = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const isMountedRef = useRef(false);
  const particlesRef = useRef(null);
  const shineRef = useRef(null);

  // Constants
  const BOARD_SIZE = 8;
  const TILE_SIZE = 1;

  const navigate = useNavigate();

  // Check if queens threaten each other
  const checkThreats = (board) => {
    const threats = [];
    for (let row1 = 0; row1 < BOARD_SIZE; row1++) {
      if (board[row1] === -1) continue;
      for (let row2 = row1 + 1; row2 < BOARD_SIZE; row2++) {
        if (board[row2] === -1) continue;
        const col1 = board[row1];
        const col2 = board[row2];
        if (col1 === col2 || Math.abs(row1 - row2) === Math.abs(col1 - col2)) {
          threats.push({ row: row1, col: col1 });
          threats.push({ row: row2, col: col2 });
        }
      }
    }
    return threats;
  };

  // Timer effect
  useEffect(() => {
    if (timerRunning) {
      startTimeRef.current = Date.now() - (completionTimeSeconds * 1000);
      timerRef.current = setInterval(() => {
        setCompletionTimeSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  useEffect(() => {
    fetch('http://localhost:8081/pdsa/eightqueens/compute/threaded/4/10', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        console.log('API call completed with status:', response.status);
      })
      .catch(error => {
        console.error('Error calling API:', error);
      });
  }, []);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Register player
  const registerPlayer = async () => {
    if (!username.trim()) {
      setMessage('Please enter a username');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8081/pdsa/eightqueens/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      if (response.ok) {
        setPlayerId(data.playerId);
        setIsUserRegistered(true);
        localStorage.setItem('eightQueensUsername', username);
        localStorage.setItem('eightQueensPlayerId', data.playerId);
        setMessage(`Welcome, ${username}! Place 8 queens so no queen threatens another.`);
        setTimerRunning(true);
      } else {
        setMessage(data.message || 'Error registering player.');
      }
    } catch (error) {
      setMessage('Error connecting to the server.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear localStorage when returning to dashboard
  const handleBackToDashboard = () => {
    localStorage.removeItem('eightQueensUsername');
    localStorage.removeItem('eightQueensPlayerId');
    setIsUserRegistered(false);
    navigate('/');
  };

  // Submit solution
  const submitSolution = async () => {
    if (placedQueens !== 8) {
      setMessage('Place exactly 8 queens on the board.');
      return;
    }

    if (threats.length > 0) {
      setMessage('Invalid solution: Some queens threaten each other.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8081/pdsa/eightqueens/solutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          playerId,
          configuration: board,
          completionTimeSeconds,
          createdAt: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      setMessage(data.message);
      if (data.message.includes('accepted') || data.message.includes('Congratulations')) {
        setTimerRunning(false);
        setTimeout(() => {
          resetBoard();
          setCompletionTimeSeconds(0);
          setTimerRunning(true);
        }, 3000);
      }
    } catch (error) {
      setMessage('Error submitting solution.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get random solution
  const getRandomSolution = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8081/pdsa/eightqueens/solutions/random/${gameId}`);
      const data = await response.json();
      if (response.ok) {
        setBoard([...data.configuration]);
        setThreats([]);
        setPlacedQueens(8);
        updateBoardVisuals();
        setMessage('Valid solution displayed! Try another configuration.');
      } else {
        setMessage('Error fetching random solution.');
      }
    } catch (error) {
      setMessage('Error connecting to the server.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate performance report
  const generateReport = async () => {
    if (algorithmRuns <= 0) {
      setMessage('Enter a valid number of runs (greater than 0).');
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all([
        fetch('http://localhost:8081/pdsa/eightqueens/compute/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId, algorithmType: 'Sequential', runs: algorithmRuns }),
        }),
        fetch('http://localhost:8081/pdsa/eightqueens/compute/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId, algorithmType: 'Threaded', runs: algorithmRuns }),
        }),
      ]);

      const response = await fetch('http://localhost:8081/pdsa/eightqueens/report/average');
      const data = await response.json();

      if (response.ok) {
        setReportData(data);
        setShowReport(true);
      } else {
        setMessage('Error fetching report data.');
      }
    } catch (error) {
      setMessage('Error connecting to the server.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset board
  const resetBoard = () => {
    setBoard(Array(8).fill(-1));
    setThreats([]);
    setPlacedQueens(0);
    updateBoardVisuals();
    setMessage('Board reset. Place your queens.');
  };

  // Update board visuals
  const updateBoardVisuals = () => {
    if (!sceneRef.current) return;

    // Clear existing queens
    queenModelsRef.current.forEach((queen) => {
      if (queen && queen.parent) queen.parent.remove(queen);
    });
    queenModelsRef.current = [];

    // Update tile colors
    boardTilesRef.current.forEach((tile, index) => {
      const row = Math.floor(index / BOARD_SIZE);
      const col = index % BOARD_SIZE;
      const isWhite = (row + col) % 2 === 0;
      const isThreatened = threats.some((t) => t.row === row && t.col === col);
      tile.material.color.set(isThreatened ? 0xff5555 : isWhite ? 0xf5f5f5 : 0x333333);
    });

    // Place queens
    board.forEach((col, row) => {
      if (col !== -1) placeQueen(row, col);
    });
  };

  // Place a realistic queen
  const placeQueen = (row, col) => {
    if (!sceneRef.current) return;

    const queenGroup = new THREE.Group();

    // Queen material with metallic texture and environment map
    const textureLoader = new TextureLoader();
    const normalMap = textureLoader.load('/textures/metal_normal.jpg');
    const envMap = new THREE.CubeTextureLoader().load([
      '/textures/env/px.jpg',
      '/textures/env/nx.jpg',
      '/textures/env/py.jpg',
      '/textures/env/ny.jpg',
      '/textures/env/pz.jpg',
      '/textures/env/nz.jpg',
    ]);
    const queenMaterial = new THREE.MeshPhysicalMaterial({
      color: threats.some((t) => t.row === row && t.col === col) ? 0xff5555 : 0xe6b800,
      metalness: 0.9,
      roughness: 0.2,
      normalMap: normalMap,
      envMap: envMap,
      envMapIntensity: 1.5,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      sheen: 0.5,
      sheenColor: 0xffffff,
      specularIntensity: 0.8,
    });

    // Detailed base
    const baseGeometry = new THREE.TorusGeometry(0.45, 0.1, 16, 100);
    const base = new THREE.Mesh(baseGeometry, queenMaterial);
    base.position.y = 0.1;
    base.rotation.x = Math.PI / 2;
    queenGroup.add(base);

    // Ornate lower body
    const lowerBodyGeometry = new THREE.LatheGeometry(
      [
        [0, 0, 0],
        [0.35, 0, 0.1],
        [0.3, 0, 0.3],
        [0.4, 0, 0.5],
        [0.3, 0, 0.7],
      ],
      32
    );
    const lowerBody = new THREE.Mesh(lowerBodyGeometry, queenMaterial);
    lowerBody.position.y = 0.35;
    queenGroup.add(lowerBody);

    // Waist with gem-like detail
    const waistGeometry = new THREE.TorusGeometry(0.25, 0.08, 16, 100);
    const waist = new THREE.Mesh(waistGeometry, queenMaterial);
    waist.position.y = 0.9;
    waist.rotation.x = Math.PI / 2;
    queenGroup.add(waist);

    // Upper body
    const upperBodyGeometry = new THREE.LatheGeometry(
      [
        [0, 0, 0],
        [0.3, 0, 0.1],
        [0.35, 0, 0.3],
        [0.25, 0, 0.5],
      ],
      32
    );
    const upperBody = new THREE.Mesh(upperBodyGeometry, queenMaterial);
    upperBody.position.y = 1.1;
    queenGroup.add(upperBody);

    // Neck
    const neckGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 32);
    const neck = new THREE.Mesh(neckGeometry, queenMaterial);
    neck.position.y = 1.65;
    queenGroup.add(neck);

    // Head with crown
    const headGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const head = new THREE.Mesh(headGeometry, queenMaterial);
    head.position.y = 1.85;
    queenGroup.add(head);

    // Crown with intricate spikes
    const crownBaseGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 32);
    const crownBase = new THREE.Mesh(crownBaseGeometry, queenMaterial);
    crownBase.position.y = 2.0;
    queenGroup.add(crownBase);

    for (let i = 0; i < 8; i++) {
      const spikeGeometry = new THREE.ConeGeometry(0.06, 0.25, 12);
      const spike = new THREE.Mesh(spikeGeometry, queenMaterial);
      const angle = (i * Math.PI) / 4;
      spike.position.set(0.22 * Math.cos(angle), 2.15, 0.22 * Math.sin(angle));
      spike.rotation.set(Math.PI / 4, 0, Math.PI / 2);
      queenGroup.add(spike);
    }

    queenGroup.position.set(col * TILE_SIZE - 3.5 * TILE_SIZE, 0.1, row * TILE_SIZE - 3.5 * TILE_SIZE);
    queenGroup.castShadow = true;
    queenGroup.receiveShadow = true;
    sceneRef.current.add(queenGroup);
    queenModelsRef.current.push(queenGroup);
  };

  // Handle board click
  const handleBoardClick = (event) => {
    if (!isUserRegistered || !sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    const rect = rendererRef.current.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const intersects = raycaster.intersectObjects(boardTilesRef.current);

    if (intersects.length > 0) {
      const tileObject = intersects[0].object;
      const tileIndex = boardTilesRef.current.indexOf(tileObject);

      if (tileIndex !== -1) {
        const row = Math.floor(tileIndex / BOARD_SIZE);
        const col = tileIndex % BOARD_SIZE;
        const newBoard = [...board];

        if (newBoard[row] === col) {
          newBoard[row] = -1;
          setPlacedQueens((prev) => prev - 1);
          setMessage('Queen removed.');
        } else if (newBoard[row] === -1) {
          if (placedQueens >= 8) {
            setMessage('Maximum 8 queens reached! Remove a queen first.');
            return;
          }
          newBoard[row] = col;
          setPlacedQueens((prev) => prev + 1);
          const tempThreats = checkThreats(newBoard);
          if (tempThreats.some((t) => t.row === row && t.col === col)) {
            setMessage('Warning: This queen is under threat!');
          } else {
            setMessage(`Queen placed at row ${row + 1}, column ${col + 1}.`);
          }
        } else {
          setMessage('This row already has a queen! Remove it first.');
          return;
        }

        setBoard(newBoard);
        setThreats(checkThreats(newBoard));
        updateBoardVisuals();
      }
    }
  };

  // Setup Three.js scene
  useEffect(() => {
    if (!mountRef.current || isMountedRef.current) return;

    isMountedRef.current = true;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Animated particle background
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      colors[i * 3] = Math.random() * 0.5 + 0.5;
      colors[i * 3 + 1] = 0.3;
      colors[i * 3 + 2] = Math.random() * 0.5 + 0.5;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particlesRef.current = particles;
    scene.add(particles);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 10, 10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    scene.add(dirLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 5;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controlsRef.current = controls;

    const boardGroup = new THREE.Group();
    boardTilesRef.current = [];

    // Board base with reflective material
    const baseGeometry = new THREE.BoxGeometry(BOARD_SIZE * TILE_SIZE + 0.5, 0.3, BOARD_SIZE * TILE_SIZE + 0.5);
    const baseMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x4a2c40,
      metalness: 0.3,
      roughness: 0.4,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.2;
    base.receiveShadow = true;
    boardGroup.add(base);

    // Board tiles with slight gloss
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const tileGeometry = new THREE.BoxGeometry(TILE_SIZE, 0.1, TILE_SIZE);
        const isWhite = (row + col) % 2 === 0;
        const tileMaterial = new THREE.MeshPhysicalMaterial({
          color: isWhite ? 0xf5f5f5 : 0x333333,
          metalness: 0.2,
          roughness: 0.3,
          clearcoat: 0.4,
          clearcoatRoughness: 0.2,
        });
        const tile = new THREE.Mesh(tileGeometry, tileMaterial);
        tile.position.set(col * TILE_SIZE - 3.5 * TILE_SIZE, 0, row * TILE_SIZE - 3.5 * TILE_SIZE);
        tile.receiveShadow = true;
        boardGroup.add(tile);
        boardTilesRef.current.push(tile);
      }
    }

    // Board shine effect
    const shineGeometry = new THREE.PlaneGeometry(BOARD_SIZE * TILE_SIZE, BOARD_SIZE * TILE_SIZE);
    const shineMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        shineColor: { value: new THREE.Color(0xaaaaaa) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 shineColor;
        varying vec2 vUv;
        void main() {
          float shine = sin(vUv.x * 3.1416 + time) * cos(vUv.y * 3.1416 + time) * 0.3;
          gl_FragColor = vec4(shineColor * shine, shine * 0.5);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const shinePlane = new THREE.Mesh(shineGeometry, shineMaterial);
    shinePlane.position.y = 0.05;
    shinePlane.rotation.x = -Math.PI / 2;
    shineRef.current = shinePlane;
    boardGroup.add(shinePlane);

    scene.add(boardGroup);

    // Board borders
    const borderGeometry = new THREE.BoxGeometry(BOARD_SIZE * TILE_SIZE + 0.3, 0.15, 0.15);
    const borderMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xaa6c39,
      metalness: 0.5,
      roughness: 0.3,
    });
    const borders = [
      { position: [0, 0.05, -4.075], rotation: [0, 0, 0] },
      { position: [0, 0.05, 4.075], rotation: [0, 0, 0] },
      { position: [-4.075, 0.05, 0], rotation: [0, Math.PI / 2, 0] },
      { position: [4.075, 0.05, 0], rotation: [0, Math.PI / 2, 0] },
    ];

    borders.forEach(({ position, rotation }) => {
      const border = new THREE.Mesh(borderGeometry, borderMaterial);
      border.position.set(...position);
      border.rotation.set(...rotation);
      boardGroup.add(border);
    });

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      // Animate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.001;
        const positions = particlesRef.current.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.01;
          if (positions[i * 3 + 1] > 25) positions[i * 3 + 1] -= 50;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Animate board shine
      if (shineRef.current) {
        shineRef.current.material.uniforms.time.value += 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  // Add click listener
  useEffect(() => {
    const canvas = rendererRef.current?.domElement;
    if (canvas) {
      canvas.addEventListener('click', handleBoardClick);
      return () => canvas.removeEventListener('click', handleBoardClick);
    }
  }, [board, isUserRegistered]);

  // Update visuals and threats
  useEffect(() => {
    setThreats(checkThreats(board));
    updateBoardVisuals();
  }, [board]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col">
      {/* Background borders */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 z-50" />
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 z-50" />
      <div className="fixed top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 via-pink-500 to-red-500 z-50" />
      <div className="fixed top-0 right-0 w-1 h-full bg-gradient-to-b from-red-500 via-pink-500 to-purple-500 z-50" />

      {/* Back button */}
      <Link
        to="/"
        onClick={handleBackToDashboard}
        className="absolute top-6 left-6 text-white flex items-center hover:text-pink-300 z-50 transition-colors duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Main content */}
      <div className="flex flex-row w-full h-screen z-10">
        {/* Chessboard */}
        <div className="w-2/3 h-full relative bg-gray-800">
          <div ref={mountRef} className="w-full h-full" />

          {/* Username prompt */}
          {!isUserRegistered && (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-80 z-40">
              <div className="bg-gray-900 p-8 rounded-xl shadow-2xl max-w-md border border-pink-500/50">
                <h2 className="text-3xl font-bold mb-4 text-pink-300">Eight Queens Puzzle</h2>
                <p className="text-gray-300 mb-6 text-sm">
                  Place 8 queens on the chessboard such that no queen threatens another. Queens can attack horizontally, vertically, or diagonally.
                </p>
                <div className="flex mb-4">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors duration-200"
                  />
                  <button
                    onClick={registerPlayer}
                    disabled={isLoading}
                    className="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-r-md hover:opacity-90 focus:ring-2 focus:ring-pink-500 transition-all duration-300 disabled:opacity-50"
                    style={{outline: 'none'}}
                  >
                    {isLoading ? 'Loading...' : 'Start Game'}
                  </button>
                </div>
                {message && <div className="text-yellow-300 text-sm mt-2">{message}</div>}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {isUserRegistered && (
          <div className="w-1/3 h-full bg-gray-900 p-6 overflow-y-auto border-l border-gray-700">
            <div className="bg-gray-800 p-4 rounded-lg mb-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-white">Game Status</h2>
              <div className="grid grid-cols-2 gap-4 text-center mb-4">
                <div className="bg-gray-700 p-3 rounded-md">
                  <h3 className="text-pink-300 text-sm mb-1">Player</h3>
                  <span className="text-white text-sm">{username}</span>
                </div>
                <div className="bg-gray-700 p-3 rounded-md">
                  <h3 className="text-pink-300 text-sm mb-1">Time</h3>
                  <span className="text-white font-mono">{formatTime(completionTimeSeconds)}</span>
                </div>
                <div className="bg-gray-700 p-3 rounded-md col-span-2">
                  <h3 className="text-pink-300 text-sm mb-2">Queens Placed ({placedQueens}/8)</h3>
                  <div className="flex justify-center gap-2">
                    {Array(8).fill(0).map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full ${
                          placedQueens > i ? 'bg-pink-500' : 'bg-gray-600'
                        } transition-colors duration-200`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={submitSolution}
                disabled={isLoading || placedQueens !== 8}
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-all duration-300"
              >
                Submit Solution
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={resetBoard}
                  className="py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-all duration-300"
                >
                  Reset Board
                </button>
                <button
                  onClick={getRandomSolution}
                  disabled={isLoading}
                  className="py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-600 disabled:opacity-50 transition-all duration-300"
                >
                  Show Solution
                </button>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-pink-300 font-medium mb-3">Performance Report</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    value={algorithmRuns}
                    onChange={(e) => setAlgorithmRuns(Math.max(1, parseInt(e.target.value) || 1))}
                    placeholder="Number of runs"
                    min="1"
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <button
                    onClick={generateReport}
                    disabled={isLoading}
                    className="px-4 py-2 bg-purple-700 text-white rounded-r-md hover:bg-purple-600 disabled:opacity-50 transition-all duration-300"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-gray-400 text-xs">Number of algorithm runs for performance testing</p>
              </div>
            </div>

            {message && (
              <div
                className={`mt-4 p-4 rounded-md text-sm border-l-4 ${
                  message.includes('Warning') || message.includes('Error')
                    ? 'bg-red-900/50 text-red-200 border-red-500'
                    : 'bg-green-900/50 text-green-200 border-green-500'
                }`}
              >
                {message}
              </div>
            )}

            <div className="mt-6 bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-2">How to Play</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-pink-400 mr-2">•</span>
                  Click a square to place a queen (one per row)
                </li>
                <li className="flex items-start">
                  <span className="text-pink-400 mr-2">•</span>
                  Queens must not threaten each other
                </li>
                <li className="flex items-start">
                  <span className="text-pink-400 mr-2">•</span>
                  Red tiles indicate threatening queens
                </li>
                <li className="flex items-start">
                  <span className="text-pink-400 mr-2">•</span>
                  Place exactly 8 queens to win
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-pink-500/30">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-pink-300">Algorithm Performance Report</h2>
              <button onClick={() => setShowReport(false)} className="text-gray-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {reportData && (
              <div className="mb-4">
                <div className="flex justify-center items-center mb-2">
                  <span className="text-gray-300 text-sm">
                    Based on <span className="text-pink-300 font-bold">{algorithmRuns}</span> runs per algorithm
                  </span>
                </div>

                <div className="relative h-48 mb-4">
                  <div className="absolute bottom-0 left-0 w-full h-full flex justify-around items-end">
                    <div className="flex flex-col items-center w-1/3">
                      <div className="text-white text-sm mb-1">{Math.round(reportData.sequentialAverageMs)} ms</div>
                      <div
                        className="w-20 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-md transition-all duration-500 shadow-lg shadow-cyan-500/20"
                        style={{
                          height: `${
                            (reportData.sequentialAverageMs /
                              Math.max(reportData.sequentialAverageMs, reportData.threadedAverageMs)) *
                            160
                          }px`,
                        }}
                      ></div>
                      <div className="text-white mt-1 text-sm">Sequential</div>
                    </div>
                    <div className="flex flex-col items-center w-1/3">
                      <div className="text-white text-sm mb-1">{Math.round(reportData.threadedAverageMs)} ms</div>
                      <div
                        className="w-20 bg-gradient-to-t from-pink-600 to-pink-400 rounded-t-md transition-all duration-500 shadow-lg shadow-pink-500/20"
                        style={{
                          height: `${
                            (reportData.threadedAverageMs /
                              Math.max(reportData.sequentialAverageMs, reportData.threadedAverageMs)) *
                            160
                          }px`,
                        }}
                      ></div>
                      <div className="text-white mt-1 text-sm">Threaded</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-center">
                  <div className="bg-gray-700/80 p-3 rounded-md border border-cyan-500/30">
                    <h3 className="text-base font-medium text-white mb-1">Sequential Algorithm</h3>
                    <p className="text-gray-300 text-sm mb-1">
                      Avg time: <span className="text-cyan-400 font-bold">{reportData.sequentialAverageMs.toFixed(2)} ms</span>
                    </p>
                    <div className="flex justify-center items-center">
                      <span className="text-gray-400 text-xs">Single-threaded</span>
                    </div>
                  </div>
                  <div className="bg-gray-700/80 p-3 rounded-md border border-pink-500/30">
                    <h3 className="text-base font-medium text-white mb-1">Threaded Algorithm</h3>
                    <p className="text-gray-300 text-sm mb-1">
                      Avg time: <span className="text-pink-400 font-bold">{reportData.threadedAverageMs.toFixed(2)} ms</span>
                    </p>
                    <div className="flex justify-center items-center">
                      <span className="text-gray-400 text-xs">Multi-threaded (4 workers)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-gray-300 bg-gray-800/80 p-3 rounded-md border border-purple-500/20 text-sm">
                  <p>
                    The chart shows average execution time in milliseconds for {algorithmRuns} runs per algorithm. 
                    The threaded algorithm uses 4 threads, each handling part of the search space, 
                    while the sequential algorithm processes it all in one thread.
                  </p>
                </div>

                <div className="mt-3 bg-gray-700/50 p-2 rounded-md">
                  <h4 className="text-white font-medium text-sm mb-1">Performance Analysis</h4>
                  <p className="text-gray-300 text-xs">
                    {reportData.threadedAverageMs < reportData.sequentialAverageMs
                      ? `The threaded algorithm is ~${(
                          reportData.sequentialAverageMs / reportData.threadedAverageMs
                        ).toFixed(2)}x faster, showing parallel processing benefits.`
                      : `The sequential algorithm performed better, likely due to thread management overhead.`}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowReport(false)}
              className="w-full py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-md hover:opacity-90 transition-all duration-300 mt-4"
            >
              Close Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EightQueens;