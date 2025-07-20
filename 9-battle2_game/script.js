const keys = {};
const vKeys = { up:false, down:false, left:false, right:false };

const gameState = {
  player: { 
    x:0, y:0, speed:4, hp:3, maxHp:3, exp:0, level:1,
    score: 0, combo: 0, maxCombo: 0,
    powerUps: { speed: 0, shield: 0, magnet: 0 },
    abilities: { dash: false, freeze: false, bomb: false }
  },
  enemies: [],
  items: [],
  isPaused: false,
  quizData: {},
  gameStarted: false,
  gameTime: 0,
  difficulty: 1
};

let bgmField;

// パワーアップアイテムの種類
const itemTypes = [
  { type: 'hp', icon: '❤️', effect: 'HP回復', duration: 0, weight: 3 },
  { type: 'speed', icon: '⚡', effect: 'スピードアップ', duration: 8000, weight: 2 },
  { type: 'shield', icon: '🛡️', effect: 'シールド', duration: 6000, weight: 2 },
  { type: 'freeze', icon: '❄️', effect: '敵フリーズ', duration: 4000, weight: 1 },
  { type: 'bomb', icon: '💣', effect: '画面内敵全滅', duration: 0, weight: 1 }
];

document.addEventListener("DOMContentLoaded", async () => {
  console.log("ゲーム初期化開始");
  
  const playerEl = document.getElementById("player");
  const areaEl = document.getElementById("game-area");

  // CSS読み込み完了を待つ
  await new Promise(resolve => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve);
    }
  });

  // プレイヤーの初期位置を設定（固定値を使用）
  const playerWidth = 48;  // CSSで設定した値
  const playerHeight = 48; // CSSで設定した値
  const areaWidth = areaEl.clientWidth || window.innerWidth;
  const areaHeight = areaEl.clientHeight || window.innerHeight;
  
  gameState.player.x = (areaWidth / 2) - (playerWidth / 2);
  gameState.player.y = (areaHeight / 2) - (playerHeight / 2);
  
  playerEl.style.left = gameState.player.x + "px";
  playerEl.style.top = gameState.player.y + "px";

  console.log(`プレイヤー初期位置: x=${gameState.player.x}, y=${gameState.player.y}`);
  console.log(`ゲームエリアサイズ: ${areaWidth} x ${areaHeight}`);

  bgmField = document.getElementById("bgm-field");

  // キーボードイベント
  document.addEventListener("keydown", e => { 
    keys[e.key] = true; 
    startBGM(); 
    
    // 特殊能力の使用
    if (e.key === ' ' && gameState.player.abilities.dash) {
      useDash();
    }
    if (e.key === 'f' && gameState.player.abilities.freeze) {
      useFreeze();
    }
    if (e.key === 'b' && gameState.player.abilities.bomb) {
      useBomb();
    }
  });
  document.addEventListener("keyup", e => { 
    delete keys[e.key]; 
  });

  // タッチ操作
  [["btn-up","up"],["btn-down","down"],["btn-left","left"],["btn-right","right"]].forEach(([id,dir]) => {
    const btn = document.getElementById(id);
    if (btn) {
      ["mousedown","touchstart"].forEach(ev => 
        btn.addEventListener(ev, e => { 
          e.preventDefault(); 
          vKeys[dir] = true; 
          startBGM(); 
        })
      );
      ["mouseup","mouseleave","touchend","touchcancel"].forEach(ev => 
        btn.addEventListener(ev, e => { 
          e.preventDefault(); 
          vKeys[dir] = false; 
        })
      );
    }
  });

  // リスタートボタン
  document.getElementById("restart-button").addEventListener("click", () => {
    location.reload();
  });

  // 特殊能力ボタンのイベント
  document.getElementById("dash-btn").addEventListener("click", () => {
    if (gameState.player.powerUps.speed > 0) {
      useDash();
    }
  });
  
  document.getElementById("freeze-btn").addEventListener("click", () => {
    if (gameState.player.abilities.freeze) {
      useFreeze();
    }
  });
  
  document.getElementById("bomb-btn").addEventListener("click", () => {
    if (gameState.player.abilities.bomb) {
      useBomb();
    }
  });

  // クイズデータ読み込み
  await loadQuizData();
  
  // 初期化完了
  updateStatusUI();
  spawnEnemies();
  gameState.gameStarted = true;
  console.log("ゲーム初期化完了");
  
  requestAnimationFrame(gameLoop);
});

