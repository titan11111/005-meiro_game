// ゲームの状態管理
let gameState = {
    screen: 'title', // title, playing, gameOver
    score: 0,
    level: 1,
    lives: 3,
    bossActive: false
};

// プレイヤー設定
let player = {
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    speed: 5,
    lastShot: 0,
    shotCooldown: 700, // 0.7秒
    powerLevel: 1,
    hasRapidFire: false,
    hasYShot: false
};

// 弾の配列
let playerBullets = [];
let enemyBullets = [];
let enemies = [];
let items = [];
let particles = [];
let boss = null;

// キャンバスとコンテキスト
let canvas, ctx;
let gameLoop;
let lastTime = 0;

// 入力管理
let keys = {};
let touchInput = {
    left: false,
    right: false,
    fire: false
};

// 弾の設定
const bulletConfig = {
    player: {
        width: 4,
        height: 10,
        speed: 8,
        color: '#00ff00'
    },
    enemy: {
        width: 4,
        height: 8,
        speed: 4,
        color: '#ff0000'
    }
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    setupEventListeners();
});

function initGame() {
    console.log('ゲーム初期化開始');
    
    // キャンバスの取得
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('キャンバスが見つかりません');
        return;
    }
    
    ctx = canvas.getContext('2d');
    
    // キャンバスサイズを設定
    resizeCanvas();
    
    // ゲーム状態をリセット
    resetGameState();
    
    console.log('ゲーム初期化完了');
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 100;
    console.log('キャンバスサイズ:', canvas.width, 'x', canvas.height);
}

function resetGameState() {
    gameState.screen = 'title';
    gameState.score = 0;
    gameState.level = 1;
    gameState.lives = 3;
    gameState.bossActive = false;
    
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 100;
    player.lastShot = 0;
    player.powerLevel = 1;
    player.hasRapidFire = false;
    player.hasYShot = false;
    
    playerBullets = [];
    enemyBullets = [];
    enemies = [];
    items = [];
    particles = [];
    boss = null;
}

function setupEventListeners() {
    console.log('イベントリスナー設定開始');
    
    // スタートボタン
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
        console.log('スタートボタンにイベント追加');
    }
    
    // リスタートボタン
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
        console.log('リスタートボタンにイベント追加');
    }
    
    // キーボード操作
    document.addEventListener('keydown', function(e) {
        keys[e.key] = true;
        console.log('キー押下:', e.key);
        
        if (e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            if (gameState.screen === 'playing') {
                fireBullet();
            }
        }
    });
    
    document.addEventListener('keyup', function(e) {
        keys[e.key] = false;
    });
    
    // タッチ操作
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const fireBtn = document.getElementById('fireBtn');
    
    if (leftBtn) {
        leftBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            touchInput.left = true;
        });
        leftBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            touchInput.left = false;
        });
    }
    
    if (rightBtn) {
        rightBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            touchInput.right = true;
        });
        rightBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            touchInput.right = false;
        });
    }
    
    if (fireBtn) {
        fireBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            touchInput.fire = true;
            if (gameState.screen === 'playing') {
                fireBullet();
            }
        });
        fireBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            touchInput.fire = false;
        });
    }
    
    // ウィンドウリサイズ
    window.addEventListener('resize', resizeCanvas);
    
    console.log('イベントリスナー設定完了');
}

function startGame() {
    console.log('ゲーム開始');
    gameState.screen = 'playing';
    document.getElementById('titleScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    
    resetGameState();
    gameLoop = requestAnimationFrame(gameUpdate);
}

function restartGame() {
    console.log('ゲームリスタート');
    startGame();
}

function gameUpdate(currentTime) {
    if (gameState.screen !== 'playing') return;
    
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    handleInput();
    updatePlayer(deltaTime);
    updateBullets(deltaTime);
    updateEnemies(deltaTime);
    updateItems(deltaTime);
    updateParticles(deltaTime);
    updateBoss(deltaTime);
    checkCollisions();
    generateEnemies();
    generateItems();
    updateScore();
    
    render();
    
    gameLoop = requestAnimationFrame(gameUpdate);
}

function handleInput() {
    // キーボード入力
    if (keys['ArrowLeft'] || keys['a'] || keys['A'] || touchInput.left) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D'] || touchInput.right) {
        player.x += player.speed;
    }
    if (keys[' '] || keys['Spacebar'] || touchInput.fire) {
        fireBullet();
    }
    
    // プレイヤーの移動範囲制限
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
}

function updatePlayer(deltaTime) {
    // プレイヤーの更新処理
}

