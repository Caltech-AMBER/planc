// Robot Stepping Stones Game

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameRunning = false;
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem('robotGameHighScore') || 0;
let gameSpeed = 3;
let gameSpeedIncrement = 0.001;

// Robot object
const robot = {
  x: 50,
  y: canvas.height - 100,
  width: 20,
  height: 30,
  velocityY: 0,
  jumping: false,
  jumpPower: 15,
  gravity: 0.6,
  spaceHeld: false,
  isOnGround: true
};

// Ground/stepping stones
let steppingStones = [];
let stoneWidth = 60;
let stoneHeight = 15;
let stoneGap = 80;

// Initialize high score display
document.getElementById('gameHighScore').textContent = highScore;

// Generate initial stones
function generateStones() {
  steppingStones = [];
  let currentX = 0;
  for (let i = 0; i < Math.ceil(canvas.width / (stoneWidth + stoneGap)) + 2; i++) {
    // Randomize gap between stones (between 60 and 140)
    const randomGap = 60 + Math.random() * 80;
    currentX += stoneWidth + randomGap;
    const yVariation = Math.random() * 60;
    const randomWidth = 40 + Math.random() * 40; // Width between 40 and 80
    steppingStones.push({
      x: currentX,
      y: canvas.height - 80 - yVariation,
      width: randomWidth,
      height: stoneHeight,
      collected: false
    });
  }
}

// Draw robot
function drawRobot() {
  ctx.save();
  
  // Main body - silver/metallic
  const bodyGradient = ctx.createLinearGradient(robot.x, robot.y, robot.x + robot.width, robot.y);
  bodyGradient.addColorStop(0, '#e8e8e8');
  bodyGradient.addColorStop(0.5, '#c0c0c0');
  bodyGradient.addColorStop(1, '#a8a8a8');
  ctx.fillStyle = bodyGradient;
  ctx.fillRect(robot.x, robot.y, robot.width, robot.height);
  
  // Body outline for mechanical look
  ctx.strokeStyle = '#707070';
  ctx.lineWidth = 1;
  ctx.strokeRect(robot.x, robot.y, robot.width, robot.height);
  
  // Head - sphere shape
  const headGradient = ctx.createRadialGradient(robot.x + robot.width / 2, robot.y - 12, 2, robot.x + robot.width / 2, robot.y - 12, 10);
  headGradient.addColorStop(0, '#f0f0f0');
  headGradient.addColorStop(0.7, '#b8b8b8');
  headGradient.addColorStop(1, '#808080');
  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.arc(robot.x + robot.width / 2, robot.y - 12, 10, 0, Math.PI * 2);
  ctx.fill();
  
  // Head outline
  ctx.strokeStyle = '#505050';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  // Eyes - LED style
  ctx.fillStyle = '#00ff00';
  ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(robot.x + 8, robot.y - 15, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(robot.x + 12, robot.y - 15, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Reset shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0)';
  
  // Left arm
  ctx.fillStyle = '#d0d0d0';
  ctx.fillRect(robot.x - 5, robot.y + 5, 5, 12);
  ctx.strokeStyle = '#707070';
  ctx.lineWidth = 1;
  ctx.strokeRect(robot.x - 5, robot.y + 5, 5, 12);
  
  // Right arm
  ctx.fillRect(robot.x + robot.width, robot.y + 5, 5, 12);
  ctx.strokeRect(robot.x + robot.width, robot.y + 5, 5, 12);
  
  // Left leg
  ctx.fillStyle = '#a8a8a8';
  ctx.fillRect(robot.x + 2, robot.y + robot.height, 5, 10);
  ctx.strokeStyle = '#707070';
  ctx.lineWidth = 1;
  ctx.strokeRect(robot.x + 2, robot.y + robot.height, 5, 10);
  
  // Right leg
  ctx.fillRect(robot.x + robot.width - 7, robot.y + robot.height, 5, 10);
  ctx.strokeRect(robot.x + robot.width - 7, robot.y + robot.height, 5, 10);
  
  // Chest panel detail
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(robot.x + 3, robot.y + 5, 14, 10);
  ctx.strokeStyle = '#707070';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(robot.x + 3, robot.y + 5, 14, 10);
  
  // Chest detail lines (mechanical grill)
  ctx.strokeStyle = '#a0a0a0';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(robot.x + 5, robot.y + 7 + i * 2.5);
    ctx.lineTo(robot.x + 15, robot.y + 7 + i * 2.5);
    ctx.stroke();
  }
  
  ctx.restore();
}

// Draw stones
function drawStones() {
  ctx.fillStyle = '#8B7355';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  steppingStones.forEach(stone => {
    ctx.fillRect(stone.x, stone.y, stone.width, stone.height);
    
    // Add texture
    ctx.strokeStyle = '#6B5345';
    ctx.lineWidth = 1;
    for (let i = 0; i < stone.width; i += 10) {
      ctx.beginPath();
      ctx.moveTo(stone.x + i, stone.y);
      ctx.lineTo(stone.x + i, stone.y + stone.height);
      ctx.stroke();
    }
  });
  
  ctx.shadowColor = 'rgba(0, 0, 0, 0)';
}

