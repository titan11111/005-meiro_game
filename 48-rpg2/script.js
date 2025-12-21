// ============================================
// RPGゲーム: 失われた記憶の冒険
// ============================================

// ゲーム定数
const TILE_SIZE = 64;
const MAP_WIDTH = 15;
const MAP_HEIGHT = 10;

// タイルタイプ
const TILE_TYPES = {
  GRASS: 0,
  FOREST: 1,
  MOUNTAIN: 2,
  DESERT: 3,
  WATER: 4,
  TOWN: 5,
  CAVE: 6,
  CASTLE: 7
};

// イベントタイプ
const EVENT_TYPES = {
  NONE: 0,
  ENEMY: 1,
  SHOP: 2,
  STORY: 3,
  BOSS: 4
};

// 武器データ
const WEAPONS = {
  bronze: { name: '銅の剣', attack: 10, price: 0, image: 'images/bronze_sword_32.png' },
  iron: { name: '鉄の剣', attack: 20, price: 100, image: 'images/iron_sword_32.png' },
  steel: { name: '鋼の剣', attack: 35, price: 300, image: 'images/steel_sword_32.png' },
  legendary: { name: '伝説の剣', attack: 60, price: 1000, image: 'images/legendary_sword_32.png' }
};

// 敵データ
const ENEMIES = {
  slime: { name: 'スライム', hp: 30, maxHp: 30, attack: 5, defense: 2, exp: 10, gold: 15, image: 'images/slime_32x32_transparent.png' },
  goblin: { name: 'ゴブリン', hp: 50, maxHp: 50, attack: 10, defense: 5, exp: 25, gold: 30, image: 'images/goblin_32x32_transparent.png' },
  orc: { name: 'オーク', hp: 80, maxHp: 80, attack: 15, defense: 8, exp: 50, gold: 60, image: 'images/orc_32x32_transparent.png' },
  ogre: { name: 'オーガ', hp: 120, maxHp: 120, attack: 25, defense: 12, exp: 100, gold: 120, image: 'images/ogre_32x32_transparent.png' },
  demonKing: { name: '魔王', hp: 300, maxHp: 300, attack: 40, defense: 20, exp: 500, gold: 500, image: 'images/demon_king_64x64_transparent.png' }
};

// ゲーム状態
let gameState = {
  currentScreen: 'title',
  player: {
    x: 1,
    y: 1,
    level: 1,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    attack: 10,
    defense: 5,
    exp: 0,
    expToNext: 100,
    gold: 50,
    weapon: 'bronze',
    storyProgress: 0,
    exploredTiles: new Set() // 探索済みタイルを記録
  },
  map: [],
  currentEnemy: null,
  battleState: 'waiting',
  images: {},
  bgm: {},
  opening: {
    currentSlide: 0,
    totalSlides: 3,
    autoPlayTimer: null,
    progressTimer: null
  }
};

// ストーリーデータ
const STORY = [
  {
    text: "目を覚ますと、あなたは見知らぬ草原にいました。\n\n周りを見回すと、記憶が全くありません。\n\n「私は誰？ここはどこ？」\n\n唯一覚えているのは、何か重要なものを探しているということだけです。"
  },
  {
    text: "近くの村人に話を聞くと、\n\n「最近、この世界で多くの人が記憶を失っている」\n\nという噂を聞きました。\n\nどうやら、魔王が人々の記憶を奪っているようです。"
  },
  {
    text: "村の武器屋で情報を得ました。\n\n「魔王を倒せば、失われた記憶が戻るかもしれない」\n\nしかし、魔王は強力です。\n\nまずは武器を整えて、モンスターを倒して経験を積む必要があります。"
  },
  {
    text: "冒険を続けるうちに、少しずつ記憶が戻ってきます。\n\nあなたは勇者だったのです。\n\n魔王との戦いで記憶を奪われ、\n\nこの地に転移されてしまったのでした。"
  },
  {
    text: "魔王の城に到着しました。\n\n最後の戦いが始まります。\n\n記憶を取り戻し、\n\n世界に平和を取り戻す時が来ました！"
  }
];

// マップ生成（強化版）
// フィールドの作り方：
// 1. 15×10のグリッドマップを生成
// 2. より自然な地形配置（地形の連続性を考慮）
// 3. 中央付近（7, 5）に街を配置（ショップイベント）
// 4. 右下（13, 8）に洞窟を配置（ストーリーイベント）
// 5. 右上（13, 1）に魔王の城を配置（ボス戦イベント）
// 6. 地形に応じた敵の出現率を設定
// 7. 探索済みエリアを記録
function generateMap() {
  const map = [];
  const noise = []; // ノイズマップ（地形の自然な配置用）
  
  // ノイズ生成（簡易版）
  for (let y = 0; y < MAP_HEIGHT; y++) {
    noise[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      noise[y][x] = Math.random();
    }
  }
  
  for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      let tileType = TILE_TYPES.GRASS;
      let eventType = EVENT_TYPES.NONE;
      let explored = false;
      
      // マップの端は森や山（より自然な配置）
      if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
        const edgeNoise = noise[y][x];
        if (edgeNoise < 0.3) {
          tileType = TILE_TYPES.MOUNTAIN;
        } else if (edgeNoise < 0.6) {
          tileType = TILE_TYPES.FOREST;
        } else {
          tileType = TILE_TYPES.GRASS;
        }
      }
      // 中央付近に街
      else if (x === 7 && y === 5) {
        tileType = TILE_TYPES.TOWN;
        eventType = EVENT_TYPES.SHOP;
      }
      // 街の周辺は草原
      else if ((x >= 6 && x <= 8) && (y >= 4 && y <= 6) && !(x === 7 && y === 5)) {
        tileType = TILE_TYPES.GRASS;
      }
      // 右下に洞窟
      else if (x === 13 && y === 8) {
        tileType = TILE_TYPES.CAVE;
        eventType = EVENT_TYPES.STORY;
      }
      // 洞窟の周辺は山
      else if ((x >= 12 && x <= 14) && (y >= 7 && y <= 9) && !(x === 13 && y === 8)) {
        tileType = TILE_TYPES.MOUNTAIN;
      }
      // 右上に魔王の城
      else if (x === 13 && y === 1) {
        tileType = TILE_TYPES.CASTLE;
        eventType = EVENT_TYPES.BOSS;
      }
      // 城の周辺は山
      else if ((x >= 12 && x <= 14) && (y >= 0 && y <= 2) && !(x === 13 && y === 1)) {
        tileType = TILE_TYPES.MOUNTAIN;
      }
      // 地形の自然な配置（ノイズベース）
      else {
        const n = noise[y][x];
        const nearbyForest = countNearbyTiles(map, x, y, TILE_TYPES.FOREST);
        const nearbyMountain = countNearbyTiles(map, x, y, TILE_TYPES.MOUNTAIN);
        
        if (n < 0.2) {
          tileType = TILE_TYPES.DESERT;
        } else if (n < 0.3 && nearbyForest > 0) {
          tileType = TILE_TYPES.FOREST;
        } else if (n < 0.4 && nearbyMountain > 0) {
          tileType = TILE_TYPES.MOUNTAIN;
        } else if (n < 0.5) {
          tileType = TILE_TYPES.FOREST;
        } else {
          tileType = TILE_TYPES.GRASS;
        }
      }
      
      // 固定位置の敵は配置しない（ランダムエンカウントシステムに変更）
      // 敵の出現は移動時にランダムで発生するため、マップ生成時には配置しない
      
      map[y][x] = { 
        type: tileType, 
        event: eventType,
        explored: explored,
        x: x,
        y: y
      };
    }
  }
  
  // 初期位置を探索済みにする
  if (map[1] && map[1][1]) {
    map[1][1].explored = true;
  }
  
  return map;
}

