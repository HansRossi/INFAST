// ================================
// GAME STATE & CONFIGURATION
// ================================

const CONFIG = {
    COUNTDOWN_DURATION: 10000, // 10 seconds in milliseconds
    TARGET_TIME: 100, // Target is 0.1 seconds (100ms) before 0
    TOLERANCE_PERFECT: 10, // Within 10ms is considered perfect
    TOLERANCE_GOOD: 50, // Within 50ms is considered good
    ANIMATION_DURATION: 300,
    TIMER_UPDATE_INTERVAL: 10, // Update timer every 10ms
};

const KEYS = {
    PLAYER1: ' ', // Space bar
    PLAYER2: 'Enter', // Enter key
};

let gameState = {
    isRunning: false,
    isPaused: false,
    startTime: null,
    currentTime: 0,
    player1: {
        pressed: false,
        pressTime: null,
        score: null,
        deviation: null,
    },
    player2: {
        pressed: false,
        pressTime: null,
        score: null,
        deviation: null,
    },
    roundNumber: 1,
    timerInterval: null,
};

// ================================
// DOM ELEMENTS
// ================================

const elements = {
    // Screens
    homeScreen: document.getElementById('homeScreen'),
    gameScreen: document.getElementById('gameScreen'),
    
    // Home screen
    startButton: document.getElementById('startButton'),
    
    // Game screen
    roundNumber: document.getElementById('roundNumber'),
    timerDisplay: document.getElementById('timerDisplay'),
    timerStatus: document.getElementById('timerStatus'),
    timerCircle: document.getElementById('timerCircle'),
    
    // Player 1
    player1Card: document.getElementById('player1Card'),
    player1Key: document.getElementById('player1Key'),
    player1Time: document.getElementById('player1Time'),
    player1Deviation: document.getElementById('player1Deviation'),
    player1Status: document.getElementById('player1Status'),
    
    // Player 2
    player2Card: document.getElementById('player2Card'),
    player2Key: document.getElementById('player2Key'),
    player2Time: document.getElementById('player2Time'),
    player2Deviation: document.getElementById('player2Deviation'),
    player2Status: document.getElementById('player2Status'),
    
    // Result modal
    resultModal: document.getElementById('resultModal'),
    resultIcon: document.getElementById('resultIcon'),
    resultTitle: document.getElementById('resultTitle'),
    resultMessage: document.getElementById('resultMessage'),
    resultPlayer1Time: document.getElementById('resultPlayer1Time'),
    resultPlayer2Time: document.getElementById('resultPlayer2Time'),
    resultPlayer1Score: document.getElementById('resultPlayer1Score'),
    resultPlayer2Score: document.getElementById('resultPlayer2Score'),
    resultDifference: document.getElementById('resultDifference'),
    playAgainButton: document.getElementById('playAgainButton'),
    homeButton: document.getElementById('homeButton'),
};

// ================================
// INITIALIZATION
// ================================

function init() {
    createStars();
    setupEventListeners();
    showScreen('home');
}

function createStars() {
    const starsContainer = document.getElementById('stars');
    const starCount = 200;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random size
        const size = Math.random();
        if (size < 0.6) {
            star.classList.add('small');
        } else if (size < 0.9) {
            star.classList.add('medium');
        } else {
            star.classList.add('large');
        }
        
        // Random position
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Random animation duration and delay
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        
        starsContainer.appendChild(star);
    }
}

function setupEventListeners() {
    // Button listeners
    elements.startButton.addEventListener('click', startGame);
    elements.playAgainButton.addEventListener('click', resetGame);
    elements.homeButton.addEventListener('click', goHome);
    
    // Close modal
    if (document.getElementById('resultClose')) {
        document.getElementById('resultClose').addEventListener('click', () => {
            elements.resultModal.classList.remove('show');
        });
    }
    
    // Keyboard listeners
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keyup', handleKeyRelease);
}

// ================================
// SCREEN MANAGEMENT
// ================================

function showScreen(screenName) {
    elements.homeScreen.classList.remove('active');
    elements.gameScreen.classList.remove('active');
    
    if (screenName === 'home') {
        elements.homeScreen.classList.add('active');
    } else if (screenName === 'game') {
        elements.gameScreen.classList.add('active');
    }
}

