import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const QuizGame = ({ questions = [], onComplete = () => {}, onExit = () => {}, gameSpeed = 2 }) => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [gameItems, setGameItems] = useState([]);
  const [characterPosition, setCharacterPosition] = useState(50); // percentage from left
  const gameRef = useRef(null);
  const bgMusicRef = useRef(null);
  const eatingSoundRef = useRef(null);
  const gameLoopRef = useRef(null);
  const animFrameRef = useRef(null);
  
  // Game settings - adjust based on gameSpeed (1-5)
  const BASE_GAME_SPEED = 3000; // ms between item spawns at slowest speed
  const GAME_SPEED = BASE_GAME_SPEED - (gameSpeed - 1) * 400; // Decrease by 400ms per speed level
  const BASE_FALL_DURATION = 8000; // ms for items to fall at slowest speed
  const FALL_DURATION = BASE_FALL_DURATION - (gameSpeed - 1) * 800; // Decrease by 800ms per speed level
  const MAX_MISSES = 5;
  
  // Initialize game
  useEffect(() => {
    if (questions.length === 0) {
      console.error("No questions provided for the game");
      return;
    }
    
    // Setup audio
    bgMusicRef.current = new Audio('http://toandz.ddns.net/fstudy/sound/bg.mp3');
    bgMusicRef.current.loop = true;
    
    eatingSoundRef.current = new Audio('http://toandz.ddns.net/fstudy/sound/eating.mp3');
    // Preload the eating sound
    eatingSoundRef.current.load();
    
    // Cleanup
    return () => {
      stopGame();
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
      if (eatingSoundRef.current) {
        eatingSoundRef.current = null;
      }
    };
  }, []);
  
  // Handle touch/mouse movement for character
  useEffect(() => {
    if (!gameStarted || gamePaused) return;
    
    const handleMouseMove = (e) => {
      if (!gameRef.current) return;
      
      const gameWidth = gameRef.current.offsetWidth;
      const mouseX = e.clientX - gameRef.current.getBoundingClientRect().left;
      const newPosition = (mouseX / gameWidth) * 100;
      
      // Constrain position to game boundaries
      setCharacterPosition(Math.max(10, Math.min(90, newPosition)));
    };
    
    const handleTouchMove = (e) => {
      if (!gameRef.current || e.touches.length === 0) return;
      
      const gameWidth = gameRef.current.offsetWidth;
      const touchX = e.touches[0].clientX - gameRef.current.getBoundingClientRect().left;
      const newPosition = (touchX / gameWidth) * 100;
      
      // Constrain position to game boundaries
      setCharacterPosition(Math.max(10, Math.min(90, newPosition)));
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gameStarted, gamePaused]);
  
  // Game state management
  useEffect(() => {
    if (gameStarted && !gamePaused) {
      startGame();
    } else {
      pauseGame();
    }
    
    return () => stopGame();
  }, [gameStarted, gamePaused, currentQuestionIndex]);
  
  // Check for game over conditions
  useEffect(() => {
    if (misses >= MAX_MISSES) {
      endGame();
    }
  }, [misses]);
  
  // Check for level complete
  useEffect(() => {
    if (currentQuestionIndex >= questions.length) {
      endGame();
    }
  }, [currentQuestionIndex, questions.length]);
  
  // Start game
  const startGame = () => {
    if (bgMusicRef.current) {
      bgMusicRef.current.play().catch(error => console.log("Audio play failed:", error));
    }
    
    // Start game loop for spawning items
    gameLoopRef.current = setInterval(() => {
      spawnItem();
    }, GAME_SPEED);
    
    // Start animation frame for collision detection
    const detectCollisions = () => {
      checkCollisions();
      animFrameRef.current = requestAnimationFrame(detectCollisions);
    };
    animFrameRef.current = requestAnimationFrame(detectCollisions);
  };
  
  // Pause game
  const pauseGame = () => {
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
    }
    
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };
  
  // Stop game completely
  const stopGame = () => {
    pauseGame();
    setGameItems([]);
  };
  
  // End game and report results
  const endGame = () => {
    stopGame();
    setGameStarted(false);
    
    // Report game results
    onComplete({
      score,
      misses,
      totalQuestions: questions.length,
      completedQuestions: currentQuestionIndex
    });
  };
  
  // Spawn a new falling item
  const spawnItem = () => {
    if (currentQuestionIndex >= questions.length) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    // Create a random answer option
    const options = ['A', 'B', 'C', 'D'];
    const randomOption = options[Math.floor(Math.random() * options.length)];
    
    // Random horizontal position (percentage)
    const position = Math.random() * 80 + 10; // between 10% and 90%
    
    // Create item
    const newItem = {
      id: Date.now() + Math.random(),
      option: randomOption,
      content: currentQuestion.options[randomOption], // Store the text content
      correct: randomOption === currentQuestion.correctAnswer,
      position: position,
      answered: false
    };
    
    setGameItems(prev => [...prev, newItem]);
    
    // Remove item after it falls off screen
    setTimeout(() => {
      setGameItems(prev => prev.filter(item => item.id !== newItem.id));
      
      // Count as a miss if item was correct and not answered
      if (newItem.correct && !newItem.answered) {
        setMisses(prev => prev + 1);
      }
    }, FALL_DURATION);
  };
  
  // Check for collisions between character and items
  const checkCollisions = () => {
    if (!gameRef.current) return;
    
    const characterElem = gameRef.current.querySelector('.character');
    if (!characterElem) return;
    
    const characterRect = characterElem.getBoundingClientRect();
    const itemElems = gameRef.current.querySelectorAll('.game-item');
    
    itemElems.forEach(itemElem => {
      const itemRect = itemElem.getBoundingClientRect();
      const itemId = itemElem.dataset.id;
      const item = gameItems.find(i => i.id.toString() === itemId);
      
      if (item && !item.answered) {
        // Check for collision - make detection more generous
        if (
          characterRect.left < itemRect.right &&
          characterRect.right > itemRect.left &&
          characterRect.top < itemRect.bottom &&
          characterRect.bottom > itemRect.top
        ) {
          console.log("Collision detected with item:", item.option, "Correct:", item.correct);
          
          // Mark item as eaten - use a direct state update for better responsiveness
          setGameItems(prevItems => 
            prevItems.map(i => i.id.toString() === itemId ? { ...i, answered: true } : i)
          );
          
          // Play sound - use a more direct approach
          const eatSound = new Audio('http://toandz.ddns.net/fstudy/sound/eating.mp3');
          eatSound.volume = 1.0;
          eatSound.play()
            .then(() => console.log("Sound played successfully"))
            .catch(e => console.error("Error playing sound:", e));
          
          // Check if answer is correct
          if (item.correct) {
            console.log("Correct answer eaten! Updating score and question");
            // Update score - make it more immediate
            setScore(prevScore => {
              const newScore = prevScore + 10;
              console.log("Score updated:", prevScore, "->", newScore);
              return newScore;
            });
            
            // Move to next question after a brief delay
            setTimeout(() => {
              setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            }, 500);
          }
        }
      }
    });
  };
  
  return (
    <div className="quiz-game-container">
      {!gameStarted ? (
        <div className="game-start-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-lg shadow-lg text-white h-[60vh]">
          <img 
            src="http://toandz.ddns.net/fstudy/img/dragon.gif" 
            alt="Dragon Character" 
            className="w-32 h-32 object-contain mb-6"
          />
          <h1 className="text-3xl font-bold mb-4">Dragon Quiz Challenge</h1>
          <p className="mb-8 text-center max-w-md">
            Feed the dragon with correct answers to score points! 
            Move your mouse to control the dragon and eat the falling answer options.
          </p>
          <button 
            className="px-8 py-4 bg-green-500 text-white text-lg font-bold rounded-lg hover:bg-green-600 transition-colors shadow-lg"
            onClick={() => setGameStarted(true)}
          >
            Start Game
          </button>
        </div>
      ) : (
        <div 
          ref={gameRef}
          className="game-area relative h-[80vh] bg-sky-100 overflow-hidden"
        >
          {/* Game HUD */}
          <div className="game-hud absolute top-0 left-0 right-0 p-2 flex justify-between z-10">
            <div className="flex items-center space-x-3">
              <div className="coins bg-yellow-400 rounded-full p-1 flex items-center">
                <span role="img" aria-label="coin">🪙</span>
                <span className="font-bold ml-1">{score}</span>
              </div>
              <div className="misses text-red-600 font-bold">
                Misses: {misses}/{MAX_MISSES}
              </div>
            </div>
            
            <div className="controls flex space-x-2">
              <button 
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
                onClick={() => setGamePaused(!gamePaused)}
              >
                {gamePaused ? '▶' : '⏸'}
              </button>
              <button 
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
                onClick={endGame}
              >
                ✖
              </button>
            </div>
          </div>
          
          {/* Current Question */}
          <div className="question-display absolute top-12 left-0 right-0 text-center p-2 bg-white bg-opacity-80 z-10">
            <p className="font-bold">
              {currentQuestionIndex < questions.length ? 
                questions[currentQuestionIndex].question : 
                "Game Complete!"}
            </p>
          </div>
          
          {/* Game Items */}
          {gameItems.map(item => (
            <div
              key={item.id}
              data-id={item.id}
              className={`game-item absolute text-sm font-bold rounded-lg p-2 flex items-center justify-center
                ${item.answered ? 'opacity-0' : 'opacity-100'}
                ${item.correct ? 'bg-green-400' : 'bg-blue-400'}`}
              style={{
                left: `${item.position}%`,
                top: '-40px',
                minWidth: '80px',
                maxWidth: '150px',
                animation: item.answered ? 'none' : `fallDown ${FALL_DURATION}ms linear forwards`
              }}
            >
              <span className="text-xs mr-1 bg-white rounded-full h-5 w-5 flex items-center justify-center">{item.option}</span>
              <span className="text-xs text-center">{item.content}</span>
            </div>
          ))}
          
          {/* Character */}
          <div 
            className="character absolute bottom-0 w-24 h-24 flex items-center justify-center"
            style={{ left: `calc(${characterPosition}% - 48px)` }}
          >
            <img 
              src="http://toandz.ddns.net/fstudy/img/dragon.gif" 
              alt="Dragon Character" 
              className="w-full h-full object-contain transform scale-150"
            />
          </div>
          
          {/* Game Paused Overlay */}
          {gamePaused && (
            <div className="paused-overlay absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-2xl font-bold">PAUSED</div>
            </div>
          )}
        </div>
      )}
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fallDown {
          from { transform: translateY(0); }
          to { transform: translateY(calc(80vh + 40px)); }
        }
      `}</style>
    </div>
  );
};

export default QuizGame; 