// 周辺のタイルタイプをカウント
function countNearbyTiles(map, x, y, tileType) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const ny = y + dy;
      const nx = x + dx;
      if (ny >= 0 && ny < MAP_HEIGHT && nx >= 0 && nx < MAP_WIDTH) {
        if (map[ny] && map[ny][nx] && map[ny][nx].type === tileType) {
          count++;
        }
      }
    }
  }
  return count;
}

// 地形に応じた敵の出現率
function getEnemyChance(tileType) {
  switch (tileType) {
    case TILE_TYPES.FOREST:
      return 0.20; // 森は敵が多い
    case TILE_TYPES.MOUNTAIN:
      return 0.18;
    case TILE_TYPES.DESERT:
      return 0.15;
    case TILE_TYPES.CAVE:
      return 0.25; // 洞窟は危険
    case TILE_TYPES.CASTLE:
      return 0.30; // 城は非常に危険
    default:
      return 0.12; // 草原は比較的安全
  }
}

// 画像読み込み
async function loadImages() {
  const imagePaths = {
    grass: 'images/grass.png',
    forest: 'images/forest.png',
    mountain: 'images/mountain.png',
    desert: 'images/desert.png',
    water: 'images/water.png',
    town: 'images/town.png',
    cave: 'images/cave.png',
    castle: 'images/evil_castle.png',
    hero: 'images/hero.png',
    hero2: 'images/hero2.png'
  };
  
  for (const [key, path] of Object.entries(imagePaths)) {
    const img = new Image();
    img.src = path;
    gameState.images[key] = img;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => {
        console.warn(`Failed to load image: ${path}`);
        resolve(); // エラーでも続行
      };
    });
  }
}

// マップ描画
function drawMap() {
  const canvas = document.getElementById('game-map');
  const ctx = canvas.getContext('2d');
  
  // キャンバスサイズ設定（レスポンシブ対応）
  const container = canvas.parentElement;
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  
  // タイルサイズを画面に合わせて調整
  const scaleX = containerWidth / (MAP_WIDTH * TILE_SIZE);
  const scaleY = containerHeight / (MAP_HEIGHT * TILE_SIZE);
  const scale = Math.min(scaleX, scaleY, 1); // 拡大はしない
  const adjustedTileSize = Math.floor(TILE_SIZE * scale);
  
  canvas.width = MAP_WIDTH * adjustedTileSize;
  canvas.height = MAP_HEIGHT * adjustedTileSize;
  
  // スケールを保存して描画時に使用
  canvas.dataset.tileSize = adjustedTileSize;
  
  // タイル描画（強化版）
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const tile = gameState.map[y][x];
      const tileSize = parseInt(canvas.dataset.tileSize) || TILE_SIZE;
      const tileX = x * tileSize;
      const tileY = y * tileSize;
      
      // 探索済みかどうかで明るさを調整
      const isExplored = tile.explored || gameState.player.exploredTiles.has(`${x},${y}`);
      const brightness = isExplored ? 1.0 : 0.4; // 未探索は暗く
      
      let img = gameState.images.grass;
      
      switch (tile.type) {
        case TILE_TYPES.GRASS:
          img = gameState.images.grass;
          break;
        case TILE_TYPES.FOREST:
          img = gameState.images.forest;
          break;
        case TILE_TYPES.MOUNTAIN:
          img = gameState.images.mountain;
          break;
        case TILE_TYPES.DESERT:
          img = gameState.images.desert;
          break;
        case TILE_TYPES.WATER:
          img = gameState.images.water;
          break;
        case TILE_TYPES.TOWN:
          img = gameState.images.town;
          break;
        case TILE_TYPES.CAVE:
          img = gameState.images.cave;
          break;
        case TILE_TYPES.CASTLE:
          img = gameState.images.castle;
          break;
      }
      
      // タイル描画
      ctx.save();
      ctx.globalAlpha = brightness;
      
      if (img && img.complete) {
        ctx.drawImage(img, tileX, tileY, tileSize, tileSize);
      } else {
        // フォールバック: 色で描画
        const colors = {
          [TILE_TYPES.GRASS]: '#4a7c59',
          [TILE_TYPES.FOREST]: '#2d5016',
          [TILE_TYPES.MOUNTAIN]: '#8b7355',
          [TILE_TYPES.DESERT]: '#d4a574',
          [TILE_TYPES.WATER]: '#4a90e2',
          [TILE_TYPES.TOWN]: '#8b7355',
          [TILE_TYPES.CAVE]: '#4a4a4a',
          [TILE_TYPES.CASTLE]: '#8b0000'
        };
        ctx.fillStyle = colors[tile.type] || '#4a7c59';
        ctx.fillRect(tileX, tileY, tileSize, tileSize);
      }
      
      // イベントがある場所にマーカーを表示（敵イベントは表示しない）
      if (isExplored && tile.event !== EVENT_TYPES.NONE && tile.event !== EVENT_TYPES.ENEMY) {
        ctx.globalAlpha = 0.6;
        const markerColors = {
          [EVENT_TYPES.SHOP]: '#ffd93d',
          [EVENT_TYPES.STORY]: '#4a90e2',
          [EVENT_TYPES.BOSS]: '#8b0000'
        };
        ctx.fillStyle = markerColors[tile.event] || '#ffffff';
        ctx.beginPath();
        ctx.arc(tileX + tileSize / 2, tileY + tileSize / 2, tileSize / 6, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
      
      // タイルの境界線（オプション）
      if (isExplored) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(tileX, tileY, tileSize, tileSize);
      }
    }
  }
  
  // プレイヤー描画（フィールドマップではhero.pngを使用）
  const tileSize = parseInt(canvas.dataset.tileSize) || TILE_SIZE;
  const heroImg = gameState.images.hero; // フィールドではhero.png
  const playerX = gameState.player.x * tileSize + tileSize / 2;
  const playerY = gameState.player.y * tileSize + tileSize / 2;
  
  if (heroImg && heroImg.complete) {
    // 画像を使用（2倍サイズ）
    const heroSize = tileSize * 1.6; // 0.8から1.6に変更（2倍）
    ctx.drawImage(
      heroImg,
      playerX - heroSize / 2,
      playerY - heroSize / 2,
      heroSize,
      heroSize
    );
  } else {
    // フォールバック: 赤丸（2倍サイズ）
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(playerX, playerY, tileSize * 2 / 3, 0, Math.PI * 2); // 2倍サイズ
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(4, tileSize / 10); // 線も太く
    ctx.stroke();
  }
}

