import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
  Text,
} from "@react-three/drei";
import { gsap } from "gsap";

const StarryBackground = () => {
  const [stars, setStars] = useState([]);

  // Generate stars on component mount
  useEffect(() => {
    const generateStars = () => {
      const starCount = 200;
      const newStars = [];

      for (let i = 0; i < starCount; i++) {
        // Determine star type (regular, bright, colored, pulsing, cross-glowing)
        const starTypeRoll = Math.random();
        let starType, color, size, glowIntensity, animationName;

        // Different layer for parallax effect
        const layer = Math.floor(Math.random() * 3) + 1;

        // Assign star properties based on type
        if (starTypeRoll < 0.5) {
          // 50% regular white stars
          starType = "regular";
          color = "#ffffff";
          size = 1 + Math.random() * 2;
          glowIntensity = 2 + Math.random();
          animationName = "twinkle";
        } else if (starTypeRoll < 0.7) {
          // 20% bright stars
          starType = "bright";
          color = "#ffffff";
          size = 2 + Math.random() * 3;
          glowIntensity = 4 + Math.random() * 2;
          animationName = "twinkle-bright";
        } else if (starTypeRoll < 0.85) {
          // 15% colored stars
          starType = "colored";
          // Choose from a set of stellar colors
          const starColors = [
            "#ff9d76", // Orange
            "#ffb6c1", // Pink
            "#add8e6", // Light blue
            "#90ee90", // Light green
            "#ffd700", // Gold
            "#8a2be2", // Blue violet
            "#00bfff", // Deep sky blue
          ];
          color = starColors[Math.floor(Math.random() * starColors.length)];
          size = 1.5 + Math.random() * 2;
          glowIntensity = 3 + Math.random();
          animationName = "twinkle-colored";
        } else if (starTypeRoll < 0.95) {
          // 10% cross-glowing stars
          starType = "cross-glow";
          color = "#ffffff";
          size = 2 + Math.random() * 2.5;
          glowIntensity = 4 + Math.random() * 2;
          animationName = "pulse-cross";
        } else {
          // 5% pulsing giant stars
          starType = "pulsing";
          color = "#ffffff";
          size = 3 + Math.random() * 3;
          glowIntensity = 5 + Math.random() * 3;
          animationName = "pulse";
        }

        // Adjust move speed based on layer (parallax effect)
        let moveSpeed;
        switch (layer) {
          case 1:
            moveSpeed = 80 + Math.random() * 20;
            break; // Fastest
          case 2:
            moveSpeed = 110 + Math.random() * 30;
            break; // Medium
          case 3:
            moveSpeed = 150 + Math.random() * 40;
            break; // Slowest
          default:
            moveSpeed = 100;
        }

        newStars.push({
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          size: size,
          color: color,
          glowIntensity: glowIntensity,
          animationName: animationName,
          animationDuration: 2 + Math.random() * 4,
          animationDelay: Math.random() * 5,
          moveSpeed: moveSpeed,
          layer: layer,
          type: starType,
          rayLength: starType === "cross-glow" ? 10 + Math.random() * 20 : 0,
          rayWidth: starType === "cross-glow" ? 1 + Math.random() : 0,
          rayRotation: starType === "cross-glow" ? Math.random() * 45 : 0,
        });
      }

      setStars(newStars);
    };

    generateStars();
  }, []);

  // Function to generate the glow effect for a star
  const getStarGlow = (star) => {
    if (star.type === "pulsing") {
      return `0 0 ${star.size * star.glowIntensity}px ${star.color}, 0 0 ${
        star.size * (star.glowIntensity / 2)
      }px ${star.color}`;
    } else if (star.type === "bright") {
      return `0 0 ${star.size * star.glowIntensity}px ${star.color}, 0 0 ${
        star.size
      }px #fff`;
    } else if (star.type === "colored") {
      return `0 0 ${star.size * star.glowIntensity}px ${star.color}`;
    } else {
      return `0 0 ${star.size * star.glowIntensity}px rgba(255, 255, 255, 0.8)`;
    }
  };

  return (
    <div
      className="starry-background"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background:
          "radial-gradient(ellipse at center, #3b1254 0%, #200b2c 50%, #120418 100%)",
        zIndex: -1,
      }}
    >
      {/* Star layers */}
      <div
        className="star-container layer-1"
        style={{
          position: "absolute",
          width: "200%",
          height: "200%",
          top: "-50%",
          left: "-50%",
          animation: "move-stars-1 80s linear infinite",
        }}
      >
        {stars
          .filter((star) => star.layer === 1)
          .map((star) => (
            <div
              key={star.id}
              className={`star star-${star.type}`}
              style={{
                position: "absolute",
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                borderRadius: "50%",
                backgroundColor: star.color,
                boxShadow: getStarGlow(star),
                animation: `${star.animationName} ${star.animationDuration}s ease-in-out infinite ${star.animationDelay}s`,
              }}
            >
              {star.type === "cross-glow" && (
                <>
                  {/* Horizontal ray */}
                  <div
                    className="ray horizontal"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: `${star.rayLength}px`,
                      height: `${star.rayWidth}px`,
                      background: `linear-gradient(to right, ${star.color}, transparent)`,
                      transform: `translate(-50%, -50%) rotate(${star.rayRotation}deg)`,
                      transformOrigin: "center",
                      animation: `ray-pulse ${star.animationDuration}s ease-in-out infinite ${star.animationDelay}s`,
                    }}
                  ></div>

                  {/* Vertical ray */}
                  <div
                    className="ray vertical"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: `${star.rayWidth}px`,
                      height: `${star.rayLength}px`,
                      background: `linear-gradient(to bottom, ${star.color}, transparent)`,
                      transform: `translate(-50%, -50%) rotate(${star.rayRotation}deg)`,
                      transformOrigin: "center",
                      animation: `ray-pulse ${star.animationDuration}s ease-in-out infinite ${star.animationDelay}s`,
                    }}
                  ></div>
                </>
              )}
            </div>
          ))}
      </div>

      <div
        className="star-container layer-2"
        style={{
          position: "absolute",
          width: "200%",
          height: "200%",
          top: "-50%",
          left: "-50%",
          animation: "move-stars-2 120s linear infinite",
        }}
      >
        {stars
          .filter((star) => star.layer === 2)
          .map((star) => (
            <div
              key={star.id}
              className={`star star-${star.type}`}
              style={{
                position: "absolute",
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                borderRadius: "50%",
                backgroundColor: star.color,
                boxShadow: getStarGlow(star),
                animation: `${star.animationName} ${star.animationDuration}s ease-in-out infinite ${star.animationDelay}s`,
              }}
            >
              {star.type === "cross-glow" && (
                <>
                  {/* Horizontal ray */}
                  <div
                    className="ray horizontal"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: `${star.rayLength}px`,
                      height: `${star.rayWidth}px`,
                      background: `linear-gradient(to right, ${star.color}, transparent)`,
                      transform: `translate(-50%, -50%) rotate(${star.rayRotation}deg)`,
                      transformOrigin: "center",
                      animation: `ray-pulse ${star.animationDuration}s ease-in-out infinite ${star.animationDelay}s`,
                    }}
                  ></div>

                  {/* Vertical ray */}
                  <div
                    className="ray vertical"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: `${star.rayWidth}px`,
                      height: `${star.rayLength}px`,
                      background: `linear-gradient(to bottom, ${star.color}, transparent)`,
                      transform: `translate(-50%, -50%) rotate(${star.rayRotation}deg)`,
                      transformOrigin: "center",
                      animation: `ray-pulse ${star.animationDuration}s ease-in-out infinite ${star.animationDelay}s`,
                    }}
                  ></div>
                </>
              )}
            </div>
          ))}
      </div>

      <div
        className="star-container layer-3"
        style={{
          position: "absolute",
          width: "200%",
          height: "200%",
          top: "-50%",
          left: "-50%",
          animation: "move-stars-3 160s linear infinite",
        }}
      >
        {stars
          .filter((star) => star.layer === 3)
          .map((star) => (
            <div
              key={star.id}
              className={`star star-${star.type}`}
              style={{
                position: "absolute",
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                borderRadius: "50%",
                backgroundColor: star.color,
                boxShadow: getStarGlow(star),
                animation: `${star.animationName} ${star.animationDuration}s ease-in-out infinite ${star.animationDelay}s`,
              }}
            >
              {star.type === "cross-glow" && (
                <>
                  {/* Horizontal ray */}
                  <div
                    className="ray horizontal"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: `${star.rayLength}px`,
                      height: `${star.rayWidth}px`,
                      background: `linear-gradient(to right, ${star.color}, transparent)`,
                      transform: `translate(-50%, -50%) rotate(${star.rayRotation}deg)`,
                      transformOrigin: "center",
                      animation: `ray-pulse ${star.animationDuration}s ease-in-out infinite ${star.animationDelay}s`,
                    }}
                  ></div>

                  {/* Vertical ray */}
                  <div
                    className="ray vertical"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: `${star.rayWidth}px`,
                      height: `${star.rayLength}px`,
                      background: `linear-gradient(to bottom, ${star.color}, transparent)`,
                      transform: `translate(-50%, -50%) rotate(${star.rayRotation}deg)`,
                      transformOrigin: "center",
                      animation: `ray-pulse ${star.animationDuration}s ease-in-out infinite ${star.animationDelay}s`,
                    }}
                  ></div>
                </>
              )}
            </div>
          ))}
      </div>

      {/* Special giant stars with proper cross flares (a few) */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={`giant-star-${i}`}
          className="giant-star"
          style={{
            position: "absolute",
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            width: `${4 + Math.random() * 4}px`,
            height: `${4 + Math.random() * 4}px`,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            boxShadow:
              "0 0 15px 8px rgba(255, 255, 255, 0.8), 0 0 30px 15px rgba(255, 255, 255, 0.4)",
            animation: `giant-star-pulse ${
              8 + Math.random() * 4
            }s ease-in-out infinite ${Math.random() * 5}s`,
            zIndex: 2,
            opacity: 0.9,
          }}
        >
          {/* Large cross flares */}
          <div
            className="star-flare horizontal"
            style={{
              position: "absolute",
              left: "-2000%",
              top: "40%",
              width: "4000%",
              height: "20%",
              background:
                "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.15) 60%, rgba(255,255,255,0) 100%)",
              animation: `flare-pulse ${
                8 + Math.random() * 4
              }s ease-in-out infinite ${Math.random() * 5}s`,
            }}
          ></div>
          <div
            className="star-flare vertical"
            style={{
              position: "absolute",
              left: "40%",
              top: "-2000%",
              width: "20%",
              height: "4000%",
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.15) 60%, rgba(255,255,255,0) 100%)",
              animation: `flare-pulse ${
                8 + Math.random() * 4
              }s ease-in-out infinite ${Math.random() * 5}s`,
            }}
          ></div>
        </div>
      ))}

      {/* Purple nebula effects */}
      <div
        className="nebula-1"
        style={{
          position: "absolute",
          width: "50%",
          height: "40%",
          left: "10%",
          top: "30%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(147, 51, 234, 0.15) 0%, rgba(147, 51, 234, 0) 70%)",
          filter: "blur(40px)",
          animation: "nebula-drift 70s ease-in-out infinite",
        }}
      />

      <div
        className="nebula-2"
        style={{
          position: "absolute",
          width: "60%",
          height: "50%",
          right: "5%",
          top: "10%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(192, 132, 252, 0.1) 0%, rgba(192, 132, 252, 0) 70%)",
          filter: "blur(30px)",
          animation: "nebula-drift-alt 90s ease-in-out infinite",
        }}
      />

      {/* CSS Animations */}
      <style>
        {`
          @keyframes twinkle {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
          
          @keyframes twinkle-bright {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; transform: scale(1.1); }
          }
          
          @keyframes twinkle-colored {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; transform: scale(1.05); }
          }
          
          @keyframes pulse {
            0% { transform: scale(0.8); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(0.8); opacity: 0.3; }
          }
          
          @keyframes pulse-cross {
            0% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(0.8); opacity: 0.5; }
          }
          
          @keyframes ray-pulse {
            0% { opacity: 0.3; }
            50% { opacity: 0.8; }
            100% { opacity: 0.3; }
          }
          
          @keyframes giant-star-pulse {
            0% { transform: scale(0.85); opacity: 0.7; }
            50% { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(0.85); opacity: 0.7; }
          }
          
          @keyframes flare-pulse {
            0% { opacity: 0.3; }
            50% { opacity: 0.7; }
            100% { opacity: 0.3; }
          }
          
          @keyframes move-stars-1 {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-50%, -50%); }
          }
          
          @keyframes move-stars-2 {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-30%, -30%); }
          }
          
          @keyframes move-stars-3 {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-20%, -20%); }
          }
          
          @keyframes nebula-drift {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(3%, 2%); }
            50% { transform: translate(1%, 4%); }
            75% { transform: translate(-2%, 1%); }
          }
          
          @keyframes nebula-drift-alt {
            0%, 100% { transform: translate(0, 0); }
            33% { transform: translate(-2%, 3%); }
            66% { transform: translate(-4%, -2%); }
          }
        `}
      </style>
    </div>
  );
};


