// Game Variables
let canvas, ctx;
let gameRunning = false;
let gameOver = false;
let startTime, currentTime;
let score = 0;
let highScore = localStorage.getItem('corruptRunHighScore') || 12500;
let policeEvaded = 0;

// Player Variables
let player = {
    x: 400,
    y: 300,
    size: 20,
    speed: 4,
    sprintSpeed: 8,
    currentSpeed: 4,
    direction: { x: 0, y: 0 },
    color: "#f1c40f",
    inJail: true,
    jailBreakProgress: 0,
    sprintEnergy: 100,
    sprintEnergyMax: 100,
    isSprinting: false
};

// Power-up Variables
let powerUps = {
    disguise: {
        active: false,
        duration: 0,
        maxDuration: 10000 // 10 seconds
    },
    speedBoost: {
        active: false,
        duration: 0,
        maxDuration: 8000 // 8 seconds
    },
    bribeMagnet: {
        active: false,
        duration: 0,
        maxDuration: 12000 // 12 seconds
    }
};

// Game Objects
let walls = [];
let bribes = [];
let police = [];
let powerUpItems = [];

// Maze Configuration
const mazeGrid = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,1,0,0,0,1,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1],
    [1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const cellSize = 40;
const mazeWidth = mazeGrid[0].length * cellSize;
const mazeHeight = mazeGrid.length * cellSize;

// Initialize Game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set high score
    document.getElementById('high-score').textContent = `$${highScore.toLocaleString()}`;
    
    // Build maze walls
    buildWalls();
    
    // Generate initial bribes
    generateBribes(15);
    
    // Generate initial police
    generatePolice(3);
    
    // Generate power-ups
    generatePowerUps(4);
    
    // Set up event listeners
    setupEventListeners();
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Build walls from maze grid
function buildWalls() {
    walls = [];
    
    for (let row = 0; row < mazeGrid.length; row++) {
        for (let col = 0; col < mazeGrid[row].length; col++) {
            if (mazeGrid[row][col] === 1) {
                walls.push({
                    x: col * cellSize,
                    y: row * cellSize,
                    width: cellSize,
                    height: cellSize
                });
            }
        }
    }
    
    // Add jail cell (center of maze)
    const centerRow = Math.floor(mazeGrid.length / 2);
    const centerCol = Math.floor(mazeGrid[0].length / 2);
    
    // Position player in jail cell
    player.x = centerCol * cellSize + cellSize / 2;
    player.y = centerRow * cellSize + cellSize / 2;
}

// Generate bribes
function generateBribes(count) {
    bribes = [];
    
    for (let i = 0; i < count; i++) {
        let validPosition = false;
        let x, y;
        
        while (!validPosition) {
            x = Math.floor(Math.random() * (mazeWidth - 40)) + 20;
            y = Math.floor(Math.random() * (mazeHeight - 40)) + 20;
            
            // Check if position is not inside a wall
            validPosition = !isInsideWall(x, y, 10);
            
            // Also check if not too close to player start
            if (validPosition) {
                const distToPlayer = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
                if (distToPlayer < 100) validPosition = false;
            }
        }
        
        const bribeTypes = ["Campaign Fund", "Kickback", "Consulting Fee", "Donation", "Gift", "Grant"];
        const bribeType = bribeTypes[Math.floor(Math.random() * bribeTypes.length)];
        const bribeAmount = Math.floor(Math.random() * 2000) + 500;
        
        bribes.push({
            x: x,
            y: y,
            size: 15,
            amount: bribeAmount,
            type: bribeType,
            color: "#f1c40f",
            collected: false
        });
    }
}

// Generate police officers
function generatePolice(count) {
    for (let i = 0; i < count; i++) {
        let validPosition = false;
        let x, y;
        
        while (!validPosition) {
            x = Math.floor(Math.random() * (mazeWidth - 40)) + 20;
            y = Math.floor(Math.random() * (mazeHeight - 40)) + 20;
            
            // Check if position is not inside a wall and not too close to player
            validPosition = !isInsideWall(x, y, 15);
            
            if (validPosition) {
                const distToPlayer = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
                if (distToPlayer < 150) validPosition = false;
            }
        }
        
        police.push({
            x: x,
            y: y,
            size: 18,
            speed: 1.5 + Math.random() * 0.5,
            color: "#e74c3c",
            id: i + 1,
            lastSeenPlayer: { x: player.x, y: player.y },
            searchRadius: 200
        });
    }
}

// Generate power-ups
function generatePowerUps(count) {
    const powerUpTypes = [
        { type: "disguise", color: "#2ecc71", icon: "🎭" },
        { type: "speedBoost", color: "#3498db", icon: "⚡" },
        { type: "bribeMagnet", color: "#9b59b6", icon: "🧲" }
    ];
    
    for (let i = 0; i < count; i++) {
        let validPosition = false;
        let x, y;
        
        while (!validPosition) {
            x = Math.floor(Math.random() * (mazeWidth - 40)) + 20;
            y = Math.floor(Math.random() * (mazeHeight - 40)) + 20;
            
            // Check if position is not inside a wall
            validPosition = !isInsideWall(x, y, 15);
        }
        
        const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        powerUpItems.push({
            x: x,
            y: y,
            size: 20,
            type: powerUpType.type,
            color: powerUpType.color,
            icon: powerUpType.icon,
            active: true
        });
    }
}

// Check if a point is inside a wall
function isInsideWall(x, y, radius) {
    for (let wall of walls) {
        if (x + radius > wall.x && x - radius < wall.x + wall.width &&
            y + radius > wall.y && y - radius < wall.y + wall.height) {
            return true;
        }
    }
    return false;
}

// Set up event listeners
function setupEventListeners() {
    // Start button
    document.getElementById('startButton').addEventListener('click', startGame);
    
    // Restart button
    document.getElementById('restartButton').addEventListener('click', restartGame);
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Touch controls for mobile
    document.getElementById('up-key').addEventListener('touchstart', () => movePlayer('up', true));
    document.getElementById('up-key').addEventListener('touchend', () => movePlayer('up', false));
    
    document.getElementById('down-key').addEventListener('touchstart', () => movePlayer('down', true));
    document.getElementById('down-key').addEventListener('touchend', () => movePlayer('down', false));
    
    document.getElementById('left-key').addEventListener('touchstart', () => movePlayer('left', true));
    document.getElementById('left-key').addEventListener('touchend', () => movePlayer('left', false));
    
    document.getElementById('right-key').addEventListener('touchstart', () => movePlayer('right', true));
    document.getElementById('right-key').addEventListener('touchend', () => movePlayer('right', false));
    
    document.getElementById('sprint-key').addEventListener('touchstart', () => { player.isSprinting = true; });
    document.getElementById('sprint-key').addEventListener('touchend', () => { player.isSprinting = false; });
    
    document.getElementById('space-key').addEventListener('touchstart', breakOutOfJail);
}

// Handle keyboard input
function handleKeyDown(e) {
    if (!gameRunning) return;
    
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            movePlayer('up', true);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            movePlayer('down', true);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            movePlayer('left', true);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            movePlayer('right', true);
            break;
        case 'Shift':
            player.isSprinting = true;
            break;
        case ' ':
            if (player.inJail) {
                breakOutOfJail();
            }
            break;
    }
}