// プレイヤー移動
function movePlayer(dx, dy) {
  const newX = gameState.player.x + dx;
  const newY = gameState.player.y + dy;
  
  // マップ範囲チェック
  if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) {
    showMessage('ここから先には進めない');
    return;
  }
  
  // 移動可能チェック（水は通れない）
  const tile = gameState.map[newY][newX];
  if (tile.type === TILE_TYPES.WATER) {
    showMessage('水の中は通れない');
    return;
  }
  
  gameState.player.x = newX;
  gameState.player.y = newY;
  
  // 探索済みエリアを記録（現在位置と周辺）
  const tileKey = `${newX},${newY}`;
  gameState.player.exploredTiles.add(tileKey);
  tile.explored = true;
  
  // 周辺のタイルも探索済みにする（視界範囲）
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = newX + dx;
      const ny = newY + dy;
      if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT) {
        const nearbyKey = `${nx},${ny}`;
        gameState.player.exploredTiles.add(nearbyKey);
        if (gameState.map[ny] && gameState.map[ny][nx]) {
          gameState.map[ny][nx].explored = true;
        }
      }
    }
  }
  
  drawMap();
  
  // フィールド情報を更新
  updateFieldInfo();
  
  // 地形情報を表示
  showTileInfo(tile);
  
  // ランダムエンカウントチェック（固定位置の敵イベントは削除）
  checkRandomEncounter(tile);
  
  // その他のイベントチェック（ショップ、ストーリー、ボス）
  if (tile.event !== EVENT_TYPES.NONE && tile.event !== EVENT_TYPES.ENEMY) {
    checkEvent(tile);
  }
}

// フィールド情報を更新
function updateFieldInfo() {
  const player = gameState.player;
  const totalTiles = MAP_WIDTH * MAP_HEIGHT;
  const exploredCount = gameState.player.exploredTiles.size;
  const explorationRate = Math.floor((exploredCount / totalTiles) * 100);
  
  const explorationRateEl = document.getElementById('exploration-rate');
  const playerCoordsEl = document.getElementById('player-coords');
  
  if (explorationRateEl) {
    explorationRateEl.textContent = `${explorationRate}%`;
  }
  
  if (playerCoordsEl) {
    playerCoordsEl.textContent = `(${player.x}, ${player.y})`;
  }
}

// ランダムエンカウントシステム
function checkRandomEncounter(tile) {
  // 街や特殊な場所ではエンカウントしない
  if (tile.type === TILE_TYPES.TOWN || tile.type === TILE_TYPES.CASTLE) {
    return;
  }
  
  // 地形に応じたエンカウント率
  const baseEncounterRate = getEnemyChance(tile.type);
  
  // レベルが高いほどエンカウント率が少し上がる（冒険が進むほど危険）
  const levelBonus = gameState.player.level * 0.01;
  const encounterRate = Math.min(baseEncounterRate + levelBonus, 0.35); // 最大35%
  
  // ランダムエンカウント判定
  if (Math.random() < encounterRate) {
    startBattle();
  }
}

// タイル情報を表示
function showTileInfo(tile) {
  const tileNames = {
    [TILE_TYPES.GRASS]: '草原',
    [TILE_TYPES.FOREST]: '森',
    [TILE_TYPES.MOUNTAIN]: '山',
    [TILE_TYPES.DESERT]: '砂漠',
    [TILE_TYPES.WATER]: '水',
    [TILE_TYPES.TOWN]: '街',
    [TILE_TYPES.CAVE]: '洞窟',
    [TILE_TYPES.CASTLE]: '魔王の城'
  };
  
  const eventNames = {
    [EVENT_TYPES.ENEMY]: '敵が潜んでいる...',
    [EVENT_TYPES.SHOP]: '武器屋',
    [EVENT_TYPES.STORY]: '記憶の欠片',
    [EVENT_TYPES.BOSS]: '魔王の城'
  };
  
  let info = tileNames[tile.type] || '未知の場所';
  if (tile.event !== EVENT_TYPES.NONE) {
    info += ` - ${eventNames[tile.event] || ''}`;
  }
  
  // 座標情報も表示（デバッグ用、必要に応じて削除可能）
  // info += ` (${tile.x}, ${tile.y})`;
  
  // 情報をステータスバーに表示（オプション）
  updateTileInfo(info);
}

