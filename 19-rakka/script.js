// HTML要素の取得
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const distanceDisplay = document.getElementById('distance');
const highDistanceDisplay = document.getElementById('highDistance');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalDistanceDisplay = document.getElementById('finalDistance');
const newRecordDisplay = document.getElementById('newRecord');
const restartButton = document.getElementById('restartButton');
const startButton = document.getElementById('startButton');
const startScreen = document.getElementById('startScreen');

// コントロールボタン
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');
const upButton = document.getElementById('upButton');
const downButton = document.getElementById('downButton');

// 風インジケーター
const windIndicator = document.getElementById('windIndicator');
const windDirectionSpan = document.getElementById('windDirection');

// パワーアップ表示要素
const featherTimeDisplay = document.getElementById('featherTime');
const shieldTimeDisplay = document.getElementById('shieldTime');
const starCountDisplay = document.getElementById('starCount');

// --- 画像アセット管理 ---
const images = {};
const imageAssets = {
    player: 'e9ea2d15-19b1-4354-97e8-d1536184f3d5.png',
    tower: '4da544de-f330-4362-a840-c3d5de494007.png',
    plane: '3ee075bf-28a2-49f1-80e4-f881ddd90f2e.png',
    bird: '0dabc06d-9be1-4a58-a5c4-1ab0d96723df.png',
    cloud1: '02db8ec8-edcc-4d6c-9d55-7da312c5c6dc.png',
    cloud2: '112a0cbb-492f-48d4-baec-55ec23c84cc0.png',
    ufo: 'maou.png'
};

function loadImages() {
    let loadedCount = 0;
    for (const [key, src] of Object.entries(imageAssets)) {
        const img = new Image();
        img.onload = () => {
            loadedCount++;
            images[key] = img;
        };
        img.onerror = () => {
            loadedCount++;
            images[key] = null;
        };
        img.src = src; 
    }
}
loadImages();

// ゲームの状態変数
let player;
let obstacles = [];
let items = [];
let particles = [];
let distance = 0;
let highDistance = localStorage.getItem('highDistance') || 0;
let gameOver = false;
let gameStarted = false;
let gameLoopId;

// ゲーム設定（小学生向けに大幅緩和）
let GAME_WIDTH = 300;
let GAME_HEIGHT = 400;
const PLAYER_SIZE = 40;
const PLAYER_SPEED = 5;      // 移動を少し速くして避けやすく
let GRAVITY = 0.005;         // 重力を弱めてふわふわに (0.008 -> 0.005)
const OBSTACLE_HEIGHT = 20;
let OBSTACLE_SPEED = 0.15;   // 障害物の落下速度をゆっくりに (0.2 -> 0.15)
let OBSTACLE_SPAWN_INTERVAL = 1800; // 敵が出る間隔を広げる (1200 -> 1800)
const ITEM_SIZE = 35;        // アイテムを少し大きく
const ITEM_SPEED = 0.1;      // アイテムは取りやすいようゆっくり
let ITEM_SPAWN_INTERVAL = 2000; // アイテム頻度アップ！ (4000 -> 2000)
const MIN_OBSTACLE_GAP = 160; // 隙間をかなり広く確保 (90 -> 160)

let lastObstacleSpawnTime = 0;
let lastItemSpawnTime = 0;
let lastDifficultyDistance = -1;

// パワーアップ・環境効果
let featherTime = 0;
let shieldTime = 0;
let shieldHits = 0;
let starCount = 0;
let windForce = 0;
let windTimer = 0;

// 背景の星
const starPositions = Array.from({ length: 80 }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 2 + 0.5, // 星を少し大きく
    blinkOffset: Math.random() * 10
}));

// 効果音
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
function playSound(freq, type='sine', vol=0.1) {
    if (audioContext.state === 'suspended') audioContext.resume();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(vol, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2); // 余韻を少し長く
    osc.start();
    osc.stop(audioContext.currentTime + 0.2);
}

function resizeCanvas() {
    const wrapper = canvas.parentElement;
    GAME_WIDTH = wrapper.clientWidth;
    GAME_HEIGHT = wrapper.clientHeight;
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
}

