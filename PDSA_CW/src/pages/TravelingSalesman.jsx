import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// City data with coordinates
const CITY_DATA = [
  { id: 1, name: "A", position: [25, 0, 0] }, // 0°
  { id: 2, name: "B", position: [20.23, 0, 14.69] }, // 36°
  { id: 3, name: "C", position: [7.73, 0, 23.78] }, // 72°
  { id: 4, name: "D", position: [-7.73, 0, 23.78] }, // 108°
  { id: 5, name: "E", position: [-20.23, 0, 14.69] }, // 144°
  { id: 6, name: "F", position: [-25, 0, 0] }, // 180°
  { id: 7, name: "G", position: [-20.23, 0, -14.69] }, // 216°
  { id: 8, name: "H", position: [-7.73, 0, -23.78] }, // 252°
  { id: 9, name: "I", position: [7.73, 0, -23.78] }, // 288°
  { id: 10, name: "J", position: [20.23, 0, -14.69] }, // 324°
];


const TravelingSalesman = () => {
  const location = useLocation();
  const playerId = location.state?.playerId;
  const username = location.state?.username;
  
  //states for the traveling salesman problem
  const [homeCity, setHomeCity] = useState(null);
  const [selectedCities, setSelectedCities] = useState([]);
  const [distances, setDistances] = useState({});
  const [totalDistance, setTotalDistance] = useState(0);
  const [sceneInitialized, setSceneInitialized] = useState(false);

  //solutions
  const [optimalSolution, setOptimalSolution] = useState(null);
  const [showOptimal, setShowOptimal] = useState(false);

  //winner or not
  const [currentRound, setCurrentRound] = useState(1);
  const [gameStatus, setGameStatus] = useState(null); // null, 'won', 'lost'
  const [showGameStatusPopup, setShowGameStatusPopup] = useState(false);

  //timer states
  const [timer, setTimer] = useState(0);
  const [solveTime, setSolveTime] = useState(null);

  //view distance matrix
  const [showDistanceMatrix, setShowDistanceMatrix] = useState(false);

  //state for the algorithmPerformance
  const [algorithmPerformance, setAlgorithmPerformance] = useState(null);
  const [showAlgorithmDetails, setShowAlgorithmDetails] = useState(false);

  //animated dots for round number
  const [roundDots, setRoundDots] = useState(".");
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setRoundDots(dots => dots.length < 3 ? dots + "." : ".");
    }, 500);
    
    return () => clearInterval(dotsInterval);
  }, []);
  
  //references to 3D components, 3js elements, labels and paths
  const cityLabelsRef = useRef({});
  const distanceLabelsRef = useRef({});
  const mountRef = useRef(null);
  const labelsContainerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const cityObjectsRef = useRef({});
  const pathLinesRef = useRef({});
  const activePathsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const homeCityRef = useRef(null);
  const selectedCitiesRef = useRef([]);
  const timerRef = useRef(null);

  // Initialize Three.js scene - now with proper cleanup and reinitialization
  useEffect(() => {
    // Reset refs on component mount to ensure clean state
    cityLabelsRef.current = {};
    distanceLabelsRef.current = {};
    cityObjectsRef.current = {};
    pathLinesRef.current = {};
    activePathsRef.current = [];
    
    // Clean up any existing scene to prevent duplicates
    cleanup();
    
    // Reset state
    setSceneInitialized(false);
    
    // Then initialize the scene
    if (mountRef.current) {
      initScene();
    }
    
    // Cleanup function when component unmounts
    return () => {
      cleanup();
    };
  }, []); // Empty dependency array means this runs once on mount

  //for the timer
  useEffect(() => {
    // Start timer when component mounts
    timerRef.current = setInterval(() => {
      setTimer(prevTime => prevTime + 1);
    }, 1000);
    
    // Clear timer when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Function to clean up scene and resources
  const cleanup = () => {
    // Cancel animation frame if it exists
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Remove event listeners
    if (rendererRef.current?.domElement) {
      rendererRef.current.domElement.removeEventListener('click', handleClick);
    }
    
    window.removeEventListener('resize', handleResize);
    
    // Clean up all labels
    Object.values(cityLabelsRef.current).forEach(label => {
      if (label?.parentNode) {
        label.parentNode.removeChild(label);
      }
    });
    
    Object.values(distanceLabelsRef.current).forEach(label => {
      if (label?.parentNode) {
        label.parentNode.removeChild(label);
      }
    });
    
    // Clean up labels container
    if (labelsContainerRef.current?.parentNode) {
      labelsContainerRef.current.parentNode.removeChild(labelsContainerRef.current);
      labelsContainerRef.current = null;
    }
    
    // Clean up renderer
    if (rendererRef.current?.domElement && mountRef.current) {
      if (mountRef.current.contains(rendererRef.current.domElement)) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    }
    
    // Clean up renderer and Three.js objects
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    
    if (controlsRef.current) {
      controlsRef.current.dispose();
      controlsRef.current = null;
    }
    
    // Clean up scene and camera
    if (sceneRef.current) {
      // Dispose materials and geometries
      sceneRef.current.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      sceneRef.current = null;
    }
    
    cameraRef.current = null;
  };
  
  //for home city selection
  useEffect(() => {
    homeCityRef.current = homeCity;
    selectedCitiesRef.current = selectedCities;
  }, [homeCity, selectedCities]);

  // Function to handle click events on the renderer
  const handleClick = (event) => {
    // Calculate mouse position in normalized device coordinates
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Update the picking ray with the camera and mouse position
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    
    // Find all intersected objects - check for recursive children
    const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);
    
    // Check if we hit a city
    if (intersects.length > 0) {
      // Look for the first object that has cityId in userData
      for (let i = 0; i < intersects.length; i++) {
        const object = intersects[i].object;
        
        // Check if the object or any parent has the cityId
        let currentObj = object;
        while (currentObj) {
          if (currentObj.userData && currentObj.userData.type === 'station' && currentObj.userData.cityId) {
            const cityId = currentObj.userData.cityId;
            console.log("Selected city ID:", cityId);
            handleCitySelectWithRefs(cityId);
            return; // Exit after handling the first valid city
          }
          // Move up to parent if available
          currentObj = currentObj.parent;
        }
      }
    }
  };
  
  // Function to handle window resize
  const handleResize = () => {
    if (cameraRef.current && rendererRef.current) {
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    }
  };
  
  // Initialize the Three.js scene
  const initScene = () => {
    console.log("Initializing 3D scene");
    
    // Clear any previous content from mountRef
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    
    // Create a container for HTML labels with high z-index
    const labelsContainer = document.createElement('div');
    labelsContainer.className = 'absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none';
    labelsContainer.style.zIndex = "30";
    mountRef.current.appendChild(labelsContainer);
    labelsContainerRef.current = labelsContainer;
    console.log("labels for cities initialized");
    
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x000b18); // Dark space background
    console.log("space background initialized");
    
    // Add stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
    });
    console.log("stars and star materials initialized");
    
    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    console.log("stars added to scene");
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.set(0, 15, 15);
    console.log("camera initialized");
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);
    
    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404080, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x8080ff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    console.log("lights and ambient lights added to scene");
    
    // Create city models
    CITY_DATA.forEach(city => {
      // Create space station model
      const stationGroup = new THREE.Group();
      stationGroup.userData = { cityId: city.id, type: 'station' };
      
      // Main core module
      const coreGeometry = new THREE.CylinderGeometry(0.6, 0.6, 1.2, 8);
      const coreMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4080a0,
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0x102030,
        emissiveIntensity: 0.5
      });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      core.userData = { cityId: city.id, type: 'station' };
      stationGroup.add(core);
      
      // Add solar panels
      const panelGeometry = new THREE.PlaneGeometry(2, 0.5);
      const panelMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2060ff,
        metalness: 0.8,
        roughness: 0.2,
        side: THREE.DoubleSide
      });
      
      // Left panel
      const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
      leftPanel.position.set(-1.3, 0, 0);
      leftPanel.rotation.y = Math.PI / 2;
      leftPanel.userData = { cityId: city.id, type: 'station' };
      stationGroup.add(leftPanel);
      
      // Right panel
      const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
      rightPanel.position.set(1.3, 0, 0);
      rightPanel.rotation.y = Math.PI / 2;
      rightPanel.userData = { cityId: city.id, type: 'station' };
      stationGroup.add(rightPanel);
      
      // Add modules
      for (let i = 0; i < 3; i++) {
        const moduleGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.8);
        const moduleMaterial = new THREE.MeshStandardMaterial({ 
          color: new THREE.Color(0.6 + Math.random() * 0.2, 0.6 + Math.random() * 0.2, 0.7 + Math.random() * 0.3),
          metalness: 0.6,
          roughness: 0.4,
          emissive: 0x101020,
          emissiveIntensity: 0.3
        });
        const module = new THREE.Mesh(moduleGeometry, moduleMaterial);
        module.userData = { cityId: city.id, type: 'station' };
        
        // Position randomly around the core
        const angle = (i / 3) * Math.PI * 2;
        module.position.set(
          Math.cos(angle) * 0.9,
          (Math.random() - 0.5) * 0.4,
          Math.sin(angle) * 0.9
        );
        module.lookAt(new THREE.Vector3(0, module.position.y, 0));
        stationGroup.add(module);
      }
      
      // Position the station
      stationGroup.position.set(...city.position);
      stationGroup.rotation.y = Math.random() * Math.PI * 2;
      
      // Add to scene
      scene.add(stationGroup);
      console.log("Stations created and added to the space scene")
      
      // Store reference to the city object
      cityObjectsRef.current[city.id] = {
        model: stationGroup,
        name: city.name,
        position: city.position,
      };
      
      // Create HTML element for city label - always visible
      const cityLabelDiv = document.createElement('div');
      cityLabelDiv.className = 'absolute px-2 py-1 text-cyan-300 text-sm font-bold bg-black bg-opacity-70 rounded-md border border-cyan-500 pointer-events-none';
      cityLabelDiv.textContent = city.name;
      cityLabelDiv.style.visibility = 'visible'; // Start visible
      labelsContainerRef.current.appendChild(cityLabelDiv);
      
      // Store the HTML element in the ref directly
      cityLabelsRef.current[city.id] = cityLabelDiv;
    });
    
    // Generate symmetric distances between cities and create paths immediately
    const newDistances = {};
    
    // Initialize the distance matrix
    CITY_DATA.forEach(city => {
      newDistances[city.id] = {};
    });
    
    // Fill distance matrix with symmetric distances
    for (let i = 0; i < CITY_DATA.length; i++) {
      const city1 = CITY_DATA[i];
      
      for (let j = i + 1; j < CITY_DATA.length; j++) {
        const city2 = CITY_DATA[j];
        
        if (city1.id !== city2.id) {
          // Generate one random distance for this pair
          const distance = Math.floor(Math.random() * 51) + 50;
          
          // Set the same distance for both directions
          newDistances[city1.id][city2.id] = distance;
          newDistances[city2.id][city1.id] = distance;
          
          // Create path between cities with distance label visible from start
          createPath(city1.id, city2.id, distance, 0x303060, true);
        }
      }
    }
    
    setDistances(newDistances);
    
    // Add click event listener to the renderer
    renderer.domElement.addEventListener('click', handleClick);
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Start animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      // Update city labels - always visible
      Object.entries(cityLabelsRef.current).forEach(([cityId, labelEl]) => {
        const cityObj = cityObjectsRef.current[cityId];
        if (cityObj && labelEl) {
          const position = new THREE.Vector3(...cityObj.position);
          position.y += 1.2; // Position label above the station
          
          // Convert 3D position to screen coordinates
          position.project(camera);
          
          // Only show labels for objects in front of the camera
          if (position.z < 1) {
            const x = (position.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
            const y = (-(position.y * 0.5) + 0.5) * renderer.domElement.clientHeight;
            
            labelEl.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
            labelEl.style.visibility = 'visible';
            
            // Highlight labels for selected cities
            if (homeCity === Number(cityId)) {
              labelEl.style.color = '#ff6060';
              labelEl.style.borderColor = '#ff0000';
              labelEl.style.backgroundColor = 'rgba(80, 0, 0, 0.8)';
            } else if (selectedCities.includes(Number(cityId))) {
              labelEl.style.color = '#60ff60';
              labelEl.style.borderColor = '#00ff00';
              labelEl.style.backgroundColor = 'rgba(0, 60, 0, 0.8)';
            } else {
              labelEl.style.color = '#60d8ff';
              labelEl.style.borderColor = '#00a0ff';
              labelEl.style.backgroundColor = 'rgba(0, 0, 40, 0.8)';
            }
          } else {
            labelEl.style.visibility = 'hidden';
          }
        }
      });
      
      // Update distance labels - always visible
      Object.entries(distanceLabelsRef.current).forEach(([pathKey, labelEl]) => {
        const [cityId1, cityId2] = pathKey.split('-').map(Number);
        const city1 = cityObjectsRef.current[cityId1];
        const city2 = cityObjectsRef.current[cityId2];
        
        if (city1 && city2 && labelEl) {
          // Calculate midpoint between stations
          const midpoint = new THREE.Vector3(
            city1.position[0] * 0.7 + city2.position[0] * 0.3,
            city1.position[1] * 0.7 + city2.position[1] * 0.3 + 0.1,
            city1.position[2] * 0.7 + city2.position[2] * 0.3 
          );
          
          // Convert 3D position to screen coordinates
          midpoint.project(camera);
          
          // Only show labels for objects in front of the camera
          if (midpoint.z < 1) {
            const x = (midpoint.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
            const y = (-(midpoint.y * 0.5) + 0.5) * renderer.domElement.clientHeight;
            
            labelEl.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
            labelEl.style.visibility = 'visible';
            
            // Check if this is part of the selected path
            const isActivePath = 
              (homeCity === cityId1 && selectedCities[0] === cityId2) ||
              (homeCity === cityId2 && selectedCities[0] === cityId1) ||
              (selectedCities.includes(cityId1) && selectedCities.includes(cityId2) && 
               Math.abs(selectedCities.indexOf(cityId1) - selectedCities.indexOf(cityId2)) === 1) ||
              (selectedCities[selectedCities.length - 1] === cityId1 && homeCity === cityId2) ||
              (selectedCities[selectedCities.length - 1] === cityId2 && homeCity === cityId1);
            
            if (isActivePath) {
              labelEl.style.color = '#ffffff';
              labelEl.style.borderColor = '#00ffff';
              labelEl.style.backgroundColor = 'rgba(0, 128, 128, 0.8)';
            } else {
              labelEl.style.color = '#ffdd80';
              labelEl.style.borderColor = '#806000';
              labelEl.style.backgroundColor = 'rgba(40, 40, 0, 0.6)';
            }
          } else {
            labelEl.style.visibility = 'hidden';
          }
        }
      });
      
      renderer.render(scene, camera);
    };
    
    // Start animation
    animate();
    
    // Mark scene as initialized
    setSceneInitialized(true);
    
    console.log("3D scene initialization complete");
  };
  
  // Create path between cities with visible distance labels
  const createPath = (cityId1, cityId2, distance, color, showDistanceLabel = false) => {
    if (!sceneRef.current || !labelsContainerRef.current) return;
    
    const city1 = cityObjectsRef.current[cityId1];
    const city2 = cityObjectsRef.current[cityId2];
    
    if (city1 && city2) {
      // Create unique key for this path
      const pathKey = `${Math.min(cityId1, cityId2)}-${Math.max(cityId1, cityId2)}`;
      
      // Create path if it doesn't exist yet
      if (!pathLinesRef.current[pathKey]) {
        const points = [
          new THREE.Vector3(...city1.position),
          new THREE.Vector3(...city2.position)
        ];
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({ 
          color,
          transparent: true,
          opacity: 0.5
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        
        sceneRef.current.add(line);
        
        // Store reference to the line
        pathLinesRef.current[pathKey] = line;
        
        // Create HTML element for distance label
        const distanceLabelDiv = document.createElement('div');
        distanceLabelDiv.className = 'absolute px-2 py-1 text-yellow-300 text-xs bg-black bg-opacity-70 rounded-md border border-yellow-600 pointer-events-none';
        distanceLabelDiv.textContent = `${distance} km`;
        distanceLabelDiv.style.visibility = showDistanceLabel ? 'visible' : 'hidden';
        labelsContainerRef.current.appendChild(distanceLabelDiv);
        
        // Store the HTML element directly in the ref
        distanceLabelsRef.current[pathKey] = distanceLabelDiv;
      }
    }
  };
  
  // Update city and path visuals based on selection status
  useEffect(() => {
    if (!sceneRef.current || !sceneInitialized) return;
    
    // Reset all city colors
    Object.values(cityObjectsRef.current).forEach(cityObj => {
      if (cityObj.model) {
        // Reset main module color
        cityObj.model.children[0].material.color.set(0x4080a0);
        cityObj.model.children[0].material.emissive.set(0x102030);
        cityObj.model.children[0].material.emissiveIntensity = 0.5;
      }
    });
    
    // Reset all path colors
    Object.values(pathLinesRef.current).forEach(line => {
      line.material.color.set(0x303060);
      line.material.opacity = 0.5;
    });
    
    // Remove active paths
    activePathsRef.current.forEach(path => {
      if (path && path.parent) {
        path.parent.remove(path);
      }
    });
    activePathsRef.current = [];
    
    if (showOptimal && optimalSolution) {
      // Render optimal solution path
      const route = optimalSolution.optimizedRoute.map(city => city.id);
      
      // Highlight stations in optimal route
      route.forEach(cityId => {
        const cityObj = cityObjectsRef.current[cityId];
        if (cityObj && cityObj.model) {
          // Highlight with purple color for optimal path
          cityObj.model.children[0].material.color.set(0xcc00ff);
          cityObj.model.children[0].material.emissive.set(0xcc00ff);
          cityObj.model.children[0].material.emissiveIntensity = 1.0;
        }
      });
      
      // Highlight home city
      if (homeCity) {
        const homeCityObj = cityObjectsRef.current[homeCity];
        if (homeCityObj && homeCityObj.model) {
          // Highlight main module with neon red
          homeCityObj.model.children[0].material.color.set(0xff2000);
          homeCityObj.model.children[0].material.emissive.set(0xff0000);
          homeCityObj.model.children[0].material.emissiveIntensity = 0.8;
        }
      }
      
      // Draw path from home to first city in route
      if (route.length > 0) {
        highlightPath(homeCity, route[0], 0xff00cc);
      }
      
      // Draw paths between cities in the route
      for (let i = 0; i < route.length - 1; i++) {
        highlightPath(route[i], route[i + 1], 0xff00cc);
      }
      
      // Draw path from last city back to home
      if (route.length > 0) {
        highlightPath(route[route.length - 1], homeCity, 0xff00cc);
      }
      
    } else {
      // Original user path rendering
      // Highlight selected cities
      selectedCities.forEach(cityId => {
        const cityObj = cityObjectsRef.current[cityId];
        if (cityObj && cityObj.model) {
          // Highlight main module with neon green
          cityObj.model.children[0].material.color.set(0x00ff40);
          cityObj.model.children[0].material.emissive.set(0x00ff00); 
          cityObj.model.children[0].material.emissiveIntensity = 0.8;
        }
      });
      
      // Highlight home city
      if (homeCity) {
        const homeCityObj = cityObjectsRef.current[homeCity];
        if (homeCityObj && homeCityObj.model) {
          // Highlight main module with neon red
          homeCityObj.model.children[0].material.color.set(0xff2000);
          homeCityObj.model.children[0].material.emissive.set(0xff0000);
          homeCityObj.model.children[0].material.emissiveIntensity = 0.8;
        }
      }
      
      // Draw active paths if we have both home city and selected cities
      if (homeCity && selectedCities.length > 0) {
        // Path from home to first selected city
        highlightPath(homeCity, selectedCities[0], 0x00ffff);
        
        // Paths between selected cities
        for (let i = 0; i < selectedCities.length - 1; i++) {
          highlightPath(selectedCities[i], selectedCities[i + 1], 0x00ffff);
        }
        
        // Path from last city back to home
        highlightPath(selectedCities[selectedCities.length - 1], homeCity, 0x00ffff);
      }
    }
    
    // Calculate and set the total distance
    let total = 0;
    
    if (showOptimal && optimalSolution) {
      total = optimalSolution.totalDistance;
    } else if (homeCity && selectedCities.length > 0) {
      // Distance from home to first city
      total += distances[homeCity]?.[selectedCities[0]] || 0;
      
      // Distance between selected cities
      for (let i = 0; i < selectedCities.length - 1; i++) {
        total += distances[selectedCities[i]]?.[selectedCities[i + 1]] || 0;
      }
      
      // Distance from last city back to home
      total += distances[selectedCities[selectedCities.length - 1]]?.[homeCity] || 0;
    }
    
    setTotalDistance(total);
    
  }, [homeCity, selectedCities, distances, sceneInitialized, showOptimal, optimalSolution]);
  
  // Highlight path between cities
  const highlightPath = (cityId1, cityId2, color) => {
    if (!sceneRef.current) return;
    
    const city1 = cityObjectsRef.current[cityId1];
    const city2 = cityObjectsRef.current[cityId2];
    
    if (city1 && city2) {
      // Find existing path
      const pathKey = `${Math.min(cityId1, cityId2)}-${Math.max(cityId1, cityId2)}`;
      const existingPath = pathLinesRef.current[pathKey];
      if (existingPath) {
        // Highlight existing path
        existingPath.material.color.set(color);
        existingPath.material.opacity = 1.0; 
        // Create animated path overlay - using cyan now
        const points = [
          new THREE.Vector3(...city1.position),
          new THREE.Vector3(...city2.position)
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({ 
          color: 0x00ffff, // Cyan color
          transparent: true,
          opacity: 0.8,
          linewidth: 2
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        sceneRef.current.add(line);
        activePathsRef.current.push(line);
      }
    }
  };

  const handleCitySelectWithRefs = (cityId) => {
    // Convert to number if it's a string to ensure consistent comparison
    cityId = Number(cityId);
    
    console.log("Current state from refs:", {
      homeCity: homeCityRef.current,
      selectedCities: [...selectedCitiesRef.current]
    });
    
    // Case 1: No home city selected yet - set as home
    if (homeCityRef.current === null) {
      console.log("Setting home city:", cityId);
      setHomeCity(cityId);
      return;
    }
    
    // Case 2: Clicking on home city again - reset everything
    if (cityId === homeCityRef.current) {
      console.log("Clicked on home city, resetting");
      setHomeCity(null);
      setSelectedCities([]);
      return;
    }
    
    // Case 3: City already in sequence - remove it and all cities after it
    const existingIndex = selectedCitiesRef.current.indexOf(cityId);
    if (existingIndex !== -1) {
      console.log("City already in sequence, removing it and subsequent cities");
      setSelectedCities(selectedCitiesRef.current.slice(0, existingIndex));
      return;
    }
    
    // Case 4: Add new city to the sequence
    console.log("Adding city to sequence:", cityId);
    setSelectedCities([...selectedCitiesRef.current, cityId]);
  };

  const handleCitySelect = (cityId) => {
    handleCitySelectWithRefs(cityId);
  };
  
  // Reset selections
  const handleReset = () => {
    setHomeCity(null);
    setSelectedCities([]);
  };
  
  //Solve the TSP problem
  const handleSolve = async () => {
    if (!homeCity || selectedCities.length !== 9) {
      alert('Please select a home city and at least one destination.');
      return;
    }
    
    // Store the current time when solved
    setSolveTime(timer);

    try {
      // Prepare data for the backend
      const tspData = {
        homeCity: {
          id: homeCity,
          name: cityObjectsRef.current[homeCity]?.name
        },
        selectedCities: selectedCities.map(cityId => ({
          id: cityId,
          name: cityObjectsRef.current[cityId]?.name,
          position: cityObjectsRef.current[cityId]?.position
        })),
        distances: distances,
        totalDistance: totalDistance,
      };
      
      console.log("Request data", tspData);
      // Send data to backend
      const response = await fetch("http://localhost:8081/pdsa/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tspData),
      });

      const result = await response.json();

      console.log('Backend response:', result);
      
      // Store the optimal solution
      if (result.bestSolution) {
        setOptimalSolution(result.bestSolution);
        setShowOptimal(true);

        // Check if player found the optimal solution
        const optimalDistance = result.bestSolution.totalDistance;
        
        // Sort the optimal route for easier comparison
        const optimalRouteNames = result.bestSolution.optimizedRoute.map(city => city.name);
        
        // Determine if player's route is optimal
        const didFindOptimalPath = optimalDistance === totalDistance;
        
        // Set game status based on result
        setGameStatus(didFindOptimalPath ? 'won' : 'lost');
        
        // Show the popup for the win scenario
        if (didFindOptimalPath) {
          setShowGameStatusPopup(true);

          //if the user found the correct answer, save their name, and all to the database
          const gameResultRequest = {
            gameId: 2,
            playerId: playerId,
            completionTime: timer,
            homeCity: cityObjectsRef.current[homeCity]?.name,
            shortestRoute: optimalRouteNames,
            shortestDistance: optimalDistance,
            solutions: result.solutions,
          }

          console.log("Game Result request body", gameResultRequest);

          const response = await fetch("http://localhost:8081/pdsa/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(gameResultRequest),
          });
          
          const saveResult = await response.json();
          setAlgorithmPerformance(saveResult);
        }
      }
    } catch (error) {
      console.error('Failed to solve TSP:', error);
      alert('Failed to communicate with the server. Please try again.');
    }
  };

  const togglePathDisplay = () => {
    setShowOptimal(!showOptimal);
  };

  const handlePlayAgain = () => {
    // Reset game state
    setHomeCity(null);
    setSelectedCities([]);
    setOptimalSolution(null);
    setShowOptimal(false);
    setGameStatus(null);
    setShowGameStatusPopup(false);
    setCurrentRound(prevRound => prevRound + 1);

    // Reset timer
    setTimer(0);
    setSolveTime(null);
      
    // Generate new random distances
    const newDistances = {};
    
    // Initialize the distance matrix
    CITY_DATA.forEach(city => {
      newDistances[city.id] = {};
    });
    
    // Fill distance matrix with new symmetric distances
    for (let i = 0; i < CITY_DATA.length; i++) {
      const city1 = CITY_DATA[i];
      
      for (let j = i + 1; j < CITY_DATA.length; j++) {
        const city2 = CITY_DATA[j];
        
        if (city1.id !== city2.id) {
          // Generate one random distance for this pair
          const distance = Math.floor(Math.random() * 51) + 50;
          
          // Set the same distance for both directions
          newDistances[city1.id][city2.id] = distance;
          newDistances[city2.id][city1.id] = distance;
          
          // Update visual path
          const pathKey = `${Math.min(city1.id, city2.id)}-${Math.max(city1.id, city2.id)}`;
          if (pathLinesRef.current[pathKey]) {
            pathLinesRef.current[pathKey].material.color.set(0x303060);
            pathLinesRef.current[pathKey].material.opacity = 0.5;
          }
          
          // Update label if it exists
          if (distanceLabelsRef.current[pathKey]) {
            distanceLabelsRef.current[pathKey].textContent = `${distance} km`;
          }
        }
      }
    }
    
    setDistances(newDistances);
  };

  //function to render distance matrix
  const DistanceMatrix = ({ distances, cityData, show, onClose }) => {
    if (!show) return null;
    
    // Get city names for headers
    const cityNames = cityData.map(city => city.name);
    
    return (
      <div className="absolute right-4 bottom-16 z-30 bg-black bg-opacity-90 border border-cyan-500 rounded shadow-lg p-4 max-h-[70vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-cyan-300 font-bold text-lg">Distance Matrix (km)</h3>
          <button 
            onClick={onClose}
            className="text-cyan-300 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="text-sm text-cyan-200">
            <thead>
              <tr>
                <th className="p-2 border border-cyan-800"></th>
                {cityNames.map(name => (
                  <th key={name} className="p-2 border border-cyan-800 font-bold">{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cityData.map(city => (
                <tr key={city.id}>
                  <th className="p-2 border border-cyan-800 font-bold">{city.name}</th>
                  {cityData.map(targetCity => (
                    <td key={`${city.id}-${targetCity.id}`} className="p-2 border border-cyan-800 text-center">
                      {city.id === targetCity.id ? 
                        '—' : 
                        distances[city.id]?.[targetCity.id] ?? '?'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  //function to render the algorithm performance pop up
  const AlgorithmPerformancePopup = ({ show, onClose, data }) => {
    if (!show || !data || !data.algorithmPerformances) return null;
  
    const performanceData = useMemo(() => {
      return data.algorithmPerformances
        .map(alg => ({
          name: alg.algorithmName,
          executionTime: alg.executionTimeMs,
        }))
        .sort((a, b) => a.executionTime - b.executionTime);
    }, [data.algorithmPerformances]);
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose}></div>
        <div className="bg-black p-6 rounded-lg border-2 border-cyan-400 shadow-lg z-50 text-center w-full max-w-2xl mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl text-cyan-300 font-bold font-alien">Algorithm Performance</h2>
            <button 
              onClick={onClose}
              className="text-cyan-300 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div key="performance-chart" className="w-full mb-6" style={{ height: "250px" }}>
            {/* Responsive line chart */}
            <LineChart 
              width={window.innerWidth > 768 ? 500 : 300} 
              height={250} 
              data={performanceData} 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#8dd1e1" />
              <YAxis stroke="#8dd1e1" label={{ value: 'Execution Time (ms)', angle: -90, position: 'insideLeft', fill: '#8dd1e1' }} />
              <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#00a0ff' }} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="executionTime" 
                stroke="#00ffff" 
                strokeWidth={2} 
                activeDot={{ r: 8 }} 
                isAnimationActive={false}
              />
            </LineChart>
          </div>
          
          <div className="mt-6 text-left">
            <h3 className="text-xl text-cyan-300 mb-2">Performance Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-cyan-200">
                <thead>
                  <tr className="bg-cyan-900 bg-opacity-40">
                    <th className="p-2 text-left">Algorithm</th>
                    <th className="p-2 text-right">Execution Time (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.map((alg, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-blue-900 bg-opacity-20' : ''}>
                      <td className="p-2 text-left">{alg.name}</td>
                      <td className="p-2 text-right">{alg.executionTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen bg-black text-cyan-300 overflow-hidden">
      <div ref={mountRef} className="w-full h-full"></div>
      
      {/* Main Control Panel - adjusted with max-height and overflow handling */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-80 p-4 rounded shadow-lg border border-cyan-500 z-20 max-w-md max-h-[calc(100vh-32px)] flex flex-col overflow-hidden">
        <h2 className="text-xl font-bold mb-2 text-cyan-300">Traveling Space Salesman</h2>
        
        {/* Stats Section */}
        <div className="mb-4 text-cyan-100">
          <p className="font-semibold mb-1">
            Home Space City: {homeCity ? cityObjectsRef.current[homeCity]?.name : 'Not Selected'}
          </p>
          <p className="font-semibold mb-1">
            Cities in Route: {selectedCities.length}
          </p>
          <p className="font-semibold">
            Total Distance: {totalDistance} km
            {optimalSolution && (
              <span className="text-xs ml-1">
                ({showOptimal ? 'Optimal' : 'Your Path'})
              </span>
            )}
          </p>
        </div>
        
        {/* Instructions & Action Buttons */}
        <div className="mb-4">
          <p className="text-sm italic mb-2 text-cyan-200">
            {!homeCity 
              ? 'Click on a city to select it as your home base' 
              : 'Now click other cities to add them to your route'}
          </p>
          <div className="flex space-x-2">
            <button 
              onClick={handleReset}
              className="bg-red-900 text-white px-3 py-1 flex-1 rounded hover:bg-red-700 transition-colors"
            >
              Reset
            </button>
            <button 
              onClick={handleSolve}
              className="bg-blue-900 text-white px-3 py-1 flex-1 rounded hover:bg-blue-700 transition-colors"
            >
              Solve
            </button>
            {optimalSolution && (
              <button 
                onClick={togglePathDisplay}
                className={`px-3 py-1 rounded flex-1 ${
                  showOptimal 
                    ? 'bg-cyan-700 hover:bg-cyan-600 text-white' 
                    : 'bg-purple-700 hover:bg-purple-600 text-white'
                }`}
              >
                {showOptimal ? 'My Path' : 'Optimal'}
              </button>
            )}
          </div>
        </div>
        
        {/* Station Selection Grid - with flex-shrink-0 to prevent unwanted shrinking */}
        <div className="mb-4 flex-shrink-0">
          <h3 className="font-semibold mb-2 text-cyan-300">Available Cities:</h3>
          <div className="grid grid-cols-2 gap-2">
            {CITY_DATA.map(city => (
              <button
                key={city.id}
                onClick={() => handleCitySelect(city.id)}
                className={`px-2 py-1 text-sm rounded transition-colors ${
                  homeCity === city.id 
                    ? 'bg-red-900 text-white ring-2 ring-red-500'
                    : selectedCities.includes(city.id) 
                      ? 'bg-green-800 text-white ring-2 ring-green-500'
                      : 'bg-gray-800 text-cyan-200 hover:bg-gray-700'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Unified Route Details Section - made to expand within available space */}
        {(selectedCities.length > 0 || optimalSolution) && (
          <div className="border-t border-cyan-700 pt-3 flex-1 min-h-0 flex flex-col">
            <h3 className="font-semibold mb-2 text-cyan-300 flex-shrink-0">
              {optimalSolution && showOptimal 
                ? "Optimal Solution" 
                : "Route Details"}
            </h3>
            
            {/* Content container with scrolling - flex-1 to take remaining space */}
            <div className="overflow-y-auto pr-1 custom-scrollbar flex-1">
              {/* Show optimal path when available and selected */}
              {optimalSolution && showOptimal && (
                <div>
                  <div className="text-purple-200 mb-2">
                    <span className="font-semibold">Optimal Distance:</span> {optimalSolution.totalDistance} km
                  </div>
                  <ul className="text-sm text-purple-100">
                    <li>Start at {cityObjectsRef.current[homeCity]?.name}</li>
                    {optimalSolution.optimizedRoute.map((city, index) => (
                      <li key={city.id} className="flex items-center">
                        <span className="text-purple-400 mr-1">→</span> {city.name}
                        <span className="ml-1 bg-purple-900 px-1 rounded text-xs">
                          {index === 0 
                            ? `(${distances[homeCity]?.[city.id]} km)`
                            : `(${distances[optimalSolution.optimizedRoute[index-1].id]?.[city.id]} km)`
                          }
                        </span>
                      </li>
                    ))}
                    <li className="flex items-center">
                      <span className="text-purple-400 mr-1">→</span> Return to {cityObjectsRef.current[homeCity]?.name}
                      <span className="ml-1 bg-purple-900 px-1 rounded text-xs">
                        ({distances[optimalSolution.optimizedRoute[optimalSolution.optimizedRoute.length-1].id]?.[homeCity]} km)
                      </span>
                    </li>
                  </ul>
                </div>
              )}
              
              {/* Show user's route when no optimal solution or when user path is selected */}
              {(!optimalSolution || !showOptimal) && selectedCities.length > 0 && homeCity && (
                <ul className="text-sm text-cyan-100">
                  <li>Start at {cityObjectsRef.current[homeCity]?.name}</li>
                  {selectedCities.map((cityId, index) => (
                    <li key={cityId} className="flex items-center">
                      <span className="text-cyan-400 mr-1">→</span> {cityObjectsRef.current[cityId]?.name} 
                      <span className="ml-1 bg-cyan-900 px-1 rounded text-xs">
                        ({index === 0 
                          ? distances[homeCity]?.[cityId] 
                          : distances[selectedCities[index-1]]?.[cityId]} km)
                      </span>
                    </li>
                  ))}
                  <li className="flex items-center">
                    <span className="text-cyan-400 mr-1">→</span> Return to {cityObjectsRef.current[homeCity]?.name} 
                    <span className="ml-1 bg-cyan-900 px-1 rounded text-xs">
                      ({distances[selectedCities[selectedCities.length-1]]?.[homeCity]} km)
                    </span>
                  </li>
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Player and Round display */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-80 p-4 rounded shadow-lg border border-cyan-500 z-20 text-right w-58">
        <div className="text-cyan-300 font-bold font-alien text-left text-2xl mb-4">
          Round {currentRound}{roundDots}
        </div>
        <h3 className="font-bold text-cyan-300 mb-1 text-xl font-alien text-left">{username}</h3>

        {/* Timer display */}
        <div className="text-cyan-300 mt-2 text-left">
          Time: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </div>
        
        {solveTime !== null && (
          <div className="text-cyan-200 text-sm">
            Solved in: {Math.floor(solveTime / 60)}:{(solveTime % 60).toString().padStart(2, '0')}
          </div>
        )}
        
        {/* Game result display */}
        {gameStatus === 'lost' && (
          <div className="mt-3 pt-3 border-t border-red-500">
            <p className="text-red-400 mb-2 font-bold">You didn't find the optimal solution!</p>
            <button 
              onClick={handlePlayAgain}
              className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors w-full"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Victory popup */}
      {showGameStatusPopup && gameStatus === 'won' && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-70"></div>
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-8 rounded-lg border-2 border-cyan-400 shadow-lg shadow-cyan-500/50 z-50 text-center max-w-md transform scale-110 animate-pulse">
            <h2 className="text-3xl text-cyan-300 font-bold mb-4 font-alien">CONGRATULATIONS!</h2>
            <p className="text-xl text-white mb-6">You've found the optimal interstellar route!</p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setShowAlgorithmDetails(true)}
                className="bg-gradient-to-r from-green-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-green-500 hover:to-blue-600 transition-all font-bold text-lg"
              >
                View Algorithm Details
              </button>
              <button 
                onClick={handlePlayAgain}
                className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-all font-bold text-lg"
              >
                Next Mission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Distance Matrix Button */}
      <div className="absolute bottom-4 right-4 z-20">
        <button 
          onClick={() => setShowDistanceMatrix(!showDistanceMatrix)}
          className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          {showDistanceMatrix ? 'Hide' : 'View'} Distance Matrix
        </button>
      </div>

      {/* Render the Distance Matrix */}
      <DistanceMatrix 
        distances={distances}
        cityData={CITY_DATA}
        show={showDistanceMatrix}
        onClose={() => setShowDistanceMatrix(false)}
      />

      {/* Add this at the end of your return statement */}
      <AlgorithmPerformancePopup 
        show={showAlgorithmDetails} 
        onClose={() => setShowAlgorithmDetails(false)} 
        data={algorithmPerformance} 
      />
    </div>
  );
}

export default TravelingSalesman;