// タイル情報をUIに表示
function updateTileInfo(info) {
  // 既存のタイル情報表示があれば更新、なければ作成
  let tileInfoEl = document.getElementById('tile-info');
  if (!tileInfoEl) {
    tileInfoEl = document.createElement('div');
    tileInfoEl.id = 'tile-info';
    tileInfoEl.className = 'tile-info';
    const gameHeader = document.querySelector('.game-header');
    if (gameHeader) {
      gameHeader.appendChild(tileInfoEl);
    }
  }
  tileInfoEl.textContent = info;
}

// イベントチェック（敵以外のイベント）
function checkEvent(tile) {
  switch (tile.event) {
    case EVENT_TYPES.SHOP:
      openShop();
      break;
    case EVENT_TYPES.STORY:
      showStory();
      break;
    case EVENT_TYPES.BOSS:
      if (gameState.player.storyProgress >= 4) {
        startBossBattle();
      } else {
        showMessage('まだ準備ができていない...\nもっと冒険を続けよう');
      }
      break;
  }
  
  // イベントは一度だけ発動（敵イベントは除く）
  if (tile.event !== EVENT_TYPES.ENEMY) {
    tile.event = EVENT_TYPES.NONE;
  }
}

// メッセージ表示
function showMessage(text) {
  const overlay = document.getElementById('message-overlay');
  overlay.textContent = text;
  overlay.classList.remove('hidden');
  
  setTimeout(() => {
    overlay.classList.add('hidden');
  }, 2000);
}

// 戦闘開始
function startBattle() {
  // レベルに応じた敵の出現テーブル（より多様な敵が出現）
  const enemyTable = [
    { level: 1, enemies: ['slime', 'slime', 'goblin'] }, // レベル1: スライムが多め、たまにゴブリン
    { level: 2, enemies: ['slime', 'goblin', 'goblin'] }, // レベル2: ゴブリンが多め
    { level: 3, enemies: ['goblin', 'goblin', 'orc'] }, // レベル3: ゴブリンとオーク
    { level: 4, enemies: ['goblin', 'orc', 'orc'] }, // レベル4: オークが多め
    { level: 5, enemies: ['orc', 'orc', 'ogre'] }, // レベル5: オークとオーガ
    { level: 6, enemies: ['orc', 'ogre', 'ogre'] }, // レベル6以上: オーガが多め
  ];
  
  const playerLevel = gameState.player.level;
  let availableEnemies = ['slime']; // デフォルト
  
  // レベルに応じた敵リストを取得
  for (let i = enemyTable.length - 1; i >= 0; i--) {
    if (playerLevel >= enemyTable[i].level) {
      availableEnemies = enemyTable[i].enemies;
      break;
    }
  }
  
  // ランダムに敵を選択（より多様な敵が出現）
  const enemyKey = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
  const enemyData = ENEMIES[enemyKey];
  
  gameState.currentEnemy = {
    ...enemyData,
    key: enemyKey
  };
  
  // 敵画像設定（見切れを防止）
  const enemySprite = document.getElementById('enemy-sprite');
  enemySprite.style.backgroundImage = `url(${enemyData.image})`;
  enemySprite.style.backgroundSize = 'contain';
  enemySprite.style.backgroundRepeat = 'no-repeat';
  enemySprite.style.backgroundPosition = 'center center';
  enemySprite.style.overflow = 'hidden';
  enemySprite.style.width = '180px';
  enemySprite.style.height = '200px';
  enemySprite.style.minWidth = '180px';
  enemySprite.style.minHeight = '200px';
  
  // プレイヤー画像設定（戦闘ではhero2.pngを使用）
  const playerSprite = document.getElementById('player-sprite');
  const hero2Img = gameState.images.hero2;
  if (hero2Img && hero2Img.complete) {
    playerSprite.style.backgroundImage = `url(${hero2Img.src})`;
    playerSprite.style.backgroundSize = 'contain';
    playerSprite.style.backgroundRepeat = 'no-repeat';
    playerSprite.style.backgroundPosition = 'center';
    playerSprite.textContent = ''; // テキストを削除
  } else {
    playerSprite.textContent = '勇者'; // フォールバック
  }
  
  // 戦闘開始アニメーション
  enemySprite.style.opacity = '0';
  enemySprite.style.transform = 'scale(0.5)';
  playerSprite.style.opacity = '0';
  playerSprite.style.transform = 'scale(0.5)';
  setTimeout(() => {
    enemySprite.style.transition = 'all 0.5s ease';
    enemySprite.style.opacity = '1';
    enemySprite.style.transform = 'scale(1)';
    playerSprite.style.transition = 'all 0.5s ease';
    playerSprite.style.opacity = '1';
    playerSprite.style.transform = 'scale(1)';
  }, 100);
  
  updateBattleUI();
  switchScreen('battle'); // BGMはswitchScreen内で自動再生
  
  // 戦闘開始時はボタンを無効化
  updateBattleButtons();
  
  // 戦闘開始メッセージ（バトルログは既にクリア済み）
  setTimeout(() => {
    addBattleLog(`${enemyData.name}が現れた！`);
    // メッセージ表示後にボタンを有効化
    gameState.battleState = 'waiting';
    updateBattleButtons();
  }, 1500);
}