function handleKeyUp(e) {
    if (!gameRunning) return;
    
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            movePlayer('up', false);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            movePlayer('down', false);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            movePlayer('left', false);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            movePlayer('right', false);
            break;
        case 'Shift':
            player.isSprinting = false;
            break;
    }
}

// Move player based on input
function movePlayer(direction, isPressed) {
    if (!gameRunning || gameOver) return;
    
    if (isPressed) {
        switch(direction) {
            case 'up':
                player.direction.y = -1;
                break;
            case 'down':
                player.direction.y = 1;
                break;
            case 'left':
                player.direction.x = -1;
                break;
            case 'right':
                player.direction.x = 1;
                break;
        }
    } else {
        switch(direction) {
            case 'up':
                if (player.direction.y === -1) player.direction.y = 0;
                break;
            case 'down':
                if (player.direction.y === 1) player.direction.y = 0;
                break;
            case 'left':
                if (player.direction.x === -1) player.direction.x = 0;
                break;
            case 'right':
                if (player.direction.x === 1) player.direction.x = 0;
                break;
        }
    }
}

// Break out of jail
function breakOutOfJail() {
    if (!player.inJail || !gameRunning) return;
    
    player.jailBreakProgress += 20;
    
    if (player.jailBreakProgress >= 100) {
        player.inJail = false;
        player.jailBreakProgress = 100;
        addToPoliceLog("You broke out of jail!", getCurrentTime());
    }
}

