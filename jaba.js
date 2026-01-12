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
    
    // Initialize the game when page loads
    window.addEventListener('load', init);
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
function spawnNewObjects(elapsedTime) {
    const seconds = Math.floor(elapsedTime / 1000);
    
    // Spawn new police every 45 seconds
    if (seconds > 0 && seconds % 45 === 0 && police.length < 8) {
        generatePolice(1);
        addToPoliceLog(`New police officer joined the chase!`, getCurrentTime());
        updatePoliceCount();
    }
    
    // Increase police speed every 30 seconds
    if (seconds > 0 && seconds % 30 === 0) {
        for (let cop of police) {
            cop.speed += 0.1;
        }
        addToPoliceLog(`Police are speeding up!`, getCurrentTime());
    }
    
    // Spawn new bribe every 10-20 seconds
    if (seconds > 0 && seconds % (10 + Math.floor(Math.random() * 11)) === 0 && bribes.length < 20) {
        spawnNewBribe();
    }
    
    // Spawn new power-up every 60 seconds
    if (seconds > 0 && seconds % 60 === 0 && powerUpItems.filter(p => p.active).length < 5) {
        spawnNewPowerUp();
    }
}

// Spawn a new bribe
function spawnNewBribe() {
    let validPosition = false;
    let x, y;
    
    while (!validPosition) {
        x = Math.floor(Math.random() * (mazeWidth - 40)) + 20;
        y = Math.floor(Math.random() * (mazeHeight - 40)) + 20;
        
        validPosition = !isInsideWall(x, y, 10);
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

// Spawn a new power-up
function spawnNewPowerUp() {
    let validPosition = false;
    let x, y;
    
    while (!validPosition) {
        x = Math.floor(Math.random() * (mazeWidth - 40)) + 20;
        y = Math.floor(Math.random() * (mazeHeight - 40)) + 20;
        
        validPosition = !isInsideWall(x, y, 15);
    }
    
    const powerUpTypes = [
        { type: "disguise", color: "#2ecc71", icon: "🎭" },
        { type: "speedBoost", color: "#3498db", icon: "⚡" },
        { type: "bribeMagnet", color: "#9b59b6", icon: "🧲" }
    ];
    
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

// Update UI elements
function updateUI() {
    // Update speed boost display
    document.getElementById('boost-counter').textContent = `${Math.round(player.sprintEnergy)}%`;
    
    // Update power-up status displays
    document.getElementById('disguise-counter').textContent = powerUps.disguise.active ? 
        `${Math.ceil(powerUps.disguise.duration / 1000)}s` : "NO";
    
    document.getElementById('speed-status').innerHTML = 
        `<i class="fas fa-bolt"></i><span>SPEED BOOST: <span class="powerup-value">${powerUps.speedBoost.active ? 
        `ACTIVE (${Math.ceil(powerUps.speedBoost.duration / 1000)}s)` : "INACTIVE"}</span></span>`;
    
    document.getElementById('disguise-status').innerHTML = 
        `<i class="fas fa-user-secret"></i><span>DISGUISE: <span class="powerup-value">${powerUps.disguise.active ? 
        `ACTIVE (${Math.ceil(powerUps.disguise.duration / 1000)}s)` : "INACTIVE"}</span></span>`;
    
    document.getElementById('magnet-status').innerHTML = 
        `<i class="fas fa-magnet"></i><span>BRIBE MAGNET: <span class="powerup-value">${powerUps.bribeMagnet.active ? 
        `ACTIVE (${Math.ceil(powerUps.bribeMagnet.duration / 1000)}s)` : "INACTIVE"}</span></span>`;
}

// Update score display
function updateScoreDisplay() {
    document.getElementById('money-counter').textContent = `$${score.toLocaleString()}`;
    
    // Update total in bribe log
    document.getElementById('total-bribes').textContent = `$${score.toLocaleString()}`;
    
    // Update high score if needed
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('corruptRunHighScore', highScore);
        document.getElementById('high-score').textContent = `$${highScore.toLocaleString()}`;
    }
}

// Update police count display
function updatePoliceCount() {
    document.getElementById('police-counter').textContent = police.length;
}

// Update time display
function updateTimeDisplay(elapsedTime) {
    const seconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const displaySeconds = seconds % 60;
    
    const timeString = `${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
    document.getElementById('time-counter').textContent = timeString;
    
    return timeString;
}

// Get current game time as string
function getCurrentTime() {
    if (!startTime) return "0:00";
    
    const elapsedTime = Date.now() - startTime;
    const seconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const displaySeconds = seconds % 60;
    
    return `${minutes}:${displaySeconds.toString().padStart(2, '0')}`;
}

// Add entry to bribe log
function addToBribeLog(bribe) {
    const bribeList = document.getElementById('bribes-list');
    
    const bribeItem = document.createElement('div');
    bribeItem.className = 'bribe-item';
    
    bribeItem.innerHTML = `
        <span class="bribe-amount">$${bribe.amount.toLocaleString()}</span>
        <span class="bribe-type">${bribe.type}</span>
    `;
    
    bribeList.insertBefore(bribeItem, bribeList.firstChild);
    
    // Limit list length
    if (bribeList.children.length > 8) {
        bribeList.removeChild(bribeList.lastChild);
    }
}

// Add entry to police log
function addToPoliceLog(text, time) {
    const policeLog = document.getElementById('police-log');
    
    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    
    logItem.innerHTML = `
        <span class="log-text">${text}</span>
        <span class="log-time">${time}</span>
    `;
    
    policeLog.insertBefore(logItem, policeLog.firstChild);
    
    // Limit list length
    if (policeLog.children.length > 6) {
        policeLog.removeChild(policeLog.lastChild);
    }
}

// End the game
function endGame() {
    gameRunning = false;
    gameOver = true;
    
    // Calculate final stats
    const elapsedTime = Date.now() - startTime;
    const timeString = updateTimeDisplay(elapsedTime);
    
    // Update game over screen
    document.getElementById('final-money').textContent = `$${score.toLocaleString()}`;
    document.getElementById('final-time').textContent = timeString;
    document.getElementById('police-evaded').textContent = policeEvaded;
    
    // Set game over message
    const messages = [
        "You were caught by the police! Justice has been served.",
        "The corruption ends here! You've been apprehended.",
        "Bribery has consequences! You're going to jail.",
        "Your escape attempt failed! The police caught you.",
        "The long arm of the law finally reached you!"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    document.getElementById('gameOverMessage').textContent = randomMessage;
    
    // Show game over screen
    document.getElementById('gameOverScreen').style.display = 'flex';
}

// Render everything
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw maze walls
    ctx.fillStyle = "#2c3e50";
    for (let wall of walls) {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        
        // Add some texture to walls
        ctx.strokeStyle = "#34495e";
        ctx.lineWidth = 2;
        ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
    }
    
    // Draw jail cell if player is in jail
    if (player.inJail) {
        const jailSize = 60;
        const jailX = player.x - jailSize / 2;
        const jailY = player.y - jailSize / 2;
        
        // Jail bars
        ctx.strokeStyle = "#7f8c8d";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(jailX, jailY, jailSize, jailSize);
        ctx.setLineDash([]);
        
        // Jail progress bar
        const barWidth = 100;
        const barHeight = 10;
        const barX = player.x - barWidth / 2;
        const barY = player.y + 50;
        
        // Background of progress bar
        ctx.fillStyle = "#34495e";
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progress fill
        ctx.fillStyle = "#f1c40f";
        ctx.fillRect(barX, barY, (player.jailBreakProgress / 100) * barWidth, barHeight);
        
        // Progress bar border
        ctx.strokeStyle = "#7f8c8d";
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Jail break text
        ctx.fillStyle = "#ecf0f1";
        ctx.font = "14px 'Orbitron', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("PRESS SPACE TO BREAK OUT", player.x, barY + 30);
        ctx.fillText(`${player.jailBreakProgress}%`, player.x, barY - 10);
    }
    
    // Draw bribes
    for (let bribe of bribes) {
        if (!bribe.collected) {
            // Draw bribe bag
            ctx.fillStyle = bribe.color;
            ctx.beginPath();
            ctx.roundRect(bribe.x - bribe.size/2, bribe.y - bribe.size/2, bribe.size, bribe.size, 4);
            ctx.fill();
            
            // Draw dollar sign
            ctx.fillStyle = "#2c3e50";
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("$", bribe.x, bribe.y);
            
            // Draw glow effect
            ctx.shadowColor = bribe.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(bribe.x, bribe.y, bribe.size/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    // Draw power-ups
    for (let powerUp of powerUpItems) {
        if (powerUp.active) {
            // Draw power-up background
            ctx.fillStyle = powerUp.color;
            ctx.beginPath();
            ctx.arc(powerUp.x, powerUp.y, powerUp.size/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw power-up icon
            ctx.fillStyle = "#ffffff";
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(powerUp.icon, powerUp.x, powerUp.y);
            
            // Draw glow effect
            ctx.shadowColor = powerUp.color;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(powerUp.x, powerUp.y, powerUp.size/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    // Draw police
    for (let cop of police) {
        // Draw police body
        ctx.fillStyle = cop.color;
        ctx.beginPath();
        ctx.arc(cop.x, cop.y, cop.size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw police badge
        ctx.fillStyle = "#3498db";
        ctx.beginPath();
        ctx.arc(cop.x, cop.y, cop.size/3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw police hat
        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(cop.x - cop.size/2, cop.y - cop.size/2 - 3, cop.size, 4);
        
        // Draw police ID number
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(cop.id, cop.x, cop.y);
        
        // Draw vision radius if player is disguised
        if (powerUps.disguise.active) {
            ctx.strokeStyle = "rgba(231, 76, 60, 0.2)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cop.x, cop.y, cop.searchRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // Draw player
    if (!player.inJail) {
        // Player body
        let playerColor = player.color;
        if (powerUps.disguise.active) {
            // Disguised player
            playerColor = "#2ecc71";
        }
        
        ctx.fillStyle = playerColor;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Player face/marker
        ctx.fillStyle = "#2c3e50";
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size/3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw sprint energy bar above player
        if (player.sprintEnergy < player.sprintEnergyMax) {
            const barWidth = 30;
            const barHeight = 4;
            const barX = player.x - barWidth / 2;
            const barY = player.y - player.size - 10;
            
            // Background
            ctx.fillStyle = "#34495e";
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Energy fill
            ctx.fillStyle = "#3498db";
            ctx.fillRect(barX, barY, (player.sprintEnergy / player.sprintEnergyMax) * barWidth, barHeight);
        }
        
        // Draw magnet effect if active
        if (powerUps.bribeMagnet.active) {
            ctx.strokeStyle = "rgba(155, 89, 182, 0.3)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(player.x, player.y, 200, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // Draw player direction indicator
    if (player.direction.x !== 0 || player.direction.y !== 0) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(
            player.x + player.direction.x * 20,
            player.y + player.direction.y * 20
        );
        ctx.stroke();
    }
}

// Initialize the game when the page loads
window.addEventListener('load', init);