// ボス戦開始
function startBossBattle() {
  gameState.currentEnemy = {
    ...ENEMIES.demonKing,
    key: 'demonKing'
  };
  
  const enemySprite = document.getElementById('enemy-sprite');
  enemySprite.style.backgroundImage = `url(${ENEMIES.demonKing.image})`;
  enemySprite.style.backgroundSize = 'contain';
  enemySprite.style.backgroundRepeat = 'no-repeat';
  enemySprite.style.backgroundPosition = 'center center';
  enemySprite.style.overflow = 'hidden';
  enemySprite.style.width = '180px';
  enemySprite.style.height = '200px';
  enemySprite.style.minWidth = '180px';
  enemySprite.style.minHeight = '200px';
  
  // プレイヤー画像設定（戦闘ではhero2.pngを使用）
  const playerSprite = document.getElementById('player-sprite');
  const hero2Img = gameState.images.hero2;
  if (hero2Img && hero2Img.complete) {
    playerSprite.style.backgroundImage = `url(${hero2Img.src})`;
    playerSprite.style.backgroundSize = 'contain';
    playerSprite.style.backgroundRepeat = 'no-repeat';
    playerSprite.style.backgroundPosition = 'center';
    playerSprite.textContent = ''; // テキストを削除
  } else {
    playerSprite.textContent = '勇者'; // フォールバック
  }
  
  // ボス登場アニメーション（より迫力のある演出）
  enemySprite.style.opacity = '0';
  enemySprite.style.transform = 'scale(0.3) rotate(180deg)';
  enemySprite.style.filter = 'brightness(0)';
  playerSprite.style.opacity = '0';
  playerSprite.style.transform = 'scale(0.5)';
  setTimeout(() => {
    enemySprite.style.transition = 'all 0.8s ease';
    enemySprite.style.opacity = '1';
    enemySprite.style.transform = 'scale(1.1) rotate(0deg)';
    enemySprite.style.filter = 'brightness(1.2)';
    playerSprite.style.transition = 'all 0.8s ease';
    playerSprite.style.opacity = '1';
    playerSprite.style.transform = 'scale(1)';
    setTimeout(() => {
      enemySprite.style.transform = 'scale(1)';
      enemySprite.style.filter = 'brightness(1)';
    }, 300);
  }, 100);
  
  updateBattleUI();
  // ボス戦の場合は特別にboss BGMを設定
  switchScreen('battle');
  playBGM('boss'); // ボス戦は特別なBGM
  
  // ボス戦開始時はボタンを無効化
  updateBattleButtons();
  
  // ボス戦開始メッセージ
  setTimeout(() => {
    addBattleLog('魔王が現れた！');
    addBattleLog('最後の戦いが始まる！');
    // メッセージ表示後にボタンを有効化
    gameState.battleState = 'waiting';
    updateBattleButtons();
  }, 2000);
}

// 戦闘UI更新
function updateBattleUI() {
  const enemy = gameState.currentEnemy;
  const player = gameState.player;
  
  document.getElementById('enemy-name').textContent = enemy.name;
  // 敵の体力バーは非表示
  
  // プレイヤーのHPバー更新
  document.getElementById('player-hp-text').textContent = `${player.hp}/${player.maxHp}`;
  const playerHpPercent = (player.hp / player.maxHp) * 100;
  document.getElementById('player-hp-fill').style.width = `${playerHpPercent}%`;
  
  // 右上のステータス更新
  document.getElementById('battle-level').textContent = player.level;
  document.getElementById('battle-hp').textContent = `${player.hp}/${player.maxHp}`;
  document.getElementById('battle-mp').textContent = `${player.mp}/${player.maxMp}`;
  
  // バトルログを完全にクリア（前回の履歴を残さない）
  const battleLog = document.getElementById('battle-log');
  if (battleLog) {
    battleLog.innerHTML = '';
  }
  
  // ボタンの有効/無効を更新
  updateBattleButtons();
}

// 戦闘ボタンの有効/無効を更新
function updateBattleButtons() {
  const buttons = ['attack-btn', 'defend-btn', 'item-btn'];
  const isWaiting = gameState.battleState === 'waiting';
  
  buttons.forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.disabled = !isWaiting;
    }
  });
}

// ダメージ数値表示
function showDamage(element, damage, isHeal = false) {
  const damageEl = document.getElementById(element);
  if (!damageEl) return;
  
  damageEl.textContent = isHeal ? `+${damage}` : `-${damage}`;
  damageEl.className = `damage-number ${isHeal ? 'heal' : 'damage'}`;
  damageEl.classList.add('show');
  
  setTimeout(() => {
    damageEl.classList.remove('show');
    damageEl.textContent = '';
  }, 1500);
}

// 攻撃
function attack() {
  if (gameState.battleState !== 'waiting') return;
  
  gameState.battleState = 'playerTurn';
  
  const player = gameState.player;
  const enemy = gameState.currentEnemy;
  
  // プレイヤーの攻撃アニメーション
  const playerSprite = document.getElementById('player-sprite');
  if (playerSprite) {
    playerSprite.classList.add('attack');
    setTimeout(() => playerSprite.classList.remove('attack'), 600);
  }
  
  // 少し遅延してからダメージ計算
  setTimeout(() => {
    const playerDamage = Math.max(1, player.attack + WEAPONS[player.weapon].attack - enemy.defense);
    enemy.hp -= playerDamage;
    
    // 敵の被ダメージエフェクト
    const enemySprite = document.getElementById('enemy-sprite');
    if (enemySprite) {
      enemySprite.classList.add('hit');
      setTimeout(() => enemySprite.classList.remove('hit'), 500);
    }
    
    // ダメージ数値表示
    showDamage('enemy-damage', playerDamage);
    addBattleLog(`${enemy.name}に${playerDamage}のダメージ！`);
    
    if (enemy.hp <= 0) {
      enemy.hp = 0;
      setTimeout(() => victory(), 800);
      return;
    }
    
    updateBattleUI();
    
    // 敵の攻撃
    setTimeout(() => {
      // 敵の攻撃アニメーション
      if (enemySprite) {
        enemySprite.classList.add('attack');
        setTimeout(() => enemySprite.classList.remove('attack'), 600);
      }
      
      setTimeout(() => {
        const enemyDamage = Math.max(1, enemy.attack - player.defense);
        player.hp -= enemyDamage;
        
        // プレイヤーの被ダメージエフェクト
        if (playerSprite) {
          playerSprite.classList.add('hit');
          setTimeout(() => playerSprite.classList.remove('hit'), 500);
        }
        
        // ダメージ数値表示
        showDamage('player-damage', enemyDamage);
        addBattleLog(`${enemy.name}の攻撃！${enemyDamage}のダメージを受けた！`);
        
        if (player.hp <= 0) {
          player.hp = 0;
          setTimeout(() => gameOver(), 800);
          return;
        }
        
        updateBattleUI();
        gameState.battleState = 'waiting';
        updateBattleButtons(); // ボタンを有効化
      }, 400);
    }, 1200);
  }, 300);
}

