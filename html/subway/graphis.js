const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const HORIZON_Y = 240;
const GROUND_Y = 750;
const TRACK_WIDTH_BOTTOM = 380;
const TRACK_WIDTH_TOP = 60;

function project(lane, z, heightOffset = 0) {
    const perspective = Math.pow(1 - z, 1.8);
    const y = HORIZON_Y + (GROUND_Y - HORIZON_Y) * perspective;
    const currentTrackWidth = TRACK_WIDTH_TOP + (TRACK_WIDTH_BOTTOM - TRACK_WIDTH_TOP) * perspective;
    const laneWidth = currentTrackWidth / 3;
    const x = (canvas.width / 2) + (lane * laneWidth);
    const scale = 0.15 + 0.85 * perspective;
    return { x, y: y - (heightOffset * scale), scale, laneWidth };
}

function drawWorld(frameCount, speed) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, HORIZON_Y);
    skyGrad.addColorStop(0, '#1e90ff');
    skyGrad.addColorStop(1, '#87CEFA');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, HORIZON_Y);

    ctx.fillStyle = '#FFF59D';
    ctx.beginPath();
    ctx.arc(360, 80, 35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#555';
    ctx.fillRect(0, HORIZON_Y, canvas.width, GROUND_Y - HORIZON_Y);

    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - TRACK_WIDTH_TOP / 2, HORIZON_Y);
    ctx.lineTo(canvas.width / 2 + TRACK_WIDTH_TOP / 2, HORIZON_Y);
    ctx.lineTo(canvas.width / 2 + TRACK_WIDTH_BOTTOM / 2, GROUND_Y);
    ctx.lineTo(canvas.width / 2 - TRACK_WIDTH_BOTTOM / 2, GROUND_Y);
    ctx.closePath();
    ctx.fill();

    const sleeperOffset = (frameCount * speed * 10) % 1;
    ctx.strokeStyle = '#4a3b32';
    for (let i = 0; i < 20; i++) {
        let z = (i + (1 - sleeperOffset)) / 20;
        if (z > 1) continue;
        let pL = project(-1.4, z), pR = project(1.4, z);
        ctx.lineWidth = Math.max(1, 6 * pL.scale);
        ctx.beginPath();
        ctx.moveTo(pL.x, pL.y);
        ctx.lineTo(pR.x, pR.y);
        ctx.stroke();
    }

    ctx.strokeStyle = '#999';
    [-1, 0, 1].forEach(lane => {
        [-0.25, 0.25].forEach(offset => {
            let pT = project(lane + offset, 1), pB = project(lane + offset, 0);
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(pT.x, pT.y);
            ctx.lineTo(pB.x, pB.y);
            ctx.stroke();
        });
    });
}

function drawScenery(s) {
    if (s.z < 0 || s.z > 1) return;
    const p = project(s.side * 2.3, s.z);
    const w = 90 * p.scale, h = s.height * p.scale;
    ctx.fillStyle = s.color;
    ctx.fillRect(p.x - w / 2, p.y - h, w, h);
    ctx.fillStyle = 'rgba(255, 255, 200, 0.6)';
    if (p.scale > 0.3) {
        ctx.fillRect(p.x - w * 0.3, p.y - h * 0.8, w * 0.2, h * 0.15);
        ctx.fillRect(p.x + w * 0.1, p.y - h * 0.8, w * 0.2, h * 0.15);
    }
}

function drawCoin(c, frameCount) {
    if (c.z < 0 || c.z > 1) return;
    const bounce = Math.sin(frameCount * 0.15 + c.z * 10) * 5;
    const p = project(c.lane, c.z, 25 + bounce);
    const r = 16 * p.scale;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 2 * p.scale;
    ctx.stroke();
}

function drawObstacle(obs) {
    if (obs.z > 1) return;
    const pF = project(obs.lane, Math.max(0, obs.z));
    const pB = project(obs.lane, Math.min(1, obs.z + obs.length));

    if (obs.type === 'train') {
        const wF = pF.laneWidth * 0.85, hF = 115 * pF.scale;
        const wB = pB.laneWidth * 0.85, hB = 115 * pB.scale;
        ctx.fillStyle = '#1a252f';
        ctx.beginPath();
        ctx.moveTo(pB.x - wB / 2, pB.y - hB);
        ctx.lineTo(pB.x + wB / 2, pB.y - hB);
        ctx.lineTo(pF.x + wF / 2, pF.y - hF);
        ctx.lineTo(pF.x - wF / 2, pF.y - hF);
        ctx.fill();

        ctx.fillStyle = obs.color;
        ctx.fillRect(pF.x - wF / 2, pF.y - hF, wF, hF);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2 * pF.scale;
        ctx.strokeRect(pF.x - wF / 2, pF.y - hF, wF, hF);
        ctx.fillStyle = '#85c1e9';
        ctx.fillRect(pF.x - wF * 0.38, pF.y - hF * 0.85, wF * 0.76, hF * 0.35);
    } else if (obs.type === 'low_barrier') {
        const w = pF.laneWidth * 0.85, h = 48 * pF.scale;
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(pF.x - w / 2, pF.y - h, w, h);
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(pF.x - w / 2, pF.y - h * 0.7, w, h * 0.3);
    } else if (obs.type === 'high_barrier') {
        const w = pF.laneWidth * 0.9, h = 105 * pF.scale;
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(pF.x - w / 2, pF.y - h, w * 0.12, h);
        ctx.fillRect(pF.x + w / 2 - w * 0.12, pF.y - h, w * 0.12, h);
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(pF.x - w / 2, pF.y - h, w, h * 0.45);
    }
}

function drawPlayer(player, frameCount) {
    const pG = project(player.visualLane, 0.08, 0);
    const pP = project(player.visualLane, 0.08, player.y);
    const shadowScale = Math.max(0.4, 1 - player.y / 180);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(pG.x, pG.y, 24 * pG.scale * shadowScale, 10 * pG.scale * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    const h = player.isSliding ? 42 : 82;
    const w = player.isSliding ? 48 : 38;
    const bob = (!player.isJumping && !player.isSliding) ? Math.abs(Math.sin(frameCount * 0.3)) * 6 : 0;
    const x = pP.x, y = pP.y - bob;

    ctx.fillStyle = '#FF3366';
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h, w, h * 0.65, 10);
    ctx.fill();

    ctx.fillStyle = '#2980b9';
    ctx.fillRect(x - w * 0.4, y - h * 0.35, w * 0.8, h * 0.35);

    if (!player.isSliding) {
        ctx.fillStyle = '#FFCC99';
        ctx.beginPath();
        ctx.arc(x, y - h - 12, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFCC00';
        ctx.fillRect(x - 16, y - h - 17, 36, 5);
    }
}