// Draw water/background
function drawWater() {
  ctx.fillStyle = '#4A90E2';
  ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
  
  // Wave pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  for (let i = 0; i < canvas.width; i += 30) {
    ctx.beginPath();
    ctx.moveTo(i, canvas.height - 50);
    ctx.quadraticCurveTo(i + 15, canvas.height - 45, i + 30, canvas.height - 50);
    ctx.stroke();
  }
}

// Update game
function update() {
  // Apply gravity (but reduce it while space is held)
  if (robot.spaceHeld && robot.jumping) {
    robot.velocityY = -robot.jumpPower * 0.5; // Keep floating up while held
  } else {
    robot.velocityY += robot.gravity;
  }
  
  robot.y += robot.velocityY;
  
  // Move stones
  steppingStones.forEach(stone => {
    stone.x -= gameSpeed;
  });
  
  // Generate new stones
  const lastStone = steppingStones[steppingStones.length - 1];
  if (lastStone.x < canvas.width) {
    const randomGap = 60 + Math.random() * 80; // Randomize gap between 60 and 140
    const randomWidth = 40 + Math.random() * 40; // Width between 40 and 80
    const yVariation = Math.random() * 60;
    steppingStones.push({
      x: lastStone.x + lastStone.width + randomGap,
      y: canvas.height - 80 - yVariation,
      width: randomWidth,
      height: stoneHeight,
      collected: false
    });
  }
  
  // Remove off-screen stones
  steppingStones = steppingStones.filter(stone => stone.x > -stone.width);
  
  // Collision detection with stones
  let onStone = false;
  steppingStones.forEach(stone => {
    if (robot.x + robot.width > stone.x &&
        robot.x < stone.x + stone.width &&
        robot.y + robot.height >= stone.y &&
        robot.y + robot.height <= stone.y + stone.height + 10 &&
        robot.velocityY >= 0) {
      robot.y = stone.y - robot.height;
      robot.velocityY = 0;
      robot.jumping = false;
      robot.isOnGround = true;
      onStone = true;
      
      // Score
      if (!stone.collected) {
        stone.collected = true;
        score += 1;
        gameSpeed += gameSpeedIncrement;
        document.getElementById('gameScore').textContent = score;
      }
    }
  });
  
  // Game over conditions
  if (robot.y > canvas.height || robot.x < -robot.width) {
    gameOver = true;
    gameRunning = false;
    
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('robotGameHighScore', highScore);
      document.getElementById('gameHighScore').textContent = highScore;
    }
  }
  
  // Fall into water detection
  if (robot.y + robot.height > canvas.height - 60 && !onStone) {
    gameOver = true;
    gameRunning = false;
    
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('robotGameHighScore', highScore);
      document.getElementById('gameHighScore').textContent = highScore;
    }
  }
}

// Draw game
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw background
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, canvas.width, canvas.height - 60);
  
  drawWater();
  drawStones();
  drawRobot();
  
  // Draw game over message
  if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('High Score: ' + highScore, canvas.width / 2, canvas.height / 2 + 60);
    
    ctx.font = '16px Arial';
    ctx.fillText('Press R or click Start Game to try again', canvas.width / 2, canvas.height / 2 + 110);
  }
}

// Game loop
function gameLoop() {
  if (gameRunning) {
    update();
  }
  draw();
  requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
  gameRunning = false;
  gameOver = false;
  score = 0;
  gameSpeed = 3;
  robot.y = canvas.height - 100;
  robot.velocityY = 0;
  robot.jumping = false;
  robot.spaceHeld = false;
  robot.isOnGround = true;
  document.getElementById('gameScore').textContent = score;
  generateStones();
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    robot.spaceHeld = true;
    
    if (!gameRunning && !gameOver) {
      // Start game on first space
      gameRunning = true;
      robot.jumping = true;
      robot.isOnGround = false;
    } else if (gameRunning && robot.isOnGround) {
      // Allow jump only when on ground
      robot.jumping = true;
      robot.isOnGround = false;
    }
  }
  if (e.key === 'r' || e.key === 'R') {
    startGame();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    robot.spaceHeld = false;
  }
});

// Mouse/touch controls
let mouseDown = false;

canvas.addEventListener('mousedown', () => {
  if (!gameRunning && !gameOver) {
    gameRunning = true;
    robot.jumping = true;
    robot.isOnGround = false;
  } else if (gameRunning && robot.isOnGround) {
    // Allow jump only when on ground
    robot.jumping = true;
    robot.isOnGround = false;
  }
  mouseDown = true;
  robot.spaceHeld = true;
});

canvas.addEventListener('mouseup', () => {
  mouseDown = false;
  robot.spaceHeld = false;
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (!gameRunning && !gameOver) {
    gameRunning = true;
    robot.jumping = true;
    robot.isOnGround = false;
  } else if (gameRunning && robot.isOnGround) {
    // Allow jump only when on ground
    robot.jumping = true;
    robot.isOnGround = false;
  }
  robot.spaceHeld = true;
});

canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  robot.spaceHeld = false;
});

// Start game loop
gameLoop();