// Start the game
function startGame() {
    gameRunning = true;
    gameOver = false;
    startTime = Date.now();
    score = 0;
    policeEvaded = 0;
    
    // Reset player
    player.inJail = true;
    player.jailBreakProgress = 0;
    player.direction.x = 0;
    player.direction.y = 0;
    player.sprintEnergy = 100;
    
    // Reset power-ups
    powerUps.disguise.active = false;
    powerUps.disguise.duration = 0;
    powerUps.speedBoost.active = false;
    powerUps.speedBoost.duration = 0;
    powerUps.bribeMagnet.active = false;
    powerUps.bribeMagnet.duration = 0;
    
    // Clear and regenerate game objects
    bribes = [];
    police = [];
    powerUpItems = [];
    
    generateBribes(15);
    generatePolice(3);
    generatePowerUps(4);
    
    // Update UI
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    updateScoreDisplay();
    updatePoliceCount();
    
    // Clear logs
    document.getElementById('bribes-list').innerHTML = '';
    document.getElementById('police-log').innerHTML = '';
    
    // Add initial log entries
    addToPoliceLog("Game started! Break out of jail with SPACE.", "0:00");
    addToPoliceLog("Police officers are searching for you!", "0:01");
}

// Restart the game
function restartGame() {
    startGame();
}

// Game loop
function gameLoop() {
    if (!gameRunning) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Update game state
    update();
    
    // Render everything
    render();
    
    // Continue the loop
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Update time
    currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    updateTimeDisplay(elapsedTime);
    
    // Update player if not in jail
    if (!player.inJail) {
        updatePlayer();
        checkCollisions();
        updatePolice();
        updatePowerUps();
        spawnNewObjects(elapsedTime);
    }
    
    // Update UI
    updateUI();
    
    // Check for game over
    if (gameOver) {
        endGame();
    }
}

// Update player position
function updatePlayer() {
    // Calculate speed
    let speed = player.speed;
    
    if (powerUps.speedBoost.active) {
        speed *= 1.8; // 80% speed boost
    }
    
    if (player.isSprinting && player.sprintEnergy > 0) {
        speed = player.sprintSpeed;
        player.sprintEnergy -= 1.5;
        if (player.sprintEnergy < 0) player.sprintEnergy = 0;
    } else if (!player.isSprinting && player.sprintEnergy < player.sprintEnergyMax) {
        player.sprintEnergy += 0.5;
    }
    
    player.currentSpeed = speed;
    
    // Calculate new position
    let newX = player.x + player.direction.x * speed;
    let newY = player.y + player.direction.y * speed;
    
    // Check wall collisions
    if (!isInsideWall(newX, newY, player.size / 2)) {
        player.x = newX;
        player.y = newY;
    } else {
        // Try moving only horizontally
        if (!isInsideWall(newX, player.y, player.size / 2)) {
            player.x = newX;
        }
        // Try moving only vertically
        if (!isInsideWall(player.x, newY, player.size / 2)) {
            player.y = newY;
        }
    }
    
    // Keep player within bounds
    player.x = Math.max(player.size / 2, Math.min(mazeWidth - player.size / 2, player.x));
    player.y = Math.max(player.size / 2, Math.min(mazeHeight - player.size / 2, player.y));
}

// Update police AI
function updatePolice() {
    for (let i = 0; i < police.length; i++) {
        const cop = police[i];
        
        // Check if player is visible (not disguised and within radius)
        const dx = player.x - cop.x;
        const dy = player.y - cop.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < cop.searchRadius && !powerUps.disguise.active) {
            // Player is visible, chase them
            cop.lastSeenPlayer.x = player.x;
            cop.lastSeenPlayer.y = player.y;
            
            // Move towards player
            const angle = Math.atan2(dy, dx);
            cop.x += Math.cos(angle) * cop.speed;
            cop.y += Math.sin(angle) * cop.speed;
            
            // Check for collision with player
            if (distance < (player.size / 2 + cop.size / 2)) {
                gameOver = true;
                return;
            }
        } else {
            // Player not visible, move towards last known position or wander
            const targetX = cop.lastSeenPlayer.x;
            const targetY = cop.lastSeenPlayer.y;
            
            const dxTarget = targetX - cop.x;
            const dyTarget = targetY - cop.y;
            const distanceToTarget = Math.sqrt(dxTarget * dxTarget + dyTarget * dyTarget);
            
            if (distanceToTarget > 10) {
                // Move towards last known position
                const angle = Math.atan2(dyTarget, dxTarget);
                cop.x += Math.cos(angle) * cop.speed * 0.7;
                cop.y += Math.sin(angle) * cop.speed * 0.7;
            } else {
                // Wander randomly
                cop.x += (Math.random() - 0.5) * cop.speed * 0.5;
                cop.y += (Math.random() - 0.5) * cop.speed * 0.5;
            }
        }
        
        // Keep police within bounds
        cop.x = Math.max(cop.size / 2, Math.min(mazeWidth - cop.size / 2, cop.x));
        cop.y = Math.max(cop.size / 2, Math.min(mazeHeight - cop.size / 2, cop.y));
        
        // Check wall collisions for police
        if (isInsideWall(cop.x, cop.y, cop.size / 2)) {
            // Move police away from wall
            cop.x -= (Math.random() - 0.5) * cop.speed * 2;
            cop.y -= (Math.random() - 0.5) * cop.speed * 2;
        }
    }
}