function Player() {
    this.x = GAME_WIDTH / 2 - PLAYER_SIZE / 2;
    this.y = 50;
    this.width = PLAYER_SIZE;
    this.height = PLAYER_SIZE;
    this.velocityY = 0;
    this.isMovingLeft = false;
    this.isMovingRight = false;
    this.isStomping = false;
    this.hasShield = false;
    this.shieldFlashTime = 0;
    this.trail = []; 

    this.draw = function() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        if (this.isStomping || Math.abs(this.velocityY) > 6) {
            this.trail.forEach((pos, index) => {
                const alpha = (index / this.trail.length) * 0.4;
                ctx.globalAlpha = alpha;
                if (images.player && images.player.complete && images.player.naturalWidth !== 0) {
                     ctx.drawImage(images.player, pos.x, pos.y, this.width, this.height);
                }
                ctx.globalAlpha = 1.0;
            });
        }

        if (this.hasShield) {
            ctx.save();
            ctx.strokeStyle = `rgba(100, 255, 218, ${0.5 + Math.sin(this.shieldFlashTime * 0.2) * 0.4})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width * 0.8, 0, 2 * Math.PI); // シールド大きく
            ctx.stroke();
            ctx.restore();
            this.shieldFlashTime++;
        }

        if (images.player && images.player.complete && images.player.naturalWidth !== 0) {
            ctx.drawImage(images.player, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#2c3e50';
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width/2, 0, Math.PI*2);
            ctx.fill();
        }
    };

    this.update = function() {
        // ストンプの加速をマイルドに
        if (this.isStomping) {
            this.velocityY += 0.4; 
            if (this.velocityY > 8) this.velocityY = 8; // 最高速度を抑える
        } else {
            this.velocityY += GRAVITY;
        }

        if (featherTime > 0 && this.velocityY > 1.5) {
            this.velocityY = 1.5; // 羽使用時はもっとゆっくり
        }

        this.y += this.velocityY;
        
        let moveX = 0;
        if (this.isMovingLeft) moveX -= PLAYER_SPEED;
        if (this.isMovingRight) moveX += PLAYER_SPEED;
        this.x += moveX + windForce;

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > GAME_WIDTH) this.x = GAME_WIDTH - this.width;

        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > 5) this.trail.shift();

        this.hasShield = shieldTime > 0;

        if (this.y > GAME_HEIGHT) {
            endGame();
        }
    };
}

function Obstacle(x, y, width, height, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.vx = 0;
    this.cloudType = Math.random() < 0.5 ? 'cloud1' : 'cloud2';

    this.draw = function() {
        const useImage = (key) => images[key] && images[key].complete && images[key].naturalWidth !== 0;

        if (this.type === 'pillar') {
            if (useImage('tower')) {
                const img = images.tower;
                ctx.save();
                ctx.beginPath();
                ctx.rect(this.x, this.y, this.width, this.height);
                ctx.clip();
                ctx.drawImage(img, this.x, this.y, this.width, this.height);
                ctx.strokeStyle = "rgba(0,0,0,0.2)"; // 枠線を薄く
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                ctx.restore();
            } else {
                ctx.fillStyle = '#555';
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        } else {
            let imgKey = null;
            if (this.type === 'cloud') imgKey = this.cloudType;
            else if (this.type === 'crow') imgKey = 'bird';
            else if (this.type === 'helicopter' || this.type === 'airplane') imgKey = 'plane';
            else if (this.type === 'ufo') imgKey = 'ufo';

            if (imgKey && useImage(imgKey)) {
                ctx.drawImage(images[imgKey], this.x, this.y, this.width, this.height);
            } else {
                ctx.fillStyle = this.type === 'cloud' ? '#ecf0f1' : '#e74c3c';
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }
    };

    this.update = function() {
        this.y -= OBSTACLE_SPEED;
        if (this.type !== 'pillar') {
            this.x += this.vx;
            if (this.x <= 0 || this.x + this.width >= GAME_WIDTH) {
                this.vx *= -1;
            }
            if (this.type === 'cloud') {
                this.x += windForce * 0.5; // 雲は風に流される
            }
        }
    };
}

function Item(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = ITEM_SIZE;
    this.height = ITEM_SIZE;
    this.type = type;
    this.time = 0;

    this.draw = function() {
        const bobY = this.y + Math.sin(this.time * 0.05) * 8; // ふわふわ大きく
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '28px serif';
        
        let icon = '';
        if (this.type === 'feather') icon = '🪶';
        else if (this.type === 'shield') icon = '🛡️';
        else if (this.type === 'star') icon = '🌟';

        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 15;
        ctx.fillText(icon, this.x + this.width/2, bobY + this.height/2);
        ctx.shadowBlur = 0;
    };

    this.update = function() {
        this.y -= ITEM_SPEED;
        this.time++;
    };
}

function Particle(x, y, type) {
    this.x = x;
    this.y = y;
    this.life = 1.0;
    this.type = type;
    
    if (type === 'wind') {
        this.vx = windForce * 8 + (Math.random()-0.5)*2;
        this.vy = (Math.random()-0.5);
        this.decay = 0.04;
    } else if (type === 'star_get') { // 星を取った時のキラキラ
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.decay = 0.02;
        this.color = `hsl(${Math.random()*60 + 40}, 100%, 50%)`;
    } else {
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.decay = 0.03;
        this.color = '#f1c40f';
    }

    this.update = function() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    };

    this.draw = function() {
        ctx.globalAlpha = Math.max(0, this.life);
        if (this.type === 'wind') {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * 2, this.y - this.vy * 2);
            ctx.stroke();
        } else {
            ctx.fillStyle = this.color || '#f1c40f';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.type === 'star_get' ? 4 : 2, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
    };
}

function initGame() {
    distance = 0;
    player = new Player();
    obstacles = [];
    items = [];
    particles = [];
    
    // リセット時にパラメータを初期値に戻す
    GRAVITY = 0.005;
    OBSTACLE_SPEED = 0.15;
    OBSTACLE_SPAWN_INTERVAL = 1800;
    
    featherTime = 0;
    shieldTime = 0;
    shieldHits = 0;
    starCount = 0;
    gameOver = false;
    
    windForce = 0;
    windTimer = 0;
    windIndicator.style.display = 'none';
    gameOverOverlay.style.display = 'none';
    startScreen.style.display = 'none';
    
    resizeCanvas();
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    gameLoopId = requestAnimationFrame(gameLoop);
}

function drawBackground() {
    let topColor, bottomColor;

    if (distance < 1000) {
        topColor = `hsl(210, 70%, ${Math.max(30, 75 - distance/25)}%)`; 
        bottomColor = `hsl(200, 80%, ${Math.max(50, 95 - distance/25)}%)`;
    } else if (distance < 2500) {
        const progress = (distance - 1000) / 1500;
        topColor = `hsl(${30 + progress * 240}, 50%, ${Math.max(10, 50 - progress*40)}%)`;
        bottomColor = `hsl(${40 + progress * 200}, 60%, ${Math.max(20, 60 - progress*40)}%)`;
    } else {
        topColor = '#050520';
        bottomColor = '#101035';
    }

    const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    if (distance > 300) {
        const starOpacity = Math.min(1, (distance - 300) / 1000);
        ctx.fillStyle = `rgba(255, 255, 255, ${starOpacity})`;
        starPositions.forEach(s => {
            const blink = Math.sin(Date.now() * 0.003 + s.blinkOffset) > 0.5 ? 1 : 0.6;
            ctx.globalAlpha = starOpacity * blink;
            ctx.beginPath();
            ctx.arc(s.x * GAME_WIDTH, s.y * GAME_HEIGHT, s.size, 0, Math.PI*2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    drawBackground();
    const now = Date.now();

    // 難易度調整（非常にゆっくり）
    if (distance - lastDifficultyDistance >= 200) { // 200mごとに少しだけ変化
        OBSTACLE_SPEED += 0.005; // 速度上昇を微量に
        if (OBSTACLE_SPAWN_INTERVAL > 800) OBSTACLE_SPAWN_INTERVAL -= 10;
        lastDifficultyDistance = distance;
    }

    // 風イベント（優しく）
    if (windTimer > 0) {
        windTimer--;
        if (Math.random() < 0.2) particles.push(new Particle(windForce > 0 ? 0 : GAME_WIDTH, Math.random()*GAME_HEIGHT, 'wind'));
        if (windTimer === 0) {
            windForce = 0;
            windIndicator.style.display = 'none';
        }
    } else if (distance > 500 && Math.random() < 0.0005) { // 発生頻度を下げる
        windTimer = 300;
        windForce = (Math.random() < 0.5 ? -1 : 1) * 0.5; // 風力弱め
        windIndicator.style.display = 'block';
        windDirectionSpan.textContent = windForce > 0 ? "RIGHT →" : "← LEFT";
    }

    const fallMultiplier = featherTime > 0 ? 0.5 : 1;
    GRAVITY = (OBSTACLE_SPEED * 0.03 + 0.002) * fallMultiplier; // 速度に応じて重力微調整
    
    player.update();
    player.draw();

    if (now - lastObstacleSpawnTime > OBSTACLE_SPAWN_INTERVAL) {
        spawnObstacle();
        lastObstacleSpawnTime = now;
    }
    if (now - lastItemSpawnTime > ITEM_SPAWN_INTERVAL) {
        spawnItem();
        lastItemSpawnTime = now;
    }

    obstacles.forEach((o, i) => {
        o.update();
        o.draw();
        if (checkCollision(player, o)) {
            if (shieldTime > 0) {
                playSound(150, 'square', 0.05);
                for(let k=0; k<5; k++) particles.push(new Particle(o.x+o.width/2, o.y+o.height/2, 'hit'));
                obstacles.splice(i, 1);
                shieldHits--;
                if (shieldHits <= 0) shieldTime = 0;
            } else if (player.isStomping && o.type !== 'pillar') {
                playSound(300, 'triangle', 0.1);
                obstacles.splice(i, 1);
                player.velocityY = -3; // ポーンと跳ねる（低めに）
                distance += 50; 
                // キラキラエフェクト追加
                for(let k=0; k<8; k++) particles.push(new Particle(o.x, o.y, 'star_get'));
            } else {
                endGame();
            }
        }
    });
    obstacles = obstacles.filter(o => o.y + o.height > -100);

    items.forEach((item, i) => {
        item.update();
        item.draw();
        if (checkCollision(player, item)) {
            playSound(500 + Math.random()*300, 'sine', 0.1); // 優しい音
            if (item.type === 'feather') featherTime = 400; // 時間延長
            if (item.type === 'shield') { shieldTime = 1500; shieldHits = 3; } // 時間延長
            if (item.type === 'star') { starCount++; distance += 100; }
            
            // アイテムゲット演出強化
            for(let k=0; k<10; k++) particles.push(new Particle(item.x, item.y, 'star_get'));
            
            items.splice(i, 1);
        }
    });
    items = items.filter(i => i.y + i.height > -100);

    particles.forEach((p, i) => {
        p.update();
        p.draw();
        if (p.life <= 0) particles.splice(i, 1);
    });

    distance += 0.8; // 距離の進みを少しゆっくりに
    updateDisplays();

    if (!gameOver) {
        gameLoopId = requestAnimationFrame(gameLoop);
    }
}

// 衝突判定（激甘設定：マージンを大きく）
function checkCollision(player, rect) {
    const margin = 15; // 判定をかなり小さくして、かすったくらいでは死なないように
    return (
        player.x + margin < rect.x + rect.width - margin &&
        player.x + player.width - margin > rect.x + margin &&
        player.y + margin < rect.y + rect.height - margin &&
        player.y + player.height - margin > rect.y + margin
    );
}

function spawnObstacle() {
    // 隙間をとても広く確保
    const gap = Math.max(PLAYER_SIZE * 4, MIN_OBSTACLE_GAP);
    const gapX = Math.random() * (GAME_WIDTH - gap);

    // 柱はたまにしか出ないようにする
    if (Math.random() < 0.4) { 
        if (gapX > 0) obstacles.push(new Obstacle(0, GAME_HEIGHT, gapX, OBSTACLE_HEIGHT, 'pillar'));
        if (gapX + gap < GAME_WIDTH) obstacles.push(new Obstacle(gapX + gap, GAME_HEIGHT, GAME_WIDTH - (gapX + gap), OBSTACLE_HEIGHT, 'pillar'));
    } else {
        // 敵キャラ（柱がない時は敵を出す）
        const types = ['cloud', 'crow', 'helicopter', 'airplane', 'ufo'];
        const type = types[Math.floor(Math.random() * types.length)];
        // UFOはレア
        if (type === 'ufo' && Math.random() > 0.3) return;

        let w = 40, h = 30;
        if (type === 'cloud') { w=60; h=35; }
        if (type === 'helicopter') { w=50; h=30; }

        // 画面中央付近に出現させる
        const x = Math.random() * (GAME_WIDTH - w);
        const enemy = new Obstacle(x, GAME_HEIGHT + 50, w, h, type);
        
        // 敵の横移動をゆっくりに
        enemy.vx = (Math.random() - 0.5) * 0.5; 
        obstacles.push(enemy);
    }
}

function spawnItem() {
    const types = ['shield', 'feather', 'star', 'star']; // 星が出やすい
    const type = types[Math.floor(Math.random() * types.length)];
    items.push(new Item(Math.random() * (GAME_WIDTH - ITEM_SIZE), GAME_HEIGHT, type));
}

function updateDisplays() {
    distanceDisplay.textContent = Math.floor(distance);
    highDistanceDisplay.textContent = Math.floor(highDistance);
    featherTimeDisplay.textContent = Math.ceil(featherTime/60);
    shieldTimeDisplay.textContent = Math.ceil(shieldTime/60);
    starCountDisplay.textContent = starCount;

    if (featherTime > 0) featherTime--;
    if (shieldTime > 0) shieldTime--;
}

function endGame() {
    if (gameOver) return;
    gameOver = true;
    
    if (distance > highDistance) {
        highDistance = distance;
        localStorage.setItem('highDistance', highDistance);
        newRecordDisplay.style.display = 'block';
    } else {
        newRecordDisplay.style.display = 'none';
    }
    
    finalDistanceDisplay.textContent = Math.floor(distance);
    gameOverOverlay.style.display = 'flex';
}

window.addEventListener('resize', resizeCanvas);

const setupBtn = (btn, actionStart, actionEnd) => {
    if(!btn) return;
    const start = (e) => { 
        if(e.cancelable) e.preventDefault(); 
        actionStart(); 
    };
    const end = (e) => { 
        if(e.cancelable) e.preventDefault(); 
        actionEnd(); 
    };
    btn.addEventListener('mousedown', start);
    btn.addEventListener('mouseup', end);
    btn.addEventListener('touchstart', start, {passive: false});
    btn.addEventListener('touchend', end, {passive: false});
};

setupBtn(startButton, () => { if(!gameStarted) { gameStarted = true; initGame(); } }, () => {});
setupBtn(restartButton, () => { initGame(); }, () => {});

setupBtn(leftButton, () => { if(player) player.isMovingLeft = true; }, () => { if(player) player.isMovingLeft = false; });
setupBtn(rightButton, () => { if(player) player.isMovingRight = true; }, () => { if(player) player.isMovingRight = false; });

let jumpInt;
setupBtn(upButton, () => {
    // 浮上力を優しく
    jumpInt = setInterval(() => { if(player) player.velocityY -= 0.4; }, 50);
}, () => { clearInterval(jumpInt); });

setupBtn(downButton, () => { if(player) player.isStomping = true; }, () => { if(player) player.isStomping = false; });

window.addEventListener('keydown', (e) => {
    if(!player) return;
    if(['ArrowLeft', 'a'].includes(e.key)) player.isMovingLeft = true;
    if(['ArrowRight', 'd'].includes(e.key)) player.isMovingRight = true;
    if(['ArrowUp', 'w'].includes(e.key)) player.velocityY -= 0.5;
    if(['ArrowDown', 's'].includes(e.key)) player.isStomping = true;
});

window.addEventListener('keyup', (e) => {
    if(!player) return;
    if(['ArrowLeft', 'a'].includes(e.key)) player.isMovingLeft = false;
    if(['ArrowRight', 'd'].includes(e.key)) player.isMovingRight = false;
    if(['ArrowDown', 's'].includes(e.key)) player.isStomping = false;
});