// 特殊能力の使用
function useDash() {
  if (gameState.player.powerUps.speed > 0) {
    const playerEl = document.getElementById("player");
    playerEl.style.transform = "scale(1.2)";
    setTimeout(() => {
      playerEl.style.transform = "scale(1)";
    }, 200);
  }
}

function useFreeze() {
  if (gameState.player.abilities.freeze) {
    gameState.enemies.forEach(enemy => {
      enemy.frozen = true;
      enemy.el.style.filter = "hue-rotate(180deg)";
    });
    setTimeout(() => {
      gameState.enemies.forEach(enemy => {
        enemy.frozen = false;
        enemy.el.style.filter = "none";
      });
    }, 3000);
  }
}

function useBomb() {
  if (gameState.player.abilities.bomb) {
    gameState.enemies.forEach(enemy => {
      if (enemy.el && enemy.el.parentNode) {
        enemy.el.remove();
      }
    });
    gameState.enemies = [];
    gameState.player.score += 500;
    spawnEnemies();
  }
}

// アイテム生成
function spawnItems() {
  if (Math.random() < 0.001) { // 0.1%の確率に変更（さらに大幅に減少）
    const area = document.getElementById("game-area");
    
    // 重み付けによるアイテム選択
    const totalWeight = itemTypes.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedItem = itemTypes[0];
    
    for (const item of itemTypes) {
      random -= item.weight;
      if (random <= 0) {
        selectedItem = item;
        break;
      }
    }
    
    const el = document.createElement("div");
    el.className = "item";
    el.textContent = selectedItem.icon;
    el.style.left = Math.random() * (area.clientWidth - 40) + "px";
    el.style.top = Math.random() * (area.clientHeight - 40) + "px";
    area.appendChild(el);
    
    const item = {
      el, type: selectedItem.type, effect: selectedItem.effect, duration: selectedItem.duration
    };
    gameState.items.push(item);
  }
}

// アイテム効果の適用
function applyItemEffect(item) {
  switch(item.type) {
    case 'hp':
      gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + 1);
      break;
    case 'speed':
      gameState.player.powerUps.speed = Date.now() + item.duration;
      break;
    case 'shield':
      gameState.player.powerUps.shield = Date.now() + item.duration;
      break;
    case 'freeze':
      gameState.player.abilities.freeze = true;
      break;
    case 'bomb':
      gameState.player.abilities.bomb = true;
      break;
  }
  
  // アイテム効果の表示
  showItemEffect(item.effect);
}

// アイテム効果の表示
function showItemEffect(effect) {
  const effectEl = document.createElement("div");
  effectEl.className = "item-effect";
  effectEl.textContent = effect;
  document.body.appendChild(effectEl);
  
  setTimeout(() => {
    effectEl.remove();
  }, 2000);
}

// アイテムとの衝突判定
function checkItemCollision() {
  const playerSize = 48;
  const itemSize = 40;
  const playerCenterX = gameState.player.x + playerSize / 2;
  const playerCenterY = gameState.player.y + playerSize / 2;
  
  gameState.items.forEach((item, index) => {
    if (!item.el || !item.el.parentNode) return;
    
    const itemRect = item.el.getBoundingClientRect();
    const areaRect = document.getElementById("game-area").getBoundingClientRect();
    const itemX = itemRect.left - areaRect.left;
    const itemY = itemRect.top - areaRect.top;
    
    const distance = Math.hypot(playerCenterX - (itemX + itemSize/2), playerCenterY - (itemY + itemSize/2));
    
    if (distance < (playerSize + itemSize) / 2) {
      applyItemEffect(item);
      item.el.remove();
      gameState.items.splice(index, 1);
    }
  });
}

// パワーアップの時間管理
function updatePowerUps() {
  const now = Date.now();
  
  if (gameState.player.powerUps.speed > 0 && now > gameState.player.powerUps.speed) {
    gameState.player.powerUps.speed = 0;
  }
  if (gameState.player.powerUps.shield > 0 && now > gameState.player.powerUps.shield) {
    gameState.player.powerUps.shield = 0;
  }
}

function startBGM() {
  if (bgmField && bgmField.paused) {
    bgmField.volume = 0.3;
    bgmField.play().catch(error => {
      console.warn("BGMの自動再生がブロックされました:", error);
    });
  }
}