// 防御
function defend() {
  if (gameState.battleState !== 'waiting') return;
  
  gameState.battleState = 'playerTurn';
  
  const player = gameState.player;
  const enemy = gameState.currentEnemy;
  
  // 防御の構えアニメーション
  const playerSprite = document.getElementById('player-sprite');
  if (playerSprite) {
    playerSprite.style.transform = 'scale(0.95)';
    playerSprite.style.filter = 'brightness(1.2)';
  }
  
  addBattleLog('防御の構えを取った！');
  
  // 敵の攻撃（ダメージ半減）
  setTimeout(() => {
    const enemySprite = document.getElementById('enemy-sprite');
    if (enemySprite) {
      enemySprite.classList.add('attack');
      setTimeout(() => enemySprite.classList.remove('attack'), 600);
    }
    
    setTimeout(() => {
      const enemyDamage = Math.max(1, Math.floor((enemy.attack - player.defense) / 2));
      player.hp -= enemyDamage;
      
      // プレイヤーの被ダメージエフェクト（軽減）
      if (playerSprite) {
        playerSprite.classList.add('hit');
        setTimeout(() => {
          playerSprite.classList.remove('hit');
          playerSprite.style.transform = '';
          playerSprite.style.filter = '';
        }, 500);
      }
      
      // ダメージ数値表示
      showDamage('player-damage', enemyDamage);
      addBattleLog(`${enemy.name}の攻撃！${enemyDamage}のダメージを受けた（防御）！`);
      
      if (player.hp <= 0) {
        player.hp = 0;
        setTimeout(() => gameOver(), 800);
        return;
      }
      
      updateBattleUI();
      
      // 防御後も次のターンに進めるようにする
      setTimeout(() => {
        gameState.battleState = 'waiting';
        updateBattleButtons(); // ボタンを有効化
        addBattleLog('次のターン...');
      }, 500);
    }, 400);
  }, 1000);
}

// 勝利
function victory() {
  const enemy = gameState.currentEnemy;
  const player = gameState.player;
  
  addBattleLog(`${enemy.name}を倒した！`);
  addBattleLog(`${enemy.exp}の経験値を獲得！`);
  addBattleLog(`${enemy.gold}Gを獲得！`);
  
  player.exp += enemy.exp;
  player.gold += enemy.gold;
  
  // レベルアップチェック
  while (player.exp >= player.expToNext) {
    levelUp();
  }
  
  updateStatus();
  
  // ボス戦勝利時はエンディングへ
  if (enemy.key === 'demonKing') {
    setTimeout(() => {
      showEnding();
      gameState.battleState = 'waiting';
    }, 3000);
  } else {
    setTimeout(() => {
      switchScreen('game'); // BGMはswitchScreen内で自動再生
      gameState.battleState = 'waiting';
    }, 2000);
  }
}

// レベルアップ
function levelUp() {
  const player = gameState.player;
  player.exp -= player.expToNext;
  player.level++;
  player.maxHp += 20;
  player.hp = player.maxHp;
  player.maxMp += 10;
  player.mp = player.maxMp;
  player.attack += 5;
  player.defense += 2;
  player.expToNext = Math.floor(player.expToNext * 1.5);
  
  showMessage(`レベルアップ！レベル${player.level}になった！`);
  updateStatus();
}

// ゲームオーバー
function gameOver() {
  addBattleLog('敗北した...');
  
  setTimeout(() => {
    if (confirm('ゲームオーバー\nもう一度プレイしますか？')) {
      resetGame();
    } else {
      switchScreen('title');
    }
  }, 1500);
}

