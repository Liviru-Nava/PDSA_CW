import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Dashboard = () => {
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  //player name states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [username, setUsername] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const games = [
    {
      id: 'tictactoe',
      title: 'Tic-Tac-Toe',
      description: 'Classic game of X and O on a 3x3 grid',
      color: '#FF6B6B',
      icon: '⭕',
      route: '/tictactoe',
      category: 'classic',
      difficulty: 'easy',
      players: '2'
    },
    {
      id: 'salesman',
      title: 'Traveling Salesman',
      description: 'Find the shortest path through all cities',
      color: '#4ECDC4',
      icon: '🗺️',
      route: '/traveling-salesman',
      category: 'puzzle',
      difficulty: 'hard',
      players: '1'
    },
    {
      id: 'hanoi',
      title: 'Tower of Hanoi',
      description: 'Move disks from one tower to another',
      color: '#FFD166',
      icon: '🗼',
      route: '/tower-of-hanoi',
      category: 'puzzle',
      difficulty: 'medium',
      players: '1'
    },
    {
      id: 'queens',
      title: 'Eight Queens Puzzle',
      description: 'Place 8 queens on a chessboard without threats',
      color: '#F06292',
      icon: '♛',
      route: '/eight-queens',
      category: 'puzzle',
      difficulty: 'hard',
      players: '1'
    },
    {
      id: 'knight',
      title: 'Knight\'s Tour',
      description: 'Move the knight to visit every square once',
      color: '#6A0572',
      icon: '♞',
      route: '/knights-tour',
      category: 'puzzle',
      difficulty: 'medium',
      players: '1'
    }
  ];

  const filteredGames = activeCategory === 'all' 
    ? games 
    : games.filter(game => game.category === activeCategory);

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
    renderer.setClearColor(0x000000, 0);
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
    controls.rotateSpeed = 0.5;
    controls.enableZoom = false;
    
    // Create background elements
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 50;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Create particle system with gradient colors
    const createParticleSystem = (count, range) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      
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
        new THREE.IcosahedronGeometry(5, 0),
        0xFF6B6B,
        [15, -8, -15],
        [0, 0, 0]
      ),
      createFloatingShape(
        new THREE.OctahedronGeometry(4, 0),
        0x4ECDC4,
        [-15, 8, -12],
        [0, 0, 0]
      ),
      createFloatingShape(
        new THREE.TetrahedronGeometry(3, 0),
        0xFFD166,
        [10, 12, -10],
        [0, 0, 0]
      ),
      createFloatingShape(
        new THREE.DodecahedronGeometry(4, 0),
        0xF06292,
        [-12, -10, -8],
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
  
  const navigateToGame = (game) => {
    if (game.id === 'salesman') {
      setSelectedGame(game);
      setShowLoginModal(true);
      setUsername('');
      setLoginError('');
    } else {
      navigate(game.route);
    }
  };
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setLoginError('Username cannot be empty');
      return;
    }
  
    setIsLoading(true);
    setLoginError('');
    
    try {
      // Check if username exists
      const checkResponse = await fetch(`http://localhost:8081/pdsa/check?username=${username}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const checkResult = await checkResponse.json();
      
      if (checkResult.exists) {
        setLoginError('Username already exists.');
        setIsLoading(false);
        setPlayerId(checkResult.playerId);
        return;
      }
      
      // Register the player
      const registerResponse = await fetch('http://localhost:8081/pdsa/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const result = await registerResponse.json();
      
      const player_id = result.playerId;
      setPlayerId(player_id);
      
      // Close modal and navigate
      setShowLoginModal(false);
      navigate(selectedGame.route, { 
        state: { playerId: result.playerId, username: result.username }
      });
    } catch (err) {
      setLoginError('Error connecting to server. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white overflow-hidden">
      {/* Improved contrast overlay */}
      <div className="fixed inset-0 bg-black opacity-50 z-0"></div>
      
      {/* 3D Background */}
      <div 
        ref={mountRef} 
        className="fixed inset-0 z-0"
      />
      
      {/* Game UI Frame Elements */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 z-10"></div>
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 z-10"></div>
      <div className="fixed top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 via-pink-500 to-red-500 z-10"></div>
      <div className="fixed top-0 right-0 w-1 h-full bg-gradient-to-b from-red-500 via-pink-500 to-purple-500 z-10"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            GAME ZONE
          </h1>
          <p className="text-xl text-cyan-300 max-w-2xl mx-auto">
            Enter a world of classic puzzles and brain teasers. Challenge yourself with these interactive games!
          </p>
        </header>
        
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button 
            className={`px-6 py-2 rounded-full text-lg font-medium transition-all duration-300 ${
              activeCategory === 'all' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            onClick={() => setActiveCategory('all')}
          >
            All Games
          </button>
          <button 
            className={`px-6 py-2 rounded-full text-lg font-medium transition-all duration-300 ${
              activeCategory === 'classic' 
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            onClick={() => setActiveCategory('classic')}
          >
            Classic
          </button>
          <button 
            className={`px-6 py-2 rounded-full text-lg font-medium transition-all duration-300 ${
              activeCategory === 'puzzle' 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            onClick={() => setActiveCategory('puzzle')}
          >
            Puzzles
          </button>
        </div>
        
        {/* Improved responsive grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          {filteredGames.map((game) => (
            <div 
              key={game.id}
              className="relative group"
              onMouseEnter={() => setHoveredCard(game.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigateToGame(game)}
            >
              <div 
                className="h-full rounded-xl shadow-lg p-5 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 backdrop-blur-sm bg-opacity-80 border border-transparent hover:border-opacity-50"
                style={{
                  backgroundColor: `${game.color}15`,
                  borderColor: game.color,
                  boxShadow: hoveredCard === game.id ? `0 8px 20px -4px ${game.color}40` : 'none'
                }}
              >
                {/* Game header */}
                <div className="flex flex-col mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{game.icon}</span>
                    <div className="h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300" style={{ backgroundColor: game.color }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-1 line-clamp-1">{game.title}</h2>
                </div>
                
                {/* Game info */}
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{game.description}</p>
                
                {/* Game stats */}
                <div className="flex justify-between text-xs text-gray-400 mt-auto">
                  <div className="flex items-center">
                    <div className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: game.color }}></div>
                    <span className="capitalize">{game.category}</span>
                  </div>
                  <div className="flex items-center">
                    <span>{game.players}P</span>
                  </div>
                  <div className="flex items-center">
                    <span className="capitalize">{game.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500">
          <div className="max-w-lg mx-auto">
            <div className="inline-block px-4 py-2 bg-gray-800 bg-opacity-50 rounded-lg backdrop-blur-sm">
              <p>Ready to challenge your mind? Select a game to begin!</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-70" onClick={() => setShowLoginModal(false)}></div>
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md relative z-10 border border-purple-500 shadow-lg shadow-purple-500/30">
            <h2 className="text-2xl font-bold mb-4 text-white">Enter Your Username</h2>
            <p className="text-gray-300 mb-6">Please enter a username to play {selectedGame?.title}</p>
            
            <form onSubmit={handleLoginSubmit}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Username"
                autoFocus
              />
              
              {loginError === 'Username already exists.' ? (
                <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg mb-4 border border-blue-500">
                  <p className="text-blue-300 mb-2">This username already exists.</p>
                  <p className="text-white">Is this you?</p>
                  <div className="flex gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        // Continue with existing user
                        setShowLoginModal(false);
                        navigate(selectedGame.route, { 
                          state: { playerId: playerId, username: username }
                        });
                      }}
                      className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      Yes, continue
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginError('');
                        setUsername('');
                      }}
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
                    >
                      No, use different name
                    </button>
                  </div>
                </div>
              ) : loginError ? (
                <div className="text-red-400 mb-4 bg-red-900 bg-opacity-30 p-2 rounded-lg">
                  {loginError}
                </div>
              ) : null}
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || loginError === 'exists'}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition"
                >
                  {isLoading ? 'Loading...' : 'Play Game'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;