// ================================
// GAME LOGIC
// ================================

function startGame() {
    showScreen('game');
    resetGameState();
    setTimeout(() => {
        startCountdown();
    }, 1000);
}

function resetGameState() {
    gameState = {
        isRunning: false,
        isPaused: false,
        startTime: null,
        currentTime: 0,
        player1: {
            pressed: false,
            pressTime: null,
            score: null,
            deviation: null,
        },
        player2: {
            pressed: false,
            pressTime: null,
            score: null,
            deviation: null,
        },
        roundNumber: gameState.roundNumber || 1,
        timerInterval: null,
    };
    
    // Reset UI
    elements.timerDisplay.textContent = '10.000';
    elements.timerStatus.textContent = 'Připravte se';
    elements.timerDisplay.classList.remove('warning');
    
    // Reset player cards
    resetPlayerCard('player1');
    resetPlayerCard('player2');
    
    // Hide result modal
    elements.resultModal.classList.remove('show');
}

function resetPlayerCard(player) {
    const card = elements[`${player}Card`];
    const timeEl = elements[`${player}Time`];
    const statusEl = elements[`${player}Status`];
    
    card.classList.remove('active', 'winner', 'pressed');
    timeEl.textContent = '—';
    statusEl.textContent = 'připraven';
    statusEl.classList.remove('ready', 'pressed', 'early');
}

function startCountdown() {
    gameState.isRunning = true;
    gameState.startTime = Date.now();
    elements.timerStatus.textContent = 'TEĎ';
    
    // Activate player cards
    elements.player1Card.classList.add('active');
    elements.player2Card.classList.add('active');
    
    elements.player1Status.textContent = 'čekám';
    elements.player1Status.classList.add('ready');
    elements.player2Status.textContent = 'čekám';
    elements.player2Status.classList.add('ready');
    
    // Start timer update
    gameState.timerInterval = setInterval(updateTimer, CONFIG.TIMER_UPDATE_INTERVAL);
}

function updateTimer() {
    if (!gameState.isRunning) return;
    
    const elapsed = Date.now() - gameState.startTime;
    gameState.currentTime = CONFIG.COUNTDOWN_DURATION - elapsed;
    
    // Allow going into negative (overtime)
    if (gameState.currentTime <= -2000) {
        // Stop at -2 seconds
        gameState.currentTime = -2000;
        endGame();
        return;
    }
    
    // Update display
    const seconds = (gameState.currentTime / 1000).toFixed(3);
    elements.timerDisplay.textContent = seconds;
    
    // Update timer circle
    const progress = Math.max(0, gameState.currentTime / CONFIG.COUNTDOWN_DURATION);
    const circumference = 2 * Math.PI * 95;
    const offset = circumference * (1 - progress);
    elements.timerCircle.style.strokeDashoffset = offset;
    
    // Add warning class when close to 0
    if (gameState.currentTime <= 1000 && gameState.currentTime >= -500) {
        elements.timerDisplay.classList.add('warning');
    }
}

function handleKeyPress(event) {
    if (!gameState.isRunning) return;
    
    // Prevent default behavior
    if (event.key === KEYS.PLAYER1 || event.key === KEYS.PLAYER2) {
        event.preventDefault();
    }
    
    // Player 1 press
    if (event.key === KEYS.PLAYER1 && !gameState.player1.pressed) {
        registerPress('player1');
    }
    
    // Player 2 press
    if (event.key === KEYS.PLAYER2 && !gameState.player2.pressed) {
        registerPress('player2');
    }
}

function handleKeyRelease(event) {
    // Visual feedback for key release
    if (event.key === KEYS.PLAYER1) {
        elements.player1Key.classList.remove('pressed');
    }
    if (event.key === KEYS.PLAYER2) {
        elements.player2Key.classList.remove('pressed');
    }
}