function updateStatusUI() {
  const hp = gameState.player.hp;
  document.getElementById("hp-hearts").innerHTML = "♥".repeat(Math.max(0, hp));
  document.getElementById("exp-fill").style.width = `${(gameState.player.exp % 100)}%`;
  document.getElementById("exp-text").textContent = `${gameState.player.exp % 100}/100`;
  document.getElementById("level-display").textContent = `Lv.${gameState.player.level}`;
  
  // スコアとコンボの表示を追加
  const statusBar = document.getElementById("status-bar");
  if (!document.getElementById("score-display")) {
    const scoreEl = document.createElement("div");
    scoreEl.id = "score-display";
    scoreEl.innerHTML = `スコア: <span id="score-value">0</span>`;
    statusBar.appendChild(scoreEl);
  }
  if (!document.getElementById("combo-display")) {
    const comboEl = document.createElement("div");
    comboEl.id = "combo-display";
    comboEl.innerHTML = `コンボ: <span id="combo-value">0</span>`;
    statusBar.appendChild(comboEl);
  }
  
  document.getElementById("score-value").textContent = gameState.player.score;
  document.getElementById("combo-value").textContent = gameState.player.combo;
  
  // パワーアップ状態の表示
  updatePowerUpDisplay();
}

// パワーアップ状態の表示
function updatePowerUpDisplay() {
  const playerEl = document.getElementById("player");
  
  // シールド効果
  if (gameState.player.powerUps.shield > 0) {
    playerEl.style.boxShadow = "0 0 20px rgba(0, 255, 255, 0.8)";
  } else {
    playerEl.style.boxShadow = "none";
  }
  
  // スピードアップ効果
  if (gameState.player.powerUps.speed > 0) {
    playerEl.style.filter = "hue-rotate(60deg)";
  } else {
    playerEl.style.filter = "none";
  }
  
  // 特殊能力ボタンの状態更新
  const dashBtn = document.getElementById("dash-btn");
  const freezeBtn = document.getElementById("freeze-btn");
  const bombBtn = document.getElementById("bomb-btn");
  
  if (gameState.player.powerUps.speed > 0) {
    dashBtn.classList.add("active");
  } else {
    dashBtn.classList.remove("active");
  }
  
  if (gameState.player.abilities.freeze) {
    freezeBtn.classList.add("active");
  } else {
    freezeBtn.classList.remove("active");
  }
  
  if (gameState.player.abilities.bomb) {
    bombBtn.classList.add("active");
  } else {
    bombBtn.classList.remove("active");
  }
}

async function loadQuizData() {
  try {
    console.log("クイズデータ読み込み開始");
    const res = await fetch("./quizData.json");
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    gameState.quizData = await res.json();

    if (Object.keys(gameState.quizData).length === 0) {
      throw new Error("quizData.jsonが空です");
    }
    console.log("クイズデータ読み込み成功。ジャンル数:", Object.keys(gameState.quizData).length);

  } catch (error) {
    console.error("クイズデータ読み込みエラー:", error);
    // エラー時はデフォルトデータを使用
    gameState.quizData = {
      "テスト": [
        { "q": "1+1は？", "a": ["1", "2", "3", "4"], "c": 1 },
        { "q": "日本の首都は？", "a": ["大阪", "東京", "京都", "福岡"], "c": 1 }
      ]
    };
    console.log("デフォルトクイズデータを使用します");
  }
}

function moveHero(dx, dy) {
  if (gameState.isPaused || !gameState.gameStarted) return;
  
  const area = document.getElementById("game-area");
  const playerEl = document.getElementById("player");
  const playerWidth = 48;
  const playerHeight = 48;
  
  // スピードアップ効果の適用
  let speed = gameState.player.speed;
  if (gameState.player.powerUps.speed > 0) {
    speed *= 1.5;
  }
  
  const newX = gameState.player.x + dx * speed;
  const newY = gameState.player.y + dy * speed;
  
  gameState.player.x = Math.max(0, Math.min(area.clientWidth - playerWidth, newX));
  gameState.player.y = Math.max(0, Math.min(area.clientHeight - playerHeight, newY));
  
  playerEl.style.left = gameState.player.x + "px";
  playerEl.style.top = gameState.player.y + "px";
}

