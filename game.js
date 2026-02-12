(function () {
  'use strict';

  const TILE = 20;
  const COLS = 28;
  const ROWS = 31;
  const CANVAS_W = COLS * TILE;
  const CANVAS_H = ROWS * TILE;

  // 0=empty, 1=wall, 2=dot, 3=power pellet
  const WALL = 1, DOT = 2, POWER = 3;

  let maze = [];
  let score = 0, lives = 3, level = 1;
  let player = { x: 14, y: 24, dir: 0, nextDir: 0, mouth: 0 };
  let ghosts = [];
  let frightenedUntil = 0;
  let dotsLeft = 0;
  let gameRunning = false;
  let animationId = 0;

  const DIRS = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }]; // up, right, down, left

  // Classic-style maze (simplified). 1=wall, 2=dot, 3=power
  function getDefaultMaze() {
    const raw = [
      '1111111111111111111111111111',
      '1222222222222112222222222221',
      '1211111111112112111111111121',
      '1211222222222222222222211121',
      '1212111111112112111111121121',
      '1222222222222222222222222221',
      '1211111121111111112111111121',
      '1211111121111111112111111121',
      '1222222222222112222222222221',
      '1111111211112112111121111111',
      '0000001212222222222112100000',
      '1111111212111001112112111111',
      '0000000222111001112220000000',
      '1111111212111111112112111111',
      '1222222222222112222222222221',
      '1211111121111111112111111121',
      '1211111121111111112111111121',
      '1222212222222222222221222221',
      '1211211211112112111121121121',
      '1222222222222112222222222221',
      '1211111111112112111111111121',
      '1211222222222222222222211121',
      '1222111121111111112111222221',
      '1212111121111111112112111121',
      '1222222222222222222222222221',
      '1211111111112112111111111121',
      '1211222222222222222222211121',
      '1222222222222222222222222221',
      '1111111111111111111111111111',
    ];
    const full = raw.map(row => {
      let r = row.split('').map(c => parseInt(c, 10));
      while (r.length < COLS) r.push(1);
      return r;
    });
    while (full.length < ROWS) full.push(Array(COLS).fill(1));
    return full;
  }

  function buildMaze() {
    maze = getDefaultMaze().map(row => [...row]);
    dotsLeft = 0;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (maze[y][x] === 0) maze[y][x] = 2;
        if (maze[y][x] === 2 || maze[y][x] === 3) dotsLeft++;
      }
    }
    // Power pellets at corners
    const powers = [[1, 1], [COLS - 2, 1], [1, ROWS - 2], [COLS - 2, ROWS - 2]];
    powers.forEach(([x, y]) => {
      if (maze[y] && maze[y][x] === 2) {
        maze[y][x] = 3;
      }
    });
  }

  function initPlayer() {
    player = { x: 14, y: 24, dir: 0, nextDir: 0, mouth: 0 };
  }

  function initGhosts() {
    const colors = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852'];
    ghosts = [
      { x: 10, y: 14, dir: 0, color: colors[0] },
      { x: 11, y: 14, dir: 0, color: colors[1] },
      { x: 12, y: 14, dir: 0, color: colors[2] },
      { x: 14, y: 14, dir: 0, color: colors[3] },
    ];
    frightenedUntil = 0;
  }

  const TUNNEL_ROW = 12;
  function getTile(x, y) {
    const col = Math.floor(x);
    const row = Math.floor(y);
    if (row < 0 || row >= ROWS) return 1;
    if (row === TUNNEL_ROW && (col < 0 || col >= COLS)) return 0;
    if (col < 0 || col >= COLS) return 1;
    return maze[row][col];
  }

  function canGo(x, y) {
    return getTile(x, y) !== 1;
  }

  function centerX(cellX) { return cellX * TILE + TILE / 2; }
  function centerY(cellY) { return cellY * TILE + TILE / 2; }
  function cellX(px) { return Math.floor(px / TILE); }
  function cellY(py) { return Math.floor(py / TILE); }

  const PLAYER_SPEED = 0.25;
  function updatePlayer() {
    const cx = player.x, cy = player.y;

    for (const d of [player.nextDir, player.dir]) {
      const nx = cx + DIRS[d].x * PLAYER_SPEED;
      const ny = cy + DIRS[d].y * PLAYER_SPEED;
      if (canGo(nx, ny)) {
        player.x = nx;
        player.y = ny;
        player.dir = d;
        break;
      }
    }

    player.mouth = (player.mouth + 0.15) % 1;

    if (Math.round(player.y) === TUNNEL_ROW && (player.x < 0 || player.x >= COLS)) {
      player.x = player.x < 0 ? COLS - 0.5 : 0.5;
    }

    const px = Math.round(player.x), py = Math.round(player.y);
    if (py >= 0 && py < ROWS && px >= 0 && px < COLS) {
    const t = getTile(px, py);
    if (t === 2) {
      maze[py][px] = 0;
      score += 10;
      dotsLeft--;
    } else if (t === 3) {
      maze[py][px] = 0;
      score += 50;
      dotsLeft--;
      frightenedUntil = Date.now() + 8000;
    }

    }
    if (dotsLeft <= 0) {
      showLevelComplete();
      return;
    }
  }

  function manhattan(ax, ay, bx, by) {
    return Math.abs(ax - bx) + Math.abs(ay - by);
  }

  function chooseGhostDir(g) {
    const gx = Math.round(g.x), gy = Math.round(g.y);
    const isFrightened = Date.now() < frightenedUntil;
    let targetX = player.x, targetY = player.y;
    if (isFrightened) {
      targetX = Math.floor(Math.random() * COLS);
      targetY = Math.floor(Math.random() * ROWS);
    }
    const dirs = [];
    for (let d = 0; d < 4; d++) {
      const nx = gx + DIRS[d].x, ny = gy + DIRS[d].y;
      if (canGo(nx, ny)) dirs.push(d);
    }
    if (dirs.length === 0) return g.dir;
    if (isFrightened) return dirs[Math.floor(Math.random() * dirs.length)];
    let bestDir = dirs[0], bestDist = 1e9;
    for (const d of dirs) {
      const nx = gx + DIRS[d].x, ny = gy + DIRS[d].y;
      const dist = manhattan(nx, ny, targetX, targetY);
      if (dist < bestDist) { bestDist = dist; bestDir = d; }
    }
    return bestDir;
  }

  const GHOST_SPEED = 0.2;
  function updateGhosts() {
    ghosts.forEach(g => {
      const gx = Math.round(g.x), gy = Math.round(g.y);
      const dx = DIRS[g.dir].x, dy = DIRS[g.dir].y;
      const nx = g.x + dx * GHOST_SPEED, ny = g.y + dy * GHOST_SPEED;

      const atCellCenter = Math.abs(g.x - gx) < 0.05 && Math.abs(g.y - gy) < 0.05;
      const canMoveCurrent = canGo(nx, ny);

      if (atCellCenter || !canMoveCurrent) {
        g.dir = chooseGhostDir(g);
      }
      const newDx = DIRS[g.dir].x, newDy = DIRS[g.dir].y;
      const finalNx = g.x + newDx * GHOST_SPEED, finalNy = g.y + newDy * GHOST_SPEED;
      if (canGo(finalNx, finalNy)) {
        g.x = finalNx;
        g.y = finalNy;
      }
    });
  }

  function checkGhostCollision() {
    if (Date.now() < frightenedUntil) {
      ghosts.forEach(g => {
        if (manhattan(player.x, player.y, g.x, g.y) < 0.6) {
          g.x = 14; g.y = 14;
          score += 200;
        }
      });
      return;
    }
    for (const g of ghosts) {
      if (manhattan(player.x, player.y, g.x, g.y) < 0.6) {
        lives--;
        updateLivesDisplay();
        if (lives <= 0) {
          gameOver();
          return;
        }
        initPlayer();
        initGhosts();
        setTimeout(() => {}, 1500);
      }
    }
  }

  function gameLoop() {
    if (!gameRunning) return;

    updatePlayer();
    if (gameRunning) updateGhosts();
    if (gameRunning) checkGhostCollision();
    draw();

    document.getElementById('score').textContent = score;
    animationId = requestAnimationFrame(gameLoop);
  }

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const v = maze[y][x];
        if (v === 1) {
          ctx.fillStyle = '#2121de';
          ctx.fillRect(x * TILE + 1, y * TILE + 1, TILE - 2, TILE - 2);
        } else if (v === 2) {
          ctx.fillStyle = '#ffb897';
          ctx.beginPath();
          ctx.arc(x * TILE + TILE / 2, y * TILE + TILE / 2, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (v === 3) {
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(x * TILE + TILE / 2, y * TILE + TILE / 2, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const cx = player.x * TILE, cy = player.y * TILE;
    const mouthOpen = 0.2 + 0.3 * Math.sin(player.mouth * Math.PI * 2);
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(cx + TILE / 2, cy + TILE / 2, TILE / 2 - 2, mouthOpen * Math.PI, (2 - mouthOpen) * Math.PI);
    ctx.lineTo(cx + TILE / 2, cy + TILE / 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();

    const isFrightened = Date.now() < frightenedUntil;
    ghosts.forEach(g => {
      const gcx = g.x * TILE + TILE / 2, gcy = g.y * TILE + TILE / 2;
      ctx.fillStyle = isFrightened ? '#2121ff' : g.color;
      ctx.beginPath();
      ctx.arc(gcx, gcy, TILE / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      if (!isFrightened) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(gcx - 4, gcy - 6, 4, 4);
        ctx.fillRect(gcx + 2, gcy - 6, 4, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(gcx - 3, gcy - 5, 2, 2);
        ctx.fillRect(gcx + 3, gcy - 5, 2, 2);
      }
    });
  }

  function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('levelCompleteScreen').classList.add('hidden');
    score = 0;
    lives = 3;
    level = 1;
    buildMaze();
    initPlayer();
    initGhosts();
    gameRunning = true;
    document.getElementById('score').textContent = '0';
    document.getElementById('lives').textContent = '3';
    document.getElementById('level').textContent = '1';
    requestAnimationFrame(gameLoop);
  }

  function updateLivesDisplay() {
    document.getElementById('lives').textContent = lives;
  }

  function showLevelComplete() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    document.getElementById('levelScore').textContent = score;
    document.getElementById('levelCompleteScreen').classList.remove('hidden');
  }

  function nextLevel() {
    level++;
    document.getElementById('level').textContent = level;
    document.getElementById('levelCompleteScreen').classList.add('hidden');
    buildMaze();
    initPlayer();
    initGhosts();
    gameRunning = true;
    requestAnimationFrame(gameLoop);
  }

  function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.getElementById('finalScore').textContent = score;
  }

  document.addEventListener('keydown', (e) => {
    const map = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3, KeyW: 0, KeyD: 1, KeyS: 2, KeyA: 3 };
    if (map[e.code] !== undefined) {
      e.preventDefault();
      player.nextDir = map[e.code];
    }
  });

  document.getElementById('startBtn').addEventListener('click', startGame);
  document.getElementById('restartBtn').addEventListener('click', startGame);
  document.getElementById('nextLevelBtn').addEventListener('click', nextLevel);
})();
