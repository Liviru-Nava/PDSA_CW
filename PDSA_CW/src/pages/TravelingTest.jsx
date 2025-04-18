import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// City data with coordinates
const CITY_DATA = [
  { id: 1, name: "Astra A", position: [25, 0, 0] }, // 0°
  { id: 2, name: "Bravo B", position: [20.23, 0, 14.69] }, // 36°
  { id: 3, name: "Cora C", position: [7.73, 0, 23.78] }, // 72°
  { id: 4, name: "Delta D", position: [-7.73, 0, 23.78] }, // 108°
  { id: 5, name: "Eyla E", position: [-20.23, 0, 14.69] }, // 144°
  { id: 6, name: "Fira F", position: [-25, 0, 0] }, // 180°
  { id: 7, name: "Gala G", position: [-20.23, 0, -14.69] }, // 216°
  { id: 8, name: "Hira H", position: [-7.73, 0, -23.78] }, // 252°
  { id: 9, name: "Iron I", position: [7.73, 0, -23.78] }, // 288°
  { id: 10, name: "Juna J", position: [20.23, 0, -14.69] }, // 324°
];


export default function TravelingSalesmanProblem() {
  const [homeCity, setHomeCity] = useState(null);
  const [selectedCities, setSelectedCities] = useState([]);
  const [distances, setDistances] = useState({});
  const [totalDistance, setTotalDistance] = useState(0);
  const [sceneInitialized, setSceneInitialized] = useState(false);
  
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
    if (homeCity) {
      if (selectedCities.length > 0) {
        // Path from home to first selected city
        highlightPath(homeCity, selectedCities[0], 0x00ffff);
        
        // Paths between selected cities
        for (let i = 0; i < selectedCities.length - 1; i++) {
          highlightPath(selectedCities[i], selectedCities[i + 1], 0x00ffff);
        }
        
        // Path from last city back to home
        if (selectedCities.length > 0) {
          highlightPath(selectedCities[selectedCities.length - 1], homeCity, 0x00ffff);
        }
        
        // Calculate total distance
        let total = 0;
        
        // Distance from home to first city
        if (selectedCities.length > 0) {
          total += distances[homeCity]?.[selectedCities[0]] || 0;
        }
        
        // Distance between selected cities
        for (let i = 0; i < selectedCities.length - 1; i++) {
          total += distances[selectedCities[i]]?.[selectedCities[i + 1]] || 0;
        }
        
        // Distance from last city back to home
        if (selectedCities.length > 0) {
          total += distances[selectedCities[selectedCities.length - 1]]?.[homeCity] || 0;
        }
        
        setTotalDistance(total);
      } else {
        setTotalDistance(0);
      }
    }
  }, [homeCity, selectedCities, distances, sceneInitialized]);
  
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
    if (!homeCity || selectedCities.length === 0) {
      alert('Please select a home city and at least one destination.');
      return;
    }
    
    try {
      // Prepare data for the backend
      const tspData = {
        homeCity: {
          id: homeCity,
          name: cityObjectsRef.current[homeCity]?.name,
          position: cityObjectsRef.current[homeCity]?.position
        },
        selectedCities: selectedCities.map(cityId => ({
          id: cityId,
          name: cityObjectsRef.current[cityId]?.name,
          position: cityObjectsRef.current[cityId]?.position
        })),
        distances: distances,
        totalDistance: totalDistance
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
      
      // Here you can process the response from the backend
      // For example, if the backend returns an optimized route
      if (result.optimizedRoute) {
        // Update your route with the optimized sequence
        setSelectedCities(result.optimizedRoute.map(city => city.id));
      }
      
      if (result.optimizedDistance) {
        // Display the optimized distance
        alert(`Optimized route found! Distance: ${result.optimizedDistance} km`);
      }
      
    } catch (error) {
      console.error('Failed to solve TSP:', error);
      alert('Failed to communicate with the server. Please try again.');
    }
  };

  return (
    <div className="relative w-full h-screen bg-black text-cyan-300">
      <div ref={mountRef} className="w-full h-full"></div>
      <div className="absolute top-4 left-4 bg-black bg-opacity-80 p-4 rounded shadow-lg border border-cyan-500 z-20">
        <h2 className="text-xl font-bold mb-2 text-cyan-300">Space Transport Network</h2>
        <div className="mb-4 text-cyan-100">
          <p className="font-semibold mb-1">
            Home Station: {homeCity ? cityObjectsRef.current[homeCity]?.name : 'Not Selected'}
          </p>
          <p className="font-semibold mb-1">
            Stations in Route: {selectedCities.length}
          </p>
          <p className="font-semibold">
            Total Distance: {totalDistance} km
          </p>
        </div>
        <div className="mb-4">
          <p className="text-sm italic mb-2 text-cyan-200">
            {!homeCity 
              ? 'Click on a station to select it as your home base' 
              : 'Now click stations to add them to your route'}
          </p>
          <button 
            onClick={handleReset}
            className="bg-red-900 text-white px-3 py-1 w-[30%] rounded hover:bg-red-700 transition-colors"
          >
            Reset
          </button>
          <button 
            onClick={handleSolve}
            className="bg-blue-900 text-white px-3 py-1 w-[30%] rounded ml-4 hover:bg-blue-700 transition-colors"
          >
            Solve
          </button>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-2 text-cyan-300">Available Stations:</h3>
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
      </div>
      {selectedCities.length > 0 && homeCity && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 p-4 rounded shadow-lg max-w-md border border-cyan-500 z-20">
          <h3 className="font-semibold mb-2 text-cyan-300">Route Details:</h3>
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
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 text-sm text-white bg-black bg-opacity-70 p-2 rounded z-20">
        Click directly on space stations or use buttons to select them
      </div>
    </div>
  );
}