function fireBullet() {
    const currentTime = Date.now();
    if (currentTime - player.lastShot < player.shotCooldown) return;
    
    player.lastShot = currentTime;
    
    if (player.hasYShot) {
        // Y字弾
        createPlayerBullet(player.x + player.width / 2, player.y, -1);
        createPlayerBullet(player.x + player.width / 2, player.y, 1);
    } else {
        // 通常弾
        createPlayerBullet(player.x + player.width / 2, player.y, 0);
    }
    
    console.log('弾を発射しました');
}

function createPlayerBullet(x, y, angleOffset) {
    const bullet = {
        x: x,
        y: y,
        width: bulletConfig.player.width,
        height: bulletConfig.player.height,
        speedX: angleOffset * 2,
        speedY: -bulletConfig.player.speed,
        color: bulletConfig.player.color
    };
    playerBullets.push(bullet);
}

function updateBullets(deltaTime) {
    // プレイヤーの弾を更新
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const bullet = playerBullets[i];
        bullet.x += bullet.speedX;
        bullet.y += bullet.speedY;
        
        // 画面外に出た弾を削除
        if (bullet.y < -bullet.height) {
            playerBullets.splice(i, 1);
        }
    }
    
    // 敵の弾を更新
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        bullet.x += bullet.speedX;
        bullet.y += bullet.speedY;
        
        // 画面外に出た弾を削除
        if (bullet.y > canvas.height) {
            enemyBullets.splice(i, 1);
        }
    }
}

function updateEnemies(deltaTime) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.y += enemy.speed;
        
        // 画面外に出た敵を削除
        if (enemy.y > canvas.height) {
            enemies.splice(i, 1);
        }
        
        // 敵の弾を発射
        if (Math.random() < 0.01) {
            createEnemyBullet(enemy.x + enemy.width / 2, enemy.y + enemy.height);
        }
    }
}

function updateItems(deltaTime) {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.y += 2;
        
        // 画面外に出たアイテムを削除
        if (item.y > canvas.height) {
            items.splice(i, 1);
        }
    }
}

function updateParticles(deltaTime) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life -= 1;
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function updateBoss(deltaTime) {
    if (!boss) return;
    
    // ボスの移動
    boss.x += boss.speedX;
    if (boss.x <= 0 || boss.x >= canvas.width - boss.width) {
        boss.speedX *= -1;
    }
    
    // ボスの弾を発射
    if (Math.random() < 0.05) {
        createBossBullet();
    }
}

function createEnemyBullet(x, y) {
    const bullet = {
        x: x,
        y: y,
        width: bulletConfig.enemy.width,
        height: bulletConfig.enemy.height,
        speedX: 0,
        speedY: bulletConfig.enemy.speed,
        color: bulletConfig.enemy.color
    };
    enemyBullets.push(bullet);
}

function createBossBullet() {
    if (!boss) return;
    
    const bullet = {
        x: boss.x + boss.width / 2,
        y: boss.y + boss.height,
        width: 6,
        height: 12,
        speedX: 0,
        speedY: 6,
        color: '#ff6600'
    };
    enemyBullets.push(bullet);
}

function generateEnemies() {
    if (Math.random() < 0.02) {
        const enemy = {
            x: Math.random() * (canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: 2 + Math.random() * 2,
            hp: 1
        };
        enemies.push(enemy);
    }
}

function generateItems() {
    if (Math.random() < 0.005) {
        const item = {
            x: Math.random() * (canvas.width - 20),
            y: -20,
            width: 20,
            height: 20,
            type: Math.random() < 0.5 ? 'rapidFire' : 'yShot'
        };
        items.push(item);
    }
}

function checkCollisions() {
    // プレイヤーの弾と敵の衝突
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const bullet = playerBullets[i];
        
        // 通常の敵との衝突
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (isColliding(bullet, enemy)) {
                enemy.hp--;
                playerBullets.splice(i, 1);
                createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ff0000');
                
                if (enemy.hp <= 0) {
                    enemies.splice(j, 1);
                    gameState.score += 100;
                }
                break;
            }
        }
        
        // ボスとの衝突
        if (boss && isColliding(bullet, boss)) {
            boss.hp--;
            playerBullets.splice(i, 1);
            createParticles(bullet.x, bullet.y, '#ff6600');
            
            if (boss.hp <= 0) {
                boss = null;
                gameState.bossActive = false;
                gameState.score += 1000;
                gameState.level++;
                document.getElementById('bossHp').style.display = 'none';
            }
            break;
        }
    }
    
    // 敵の弾とプレイヤーの衝突
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        if (isColliding(bullet, player)) {
            enemyBullets.splice(i, 1);
            takeDamage();
            createParticles(player.x + player.width / 2, player.y + player.height / 2, '#ffffff');
        }
    }
    
    // 敵とプレイヤーの衝突
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (isColliding(enemy, player)) {
            enemies.splice(i, 1);
            takeDamage();
            createParticles(player.x + player.width / 2, player.y + player.height / 2, '#ffffff');
        }
    }
    
    // アイテムとプレイヤーの衝突
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (isColliding(item, player)) {
            collectItem(item);
            items.splice(i, 1);
        }
    }
}