// Update power-ups
function updatePowerUps() {
    const now = Date.now();
    
    // Update active power-up durations
    if (powerUps.disguise.active) {
        powerUps.disguise.duration -= 16; // Approximately 60 FPS
        if (powerUps.disguise.duration <= 0) {
            powerUps.disguise.active = false;
            addToPoliceLog("Disguise has worn off!", getCurrentTime());
        }
    }
    
    if (powerUps.speedBoost.active) {
        powerUps.speedBoost.duration -= 16;
        if (powerUps.speedBoost.duration <= 0) {
            powerUps.speedBoost.active = false;
            addToPoliceLog("Speed boost has worn off!", getCurrentTime());
        }
    }
    
    if (powerUps.bribeMagnet.active) {
        powerUps.bribeMagnet.duration -= 16;
        if (powerUps.bribeMagnet.duration <= 0) {
            powerUps.bribeMagnet.active = false;
            addToPoliceLog("Bribe magnet has worn off!", getCurrentTime());
        }
        
        // Magnet effect: attract nearby bribes
        for (let bribe of bribes) {
            if (!bribe.collected) {
                const dx = player.x - bribe.x;
                const dy = player.y - bribe.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 200) {
                    const angle = Math.atan2(dy, dx);
                    bribe.x += Math.cos(angle) * 5;
                    bribe.y += Math.sin(angle) * 5;
                }
            }
        }
    }
}

// Check collisions
function checkCollisions() {
    // Check bribe collisions
    for (let i = bribes.length - 1; i >= 0; i--) {
        const bribe = bribes[i];
        
        if (bribe.collected) continue;
        
        const dx = player.x - bribe.x;
        const dy = player.y - bribe.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < (player.size / 2 + bribe.size / 2)) {
            // Collect bribe
            bribe.collected = true;
            score += bribe.amount;
            
            // Add to bribe log
            addToBribeLog(bribe);
            
            // Update score display
            updateScoreDisplay();
            
            // Add to police log
            addToPoliceLog(`Collected ${bribe.type}: $${bribe.amount}`, getCurrentTime());
            
            // Remove from array (for performance)
            bribes.splice(i, 1);
            
            // Occasionally spawn new bribe
            if (Math.random() < 0.3) {
                spawnNewBribe();
            }
        }
    }
    
    // Check power-up collisions
    for (let i = powerUpItems.length - 1; i >= 0; i--) {
        const powerUp = powerUpItems[i];
        
        if (!powerUp.active) continue;
        
        const dx = player.x - powerUp.x;
        const dy = player.y - powerUp.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < (player.size / 2 + powerUp.size / 2)) {
            // Collect power-up
            powerUp.active = false;
            
            // Activate the power-up
            activatePowerUp(powerUp.type);
            
            // Add to police log
            addToPoliceLog(`Picked up ${powerUp.type === 'disguise' ? 'Disguise' : powerUp.type === 'speedBoost' ? 'Speed Boost' : 'Bribe Magnet'}!`, getCurrentTime());
        }
    }
}

// Activate a power-up
function activatePowerUp(type) {
    switch(type) {
        case 'disguise':
            powerUps.disguise.active = true;
            powerUps.disguise.duration = powerUps.disguise.maxDuration;
            break;
        case 'speedBoost':
            powerUps.speedBoost.active = true;
            powerUps.speedBoost.duration = powerUps.speedBoost.maxDuration;
            break;
        case 'bribeMagnet':
            powerUps.bribeMagnet.active = true;
            powerUps.bribeMagnet.duration = powerUps.bribeMagnet.maxDuration;
            break;
    }
}

// Spawn new game objects over time
function spawn