function registerPress(player) {
    const elapsed = Date.now() - gameState.startTime;
    const timeRemaining = CONFIG.COUNTDOWN_DURATION - elapsed;
    
    gameState[player].pressed = true;
    gameState[player].pressTime = elapsed;
    
    // Visual feedback
    const cardEl = elements[`${player}Card`];
    const keyEl = elements[`${player}Key`];
    const statusEl = elements[`${player}Status`];
    
    cardEl.classList.add('pressed');
    keyEl.classList.add('pressed');
    
    // Calculate how close to target (100ms before 0)
    const targetTime = CONFIG.COUNTDOWN_DURATION - CONFIG.TARGET_TIME;
    const deviation = Math.abs(elapsed - targetTime);
    gameState[player].score = deviation;
    gameState[player].deviation = deviation;
    
    // Update UI
    const timeInSeconds = (timeRemaining / 1000).toFixed(3);
    elements[`${player}Time`].textContent = `${timeInSeconds}s`;
    
    // Check if WAY too early (more than 2 seconds before target)
    if (timeRemaining > 2000) {
        statusEl.textContent = 'příliš brzy';
        statusEl.classList.add('early');
        statusEl.classList.remove('ready');
        
        // Add penalty for pressing way too early
        gameState[player].score = 10000 + deviation;
    } else {
        statusEl.textContent = 'stisknuto';
        statusEl.classList.add('pressed');
        statusEl.classList.remove('ready');
        
        // Check if perfect timing
        if (deviation <= CONFIG.TOLERANCE_PERFECT) {
            elements[`${player}Time`].classList.add('perfect');
        }
    }
    
    // Check if both players have pressed
    if (gameState.player1.pressed && gameState.player2.pressed) {
        setTimeout(() => endGame(), 500);
    }
}

function endGame() {
    gameState.isRunning = false;
    clearInterval(gameState.timerInterval);
    
    elements.timerStatus.textContent = 'konec';
    elements.timerDisplay.classList.remove('warning');
    
    // Deactivate player cards
    elements.player1Card.classList.remove('active');
    elements.player2Card.classList.remove('active');
    
    // Calculate winner
    setTimeout(() => showResults(), 800);
}

function showResults() {
    const modal = elements.resultModal;
    
    let winner = null;
    
    // Check if both pressed
    if (!gameState.player1.pressed && !gameState.player2.pressed) {
        // Nobody pressed
        elements.resultTitle.textContent = 'Nikdo nestiskl';
    } else if (!gameState.player1.pressed) {
        // Only player 2 pressed
        winner = 'player2';
        elements.resultTitle.textContent = 'Hráč 2 vyhrál';
        elements.player2Card.classList.add('winner');
    } else if (!gameState.player2.pressed) {
        // Only player 1 pressed
        winner = 'player1';
        elements.resultTitle.textContent = 'Hráč 1 vyhrál';
        elements.player1Card.classList.add('winner');
    } else {
        // Both pressed - compare scores
        const score1 = gameState.player1.score;
        const score2 = gameState.player2.score;
        
        if (Math.abs(score1 - score2) < 5) {
            // Draw (within 5ms)
            elements.resultTitle.textContent = 'Remíza';
        } else if (score1 < score2) {
            // Player 1 wins
            winner = 'player1';
            elements.resultTitle.textContent = 'Hráč 1 vyhrál';
            elements.player1Card.classList.add('winner');
        } else {
            // Player 2 wins
            winner = 'player2';
            elements.resultTitle.textContent = 'Hráč 2 vyhrál';
            elements.player2Card.classList.add('winner');
        }
    }
    
    // Update result details
    updateResultDetails(winner);
    
    // Show modal
    modal.classList.add('show');
}