function spawnEnemies() {
  const genres = Object.keys(gameState.quizData);
  const area = document.getElementById("game-area");
  
  // 既存の敵を削除
  gameState.enemies.forEach(e => {
    if (e.el && e.el.parentNode) {
      e.el.remove();
    }
  });
  gameState.enemies = [];

  if (genres.length === 0) {
    console.error("クイズデータにジャンルがありません");
    return;
  }

  const playerSize = 48;
  const enemySize = 80;
  const safeZone = 150; // 安全地帯を少し小さく
  const numberOfEnemies = 8 + Math.floor(gameState.difficulty * 2); // 難易度に応じて敵の数を増加

  console.log("敵生成開始:", numberOfEnemies + "体");

  for (let i = 0; i < numberOfEnemies; i++) {
    const el = document.createElement("div");
    el.className = "enemy";
    el.style.backgroundImage = `url('./images/enemy${(i % 10) + 1}.png')`;

    let x, y;
    let validPosition = false;
    let attempts = 0;
    const maxAttempts = 50;

    while (!validPosition && attempts < maxAttempts) {
      x = Math.random() * (area.clientWidth - enemySize);
      y = Math.random() * (area.clientHeight - enemySize);

      const playerCenterX = gameState.player.x + playerSize / 2;
      const playerCenterY = gameState.player.y + playerSize / 2;
      const enemyCenterX = x + enemySize / 2;
      const enemyCenterY = y + enemySize / 2;

      const distance = Math.hypot(playerCenterX - enemyCenterX, playerCenterY - enemyCenterY);

      if (distance > safeZone) {
        validPosition = true;
      }
      attempts++;
    }

    // 有効な位置が見つからない場合は端に配置
    if (!validPosition) {
      x = Math.random() < 0.5 ? 0 : area.clientWidth - enemySize;
      y = Math.random() * (area.clientHeight - enemySize);
    }

    el.style.left = x + "px";
    el.style.top = y + "px";
    area.appendChild(el);

    const assignedGenre = genres[i % genres.length];
    const enemyType = (i % 10) + 1; // 敵の種類（1-10）
    
    // 敵の種類に応じた動きパターンを設定
    const movementPattern = getMovementPattern(enemyType);
    
    const enemy = {
      el, x, y,
      speed: (0.5 + Math.random() * 1.5) * (1 + gameState.difficulty * 0.2), // 難易度に応じて速度増加
      angle: Math.random() * Math.PI * 2,
      hasHit: false,
      genre: assignedGenre,
      lastQuizTime: 0,  // 最後にクイズを出した時間を記録
      frozen: false,
      type: enemyType,
      pattern: movementPattern,
      patternData: {
        time: 0,
        targetX: x,
        targetY: y,
        zigzagPhase: 0,
        circleRadius: 50 + Math.random() * 30,
        circleCenterX: x,
        circleCenterY: y,
        chargeCooldown: 0,
        lastDirectionChange: 0
      }
    };
    
    gameState.enemies.push(enemy);
    console.log(`敵${i + 1}生成: ジャンル=${assignedGenre}, タイプ=${enemyType}, パターン=${movementPattern}, 位置=(${Math.round(x)},${Math.round(y)})`);
  }
}

// 敵の動きパターンを定義
function getMovementPattern(enemyType) {
  const patterns = {
    1: 'random',      // ランダム移動
    2: 'chase',       // プレイヤー追跡
    3: 'flee',        // プレイヤーから逃走
    4: 'patrol',      // 巡回移動
    5: 'zigzag',      // ジグザグ移動
    6: 'circle',      // 円運動
    7: 'charge',      // 突進攻撃
    8: 'ambush',      // 待ち伏せ
    9: 'bounce',      // バウンド移動
    10: 'teleport'    // テレポート
  };
  return patterns[enemyType] || 'random';
}

function moveEnemies() {
  if (gameState.isPaused || !gameState.gameStarted) return;
  
  const area = document.getElementById("game-area");
  const enemySize = 80;
  
  gameState.enemies.forEach(enemy => {
    if (!enemy.el || !enemy.el.parentNode || enemy.frozen) return;
    
    // パターンデータの時間を更新
    enemy.patternData.time += 16; // 約60FPS
    
    // 敵の種類に応じた移動処理
    switch(enemy.pattern) {
      case 'random':
        moveRandom(enemy, area, enemySize);
        break;
      case 'chase':
        moveChase(enemy, area, enemySize);
        break;
      case 'flee':
        moveFlee(enemy, area, enemySize);
        break;
      case 'patrol':
        movePatrol(enemy, area, enemySize);
        break;
      case 'zigzag':
        moveZigzag(enemy, area, enemySize);
        break;
      case 'circle':
        moveCircle(enemy, area, enemySize);
        break;
      case 'charge':
        moveCharge(enemy, area, enemySize);
        break;
      case 'ambush':
        moveAmbush(enemy, area, enemySize);
        break;
      case 'bounce':
        moveBounce(enemy, area, enemySize);
        break;
      case 'teleport':
        moveTeleport(enemy, area, enemySize);
        break;
      default:
        moveRandom(enemy, area, enemySize);
    }
    
    // DOM要素の位置を更新
    enemy.el.style.left = enemy.x + "px";
    enemy.el.style.top = enemy.y + "px";
  });
}

