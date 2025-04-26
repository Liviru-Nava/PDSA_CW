import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
  Text,
} from "@react-three/drei";
import { gsap } from "gsap";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';
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

// Username popup component
const UsernamePopup = ({ onSubmit }) => {
  const [username, setUsername] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username);
    }
  };
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
      }}
    >
      {/* StarryBackground component to make the popup more visually appealing */}
      <StarryBackground />
      
      <div
        style={{
          backgroundColor: 'rgba(25, 25, 50, 0.95)',
          borderRadius: '15px',
          padding: '30px',
          width: '400px',
          textAlign: 'center',
          boxShadow: '0 0 30px #00ffff, 0 0 20px #ff00ff',
          border: '2px solid #00ffff',
          zIndex: 2001,
        }}
      >
        <h2 
          style={{
            color: '#ffffff',
            fontSize: '28px',
            marginBottom: '20px',
            textShadow: '0 0 10px #00ffff, 0 0 5px #00ffff',
          }}
        >
          Welcome to Knight's Tour!
        </h2>
        <p 
          style={{
            color: '#ffffff',
            fontSize: '16px',
            marginBottom: '25px',
          }}
        >
          Please enter your name to begin the challenge:
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              color: 'white',
              border: '1px solid #00ffff',
              borderRadius: '5px',
              marginBottom: '20px',
              outline: 'none',
            }}
            placeholder="Your name"
            autoFocus
          />
          
          <button
            type="submit"
            style={{
              padding: '12px 25px',
              fontSize: '18px',
              backgroundColor: '#008cff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              boxShadow: '0 0 10px #008cff',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4dafff'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#008cff'}
          >
            Start Game
          </button>
        </form>
      </div>
    </div>
  );
};