// Celebration component with enhanced confetti effects
const Celebration = ({ moveCount, gameTime, onClose, isDefeat = false, resetGame }) => {
  // Create confetti particles on component mount (only for victory)
  useEffect(() => {
    // Don't show confetti for defeat scenario
    if (isDefeat) return;
    
    // Create a canvas for the confetti
    const confettiCanvas = document.createElement('canvas');
    confettiCanvas.id = 'confetti-canvas';
    confettiCanvas.style.position = 'fixed';
    confettiCanvas.style.top = '0';
    confettiCanvas.style.left = '0';
    confettiCanvas.style.width = '100%';
    confettiCanvas.style.height = '100%';
    confettiCanvas.style.pointerEvents = 'none';
    confettiCanvas.style.zIndex = '999';
    document.body.appendChild(confettiCanvas);

    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    // Confetti particle properties
    const particles = [];
    const particleCount = 200;
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
      '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', 
      '#009688', '#4caf50', '#8bc34a', '#cddc39', 
      '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
    ];
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * confettiCanvas.width, // x-position
        y: Math.random() * confettiCanvas.height - confettiCanvas.height, // y-position (start above screen)
        size: Math.random() * 10 + 5, // size
        color: colors[Math.floor(Math.random() * colors.length)], // random color
        speed: Math.random() * 3 + 2, // fall speed
        sway: Math.random() * 5 - 2.5, // horizontal movement
        swaySpeed: Math.random() * 0.02 + 0.01, // speed of horizontal oscillation
        angle: Math.random() * 360, // rotation angle
        spin: Math.random() * 0.2 - 0.1, // spin speed
        shape: Math.random() > 0.5 ? 'circle' : 'rect', // either circle or rectangle
        opacity: Math.random() * 0.8 + 0.2, // random opacity
      });
    }

    // Animation loop
    let animationFrame;
    const animate = () => {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        
        ctx.restore();
        
        // Update position
        p.y += p.speed;
        p.x += Math.sin(p.y * p.swaySpeed) * p.sway;
        p.angle += p.spin;
        
        // Reset if offscreen
        if (p.y > confettiCanvas.height) {
          p.y = -p.size;
          p.x = Math.random() * confettiCanvas.width;
        }
      });
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Handle window resize
    const handleResize = () => {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
      document.body.removeChild(confettiCanvas);
    };
  }, [isDefeat]);

  // Define styles based on victory or defeat
  const boxShadow = isDefeat 
    ? '0 0 30px #ff4d4d, 0 0 20px #ff8c00' 
    : '0 0 30px #00ffff, 0 0 20px #ff00ff';
  
  const borderColor = isDefeat ? '#ff4d4d' : '#00ffff';
  
  const titleColor = isDefeat ? '#ff4d4d' : '#00ffff';
  
  const buttonColor = isDefeat ? '#ff4d4d' : '#008cff';
  
  const buttonHoverColor = isDefeat ? '#ff7f7f' : '#4dafff';

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      {/* Message card for victory or defeat */}
      <div 
        style={{
          backgroundColor: 'rgba(25, 25, 50, 0.95)',
          borderRadius: '15px',
          padding: '30px',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: boxShadow,
          border: `2px solid ${borderColor}`,
          zIndex: 1001,
          animation: 'pulse 2s infinite ease-in-out'
        }}
      >
        <h2 
          style={{
            color: '#ffffff',
            fontSize: '32px',
            marginBottom: '20px',
            textShadow: `0 0 10px ${titleColor}, 0 0 5px ${titleColor}`,
          }}
        >
          {isDefeat ? 'Dead End Reached!' : 'Incredible Victory!'}
        </h2>
        <p 
          style={{
            color: '#ffffff',
            fontSize: '18px',
            marginBottom: '15px',
          }}
        >
          {isDefeat 
            ? 'You have no more legal moves available. Your knight is trapped!' 
            : "You've completed the Knight's Tour by visiting all 64 squares!"}
        </p>
        <div 
          style={{
            margin: '25px 0',
            padding: '15px',
            backgroundColor: isDefeat ? 'rgba(255, 77, 77, 0.1)' : 'rgba(0, 255, 255, 0.1)',
            borderRadius: '10px',
            border: isDefeat ? '1px solid rgba(255, 77, 77, 0.3)' : '1px solid rgba(0, 255, 255, 0.3)',
          }}
        >
          <p style={{ color: '#ffffff', marginBottom: '5px' }}>
            Squares Visited: <span style={{ fontWeight: 'bold', color: isDefeat ? '#ff4d4d' : '#00ffff' }}>{moveCount}</span>
          </p>
          <p style={{ color: '#ffffff' }}>
            Time Elapsed: <span style={{ fontWeight: 'bold', color: isDefeat ? '#ff4d4d' : '#00ffff' }}>{formatTime(gameTime)}</span>
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          {isDefeat && (
            <button 
              onClick={function(){
                onClose(false);
              }} 
              style={{
                padding: '12px 25px',
                fontSize: '18px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#888'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#666'}
            >
              Close
            </button>
          )}
          <button 
            onClick={function(){
              if(isDefeat){
                resetGame();
                console.log("Here");
              }else{
                onClose(false);
              }
            }} // Pass false to indicate normal close
            style={{
              padding: '12px 25px',
              fontSize: '18px',
              backgroundColor: buttonColor,
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              boxShadow: `0 0 10px ${buttonColor}`,
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = buttonHoverColor}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = buttonColor}
          >
            {isDefeat ? 'Start New Game' : 'Continue'}
          </button>
        </div>
      </div>
      
      {/* Animation keyframes */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
    </div>
  );
};

// Number marker component for visited squares
const NumberMarker = ({ position, number }) => {
  return (
    <Text
      position={[position[0], 0.3, position[2]]}
      rotation={[-Math.PI / 2 + 0.3, 0, 0]}
      fontSize={0.5}
      fontWeight={700}
      color="#ffffff"  // Main text color
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.05}  // Border thickness
      outlineColor="#00a2ff"  // Neon blue border color
      outlineOpacity={0.6}  // Make border fully opaque
    >
      {number}
    </Text>
  );
};