// 1. ランダム移動
function moveRandom(enemy, area, enemySize) {
  // 定期的に方向を変更
  if (enemy.patternData.time - enemy.patternData.lastDirectionChange > 2000) {
    enemy.angle = Math.random() * Math.PI * 2;
    enemy.patternData.lastDirectionChange = enemy.patternData.time;
  }
  
  enemy.x += Math.cos(enemy.angle) * enemy.speed;
  enemy.y += Math.sin(enemy.angle) * enemy.speed;
  
  // 境界チェックと反射
  if (enemy.x <= 0 || enemy.x >= area.clientWidth - enemySize) {
    enemy.angle = Math.PI - enemy.angle;
    enemy.x = Math.max(0, Math.min(area.clientWidth - enemySize, enemy.x));
  }
  if (enemy.y <= 0 || enemy.y >= area.clientHeight - enemySize) {
    enemy.angle = -enemy.angle;
    enemy.y = Math.max(0, Math.min(area.clientHeight - enemySize, enemy.y));
  }
}

// 2. プレイヤー追跡
function moveChase(enemy, area, enemySize) {
  const playerCenterX = gameState.player.x + 24;
  const playerCenterY = gameState.player.y + 24;
  const enemyCenterX = enemy.x + enemySize / 2;
  const enemyCenterY = enemy.y + enemySize / 2;
  
  const dx = playerCenterX - enemyCenterX;
  const dy = playerCenterY - enemyCenterY;
  const distance = Math.hypot(dx, dy);
  
  if (distance > 0) {
    enemy.angle = Math.atan2(dy, dx);
  }
  
  enemy.x += Math.cos(enemy.angle) * enemy.speed;
  enemy.y += Math.sin(enemy.angle) * enemy.speed;
  
  // 境界チェック
  enemy.x = Math.max(0, Math.min(area.clientWidth - enemySize, enemy.x));
  enemy.y = Math.max(0, Math.min(area.clientHeight - enemySize, enemy.y));
}

// 3. プレイヤーから逃走
function moveFlee(enemy, area, enemySize) {
  const playerCenterX = gameState.player.x + 24;
  const playerCenterY = gameState.player.y + 24;
  const enemyCenterX = enemy.x + enemySize / 2;
  const enemyCenterY = enemy.y + enemySize / 2;
  
  const dx = enemyCenterX - playerCenterX;
  const dy = enemyCenterY - playerCenterY;
  const distance = Math.hypot(dx, dy);
  
  if (distance > 0) {
    enemy.angle = Math.atan2(dy, dx);
  }
  
  enemy.x += Math.cos(enemy.angle) * enemy.speed;
  enemy.y += Math.sin(enemy.angle) * enemy.speed;
  
  // 境界チェック
  enemy.x = Math.max(0, Math.min(area.clientWidth - enemySize, enemy.x));
  enemy.y = Math.max(0, Math.min(area.clientHeight - enemySize, enemy.y));
}

// 4. 巡回移動
function movePatrol(enemy, area, enemySize) {
  const patrolRadius = 100;
  const centerX = enemy.patternData.circleCenterX;
  const centerY = enemy.patternData.circleCenterY;
  
  // 目標地点に到達したら新しい目標を設定
  const currentX = enemy.x + enemySize / 2;
  const currentY = enemy.y + enemySize / 2;
  const distanceToTarget = Math.hypot(currentX - enemy.patternData.targetX, currentY - enemy.patternData.targetY);
  
  if (distanceToTarget < 20) {
    const angle = Math.random() * Math.PI * 2;
    enemy.patternData.targetX = centerX + Math.cos(angle) * patrolRadius;
    enemy.patternData.targetY = centerY + Math.sin(angle) * patrolRadius;
  }
  
  // 目標に向かって移動
  const dx = enemy.patternData.targetX - currentX;
  const dy = enemy.patternData.targetY - currentY;
  if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
    enemy.angle = Math.atan2(dy, dx);
  }
  
  enemy.x += Math.cos(enemy.angle) * enemy.speed;
  enemy.y += Math.sin(enemy.angle) * enemy.speed;
  
  // 境界チェック
  enemy.x = Math.max(0, Math.min(area.clientWidth - enemySize, enemy.x));
  enemy.y = Math.max(0, Math.min(area.clientHeight - enemySize, enemy.y));
}