function isColliding(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function takeDamage() {
    gameState.lives--;
    if (gameState.lives <= 0) {
        gameOver();
    }
}

function collectItem(item) {
    if (item.type === 'rapidFire') {
        player.hasRapidFire = true;
        player.shotCooldown = 200; // 0.2秒
        setTimeout(() => {
            player.hasRapidFire = false;
            player.shotCooldown = 700;
        }, 10000); // 10秒間
    } else if (item.type === 'yShot') {
        player.hasYShot = true;
        setTimeout(() => {
            player.hasYShot = false;
        }, 15000); // 15秒間
    }
}

function createParticles(x, y, color) {
    for (let i = 0; i < 5; i++) {
        const particle = {
            x: x,
            y: y,
            speedX: (Math.random() - 0.5) * 4,
            speedY: (Math.random() - 0.5) * 4,
            color: color,
            life: 30
        };
        particles.push(particle);
    }
}

function updateScore() {
    document.getElementById('score').textContent = `スコア: ${gameState.score}`;
    document.getElementById('lives').textContent = `ライフ: ${gameState.lives}`;
    document.getElementById('level').textContent = `レベル: ${gameState.level}`;
    
    if (boss) {
        document.getElementById('bossHp').textContent = `ボスHP: ${boss.hp}`;
    }
    
    // ボス出現判定
    if (gameState.score > 0 && gameState.score % 5000 === 0 && !gameState.bossActive && !boss) {
        spawnBoss();
    }
}

function spawnBoss() {
    boss = {
        x: canvas.width / 2 - 50,
        y: 50,
        width: 100,
        height: 80,
        hp: 100,
        speedX: 2
    };
    gameState.bossActive = true;
    document.getElementById('bossHp').style.display = 'block';
}

function gameOver() {
    gameState.screen = 'gameOver';
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.remove('hidden');
    
    document.getElementById('finalScore').textContent = `最終スコア: ${gameState.score}`;
    document.getElementById('finalLevel').textContent = `到達レベル: ${gameState.level}`;
    
    const resultMessage = document.getElementById('result-message');
    if (gameState.score > 10000) {
        resultMessage.textContent = '素晴らしい戦いでした！';
    } else if (gameState.score > 5000) {
        resultMessage.textContent = 'よく頑張りました！';
    } else {
        resultMessage.textContent = '次回はもっと頑張ろう！';
    }
    
    cancelAnimationFrame(gameLoop);
}

function render() {
    // 背景をクリア
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 星の背景
    drawStars();
    
    // プレイヤーを描画
    drawPlayer();
    
    // 弾を描画
    drawBullets();
    
    // 敵を描画
    drawEnemies();
    
    // アイテムを描画
    drawItems();
    
    // パーティクルを描画
    drawParticles();
    
    // ボスを描画
    if (boss) {
        drawBoss();
    }
}

function drawStars() {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
        const x = (i * 37) % canvas.width;
        const y = (i * 73) % canvas.height;
        ctx.fillRect(x, y, 1, 1);
    }
}

function drawPlayer() {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // プレイヤーの装飾
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x + 5, player.y + 5, 10, 10);
}

function drawBullets() {
    // プレイヤーの弾
    ctx.fillStyle = bulletConfig.player.color;
    playerBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // 敵の弾
    ctx.fillStyle = bulletConfig.enemy.color;
    enemyBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawEnemies() {
    ctx.fillStyle = '#ff0000';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function drawItems() {
    items.forEach(item => {
        if (item.type === 'rapidFire') {
            ctx.fillStyle = '#ffff00';
        } else {
            ctx.fillStyle = '#00ffff';
        }
        ctx.fillRect(item.x, item.y, item.width, item.height);
    });
}

function drawParticles() {
    particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life / 30;
        ctx.fillRect(particle.x, particle.y, 2, 2);
    });
    ctx.globalAlpha = 1;
}

function drawBoss() {
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
    
    // ボスの装飾
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(boss.x + 10, boss.y + 10, 20, 20);
    ctx.fillRect(boss.x + 70, boss.y + 10, 20, 20);
}