// Celebration component with enhanced confetti effects
const Celebration = ({ moveCount, gameTime, onClose, isDefeat = false, resetGame, boardSize, setShowResultsTab }) => {
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
            : `You've completed the Knight's Tour by visiting all ${boardSize} the squares!`}
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
                setShowResultsTab(true);
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
                setShowResultsTab(true);
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
const BoardSquare = ({ position, color, isLegalMove, isDeadEnd, onClick, selectedAlgorithm }) => {
  const [hovered, setHovered] = useState(false);

  // Determine the final color based on state
  const squareColor = isDeadEnd && selectedAlgorithm === "user"
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
  const { scene } = useGLTF("/knight.glb");

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
const ChessBoard = () => {
  const [showUsernamePopup, setShowUsernamePopup] = useState(true);
  const [username, setUsername] = useState("");
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
  const [boardSize, setBoardSize] = useState(8); // Default to 8x8 board
    // Add these near your other state variables in ChessBoard component
  const [showResultsTab, setShowResultsTab] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("user"); // "user", "warnsdorff", "backtracking"
  const [algorithmSequences, setAlgorithmSequences] = useState({
    user: [], // Will contain user's moves as [0, 1, 2, ...] where each number is the square index
    warnsdorff: [], // Will contain Warnsdorff's algorithm solution
    backtracking: [], // Will contain backtracking algorithm solution
    backtrackingHeuristic:[]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [showMetricsChart, setShowMetricsChart] = useState(false);
  const [metricsData, setMetricsData] = useState([]);

  const fetchMetricsData = async () => {
    setIsLoading(true);
    setServerError(null);
    try {
      const response = await fetch(`http://localhost:8081/pdsa/knights-tour/metrics/${username}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics data: ${response.status}`);
      }
      const data = await response.json();
      setMetricsData(data);
    } catch (err) {
      console.error("Error fetching metrics data:", err);
      setServerError("Failed to load algorithm metrics. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const AlgorithmMetricsChart = () => {        
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}>
        <div style={{
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          padding: "30px",
          borderRadius: "15px",
          width: "80%",
          maxWidth: "800px",
          maxHeight: "80vh",
          overflow: "auto",
          border: "1px solid #00ffff",
          boxShadow: "0 0 20px rgba(0, 255, 255, 0.5)",
          position: "relative"
        }}>
          <button 
            onClick={() => setShowMetricsChart(false)}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "none",
              border: "none",
              color: "#00ffff",
              fontSize: "24px",
              cursor: "pointer"
            }}
          >
            ×
          </button>
          
          <h2 style={{
            color: "#00ffff",
            textAlign: "center",
            marginBottom: "20px",
            textShadow: "0 0 5px rgba(0, 255, 255, 0.5)"
          }}>
            Algorithm Performance Metrics
          </h2>
          
          {isLoading ? (
            <div style={{
              display: "flex",
              justifyContent: "center",
              padding: "40px"
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                border: "4px solid rgba(0, 255, 255, 0.3)",
                borderTop: "4px solid #00ffff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }} />
            </div>
          ) : serverError ? (
            <div style={{
              color: "#ff6b6b",
              textAlign: "center",
              padding: "20px"
            }}>
              {serverError}
            </div>
          ) : (
            <div style={{ height: "400px" }}>
              <MetricsBarChart data={metricsData} />
            </div>
          )}
        </div>
      </div>
    );
  };

  const MetricsBarChart = ({ data }) => {
    if (!data || data.length === 0) {
      return <div style={{ color: "#00ffff", textAlign: "center" }}>No data available</div>;
    }
    
    // Process data for the chart - let's restructure it for a bar chart
    const chartData = data[0].rounds.map((round, index) => {
      const dataPoint = { 
        name: `${round}x${round}`,  // Board size as name
      };
      
      data.forEach(algorithm => {
        // For each algorithm, add execution time for this round index
        // Add a small offset to ensure logarithmic scale works (avoid 0 values)
        dataPoint[algorithm.algorithmName] = (algorithm.executionTimes[index] || 0) + 0.1;
      });
      
      return dataPoint;
    }).reverse(); // Reverse to show rounds in ascending order
    
    // Generate unique colors for each algorithm
    const colors = ["#00ffff", "#ff6b6b", "#5ee962"];
    
    // Find min and max values to set domain properly
    let minValue = Infinity;
    let maxValue = -Infinity;
    
    chartData.forEach(dataPoint => {
      data.forEach(algorithm => {
        const value = dataPoint[algorithm.algorithmName];
        if (value < minValue) minValue = value;
        if (value > maxValue) maxValue = value;
      });
    });
    
    // Ensure minimum is at least 0.1
    minValue = Math.max(0.1, minValue);
    
    // Add padding to max value
    maxValue = maxValue * 1.1;
    
    // Determine if we should use log scale (if max/min ratio is more than 100)
    const useLogScale = maxValue / minValue > 100;
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="name" 
            label={{ value: 'Board Size', position: 'insideBottom', offset: -10, fill: '#00ffff' }}
            tick={{ fill: '#00ffff' }}
          />
          <YAxis 
            label={{ value: 'Execution Time (ms)', angle: -90, position: 'insideLeft', offset: 10, fill: '#00ffff' }}
            tick={{ fill: '#00ffff' }}
            domain={useLogScale ? [minValue, maxValue] : [0, 'auto']}
            scale={useLogScale ? 'log' : 'auto'}
            allowDataOverflow={true}
            tickFormatter={(value) => value.toFixed(1)}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
              border: '1px solid #00ffff',
              color: '#00ffff'
            }}
            labelStyle={{ color: '#00ffff' }}
            formatter={(value) => [`${(value - 0.1).toFixed(2)} ms`, ``]}
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            wrapperStyle={{ color: '#00ffff' }}
          />
          
          {data.map((algorithm, index) => (
            <Bar 
              key={algorithm.algorithmName}
              dataKey={algorithm.algorithmName} 
              fill={colors[index % colors.length]} 
              animationDuration={1500}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const Spinner = () => {
    return (
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: "10px",
        border: "1px solid rgba(0, 255, 255, 0.3)",
        boxShadow: "0 0 15px rgba(0, 255, 255, 0.2)"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(0, 255, 255, 0.3)",
          borderTop: "4px solid #00ffff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "10px"
        }} />
        <div style={{
          color: "#00ffff",
          fontSize: "16px",
          fontWeight: "bold"
        }}>Loading...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  };

  const createBoardArray = () => {
    const board = Array(boardSize).fill().map(() => Array(boardSize).fill(-1));
    moveHistory.current.forEach(move => {
      if (move.moveNumber !== null) {
        const halfSize = boardSize / 2 - 0.5;
        const x = Math.round(move.position[0] + halfSize);
        const y = Math.round(move.position[2] + halfSize);
        board[y][x] = move.moveNumber - 1; // to convert to zero base indices
      }
    });
    
    return board;
  };


  const saveGameResults = async (gameCompleted, moveNo, startX, startY) => {
    setIsLoading(true);
    setServerError(null);
    
    try {
      const boardArray = createBoardArray();
      
      const payload = {
        username: username,
        boardSize: boardSize,
        moveCount: moveNo,
        gameTime: gameTime,
        hasCompleted: gameCompleted,
        board: boardArray,
        startX: startX,
        startY: startY,
        algorithmMetrics: {
          "warnsdorffs": {
            executionTime: algorithmMetrics.warnsdorff.executionTime, // milliseconds
            memoryUsage: 0,  // kilobytes
            branchesCovered: algorithmMetrics.warnsdorff.branchesCovered,
            maxMovesReached: algorithmMetrics.warnsdorff.maximumNumberOfMoves,
            hasCompleted: algorithmMetrics.warnsdorff.solutionFound,
            board: algorithmSequences.warnsdorff,
            hasTimedOut:algorithmMetrics.warnsdorff.timedOut
          },
          "backtracking": {
            executionTime: algorithmMetrics.backtracking.executionTime, // milliseconds
            memoryUsage: 0,  // kilobytes
            branchesCovered: algorithmMetrics.backtracking.branchesCovered,
            maxMovesReached: algorithmMetrics.backtracking.maximumNumberOfMoves,
            hasCompleted: algorithmMetrics.backtracking.solutionFound,
            board: algorithmSequences.backtracking,
            hasTimedOut:algorithmMetrics.backtracking.timedOut
          },
          "backtrackingheuristic": {
            executionTime: algorithmMetrics.backtrackingHeuristic.executionTime, // milliseconds
            memoryUsage: 0,  // kilobytes
            branchesCovered: algorithmMetrics.backtrackingHeuristic.branchesCovered,
            maxMovesReached: algorithmMetrics.backtrackingHeuristic.maximumNumberOfMoves,
            hasCompleted: algorithmMetrics.backtrackingHeuristic.solutionFound,
            board: algorithmSequences.backtrackingHeuristic,
            hasTimedOut:algorithmMetrics.backtrackingHeuristic.timedOut
          }
        }
      };
      
      const response = await fetch('http://localhost:8081/pdsa/knights-tour/save-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Game results saved:', data);
      
      // Here you can handle any additional logic after successful save
      return true;
    } catch (error) {
      console.error('Error saving game results:', error);
      setServerError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleUsernameSubmit = (name) => {
    setUsername(name);
    setShowUsernamePopup(false);
    console.log(`Username set: ${name}`);
  };

  const [algorithmLoading, setAlgorithmLoading] = useState({
    warnsdorff: false,
    backtracking: false,
    backtrackingHeuristic:false
  });
  const [algorithmMetrics, setAlgorithmMetrics] = useState({
    warnsdorff: { executionTime: null, branchesCovered: null, maximumNumberOfMoves: 0, solutionFound: false, timedOut: false },
    backtracking: { executionTime: null, branchesCovered: null, maximumNumberOfMoves: 0, solutionFound: false, timedOut: false },
    backtrackingHeuristic: { executionTime: null, branchesCovered: null, maximumNumberOfMoves: 0, solutionFound:false, timedOut: false }
  });

  const controllers = {
    warnsdorff: new AbortController(),
    backtracking: new AbortController(),
    backtrackingHeuristic: new AbortController()
  };

  const abortControllersRef = useRef(controllers);


  // Add this function to your ChessBoard component
  const generateAlgorithmSolutions = async (startY, startX) => {
    const userSequence = visitedSquares.map(square => {
      const halfSize = boardSize / 2 - 0.5;
      const x = Math.floor(square.position[0] + halfSize);
      const y = Math.floor(square.position[2] + halfSize);
      return y * boardSize + x;
    });
  
    // Set loading states
    setAlgorithmLoading({
      warnsdorff: true,
      backtracking: true,
      backtrackingHeuristic: true
    });

  
    try {
      // Start both algorithm calculations in parallel
      const warnsdorffPromise = fetchSolution("warnsdorffs", startX, startY, controllers.warnsdorff.signal);
      const backtrackingPromise = fetchSolution("backtracking", startX, startY, controllers.backtracking.signal);
      const backtrackingHeuristicPromise = fetchSolution("backtrackingHeuristic", startX, startY, controllers.backtrackingHeuristic.signal);
      // Handle both promises, but don't wait for both to complete

      console.log("\nWe are generating algorithm solutions for the starting position (",startX,",",startY,") ... feel free to solve before the algorithm");
      warnsdorffPromise
        .then(data => {
          const warnsdorffSequence = convertBoardToSequence(data.board);
          console.log(data);
          setAlgorithmSequences(prev => ({
            ...prev,
            warnsdorff: warnsdorffSequence
          }));
          // Store metrics
          setAlgorithmMetrics(prev => ({
            ...prev,
            warnsdorff: {
              executionTime: data.executionTime !== undefined ? data.executionTime : -1,
              branchesCovered: data.branchesCovered !== undefined ? data.branchesCovered : -1,
              solutionFound: data.solutionFound !== undefined ? data.solutionFound : false,
              maximumNumberOfMoves: data.maximumMovesMade !== undefined ? data.maximumMovesMade : 0,
              timedOut: data.timedOut !== undefined ? data.timedOut : false
            }
          }));
        })
        .catch(error => {
          if (error.name !== 'AbortError') {
            console.error("Warnsdorff algorithm error:", error);
            // Set fallback data
            setAlgorithmSequences(prev => ({
              ...prev,
              warnsdorff: generateDummySequence(boardSize)
            }));
            setAlgorithmMetrics(prev => ({
              ...prev,
              warnsdorff: {
                executionTime: -1,
                branchesCovered: -1,
                solutionFound: false,
                maximumNumberOfMoves: 0,
                timedOut: false
              }
            }));
          }
        })
        .finally(() => {
          setAlgorithmLoading(prev => ({
            ...prev, 
            warnsdorff: false
          }));
        });
  
      backtrackingPromise
        .then(data => {
          console.log(data);
          const backtrackingSequence = convertBoardToSequence(data.board);
          setAlgorithmSequences(prev => ({
            ...prev,
            backtracking: backtrackingSequence
          }));
          // Store metrics
          setAlgorithmMetrics(prev => ({
            ...prev,
            backtracking: {
              executionTime: data.executionTime !== undefined ? data.executionTime : -1,
              branchesCovered: data.branchesCovered !== undefined ? data.branchesCovered : -1,
              solutionFound: data.solutionFound !== undefined ? data.solutionFound : false,
              maximumNumberOfMoves: data.maximumMovesMade !== undefined ? data.maximumMovesMade : 0,
              timedOut: data.timedOut !== undefined ? data.timedOut : false
            }
          }));
        })
        .catch(error => {
          if (error.name !== 'AbortError') {
            console.error("Backtracking algorithm error:", error);
            // Set fallback data
            setAlgorithmSequences(prev => ({
              ...prev,
              backtracking: generateDummySequence(boardSize)
            }));
            setAlgorithmMetrics(prev => ({
              ...prev,
              backtracking: {
                executionTime: -1,
                branchesCovered: -1,
                solutionFound: false,
                maximumNumberOfMoves: 0,
                timedOut: false
              }
            }));
          }
        })
        .finally(() => {
          setAlgorithmLoading(prev => ({
            ...prev, 
            backtracking: false
          }));
        });

        backtrackingHeuristicPromise
        .then(data => {
          console.log(data);
          const backtrackingHeuristicSequence = convertBoardToSequence(data.board);
          setAlgorithmSequences(prev => ({
            ...prev,
            backtrackingHeuristic: backtrackingHeuristicSequence
          }));
          // Store metrics
          setAlgorithmMetrics(prev => ({
            ...prev,
            backtrackingHeuristic: {
              executionTime: data.executionTime !== undefined ? data.executionTime : -1,
              branchesCovered: data.branchesCovered !== undefined ? data.branchesCovered : -1,
              solutionFound: data.solutionFound !== undefined ? data.solutionFound : false,
              maximumNumberOfMoves: data.maximumMovesMade !== undefined ? data.maximumMovesMade : 0,
              timedOut: data.timedOut !== undefined ? data.timedOut : false
            }
          }));
        })
        .catch(error => {
          console.log(error.name);
          if (error.name !== 'AbortError') {
            console.error("Backtracking algorithm error:", error);
            setAlgorithmSequences(prev => ({
              ...prev,
              backtrackingHeuristic: generateDummySequence(boardSize)
            }));
            setAlgorithmMetrics(prev => ({
              ...prev,
              backtrackingHeuristic: {
                executionTime: -1,
                branchesCovered: -1,
                solutionFound: false,
                maximumNumberOfMoves: 0,
                timedOut: false
              }
            }));
          }
        })
        .finally(() => {
          setAlgorithmLoading(prev => ({
            ...prev, 
            backtrackingHeuristic: false
          }));
        });
  
      // Initialize user sequence
      setAlgorithmSequences(prev => ({
        ...prev,
        user: userSequence
      }));
      
    } catch (error) {
      console.error("Error setting up algorithm solutions:", error);
    }
  };
  
  // Helper function to fetch a single solution
  const fetchSolution = async (algorithm, startX, startY, signal) => {
    const response = await fetch('http://localhost:8081/pdsa/knights-tour/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        boardSize: boardSize,
        algorithm: algorithm,
        startX: startX,
        startY: startY
      }),
      signal // Add the abort signal
    });
    if (!response.ok){
      const errorMessage = response.headers.get('X-Error-Type');
      if(errorMessage === "no-solution-found"){
        const response3 = await response.json();
        response3.timedOut = true;
        return response3;
      }
      throw new Error("API request failed",response);
    }
    const response2 = await response.json();
    response2.timedOut = false;
    return response2;
  };
  
  // Convert 2D board array to 1D sequence
  const convertBoardToSequence = (board) => {
    const sequence = [];
    for (let x = 0; x < board.length; x++) {
      for (let y = 0; y < board[x].length; y++) {
        sequence[board[x][y]] = x * board.length + y;
      }
    }
    return sequence;
  };
  
  // Fallback dummy data generator
  const generateDummySequence = (size) => {
    return Array(size * size).fill(0).map((_, i) => i);
  };

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

    const halfSize = boardSize / 2 - 0.5;
    const [x, z] = [pos[0] + halfSize, pos[2] + halfSize]; 

    const moves = [
      [x + 2, z + 1],
      [x + 1, z + 2],
      [x - 1, z + 2],
      [x - 2, z + 1],
      [x - 2, z - 1],
      [x - 1, z - 2],
      [x + 1, z - 2],
      [x + 2, z - 1],
    ];

    // Filter moves to ensure they are within the board and not visited
    return moves
      .filter(([newX, newZ]) => {
        // Check if within board boundaries
        if (newX < 0 || newX > boardSize - 1 || newZ < 0 || newZ > boardSize - 1 ) return false;

        // Check if square has been visited
        const boardPos = [newX - halfSize, 0, newZ - halfSize];
        return !visitedSquares.some(
          (visited) =>
            visited.position[0] === boardPos[0] &&
            visited.position[2] === boardPos[2]
        );
      })
      .map(([newX, newZ]) => [newX - halfSize, 0, newZ - halfSize]); // Convert back to board space
  };

  const startGame = () => {
    const randX = Math.floor(Math.random() * boardSize);
    const randZ = Math.floor(Math.random() * boardSize);

    const halfSize = boardSize / 2 - 0.5;

    const position = [randX - halfSize, 0.1, randZ - halfSize];
    setKnightPosition(position);
    
    // Initialize with proper move number
    const initialMove = { position, moveNumber: 1 };
    setVisitedSquares([initialMove]);
    setMoveCount(1);
    moveHistory.current = [initialMove];

    setLegalMoves(calculateLegalMoves(position));
    setGameStarted(true);
    startTimer();

    generateAlgorithmSolutions(randX, randZ);
  };

  // Reset the game
  const resetGame = () => {

    if (abortControllersRef.current) {
      if (abortControllersRef.current.warnsdorff) {
        abortControllersRef.current.warnsdorff.abort();
      }
      if (abortControllersRef.current.backtracking) {
        abortControllersRef.current.backtracking.abort();
      }
    }

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
    setShowResultsTab(false);
    setSelectedAlgorithm("user");
    setAlgorithmMetrics({
      warnsdorff: { executionTime: null, branchesCovered: null },
      backtracking: { executionTime: null, branchesCovered: null }
    });
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

  const handleMoveComplete = async (isUndo) => {
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
        
        if (moveHistory.current.length === boardSize * boardSize) {
          setGameCompleted(true);
          stopTimer();
          console.log(moveHistory);
          await saveGameResults(true, moveHistory.current.length, moveHistory.current[0].position[2] + (boardSize / 2 - 0.5), moveHistory.current[0].position[0] + (boardSize / 2 - 0.5));
          setGameCompleted(true);
          setLegalMoves([]);
          setShowVictoryModal(true);
          console.log(username);
        } else if(legalMovesLocal.length === 0){
          setGameCompleted(true);
          stopTimer();
          console.log(moveHistory);
          await saveGameResults(false, moveHistory.current.length, moveHistory.current[0].position[2] + (boardSize / 2 - 0.5), moveHistory.current[0].position[0] + (boardSize / 2 - 0.5));
          setShowVictoryModal(true);
          setIsDeadEnd(true);
          console.log(username);
        }
      }
    } 
  };

  // Create the chessboard
  const createBoard = () => {
    const squares = [];
    const halfSize = boardSize / 2 - 0.5;
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        const isEven = (i + j) % 2 === 0;
      const position = [i - halfSize, 0, j - halfSize];

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
            selectedAlgorithm = {selectedAlgorithm}
          />
        );
      }
    }
    return squares;
  };

  // Add this component inside ChessBoard but before the return statement
  const ResultsTab = () => {
    // Get metrics for current algorithm
    const metrics = algorithmMetrics[selectedAlgorithm] || { executionTime: '—', branchesCovered: '—', solutionFound: '—', maximumNumberOfMoves: "—", timedOut: false };
    
    return (
      <div
        style={{
          position: "absolute",
          top: "50px",
          left: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: "20px",
          borderRadius: "10px",
          zIndex: 10,
          color: "white",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          minWidth: "250px",
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
          Results Comparison
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setSelectedAlgorithm("user")}
              style={{
                flex: 1,
                padding: "8px",
                backgroundColor: selectedAlgorithm === "user" ? "#00ffff" : "#4a4a4a",
                color: selectedAlgorithm === "user" ? "black" : "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Your Path
            </button>
          
            <button
              onClick={() => setSelectedAlgorithm("warnsdorff")}
              style={{
                flex: 1,
                padding: "8px",
                backgroundColor: selectedAlgorithm === "warnsdorff" ? "#00ffff" : "#4a4a4a",
                color: selectedAlgorithm === "warnsdorff" ? "black" : "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "5px",
                cursor: "pointer",
                position: "relative",
              }}
            >
              Warnsdorff
              {algorithmLoading.warnsdorff && (
                <span style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#ffff00",
                }}></span>
              )}
            </button>
          </div>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setSelectedAlgorithm("backtracking")}
              style={{
                flex: 1,
                padding: "8px",
                backgroundColor: selectedAlgorithm === "backtracking" ? "#00ffff" : "#4a4a4a",
                color: selectedAlgorithm === "backtracking" ? "black" : "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "5px",
                cursor: "pointer",
                position: "relative",
              }}
            >
              Backtracking
              {algorithmLoading.backtracking && (
                <span style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#ffff00",
                }}></span>
              )}
            </button>
            
            <button
              onClick={() => setSelectedAlgorithm("backtrackingHeuristic")}
              style={{
                flex: 1,
                padding: "8px",
                backgroundColor: selectedAlgorithm === "backtrackingHeuristic" ? "#00ffff" : "#4a4a4a",
                color: selectedAlgorithm === "backtrackingHeuristic" ? "black" : "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "5px",
                cursor: "pointer",
                position: "relative",
              }}
            >
              BacktrackingHeuristic
              {algorithmLoading.backtrackingHeuristic && (
                <span style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#ffff00",
                }}></span>
              )}
            </button>
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
            Algorithm
          </div>
          <div
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "#00ffff",
            }}
          >
            {selectedAlgorithm === "user" ? "Your Solution" : 
            selectedAlgorithm === "warnsdorff" ? "Warnsdorff's Algorithm" 
            : selectedAlgorithm === "backtrackingHeuristic" ? "Backtracking Heuristic" :
            "Backtracking Algorithm"}
          </div>
        </div>
        
        {/* New sections for algorithm metrics */}
        {selectedAlgorithm !== "user" && (
          <>
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
                Execution Time
              </div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#00ffff",
                }}
              >
                {metrics.executionTime !== null ?
                   metrics.timedOut ? "—" :
                  `${metrics.executionTime.toFixed(2)} ms` :
                  "Calculating..."}
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
                Solution Found
              </div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#00ffff",
                }}
              >
                {(metrics.solutionFound !== null 
                  && !metrics.timedOut) ? 
                  (metrics.solutionFound === true ? "TRUE" : "FALSE")
                  : "Calculating..."}
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
                Branches Covered
              </div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#00ffff",
                }}
              >
                {metrics.branchesCovered !== null 
                  ? metrics.branchesCovered.toLocaleString() 
                  : "Calculating..."}
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
                Maximum moves
              </div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#00ffff",
                }}
              >
                {(metrics.maximumNumberOfMoves !== null)  ?
                  metrics.maximumNumberOfMoves :
                  "Calculating..."}
              </div>
            </div>
          </>
        )}
      </div>
    );
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

      {isLoading && <Spinner />}

      {showUsernamePopup && <UsernamePopup onSubmit={handleUsernameSubmit} />}
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
          <>
            <div style={{
              marginBottom: "15px",
              textAlign: "center"
            }}>
              <label style={{
                display: "block",
                marginBottom: "5px",
                color: "#00ffff"
              }}>
                Select Board Size:
              </label>
              <select 
                value={boardSize}
                onChange={(e) => setBoardSize(parseInt(e.target.value))}
                style={{
                  padding: "8px",
                  borderRadius: "5px",
                  backgroundColor: "#4a4a4a",
                  color: "white",
                  border: "1px solid #00ffff",
                  width: "100%"
                }}
              >
                <option value={5}>5x5</option>
                <option value={6}>6x6</option>
                <option value={7}>7x7</option>
                <option value={8}>8x8</option>
              </select>
            </div>
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
          </>
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
                boardSize={boardSize}
                setShowResultsTab={setShowResultsTab}
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
        {!gameStarted && (
            <button
            onClick={() => {
              fetchMetricsData(); // Call the fetch function
              setShowMetricsChart(true);
            }}
            style={{
              padding: "10px",
              fontSize: "16px",
              backgroundColor: "#3F51B5",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "all 0.2s",
              marginTop: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "18px" }}>📊</span>
            View Algorithm Metrics
          </button>
          )}
          
      </div>

      {gameCompleted && showResultsTab && <ResultsTab />}

      {showMetricsChart && <AlgorithmMetricsChart />}

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
            <boxGeometry args={[boardSize  + 0.6, 0.2, boardSize  + 0.6]} />
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

            {gameStarted && 
              (selectedAlgorithm === "user" ? 
                visitedSquares.map(
                  (visited, index) =>
                    visited.moveNumber !== null && (
                      <NumberMarker
                        key={`marker-${index}`}
                        position={visited.position}
                        number={visited.moveNumber}
                      />
                    )
                ) : 
                
                algorithmSequences[selectedAlgorithm].map((squareIndex, moveNumber) => {
                  const x = squareIndex % boardSize;
                  const z = Math.floor(squareIndex / boardSize);
                  const halfSize = boardSize / 2 - 0.5;
                  const position = [x - halfSize, 0, z - halfSize];
                  
                  return (
                    <NumberMarker
                      key={`algo-marker-${moveNumber}`}
                      position={position}
                      number={moveNumber + 1}
                    />
                  );
                })
              )
            }

            {gameStarted && (
              <Suspense fallback={null}>
                {selectedAlgorithm === "user" ? (
                  <AnimatedKnight
                    currentPos={knightPosition}
                    targetPos={targetPosition || knightPosition}
                    isMoving={isMoving}
                    onMoveComplete={handleMoveComplete}
                    isUndoMove={isUndoMove}
                  />
                ) : (
                  // Position knight at the last position of the algorithm path
                  (() => {
                    const sequence = algorithmSequences[selectedAlgorithm];
                    if (sequence.length > 0) {
                      const lastSquareIndex = sequence[sequence.length - 1];
                      const x = lastSquareIndex % boardSize;
                      const z = Math.floor(lastSquareIndex / boardSize);
                      const halfSize = boardSize / 2 - 0.5;
                      const position = [x - halfSize, 0.1, z - halfSize];
                      
                      return <KnightModel position={position} />;
                    }
                    return null;
                  })()
                )}
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

export default ChessBoard;