// 5. ジグザグ移動
function moveZigzag(enemy, area, enemySize) {
  const zigzagPeriod = 3000; // 3秒で1周期
  const zigzagAmplitude = 50;
  
  enemy.patternData.zigzagPhase += 16;
  const phase = (enemy.patternData.zigzagPhase % zigzagPeriod) / zigzagPeriod;
  
  // 基本方向（右方向）
  const baseAngle = 0;
  // ジグザグの角度変化
  const zigzagAngle = Math.sin(phase * Math.PI * 4) * 0.5;
  
  enemy.angle = baseAngle + zigzagAngle;
  
  enemy.x += Math.cos(enemy.angle) * enemy.speed;
  enemy.y += Math.sin(enemy.angle) * enemy.speed;
  
  // 画面端で反転
  if (enemy.x <= 0 || enemy.x >= area.clientWidth - enemySize) {
    enemy.angle = Math.PI - enemy.angle;
    enemy.x = Math.max(0, Math.min(area.clientWidth - enemySize, enemy.x));
  }
  if (enemy.y <= 0 || enemy.y >= area.clientHeight - enemySize) {
    enemy.angle = -enemy.angle;
    enemy.y = Math.max(0, Math.min(area.clientHeight - enemySize, enemy.y));
  }
}

// 6. 円運動
function moveCircle(enemy, area, enemySize) {
  const circleRadius = enemy.patternData.circleRadius;
  const centerX = enemy.patternData.circleCenterX;
  const centerY = enemy.patternData.circleCenterY;
  
  // 円運動の角度を更新
  const circleSpeed = 0.02;
  enemy.angle += circleSpeed;
  
  // 円運動の位置計算
  const newX = centerX + Math.cos(enemy.angle) * circleRadius - enemySize / 2;
  const newY = centerY + Math.sin(enemy.angle) * circleRadius - enemySize / 2;
  
  // 境界チェック
  enemy.x = Math.max(0, Math.min(area.clientWidth - enemySize, newX));
  enemy.y = Math.max(0, Math.min(area.clientHeight - enemySize, newY));
}

// 7. 突進攻撃
function moveCharge(enemy, area, enemySize) {
  const chargeCooldown = 3000; // 3秒間隔
  const chargeDuration = 1000; // 1秒間突進
  
  if (enemy.patternData.chargeCooldown <= 0) {
    // 突進開始
    const playerCenterX = gameState.player.x + 24;
    const playerCenterY = gameState.player.y + 24;
    const enemyCenterX = enemy.x + enemySize / 2;
    const enemyCenterY = enemy.y + enemySize / 2;
    
    const dx = playerCenterX - enemyCenterX;
    const dy = playerCenterY - enemyCenterY;
    if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
      enemy.angle = Math.atan2(dy, dx);
    }
    
    enemy.patternData.chargeCooldown = chargeCooldown;
    enemy.speed *= 2; // 突進中は速度2倍
  }
  
  enemy.x += Math.cos(enemy.angle) * enemy.speed;
  enemy.y += Math.sin(enemy.angle) * enemy.speed;
  
  // 境界チェック
  enemy.x = Math.max(0, Math.min(area.clientWidth - enemySize, enemy.x));
  enemy.y = Math.max(0, Math.min(area.clientHeight - enemySize, enemy.y));
  
  // クールダウン更新
  enemy.patternData.chargeCooldown -= 16;
  
  // 突進終了後、速度を元に戻す
  if (enemy.patternData.chargeCooldown < chargeCooldown - chargeDuration) {
    enemy.speed = (0.5 + Math.random() * 1.5) * (1 + gameState.difficulty * 0.2);
  }
}

// 8. 待ち伏せ
function moveAmbush(enemy, area, enemySize) {
  const ambushDuration = 2000; // 2秒間待機
  const moveDuration = 1000;   // 1秒間移動
  
  const cycle = (enemy.patternData.time % (ambushDuration + moveDuration));
  
  if (cycle < ambushDuration) {
    // 待機中 - 動かない
    return;
  } else {
    // 移動中 - ランダム移動
    if (enemy.patternData.time - enemy.patternData.lastDirectionChange > 500) {
      enemy.angle = Math.random() * Math.PI * 2;
      enemy.patternData.lastDirectionChange = enemy.patternData.time;
    }
    
    enemy.x += Math.cos(enemy.angle) * enemy.speed;
    enemy.y += Math.sin(enemy.angle) * enemy.speed;
    
    // 境界チェック
    enemy.x = Math.max(0, Math.min(area.clientWidth - enemySize, enemy.x));
    enemy.y = Math.max(0, Math.min(area.clientHeight - enemySize, enemy.y));
  }
}