// 戦闘ログ追加
function addBattleLog(text) {
  const log = document.getElementById('battle-log');
  const p = document.createElement('p');
  p.textContent = text;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

// ショップを開く
function openShop() {
  switchScreen('shop'); // BGMはswitchScreen内で自動管理（フィールドBGM継続）
  // 店主の挨拶
  showShopMessage('いらっしゃい！\n良い武器が揃ってるぜ！');
  updateShopUI();
}

// ショップメッセージ表示
function showShopMessage(text) {
  const shopContent = document.querySelector('.shop-content');
  let messageDiv = document.getElementById('shop-message');
  
  if (!messageDiv) {
    messageDiv = document.createElement('div');
    messageDiv.id = 'shop-message';
    messageDiv.className = 'shop-message';
    shopContent.insertBefore(messageDiv, shopContent.firstChild);
  }
  
  messageDiv.textContent = text;
  messageDiv.style.display = 'block';
  
  // 3秒後に自動で非表示
  setTimeout(() => {
    if (messageDiv) {
      messageDiv.style.display = 'none';
    }
  }, 3000);
}

// ショップUI更新（強化版）
function updateShopUI() {
  const shopItems = document.getElementById('shop-items');
  shopItems.innerHTML = '';
  
  const player = gameState.player;
  const currentWeapon = WEAPONS[player.weapon];
  const currentAttack = player.attack + currentWeapon.attack;
  
  document.getElementById('shop-gold').textContent = player.gold;
  
  for (const [key, weapon] of Object.entries(WEAPONS)) {
    if (key === 'bronze') continue; // 初期武器は販売しない
    
    const item = document.createElement('div');
    item.className = 'shop-item';
    
    const owned = player.weapon === key;
    const canAfford = player.gold >= weapon.price;
    const newAttack = player.attack + weapon.attack;
    const attackDiff = newAttack - currentAttack;
    
    if (owned) {
      item.classList.add('owned');
      item.innerHTML = `
        <div class="shop-item-image-wrapper">
          <img src="${weapon.image}" alt="${weapon.name}" 
               onerror="this.style.display='none';"
               onload="this.style.opacity='1';"
               style="opacity:0;transition:opacity 0.3s;">
          <div class="owned-badge">装備中</div>
        </div>
        <div class="shop-item-name">${weapon.name}</div>
        <div class="shop-item-stats">
          <div class="shop-item-stat">攻撃力: +${weapon.attack}</div>
          <div class="shop-item-stat">現在の攻撃力: ${newAttack}</div>
        </div>
        <div class="shop-item-price owned-price">所持済み</div>
      `;
    } else {
      const attackClass = attackDiff > 0 ? 'attack-up' : attackDiff < 0 ? 'attack-down' : '';
      const attackIndicator = attackDiff > 0 ? `↑+${attackDiff}` : attackDiff < 0 ? `↓${attackDiff}` : '';
      
      item.innerHTML = `
        <div class="shop-item-image-wrapper">
          <img src="${weapon.image}" alt="${weapon.name}" 
               onerror="this.style.display='none';"
               onload="this.style.opacity='1';"
               style="opacity:0;transition:opacity 0.3s;">
        </div>
        <div class="shop-item-name">${weapon.name}</div>
        <div class="shop-item-stats">
          <div class="shop-item-stat">攻撃力: +${weapon.attack}</div>
          <div class="shop-item-stat ${attackClass}">
            装備時: ${newAttack} ${attackIndicator ? `<span class="attack-indicator">${attackIndicator}</span>` : ''}
          </div>
          <div class="shop-item-stat">現在: ${currentAttack}</div>
        </div>
        <div class="shop-item-price ${canAfford ? '' : 'insufficient'}">${weapon.price}G</div>
        ${canAfford ? '<div class="shop-item-hint">クリックで購入</div>' : '<div class="shop-item-hint insufficient">お金が足りません</div>'}
      `;
      
      if (canAfford) {
        item.addEventListener('click', () => buyWeapon(key));
        item.classList.add('purchasable');
      } else {
        item.addEventListener('click', () => {
          showShopMessage('おとといきやがれ！\n金が足りないぞ！');
        });
        item.classList.add('insufficient');
      }
    }
    
    shopItems.appendChild(item);
  }
}

// 武器購入（強化版）
function buyWeapon(weaponKey) {
  const weapon = WEAPONS[weaponKey];
  const player = gameState.player;
  
  if (player.gold >= weapon.price) {
    const oldWeapon = WEAPONS[player.weapon];
    const oldAttack = player.attack + oldWeapon.attack;
    const newAttack = player.attack + weapon.attack;
    const attackDiff = newAttack - oldAttack;
    
    player.gold -= weapon.price;
    player.weapon = weaponKey;
    
    updateShopUI();
    updateStatus();
    
    // より詳細な購入メッセージ
    let message = `${weapon.name}を購入した！\n`;
    if (attackDiff > 0) {
      message += `攻撃力が${attackDiff}上がった！`;
    } else if (attackDiff < 0) {
      message += `攻撃力が${Math.abs(attackDiff)}下がった...`;
    } else {
      message += `攻撃力は変わらない`;
    }
    message += `\nありがとう！`;
    
    showShopMessage(message);
  } else {
    // お金がないとき
    const shortage = weapon.price - player.gold;
    showShopMessage(`おとといきやがれ！\n金が${shortage}G足りないぞ！`);
  }
}

// ストーリー表示
function showStory() {
  const progress = gameState.player.storyProgress;
  if (progress < STORY.length) {
    gameState.player.storyProgress = progress + 1;
    switchScreen('story'); // BGMはswitchScreen内で自動管理（フィールドBGM継続）
    document.getElementById('story-text').textContent = STORY[progress].text;
  } else {
    showMessage('すべての記憶を取り戻した！');
  }
}

// 画面切り替え（BGM管理付き）
function switchScreen(screenName) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  document.getElementById(`${screenName}-screen`).classList.add('active');
  gameState.currentScreen = screenName;
  
  // 画面に応じたBGMを自動再生
  const bgmMap = {
    'title': 'title',
    'opening': 'title',
    'game': 'field',
    'battle': 'battle',
    'shop': 'field', // ショップはフィールドBGMを継続
    'menu': null, // メニューはBGMを停止しない
    'story': 'field', // ストーリーはフィールドBGMを継続
    'ending': 'title'
  };
  
  const bgmType = bgmMap[screenName];
  if (bgmType) {
    playBGM(bgmType);
  }
  // nullの場合はBGMを変更しない（メニューなど）
}

// ステータス更新
function updateStatus() {
  const player = gameState.player;
  document.getElementById('player-level').textContent = player.level;
  document.getElementById('player-hp').textContent = `${player.hp}/${player.maxHp}`;
  document.getElementById('player-gold').textContent = player.gold;
  document.getElementById('player-weapon').textContent = WEAPONS[player.weapon].name;
  
  // メニュー画面のステータスも更新
  document.getElementById('menu-level').textContent = player.level;
  document.getElementById('menu-hp').textContent = player.hp;
  document.getElementById('menu-max-hp').textContent = player.maxHp;
  document.getElementById('menu-attack').textContent = player.attack + WEAPONS[player.weapon].attack;
  document.getElementById('menu-defense').textContent = player.defense;
  document.getElementById('menu-gold').textContent = player.gold;
  document.getElementById('menu-weapon').textContent = WEAPONS[player.weapon].name;
}

// BGM再生
function playBGM(type) {
  // 全てのBGMを停止
  Object.values(gameState.bgm).forEach(bgm => {
    if (bgm) {
      bgm.pause();
      bgm.currentTime = 0;
    }
  });
  
  const bgmMap = {
    title: 'bgm-title',
    field: 'bgm-field',
    battle: 'bgm-battle',
    boss: 'bgm-boss'
  };
  
  const bgmId = bgmMap[type];
  if (bgmId) {
    const bgm = document.getElementById(bgmId);
    if (bgm) {
      bgm.volume = 0.3;
      bgm.play().catch(e => console.log('BGM play failed:', e));
      gameState.bgm[type] = bgm;
    }
  }
}

