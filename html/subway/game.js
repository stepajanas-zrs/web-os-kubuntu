const scoreEl = document.getElementById('scoreBadge');
const coinEl = document.getElementById('coinBadge');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const titleText = document.getElementById('titleText');
const descText = document.getElementById('descText');

let isPlaying = false, score = 0, coins = 0, speed = 0.015, frameCount = 0;
let obstacles = [], collectibles = [], scenery = [];

const player = {
    lane: 0, visualLane: 0, y: 0, vy: 0,
    isJumping: false, isSliding: false, slideTimer: 0
};

function getBuildingColor() {
    const colors = ['#d9534f', '#f0ad4e', '#5bc0de', '#e67e22', '#9b59b6', '#34495e'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function resetGame() {
    score = 0; coins = 0; speed = 0.014; frameCount = 0;
    Object.assign(player, { lane: 0, visualLane: 0, y: 0, vy: 0, isJumping: false, isSliding: false, slideTimer: 0 });
    obstacles = []; collectibles = []; scenery = [];

    for (let i = 0; i < 10; i++) {
        scenery.push({ z: i * 0.1, side: -1, height: 120 + Math.random() * 100, color: getBuildingColor() });
        scenery.push({ z: i * 0.1, side: 1, height: 120 + Math.random() * 100, color: getBuildingColor() });
    }
    updateUI();
}

function spawnObjects() {
    if (frameCount % Math.max(28, Math.floor(55 - speed * 1000)) === 0) {
        const lanes = [-1, 0, 1].sort(() => Math.random() - 0.5);
        const numObs = Math.random() < 0.6 ? 1 : 2;
        const types = ['train', 'low_barrier', 'high_barrier'];

        for (let i = 0; i < numObs; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            obstacles.push({
                lane: lanes[i], z: 1.0, type: type,
                length: type === 'train' ? 0.22 : 0.04,
                color: Math.random() > 0.5 ? '#2980b9' : '#c0392b'
            });
        }

        const freeLane = lanes[numObs];
        if (freeLane !== undefined && Math.random() < 0.8) {
            for (let c = 0; c < 4; c++) {
                collectibles.push({ lane: freeLane, z: 1.0 + (c * 0.045), collected: false });
            }
        }
    }

    if (frameCount % 12 === 0) {
        scenery.push({ z: 1.0, side: -1, height: 120 + Math.random() * 120, color: getBuildingColor() });
        scenery.push({ z: 1.0, side: 1, height: 120 + Math.random() * 120, color: getBuildingColor() });
    }
}

function update() {
    if (!isPlaying) return;
    frameCount++;
    score += speed * 150;
    speed = Math.min(0.032, speed + 0.000003);
    player.visualLane += (player.lane - player.visualLane) * 0.25;

    if (player.isJumping) {
        player.y += player.vy;
        player.vy -= 1.3;
        if (player.y <= 0) { player.y = 0; player.isJumping = false; player.vy = 0; }
    }
    if (player.isSliding && --player.slideTimer <= 0) player.isSliding = false;

    spawnObjects();

    scenery.forEach((s, i) => { s.z -= speed; if (s.z < -0.2) scenery.splice(i, 1); });

    for (let i = collectibles.length - 1; i >= 0; i--) {
        let c = collectibles[i];
        c.z -= speed;
        if (!c.collected && Math.abs(c.z - 0.08) < 0.04 && c.lane === player.lane && player.y < 70) {
            c.collected = true; coins++; score += 50;
        }
        if (c.z < -0.1 || c.collected) collectibles.splice(i, 1);
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.z -= speed;
        if (obs.lane === player.lane && 0.08 >= obs.z - 0.02 && 0.08 <= obs.z + obs.length) {
            let hit = (obs.type === 'train' && player.y < 110) ||
                      (obs.type === 'low_barrier' && player.y < 55) ||
                      (obs.type === 'high_barrier' && !player.isSliding && player.y < 85);
            if (hit) { gameOver(); return; }
        }
        if (obs.z + obs.length < -0.1) obstacles.splice(i, 1);
    }
    updateUI();
}

function render() {
    drawWorld(frameCount, speed);
    let list = [
        ...scenery.map(s => ({ type: 'scenery', z: s.z, data: s })),
        ...collectibles.map(c => ({ type: 'coin', z: c.z, data: c })),
        ...obstacles.map(o => ({ type: 'obstacle', z: o.z, data: o })),
        { type: 'player', z: 0.08 }
    ].sort((a, b) => b.z - a.z);

    list.forEach(item => {
        if (item.type === 'scenery') drawScenery(item.data);
        else if (item.type === 'coin') drawCoin(item.data, frameCount);
        else if (item.type === 'obstacle') drawObstacle(item.data);
        else if (item.type === 'player') drawPlayer(player, frameCount);
    });
}

function updateUI() {
    scoreEl.textContent = Math.floor(score);
    coinEl.textContent = '🪙 ' + coins;
}

function gameOver() {
    isPlaying = false;
    titleText.textContent = 'KONEC HRY!';
    descText.innerHTML = `Skóre: <strong>${Math.floor(score)}</strong> | Mince: <strong>${coins}</strong>`;
    startBtn.textContent = 'HRÁT ZNOVU';
    overlay.style.display = 'flex';
}

function movePlayer(dir) {
    if (!isPlaying) return;
    if (dir === 'left' && player.lane > -1) player.lane--;
    if (dir === 'right' && player.lane < 1) player.lane++;
    if (dir === 'up' && !player.isJumping) { player.isJumping = true; player.isSliding = false; player.vy = 20; }
    if (dir === 'down' && !player.isSliding) {
        player.isSliding = true; player.slideTimer = 32;
        if (player.isJumping) player.vy = -25;
    }
}

window.addEventListener('keydown', e => {
    if (['ArrowLeft', 'a', 'A'].includes(e.key)) movePlayer('left');
    if (['ArrowRight', 'd', 'D'].includes(e.key)) movePlayer('right');
    if (['ArrowUp', 'w', 'W', ' '].includes(e.key)) movePlayer('up');
    if (['ArrowDown', 's', 'S'].includes(e.key)) movePlayer('down');
});

let startX = 0, startY = 0;
canvas.addEventListener('touchstart', e => { startX = e.touches.clientX; startY = e.touches.clientY; }, { passive: true });
canvas.addEventListener('touchend', e => handleSwipe(e.changedTouches.clientX - startX, e.changedTouches.clientY - startY));
canvas.addEventListener('mousedown', e => { startX = e.clientX; startY = e.clientY; });
canvas.addEventListener('mouseup', e => handleSwipe(e.clientX - startX, e.clientY - startY));

function handleSwipe(dx, dy) {
    if (Math.abs(dx) < 25 && Math.abs(dy) < 25) return;
    if (Math.abs(dx) > Math.abs(dy)) movePlayer(dx > 0 ? 'right' : 'left');
    else movePlayer(dy < 0 ? 'up' : 'down');
}

startBtn.addEventListener('click', () => { resetGame(); isPlaying = true; overlay.style.display = 'none'; });

function loop() { update(); render(); requestAnimationFrame(loop); }
resetGame(); render(); loop();