// 9. バウンド移動
function moveBounce(enemy, area, enemySize) {
  // 重力効果をシミュレート
  const gravity = 0.1;
  const bounce = 0.7;
  
  // 垂直方向の速度を追加
  if (!enemy.verticalSpeed) enemy.verticalSpeed = 0;
  if (!enemy.horizontalSpeed) enemy.horizontalSpeed = enemy.speed;
  
  enemy.verticalSpeed += gravity;
  enemy.y += enemy.verticalSpeed;
  enemy.x += enemy.horizontalSpeed;
  
  // 地面でのバウンド
  if (enemy.y >= area.clientHeight - enemySize) {
    enemy.y = area.clientHeight - enemySize;
    enemy.verticalSpeed = -enemy.verticalSpeed * bounce;
  }
  
  // 天井でのバウンド
  if (enemy.y <= 0) {
    enemy.y = 0;
    enemy.verticalSpeed = -enemy.verticalSpeed * bounce;
  }
  
  // 左右の壁でのバウンド
  if (enemy.x <= 0 || enemy.x >= area.clientWidth - enemySize) {
    enemy.horizontalSpeed = -enemy.horizontalSpeed;
    enemy.x = Math.max(0, Math.min(area.clientWidth - enemySize, enemy.x));
  }
}

// 10. テレポート
function moveTeleport(enemy, area, enemySize) {
  const teleportInterval = 4000; // 4秒間隔
  
  if (enemy.patternData.time % teleportInterval < 16) {
    // テレポート実行
    enemy.x = Math.random() * (area.clientWidth - enemySize);
    enemy.y = Math.random() * (area.clientHeight - enemySize);
    
    // テレポートエフェクト（透明度変化）
    enemy.el.style.opacity = '0.5';
    setTimeout(() => {
      if (enemy.el) enemy.el.style.opacity = '1';
    }, 200);
  } else {
    // 通常のランダム移動
    if (enemy.patternData.time - enemy.patternData.lastDirectionChange > 1000) {
      enemy.angle = Math.random() * Math.PI * 2;
      enemy.patternData.lastDirectionChange = enemy.patternData.time;
    }
    
    enemy.x += Math.cos(enemy.angle) * enemy.speed * 0.5; // テレポート敵は移動速度が遅い
    enemy.y += Math.sin(enemy.angle) * enemy.speed * 0.5;
    
    // 境界チェック
    enemy.x = Math.max(0, Math.min(area.clientWidth - enemySize, enemy.x));
    enemy.y = Math.max(0, Math.min(area.clientHeight - enemySize, enemy.y));
  }
}

function checkCollision() {
  if (gameState.isPaused || !gameState.gameStarted) return;
  
  const playerSize = 48;
  const enemySize = 80;
  const collisionDistance = 40; // 衝突判定距離を大きく
  
  const playerCenterX = gameState.player.x + playerSize / 2;
  const playerCenterY = gameState.player.y + playerSize / 2;
  const currentTime = Date.now();

  gameState.enemies.forEach(enemy => {
    if (!enemy.el || !enemy.el.parentNode) return;

    const enemyCenterX = enemy.x + enemySize / 2;
    const enemyCenterY = enemy.y + enemySize / 2;
    const distance = Math.hypot(playerCenterX - enemyCenterX, playerCenterY - enemyCenterY);

    // 衝突判定を行い、前回のクイズから1秒以上経過していればクイズを表示
    if (distance < collisionDistance && (currentTime - enemy.lastQuizTime) > 1000) {
      console.log("衝突検出！ジャンル:", enemy.genre, "距離:", Math.round(distance));
      enemy.lastQuizTime = currentTime;  // クイズを出した時間を記録
      showQuiz(enemy);
    }
  });
}