// ゲームリセット
function resetGame() {
  gameState.player = {
    x: 1,
    y: 1,
    level: 1,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    attack: 10,
    defense: 5,
    exp: 0,
    expToNext: 100,
    gold: 50,
    weapon: 'bronze',
    storyProgress: 0,
    exploredTiles: new Set()
  };
  
  // 初期位置を探索済みにする
  gameState.player.exploredTiles.add('1,1');
  
  gameState.map = generateMap();
  updateStatus();
  drawMap();
  updateFieldInfo(); // フィールド情報を初期化
  switchScreen('game'); // BGMはswitchScreen内で自動再生
}

// エンディング
function showEnding() {
  switchScreen('ending'); // BGMはswitchScreen内で自動再生（タイトルBGM）
  document.getElementById('ending-text').innerHTML = `
    <p>魔王を倒し、失われた記憶を取り戻しました。</p>
    <p>あなたは勇者として、世界に平和をもたらしました。</p>
    <p>これからも、新しい冒険が待っています...</p>
    <p style="margin-top: 2rem; font-size: 1.5rem; color: #ffd93d;">🎉 おめでとうございます！ 🎉</p>
  `;
}

// オープニング画面の管理
function startOpening() {
  gameState.opening.currentSlide = 0;
  switchScreen('opening'); // BGMはswitchScreen内で自動再生
  showOpeningSlide(0);
  startOpeningAutoPlay();
}

function showOpeningSlide(index) {
  const slides = document.querySelectorAll('.opening-slide');
  slides.forEach((slide, i) => {
    if (i === index) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });
  
  // プログレスバー更新
  const progress = ((index + 1) / gameState.opening.totalSlides) * 100;
  document.querySelector('.opening-progress-bar').style.width = `${progress}%`;
  
  gameState.opening.currentSlide = index;
}

function nextOpeningSlide() {
  if (gameState.opening.currentSlide < gameState.opening.totalSlides - 1) {
    showOpeningSlide(gameState.opening.currentSlide + 1);
    startOpeningAutoPlay();
  } else {
    // オープニング終了、ゲーム開始
    endOpening();
  }
}

function startOpeningAutoPlay() {
  // 既存のタイマーをクリア
  if (gameState.opening.autoPlayTimer) {
    clearTimeout(gameState.opening.autoPlayTimer);
  }
  
  // 5秒後に自動で次のスライドへ
  gameState.opening.autoPlayTimer = setTimeout(() => {
    nextOpeningSlide();
  }, 5000);
}

function skipOpening() {
  // タイマーをクリア
  if (gameState.opening.autoPlayTimer) {
    clearTimeout(gameState.opening.autoPlayTimer);
  }
  if (gameState.opening.progressTimer) {
    clearInterval(gameState.opening.progressTimer);
  }
  
  endOpening();
}

function endOpening() {
  // オープニング終了、ゲーム開始
  resetGame();
}

// イベントリスナー設定
document.addEventListener('DOMContentLoaded', async () => {
  // タイトル画面
  document.getElementById('start-btn').addEventListener('click', () => {
    startOpening();
  });
  
  // オープニング画面
  document.getElementById('opening-next-btn').addEventListener('click', () => {
    nextOpeningSlide();
  });
  
  document.getElementById('opening-skip-btn').addEventListener('click', () => {
    skipOpening();
  });
  
  // オープニング画面をクリックしても次へ進める
  document.getElementById('opening-screen').addEventListener('click', (e) => {
    // ボタン以外をクリックした場合
    if (!e.target.closest('.opening-controls') && !e.target.closest('.opening-skip-btn') && !e.target.closest('.opening-next-btn')) {
      nextOpeningSlide();
    }
  });
  
  // キーボード操作
  document.addEventListener('keydown', (e) => {
    if (gameState.currentScreen !== 'game') return;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        movePlayer(0, -1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        movePlayer(0, 1);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        movePlayer(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        movePlayer(1, 0);
        break;
    }
  });
  
  // モバイル操作ボタン
  document.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const direction = btn.dataset.direction;
      const moves = {
        up: [0, -1],
        down: [0, 1],
        left: [-1, 0],
        right: [1, 0]
      };
      if (moves[direction] && gameState.currentScreen === 'game') {
        movePlayer(moves[direction][0], moves[direction][1]);
      }
    });
    
    // タッチフィードバック
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      btn.style.transform = 'scale(0.9)';
    });
    
    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      btn.style.transform = 'scale(1)';
    });
  });
  
  // アクションボタン
  document.getElementById('menu-btn').addEventListener('click', () => {
    switchScreen('menu');
    updateStatus();
  });
  
  document.getElementById('interact-btn').addEventListener('click', () => {
    const tile = gameState.map[gameState.player.y][gameState.player.x];
    checkEvent(tile);
  });
  
  // 戦闘ボタン
  document.getElementById('attack-btn').addEventListener('click', attack);
  document.getElementById('defend-btn').addEventListener('click', defend);
  
  // ショップ
  document.getElementById('shop-close-btn').addEventListener('click', () => {
    switchScreen('game'); // BGMはswitchScreen内で自動再生
  });
  
  // メニュー
  document.getElementById('menu-close-btn').addEventListener('click', () => {
    switchScreen('game');
  });
  
  document.getElementById('continue-btn').addEventListener('click', () => {
    switchScreen('game');
  });
  
  // ストーリー
  document.getElementById('story-next-btn').addEventListener('click', () => {
    if (gameState.player.storyProgress < STORY.length) {
      showStory();
    } else {
      switchScreen('game');
    }
  });
  
  // エンディング
  document.getElementById('ending-restart-btn').addEventListener('click', () => {
    resetGame();
  });
  
  // 画像読み込みと初期化
  await loadImages();
  gameState.map = generateMap();
  drawMap();
  
  // タイトル画面のBGM再生（初期画面）
  playBGM('title');
  
  // ウィンドウリサイズ時のマップ再描画
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (gameState.currentScreen === 'game') {
        drawMap();
      }
    }, 250);
  });
});