function updateResultDetails(winner) {
    const players = document.querySelectorAll('.result-player');
    
    // Player 1
    if (gameState.player1.pressed) {
        const timeRemaining = (CONFIG.COUNTDOWN_DURATION - gameState.player1.pressTime) / 1000;
        elements.resultPlayer1Time.textContent = `${timeRemaining.toFixed(3)}s`;
        elements.resultPlayer1Score.textContent = `±${gameState.player1.deviation}ms`;
        
        if (winner === 'player1') {
            players[0].classList.add('winner');
        }
    } else {
        elements.resultPlayer1Time.textContent = '—';
        elements.resultPlayer1Score.textContent = '—';
    }
    
    // Player 2
    if (gameState.player2.pressed) {
        const timeRemaining = (CONFIG.COUNTDOWN_DURATION - gameState.player2.pressTime) / 1000;
        elements.resultPlayer2Time.textContent = `${timeRemaining.toFixed(3)}s`;
        elements.resultPlayer2Score.textContent = `±${gameState.player2.deviation}ms`;
        
        if (winner === 'player2') {
            players[1].classList.add('winner');
        }
    } else {
        elements.resultPlayer2Time.textContent = '—';
        elements.resultPlayer2Score.textContent = '—';
    }
    
    // Calculate and show difference
    if (gameState.player1.pressed && gameState.player2.pressed) {
        const diff = Math.abs(gameState.player1.deviation - gameState.player2.deviation);
        const diffSeconds = (diff / 1000).toFixed(3);
        
        if (winner === 'player1') {
            elements.resultDifference.innerHTML = `Hráč 1 byl rychlejší o <strong>${diff}ms</strong> (${diffSeconds}s)`;
        } else if (winner === 'player2') {
            elements.resultDifference.innerHTML = `Hráč 2 byl rychlejší o <strong>${diff}ms</strong> (${diffSeconds}s)`;
        } else {
            elements.resultDifference.innerHTML = `Rozdíl: <strong>${diff}ms</strong> - Téměř identická reakce!`;
        }
    } else {
        elements.resultDifference.textContent = '';
    }
}



function resetGame() {
    gameState.roundNumber++;
    startGame();
}

function goHome() {
    gameState.roundNumber = 1;
    showScreen('home');
    resetGameState();
}

// ================================
// START APPLICATION
// ================================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ================================
// ADDITIONAL UTILITIES
// ================================



// Prevent space bar from scrolling page
window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
    }
});

// Add keyboard visual feedback even when game is not running
document.addEventListener('keydown', (e) => {
    if (!gameState.isRunning) {
        if (e.key === KEYS.PLAYER1) {
            elements.player1Key.classList.add('pressed');
        }
        if (e.key === KEYS.PLAYER2) {
            elements.player2Key.classList.add('pressed');
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (!gameState.isRunning) {
        if (e.key === KEYS.PLAYER1) {
            elements.player1Key.classList.remove('pressed');
        }
        if (e.key === KEYS.PLAYER2) {
            elements.player2Key.classList.remove('pressed');
        }
    }
});

// Add sound effects (optional - can be enhanced with actual audio files)
function playSound(type) {
    // This is a placeholder for sound effects
    // You can add actual audio files later
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'press') {
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
    } else if (type === 'win') {
        oscillator.frequency.value = 1200;
        gainNode.gain.value = 0.2;
    } else if (type === 'start') {
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.1;
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Debug mode - log game state (can be removed in production)
window.debugGame = () => {
    console.log('Game State:', gameState);
    console.log('Current Time:', gameState.currentTime);
    console.log('Player 1:', gameState.player1);
    console.log('Player 2:', gameState.player2);
};

// Add resize handler for responsive design
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Recalculate any size-dependent elements if needed
        console.log('Window resized');
    }, 250);
});

// Performance optimization - disable animations if performance is poor
let fps = 60;
let lastFrameTime = Date.now();
let frameCount = 0;

function checkPerformance() {
    frameCount++;
    const now = Date.now();
    const delta = now - lastFrameTime;
    
    if (delta >= 1000) {
        fps = (frameCount * 1000) / delta;
        frameCount = 0;
        lastFrameTime = now;
        
        // If FPS drops below 30, reduce particle count
        if (fps < 30) {
            const particles = document.querySelectorAll('.particle');
            particles.forEach((p, i) => {
                if (i % 2 === 0) p.style.display = 'none';
            });
        }
    }
    
    requestAnimationFrame(checkPerformance);
}

requestAnimationFrame(checkPerformance);

// Add console welcome message
console.log('%c INFAST ', 'background: linear-gradient(135deg, #1e3a8a 0%, #f97316 100%); color: white; font-size: 24px; font-weight: bold; padding: 10px;');
console.log('%c Hra pro dva hráče - Vytvořeno Giovanniem ', 'color: #3b82f6; font-size: 14px;');
console.log('%c Pro debug informace použijte: window.debugGame() ', 'color: #f97316; font-size: 12px;');