function showQuiz(enemy) {
  gameState.isPaused = true;
  const genre = enemy.genre;
  const quizList = gameState.quizData[genre];

  console.log("クイズ表示:", genre);

  if (!quizList || quizList.length === 0) {
    console.error(`ジャンル '${genre}' のクイズが見つかりません`);
    
    // エラー時はHP減少（シールドがあれば無効化）
    if (gameState.player.powerUps.shield <= 0) {
      gameState.player.hp--;
    }
    if (document.getElementById("se-wrong")) {
      document.getElementById("se-wrong").play();
    }
    updateStatusUI();
    
    setTimeout(() => {
      gameState.isPaused = false;
      if (gameState.player.hp <= 0) {
        showGameOver();
      }
    }, 1000);
    return;
  }

  const quiz = quizList[Math.floor(Math.random() * quizList.length)];

  document.getElementById("quiz-genre").textContent = `【${genre}】の問題`;
  document.getElementById("quiz-question").textContent = quiz.q;
  
  const optionsEl = document.getElementById("quiz-options");
  optionsEl.innerHTML = "";
  
  quiz.a.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.addEventListener("click", () => {
      handleAnswer(i === quiz.c, enemy);
    });
    optionsEl.appendChild(btn);
  });

  const quizEl = document.getElementById("quiz-container");
  quizEl.classList.remove("hidden");
  quizEl.style.display = "flex";
}

function handleAnswer(correct, enemy) {
  const quizEl = document.getElementById("quiz-container");
  quizEl.classList.add("hidden");
  quizEl.style.display = "none";

  if (correct) {
    console.log("正解！");
    if (document.getElementById("se-correct")) {
      document.getElementById("se-correct").play();
    }
    
    // コンボシステム
    gameState.player.combo++;
    gameState.player.maxCombo = Math.max(gameState.player.maxCombo, gameState.player.combo);
    
    // スコア計算（コンボボーナス付き）
    const baseScore = 100;
    const comboBonus = Math.floor(gameState.player.combo * 10);
    const totalScore = baseScore + comboBonus;
    gameState.player.score += totalScore;
    
    // 敵を削除
    if (enemy.el && enemy.el.parentNode) {
      enemy.el.remove();
    }
    gameState.enemies = gameState.enemies.filter(e => e !== enemy);
    
    // 経験値増加（コンボボーナス付き）
    const expGain = 20 + Math.floor(gameState.player.combo * 2);
    gameState.player.exp += expGain;
    if (gameState.player.exp >= 100) {
      gameState.player.level++;
      gameState.player.exp = 0;
      gameState.player.maxHp++; // レベルアップでHP上限増加
      gameState.player.hp = gameState.player.maxHp; // HP全回復
      if (document.getElementById("se-levelup")) {
        document.getElementById("se-levelup").play();
      }
      console.log("レベルアップ！ Lv." + gameState.player.level);
    }

    // すべての敵を倒したら、再度敵を出現させる
    if (gameState.enemies.length === 0) {
      console.log("すべての敵を倒しました！新しい敵を出現させます。");
      gameState.difficulty++; // 難易度上昇
      spawnEnemies();
    }

  } else {
    console.log("不正解...");
    if (document.getElementById("se-wrong")) {
      document.getElementById("se-wrong").play();
    }
    
    // シールドがあればダメージを無効化
    if (gameState.player.powerUps.shield <= 0) {
      gameState.player.hp--;
    }
    
    // コンボリセット
    gameState.player.combo = 0;
  }

  updateStatusUI();
  gameState.isPaused = false;
  
  if (gameState.player.hp <= 0) {
    showGameOver();
  }
}

function showGameOver() {
  console.log("ゲームオーバー");
  gameState.isPaused = true;
  
  if (bgmField && !bgmField.paused) {
    bgmField.pause();
  }
  
  const gameoverContainer = document.getElementById("gameover-container");
  const gameoverText = document.getElementById("gameover-text");
  
  // 最終スコアを表示
  gameoverText.innerHTML = `ゲームオーバー<br><br>最終スコア: ${gameState.player.score}<br>最大コンボ: ${gameState.player.maxCombo}<br>到達レベル: ${gameState.player.level}`;
  
  gameoverContainer.classList.remove("hidden");
  gameoverContainer.style.display = "flex";
}

function gameLoop() {
  if (!gameState.gameStarted) {
    requestAnimationFrame(gameLoop);
    return;
  }

  // ゲーム時間の更新
  gameState.gameTime += 16; // 約60FPS

  // キー入力処理
  const dx = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0) + 
            (vKeys.right ? 1 : 0) - (vKeys.left ? 1 : 0);
  const dy = (keys.ArrowDown ? 1 : 0) - (keys.ArrowUp ? 1 : 0) + 
            (vKeys.down ? 1 : 0) - (vKeys.up ? 1 : 0);

  if (dx !== 0 || dy !== 0) {
    moveHero(dx, dy);
  }

  moveEnemies();
  checkCollision();
  checkItemCollision();
  updatePowerUps();
  spawnItems();
  requestAnimationFrame(gameLoop);
}