// BoardSquare component with interactive features
const BoardSquare = ({ position, color, isLegalMove, isDeadEnd, onClick }) => {
  const [hovered, setHovered] = useState(false);

  // Determine the final color based on state
  const squareColor = isDeadEnd
    ? "#ff3333" // Red for dead ends
    : isLegalMove
    ? "#4bba45" // Green for legal moves
    : hovered
    ? "#dddddd"
    : color; // Light blue when hovered, normal color otherwise

  return (
    <mesh
      position={position}
      receiveShadow
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1, 0.1, 1]} />
      <meshStandardMaterial color={squareColor} />
    </mesh>
  );
};

// Knight model component
const KnightModel = ({ position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const { scene } = useGLTF("/src/assets/knight.glb");

  // Clone the scene to make it usable
  const knightScene = React.useMemo(() => scene.clone(), [scene]);

  // Apply shadows to all meshes in the model
  React.useEffect(() => {
    knightScene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  }, [knightScene]);

  return (
    <primitive
      object={knightScene}
      position={position}
      rotation={rotation}
      scale={0.1}
    />
  );
};

// Preload the knight model
useGLTF.preload("/knight.glb");

// Animated knight component
const AnimatedKnight = ({
  currentPos,
  targetPos,
  isMoving,
  onMoveComplete,
  isUndoMove = false,
}) => {
  const knightRef = useRef();
  const [position, setPosition] = useState([...currentPos]);

  useEffect(() => {
    // Add a guard to prevent double execution
    if (!isMoving || !knightRef.current) return;
    const knight = knightRef.current;
    const startPos = [...currentPos];
    const endPos = [...targetPos];
  
    // Clear any existing animations
    gsap.killTweensOf(knight.position);
  
    const midPoint = [
      startPos[0] + (endPos[0] - startPos[0]) / 2,
      startPos[1] + 1,
      startPos[2] + (endPos[2] - startPos[2]) / 2,
    ];
  
    // Use a timeline for better control
    const tl = gsap.timeline({
      onComplete: () => {
        console.log("Animation completed");
        setPosition(endPos);
        onMoveComplete(isUndoMove);
      }
    });
  
    tl.to(knight.position, {
      x: midPoint[0],
      y: midPoint[1],
      z: midPoint[2],
      duration: 0.5,
      ease: "power2.out"
    }).to(knight.position, {
      x: endPos[0],
      y: endPos[1],
      z: endPos[2],
      duration: 0.5,
      ease: "power2.in"
    });
  
    return () => {
      tl.kill();
    };
  }, [isMoving]); // Only depend on isMoving

  return (
    <group ref={knightRef} position={position}>
      <KnightModel />
    </group>
  );
};

// Format time in MM:SS format
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

// Main ChessBoard component
const KnightsTour = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [knightPosition, setKnightPosition] = useState(null);
  const [targetPosition, setTargetPosition] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [legalMoves, setLegalMoves] = useState([]);
  const [visitedSquares, setVisitedSquares] = useState([]);
  const [moveCount, setMoveCount] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [isUndoMove, setIsUndoMove] = useState(false);
  const timerRef = useRef(null);
  const moveHistory = useRef([]);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isDeadEnd, setIsDeadEnd] = useState(false);

  // Start timer
  const startTimer = () => {
    setGameTime(0);
    timerRef.current = setInterval(() => {
      setGameTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  // Stop timer
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Reset timer
  const resetTimer = () => {
    stopTimer();
    setGameTime(0);
  };

  // Calculate legal knight moves from a given position
  const calculateLegalMoves = (pos) => {
    if (!pos) return [];

    const [x, z] = [pos[0] + 3.5, pos[2] + 3.5]; // Convert to 0-7 board coordinates
    const moves = [
      [x + 2, z + 1],
      [x + 2, z - 1],
      [x - 2, z + 1],
      [x - 2, z - 1],
      [x + 1, z + 2],
      [x + 1, z - 2],
      [x - 1, z + 2],
      [x - 1, z - 2],
    ];

    // Filter moves to ensure they are within the board and not visited
    return moves
      .filter(([newX, newZ]) => {
        // Check if within board boundaries
        if (newX < 0 || newX > 7 || newZ < 0 || newZ > 7) return false;

        // Check if square has been visited
        const boardPos = [newX - 3.5, 0, newZ - 3.5];
        return !visitedSquares.some(
          (visited) =>
            visited.position[0] === boardPos[0] &&
            visited.position[2] === boardPos[2]
        );
      })
      .map(([newX, newZ]) => [newX - 3.5, 0, newZ - 3.5]); // Convert back to board space
  };

  const startGame = () => {
    const randX = Math.floor(Math.random() * 8);
    const randZ = Math.floor(Math.random() * 8);

    const position = [randX - 3.5, 0.1, randZ - 3.5];
    setKnightPosition(position);
    
    // Initialize with proper move number
    const initialMove = { position, moveNumber: 1 };
    setVisitedSquares([initialMove]);
    setMoveCount(1);
    moveHistory.current = [initialMove];

    setLegalMoves(calculateLegalMoves(position));
    setGameStarted(true);
    startTimer();
  };

  // Reset the game
  const resetGame = () => {
    setKnightPosition(null);
    setTargetPosition(null);
    setIsMoving(false);
    setIsUndoMove(false);
    setLegalMoves([]);
    setVisitedSquares([]);
    setMoveCount(0);
    moveHistory.current = [];
    setGameStarted(false);
    setGameCompleted(false);
    setShowVictoryModal(false);
    setIsDeadEnd(false);
    resetTimer();
  };

  // Undo the last move
  const undoMove = () => {
    if (moveCount <= 1 || isMoving || gameCompleted) return;
    const previousMove = moveHistory.current[moveHistory.current.length - 2];
    setTargetPosition(previousMove.position);
    setIsMoving(true);
    setIsUndoMove(true);
  };

  // Handle square click
  const handleSquareClick = (position) => {
    if (!gameStarted || isMoving) return;
    
    const isLegal = legalMoves.some(move => 
      move[0] === position[0] && move[2] === position[2]
    );
    
    if (isLegal) {
      setTargetPosition([position[0], 0.1, position[2]]);
      setIsMoving(true);
      setIsUndoMove(false);
    }
  };

  const handleMoveComplete = (isUndo) => {
    setIsMoving(false);
    if (isUndo) {
      if (moveHistory.current.length <= 1) return;
      const previousMove = moveHistory.current[moveHistory.current.length - 2];
      if(previousMove.moveNumber === moveCount - 1 ) {
        const undoMove = moveHistory.current.pop();
        setKnightPosition(previousMove.position);
        setVisitedSquares([...moveHistory.current]);
        const newLegalMoves = calculateLegalMoves(previousMove.position);
        newLegalMoves.push(undoMove.position);
        setLegalMoves(newLegalMoves);
        setIsUndoMove(false);
        setIsDeadEnd(false);
        setMoveCount(moveCount-1);
      }
    } else {
      const newMoveNumber = moveCount + 1;
      const moveExists = moveHistory.current.some(move => 
        move.moveNumber === newMoveNumber && 
        move.position[0] === targetPosition[0] && 
        move.position[2] === targetPosition[2]
      );
      
      if (!moveExists) {
        const newMove = { 
          position: targetPosition, 
          moveNumber: newMoveNumber
        };
        moveHistory.current = [...moveHistory.current, newMove];
        setVisitedSquares([...moveHistory.current]);
        setKnightPosition(targetPosition);
        setMoveCount(newMoveNumber);
        const legalMovesLocal = calculateLegalMoves(targetPosition);
        setLegalMoves(legalMovesLocal);

        if (moveHistory.current.length === 64) {
          stopTimer();
          setShowVictoryModal(true);
          setGameCompleted(true);
          setLegalMoves([]);
        } else if(legalMovesLocal.length === 0){
          setShowVictoryModal(true);
          setIsDeadEnd(true);
          stopTimer();
          setGameCompleted(true);
        }
      }
    } 
  };

  // Create the chessboard
  const createBoard = () => {
    const squares = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const isEven = (i + j) % 2 === 0;
        const position = [i - 3.5, 0, j - 3.5];

        // Check if this square is a legal move
        const isLegal = legalMoves.some(
          (move) => move[0] === position[0] && move[2] === position[2]
        );
        let currentPos = false ;
        if(knightPosition !== null){
          currentPos = knightPosition[0] === position[0] && knightPosition[2] === position[2];
        }

        squares.push(
          <BoardSquare
            key={`${i}-${j}`}
            position={position}
            color={isEven ? "#990ff0" : "#eaa515"}
            isLegalMove={isLegal}
            isDeadEnd={isDeadEnd && currentPos}
            onClick={() => handleSquareClick(position)}
          />
        );
      }
    }
    return squares;
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Fixed 2D Starry Background */}
      <StarryBackground />

      {/* Game Title */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <h1
          style={{
            color: "#ffffff",
            textShadow: "0 0 10px #00ffff, 0 0 20px #00ffff",
            fontFamily: "serif",
            fontSize: "38px",
            border: "2px solid white",
            display: "inline-block",
            padding: "10px 25px",
            borderRadius: "8px",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          Knight's Tour Game
        </h1>
      </div>

      {/* Control Panel */}
      <div
        style={{
          position: "absolute",
          top: "120px",
          right: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: "20px",
          borderRadius: "10px",
          zIndex: 10,
          color: "white",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          minWidth: "200px",
          border: "1px solid rgba(0, 255, 255, 0.3)",
          boxShadow: "0 0 15px rgba(0, 255, 255, 0.2)",
        }}
      >
        <div
          style={{
            fontSize: "1.2rem",
            textAlign: "center",
            marginBottom: "10px",
            fontWeight: "bold",
            color: "#00ffff",
            textShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
          }}
        >
          Game Controls
        </div>

        {!gameStarted ? (
          <button
            onClick={startGame}
            style={{
              padding: "12px 24px",
              fontSize: "18px",
              backgroundColor: "#4a4a4a",
              color: "white",
              border: "1px solid #00ffff",
              borderRadius: "5px",
              cursor: "pointer",
              boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
              transition: "transform 0.1s, box-shadow 0.1s",
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "translateY(2px)";
              e.currentTarget.style.boxShadow =
                "0 0 8px rgba(0, 255, 255, 0.5)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 0 15px rgba(0, 255, 255, 0.5)";
            }}
          >
            Start Game
          </button>
        ) : (
          <>
            <button
              onClick={resetGame}
              style={{
                padding: "10px",
                fontSize: "16px",
                backgroundColor: "#f44336",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "5px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Reset Game
            </button>

            <button
              onClick={undoMove}
              disabled={moveCount <= 1 || isMoving || gameCompleted}
              style={{
                padding: "10px",
                fontSize: "16px",
                backgroundColor:
                  moveCount <= 1 || isMoving || gameCompleted ? "#9E9E9E" : "#2196F3",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "5px",
                cursor: moveCount <= 1 || isMoving ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              Undo Move
            </button>

            {showVictoryModal && (
              <Celebration 
                moveCount={moveCount} 
                gameTime={gameTime} 
                onClose={() => setShowVictoryModal(false)} 
                isDefeat={isDeadEnd}
                resetGame={resetGame}
              />
            )}

            <div
              style={{
                textAlign: "center",
                marginTop: "10px",
                padding: "10px",
                backgroundColor: "rgba(0, 255, 255, 0.1)",
                borderRadius: "5px",
                border: "1px solid rgba(0, 255, 255, 0.2)",
              }}
            >
              <div style={{ fontSize: "0.9rem", marginBottom: "5px" }}>
                Time Elapsed
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#00ffff",
                }}
              >
                {formatTime(gameTime)}
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "10px",
                backgroundColor: "rgba(0, 255, 255, 0.1)",
                borderRadius: "5px",
                border: "1px solid rgba(0, 255, 255, 0.2)",
              }}
            >
              <div style={{ fontSize: "0.9rem", marginBottom: "5px" }}>
                Moves Made
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#00ffff",
                }}
              >
                {moveCount}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3D Chess Board Scene */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 5,
        }}
      >
        <Canvas shadows>
          {/* Game scene */}
          <PerspectiveCamera makeDefault position={[0, 10, 8]} />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[3, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          {/* Add a subtle glow to the board */}
          <pointLight position={[0, 1, 0]} intensity={1} color="#00ffff" />

          <group>
          <mesh position={[0, -0.1, 0]} receiveShadow>
            <boxGeometry args={[8.6, 0.2, 8.6]} />
            <meshStandardMaterial 
              color="#00C0F9" 
              transparent={true}
              opacity={0.1}
              emissive="#ac3ec1"
              emissiveIntensity={0.5}
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>
            {createBoard()}

            {/* Number markers for visited squares */}
            {gameStarted &&
              visitedSquares.map(
                (visited, index) =>
                  visited.moveNumber !== null && (
                    <NumberMarker
                      key={`marker-${index}`}
                      position={visited.position}
                      number={visited.moveNumber}
                    />
                  )
              )}

            {gameStarted && (
              <Suspense fallback={null}>
                <AnimatedKnight
                  currentPos={knightPosition}
                  targetPos={targetPosition || knightPosition}
                  isMoving={isMoving}
                  onMoveComplete={handleMoveComplete}
                  isUndoMove={isUndoMove}
                />
              </Suspense>
            )}
          </group>
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default KnightsTour;