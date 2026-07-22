const GameState = {
  level: 1,
  maze: [],
  size: 0,
  cellSize: 48,
  hero: { x: 1, y: 1 },
  treasures: [],
  revealed: [],
  usedMimics: [],
  isQuiz: false,
  isChoosing: false,
  pendingTreasure: null,
  pendingBattle: null,
  battleTimeoutId: null,
  ignoredStanding: null, // {x,y} 無視中のマス（そのマスにいる間だけ再表示しない）
  gameOver: false,
  gameClear: false,
  collected: [],
  timeLeft: 30,
  items: [],
  timerId: null,
  itemSpawnId: null,
  hp: 3,
  maxHp: 3,
  timerPaused: false
};

const Assets = {
  images: {},
  sounds: {},
  load(callback) {
    // clock.png は未同梱のため描画フォールバックのみ（404ログを出さない）
    // mimic = 迷路用 / mimic_battle = 戦闘UI用（新規追加）
    const imgList = ["hero", "treasure", "mimic", "mimic_battle", "coin", "flag"];
    const soundList = ["bgm", "seikai", "fuseikai", "takara", "kamituku"];
    let total = imgList.length;
    let loaded = 0;

    const makeFallback = (name) => {
      const canvas = document.createElement('canvas');
      canvas.width = 48;
      canvas.height = 48;
      const ctx = canvas.getContext('2d');
      const colors = {
        hero: '#3a8fd4',
        treasure: '#e8b84a',
        mimic: '#c44536',
        mimic_battle: '#c44536',
        coin: '#f0c45a',
        flag: '#7edc8a',
        clock: '#5ab0c4'
      };
      ctx.fillStyle = colors[name] || '#888';
      ctx.beginPath();
      ctx.arc(24, 24, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name === 'clock' ? 'CLK' : name.substr(0, 4), 24, 24);
      return canvas;
    };

    Assets.images.clock = makeFallback('clock');

    imgList.forEach(name => {
      const img = new Image();
      img.src = `./images/${name}.png`;
      img.onload = () => {
        Assets.images[name] = img;
        loaded++;
        if (loaded === total) callback();
      };
      img.onerror = () => {
        Assets.images[name] = makeFallback(name);
        loaded++;
        if (loaded === total) callback();
      };
    });

    soundList.forEach(id => {
      const audio = document.getElementById(id);
      if (audio) Assets.sounds[id] = audio;
    });
  }
};

const Renderer = {
  canvas: document.getElementById("mazeCanvas"),
  ctx: null,
  viewW: 320,
  viewH: 320,
  init() {
    this.ctx = this.canvas.getContext("2d");
  },
  draw() {
    const { maze, size, cellSize, hero, treasures, revealed } = GameState;
    const ctx = this.ctx;
    const vw = this.viewW;
    const vh = this.viewH;
    const offsetX = vw / 2 - hero.x * cellSize - cellSize / 2;
    const offsetY = vh / 2 - hero.y * cellSize - cellSize / 2;

    ctx.clearRect(0, 0, vw, vh);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const px = x * cellSize + offsetX;
        const py = y * cellSize + offsetY;
        if (px > vw || py > vh || px + cellSize < 0 || py + cellSize < 0) continue;

        if (maze[y][x] === 1) {
          // 壁：ダンジョンの暗さを保ちつつ、道より明確に沈める
          ctx.fillStyle = "#0e1518";
          ctx.fillRect(px, py, cellSize, cellSize);
          ctx.strokeStyle = "#070b0d";
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);
        } else {
          // 通路：少しだけ明るく＋薄い市松で「ここが道」と分かる
          const checker = (x + y) % 2 === 0;
          ctx.fillStyle = checker ? "#4a6166" : "#3f555a";
          ctx.fillRect(px, py, cellSize, cellSize);
          ctx.strokeStyle = "rgba(180, 210, 215, 0.12)";
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);
        }
      }
    }

    treasures.forEach(t => {
      const px = t.x * cellSize + offsetX;
      const py = t.y * cellSize + offsetY;
      if (px > vw || py > vh || px + cellSize < 0 || py + cellSize < 0) return;

      const found = revealed.some(r => r.x === t.x && r.y === t.y);
      let img;
      if (t.isGoal) {
        img = Assets.images.flag || Assets.images.treasure;
      } else {
        img = found
          ? (t.isMimic ? Assets.images.mimic : Assets.images.coin)
          : Assets.images.treasure;
      }

      if (img) {
        ctx.drawImage(img, px, py, cellSize, cellSize);
      } else {
        ctx.fillStyle = found ? (t.isMimic ? '#c44536' : '#e8b84a') : '#e8b84a';
        ctx.fillRect(px + 4, py + 4, cellSize - 8, cellSize - 8);
      }
    });

    GameState.items.forEach(item => {
      const px = item.x * cellSize + offsetX;
      const py = item.y * cellSize + offsetY;
      if (px > vw || py > vh || px + cellSize < 0 || py + cellSize < 0) return;
      const img = Assets.images.clock;
      if (img) {
        ctx.drawImage(img, px, py, cellSize, cellSize);
      } else {
        ctx.fillStyle = '#5ab0c4';
        ctx.fillRect(px + 8, py + 8, cellSize - 16, cellSize - 16);
      }
    });

    const heroImg = Assets.images.hero;
    const hx = vw / 2 - cellSize / 2;
    const hy = vh / 2 - cellSize / 2;
    if (heroImg) {
      ctx.drawImage(heroImg, hx, hy, cellSize, cellSize);
    } else {
      ctx.fillStyle = '#3a8fd4';
      ctx.fillRect(hx, hy, cellSize, cellSize);
    }

    updateTreasureCount();
  }
};

const GameEngine = {
  init({ resetHp = false } = {}) {
    document.getElementById("level").textContent = GameState.level;
    GameState.size = Math.min(10 + Math.floor(GameState.level * 1.5), 40);
    this.resizeCanvas();
    GameState.hero = { x: 1, y: 1 };
    GameState.gameOver = false;
    GameState.gameClear = false;
    GameState.isQuiz = false;
    GameState.isChoosing = false;
    GameState.pendingTreasure = null;
    GameState.pendingBattle = null;
    if (GameState.battleTimeoutId) {
      clearTimeout(GameState.battleTimeoutId);
      GameState.battleTimeoutId = null;
    }
    GameState.ignoredStanding = null;
    GameState.revealed = [];
    GameState.usedMimics = [];
    GameState.timeLeft = 30;
    GameState.timerPaused = false;
    if (resetHp) {
      GameState.hp = GameState.maxHp;
    }
    updateHpDisplay();
    updateTimeDisplay();
    GameState.items = [];
    if (GameState.timerId) clearInterval(GameState.timerId);
    if (GameState.itemSpawnId) clearInterval(GameState.itemSpawnId);
    hideOverlay("treasure-choice");
    hideOverlay("quiz-box");
    setUiLocked(false);
    this.generateMaze();
    this.placeTreasures();
    Renderer.draw();
    this.startTimer();
    this.startItemSpawn();
    this.loop();
  },

  resizeCanvas() {
    const container = document.querySelector('.maze-container');
    if (!container || !Renderer.ctx) return;

    // 縦長スマホでは「正方形に切らない」＝見える範囲を最大化
    const cssW = Math.max(200, container.clientWidth || window.innerWidth || 320);
    const cssH = Math.max(240, container.clientHeight || Math.floor(window.innerHeight * 0.75) || 400);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    Renderer.viewW = cssW;
    Renderer.viewH = cssH;
    Renderer.canvas.width = Math.floor(cssW * dpr);
    Renderer.canvas.height = Math.floor(cssH * dpr);
    Renderer.canvas.style.width = cssW + "px";
    Renderer.canvas.style.height = cssH + "px";
    Renderer.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 画面が広いほどマスを少し大きくして見やすく
    const shortSide = Math.min(cssW, cssH);
    GameState.cellSize = shortSide >= 700 ? 56 : shortSide >= 500 ? 48 : 42;
  },

  generateMaze() {
    const size = GameState.size;
    const maze = Array(size).fill().map(() => Array(size).fill(1));
    const stack = [];

    maze[1][1] = 0;
    stack.push({ x: 1, y: 1 });

    while (stack.length) {
      const current = stack[stack.length - 1];
      const dirs = [];

      if (current.y > 1 && maze[current.y - 2][current.x] === 1)
        dirs.push({ dx: 0, dy: -2 });
      if (current.y < size - 2 && maze[current.y + 2][current.x] === 1)
        dirs.push({ dx: 0, dy: 2 });
      if (current.x > 1 && maze[current.y][current.x - 2] === 1)
        dirs.push({ dx: -2, dy: 0 });
      if (current.x < size - 2 && maze[current.y][current.x + 2] === 1)
        dirs.push({ dx: 2, dy: 0 });

      if (dirs.length) {
        const { dx, dy } = dirs[Math.floor(Math.random() * dirs.length)];
        maze[current.y + dy / 2][current.x + dx / 2] = 0;
        maze[current.y + dy][current.x + dx] = 0;
        stack.push({ x: current.x + dx, y: current.y + dy });
      } else {
        stack.pop();
      }
    }

    maze[1][0] = 0;
    const gx = size - 2;
    const gy = size - 2;
    maze[gy][gx] = 0;
    maze[size - 2][size - 1] = 0;
    GameState.maze = maze;
  },

  placeTreasures() {
    const chestCount = Math.max(3, Math.floor(GameState.size / 5) + 1);
    const placed = [];
    GameState.treasures = [];

    // ステージに応じてミミックを必ず一定数配置（1–2面でも0体にならない）
    const level = Math.max(1, GameState.level || 1);
    const minMimics = level <= 2 ? 1 : level <= 5 ? 2 : level <= 8 ? 2 : 3;
    const mimicTarget = Math.min(
      chestCount - 1, // 通常宝箱を最低1個残す
      Math.max(minMimics, Math.round(chestCount * (0.4 + level * 0.04)))
    );

    const slots = [];
    for (let i = 0; i < chestCount; i++) {
      slots.push(i < mimicTarget);
    }
    // 出現順を混ぜる（先頭だけミミックに偏らない）
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = slots[i];
      slots[i] = slots[j];
      slots[j] = tmp;
    }

    const tryPlaceAt = (maker) => {
      let attempts = 0;
      while (attempts < 120) {
        const x = Math.floor(Math.random() * (GameState.size - 2)) + 1;
        const y = Math.floor(Math.random() * (GameState.size - 2)) + 1;
        if (
          GameState.maze[y] && GameState.maze[y][x] === 0 &&
          Math.abs(x - GameState.hero.x) + Math.abs(y - GameState.hero.y) > 3 &&
          !placed.some(p => p.x === x && p.y === y)
        ) {
          const item = maker(x, y);
          GameState.treasures.push(item);
          placed.push({ x, y });
          return true;
        }
        attempts++;
      }
      return false;
    };

    slots.forEach((asMimic) => {
      tryPlaceAt((x, y) => {
        if (asMimic) {
          const m = rollMimicForLevel(level);
          return {
            x, y,
            isMimic: true,
            mimicType: m.mimicType,
            difficulty: m.difficulty,
            mimicLabel: m.label
          };
        }
        return { x, y, isMimic: false };
      });
    });

    // 万一ミミック0なら、通常宝箱1つを強制変換
    const mimicPlaced = GameState.treasures.filter(t => t.isMimic).length;
    if (mimicPlaced < minMimics) {
      const normals = GameState.treasures.filter(t => !t.isMimic && !t.isGoal && !t.isHidden);
      for (const n of normals) {
        if (GameState.treasures.filter(t => t.isMimic).length >= minMimics) break;
        if (normals.length <= 1) break; // 通常宝箱は残す
        const m = rollMimicForLevel(level);
        n.isMimic = true;
        n.mimicType = m.mimicType;
        n.difficulty = m.difficulty;
        n.mimicLabel = m.label;
      }
    }

    let hiddenPlaced = false;
    let hiddenAttempts = 0;
    while (!hiddenPlaced && hiddenAttempts < 100) {
      const x = Math.floor(Math.random() * (GameState.size - 2)) + 1;
      const y = Math.floor(Math.random() * (GameState.size - 2)) + 1;
      if (
        GameState.maze[y] && GameState.maze[y][x] === 0 &&
        Math.abs(x - GameState.hero.x) + Math.abs(y - GameState.hero.y) > 3 &&
        !placed.some(p => p.x === x && p.y === y)
      ) {
        GameState.treasures.push({ x, y, isHidden: true, collectionId: 1, isMimic: false });
        placed.push({ x, y });
        hiddenPlaced = true;
      }
      hiddenAttempts++;
    }

    const gx = GameState.size - 2;
    const gy = GameState.size - 2;
    if (GameState.maze[gy] && GameState.maze[gy][gx] === 0) {
      GameState.treasures.push({ x: gx, y: gy, isMimic: false, isGoal: true });
    }
  },

  startTimer() {
    GameState.timerId = setInterval(() => {
      if (GameState.gameOver || GameState.gameClear) return;
      if (GameState.timerPaused || GameState.isQuiz || GameState.isChoosing) return;
      GameState.timeLeft--;
      updateTimeDisplay();
      if (GameState.timeLeft <= 0) {
        clearInterval(GameState.timerId);
        if (GameState.itemSpawnId) clearInterval(GameState.itemSpawnId);
        GameState.gameOver = true;
        document.getElementById("game-over-reason").textContent = "時間切れ...";
        showModal(document.getElementById("game-over-modal"));
      }
    }, 1000);
  },

  startItemSpawn() {
    let spawnCount = 0;
    const spawn = () => {
      if (GameState.gameOver || GameState.gameClear) return;
      this.spawnItem();
      spawnCount++;
      if (spawnCount >= 3 && GameState.itemSpawnId) {
        clearInterval(GameState.itemSpawnId);
        GameState.itemSpawnId = null;
      }
    };

    spawn();
    GameState.itemSpawnId = setInterval(spawn, 20000);
  },

  spawnItem() {
    const hasFast = GameState.items.some(i => i.type === 'fastClock');
    const type = !hasFast && Math.random() < 0.2 ? 'fastClock' : 'clock';
    const speed = type === 'fastClock' ? 0.4 : 0.2;
    const x = Math.floor(Math.random() * (GameState.size - 2)) + 1;
    GameState.items.push({ x, y: 0, speed, type });
  },

  loop() {
    if (GameState.gameOver || GameState.gameClear) return;
    this.updateItems();
    Renderer.draw();
    requestAnimationFrame(() => this.loop());
  },

  updateItems() {
    if (GameState.isQuiz || GameState.isChoosing) return;
    GameState.items.forEach(it => it.y += it.speed);
    GameState.items = GameState.items.filter(it => {
      const caught = Math.abs(it.x - GameState.hero.x) < 0.5 &&
        Math.abs(it.y - GameState.hero.y) < 0.5;
      if (caught) {
        if (it.type === 'fastClock' || it.type === 'clock') {
          GameState.timeLeft += 1;
          updateTimeDisplay();
        }
        return false;
      }
      return it.y < GameState.size;
    });
  },

  moveHero(dx, dy) {
    if (GameState.gameOver || GameState.gameClear || GameState.isQuiz || GameState.isChoosing) return;

    const nx = GameState.hero.x + dx;
    const ny = GameState.hero.y + dy;

    if (
      nx >= 0 && ny >= 0 &&
      nx < GameState.size && ny < GameState.size &&
      GameState.maze[ny] && GameState.maze[ny][nx] === 0
    ) {
      GameState.hero.x = nx;
      GameState.hero.y = ny;

      // マスを離れたら「無視」フラグ解除
      if (
        GameState.ignoredStanding &&
        (GameState.ignoredStanding.x !== nx || GameState.ignoredStanding.y !== ny)
      ) {
        GameState.ignoredStanding = null;
      }

      this.checkEvents();
      Renderer.draw();
    }
  },

  checkEvents() {
    for (let t of GameState.treasures) {
      if (
        t.x !== GameState.hero.x ||
        t.y !== GameState.hero.y ||
        GameState.revealed.some(r => r.x === t.x && r.y === t.y)
      ) {
        continue;
      }

      // ゴールは従来どおり自動判定
      if (t.isGoal) {
        this.handleGoal(t);
        break;
      }

      // 宝箱（通常・隠し・ミミック）は選択式
      if (
        GameState.ignoredStanding &&
        GameState.ignoredStanding.x === t.x &&
        GameState.ignoredStanding.y === t.y
      ) {
        break;
      }

      TreasureChoice.show(t);
      break;
    }
  },

  handleGoal(t) {
    const nonGoalTreasures = GameState.treasures.filter(x => !x.isMimic && !x.isGoal);
    const allFound = nonGoalTreasures.length === 0 ||
      nonGoalTreasures.every(tr => GameState.revealed.some(r => r.x === tr.x && r.y === tr.y));

    if (!allFound) return;

    playSound('takara');
    GameState.revealed.push(t);
    if (GameState.level < 10) {
      GameState.level++;
      showMessage(`ゴール！レベル${GameState.level}へ進む！`);
      setTimeout(() => {
        hideMessage();
        GameEngine.init({ resetHp: false });
      }, 1500);
    } else {
      GameState.gameClear = true;
      showMessage("全てのレベルをクリアしました！");
      setTimeout(() => {
        hideMessage();
        showModal(document.getElementById("game-clear-modal"));
      }, 2000);
    }
  },

  openTreasure(t) {
    if (t.isMimic) {
      this.startMimicBattle(t);
      return;
    }

    if (t.isHidden) {
      playSound('seikai');
      GameState.revealed.push(t);
      if (!GameState.collected.includes(t.collectionId)) {
        GameState.collected.push(t.collectionId);
      }
      showMessage("✨隠し宝箱を発見！コレクションに追加！");
      setTimeout(hideMessage, 2000);
      Renderer.draw();
      return;
    }

    playSound('takara');
    GameState.revealed.push(t);
    showMessage("宝物を手に入れた！");
    setTimeout(hideMessage, 1500);
    Renderer.draw();
  },

  /** ミミック発見 → 戦闘UIへ確実に接続 */
  startMimicBattle(t) {
    if (!t || GameState.gameOver || GameState.gameClear) return;

    // 進行中のホールド移動を止める（演出中にマス移動しない）
    ["up", "down", "left", "right"].forEach((dir) => stopHolding(dir));

    // 二重オープンでも、未戦闘なら戦闘へ復帰
    const alreadyUsed = GameState.usedMimics.some(m => m.x === t.x && m.y === t.y);
    const box = document.getElementById("quiz-box");
    if (alreadyUsed && GameState.isQuiz && box && !box.classList.contains("hidden")) {
      return;
    }

    if (!alreadyUsed) {
      GameState.usedMimics.push(t);
    }

    GameState.pendingBattle = t;
    GameState.isQuiz = true; // 遅延中も移動・再選択を止める
    GameState.isChoosing = false;
    setUiLocked(true);
    hideOverlay("treasure-choice");
    playSound('kamituku');

    const label = t.mimicLabel || "ミミック";
    showMessage(label + "があらわれた！");

    if (GameState.battleTimeoutId) {
      clearTimeout(GameState.battleTimeoutId);
      GameState.battleTimeoutId = null;
    }

    // 短い演出のあと必ず戦闘画面へ（失敗時は即リトライ）
    GameState.battleTimeoutId = setTimeout(() => {
      GameState.battleTimeoutId = null;
      hideMessage();
      try {
        QuizSystem.show(t);
      } catch (_) {
        GameState.isQuiz = false;
        GameState.pendingBattle = null;
        setUiLocked(false);
        showMessage("戦闘の開始に失敗した...");
        setTimeout(hideMessage, 1600);
      }
    }, 450);
  },

  takeDamage(amount, reason) {
    GameState.hp = Math.max(0, GameState.hp - amount);
    updateHpDisplay();
    vibrate(30);

    if (GameState.hp <= 0) {
      GameState.gameOver = true;
      document.getElementById("game-over-reason").textContent =
        reason || "たいりょくが なくなった...";
      showMessage("やられた...ゲームオーバー");
      setTimeout(() => {
        hideMessage();
        showModal(document.getElementById("game-over-modal"));
      }, 1400);
      return true;
    }
    return false;
  }
};

const TreasureChoice = {
  _busy: false,

  show(treasure) {
    this._busy = false;
    GameState.isChoosing = true;
    GameState.pendingTreasure = treasure;
    const panel = document.getElementById("treasure-choice");
    const img = document.getElementById("choice-chest-img");
    if (img && Assets.images.treasure) {
      img.src = Assets.images.treasure.src || "./images/treasure.png";
    }
    panel.classList.remove("hidden");
    setUiLocked(true);
  },

  open() {
    if (this._busy || !GameState.isChoosing) return;
    this._busy = true;
    const t = GameState.pendingTreasure;
    this.close(false);
    if (!t) return;
    GameEngine.openTreasure(t);
  },

  ignore() {
    if (this._busy || !GameState.isChoosing) return;
    this._busy = true;
    const t = GameState.pendingTreasure;
    if (t) {
      GameState.ignoredStanding = { x: t.x, y: t.y };
    }
    this.close(false);
    showMessage("宝箱をスルーした");
    setTimeout(hideMessage, 1000);
  },

  close() {
    GameState.isChoosing = false;
    GameState.pendingTreasure = null;
    hideOverlay("treasure-choice");
    if (!GameState.isQuiz) setUiLocked(false);
  }
};

const MIMIC_TABLE = [
  { mimicType: "NORMAL_MIMIC", difficulty: 1, label: "普通のミミック" },
  { mimicType: "STRONG_MIMIC", difficulty: 2, label: "強いミミック" },
  { mimicType: "ELITE_MIMIC", difficulty: 3, label: "かなり強いミミック" },
  { mimicType: "HARD_MIMIC", difficulty: 4, label: "ハードミミック" }
];

/** 階層が上がるほど強いミミックが出やすい */
function rollMimicForLevel(level) {
  const lv = Math.max(1, Math.min(10, level || 1));
  let weights;
  if (lv <= 2) weights = [70, 25, 5, 0];
  else if (lv <= 4) weights = [35, 45, 15, 5];
  else if (lv <= 6) weights = [15, 35, 35, 15];
  else if (lv <= 8) weights = [5, 20, 40, 35];
  else weights = [0, 10, 35, 55];

  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return MIMIC_TABLE[i];
  }
  return MIMIC_TABLE[0];
}

const QuizSystem = {
  currentExplanation: "",

  show(treasure) {
    if (typeof QuizEngine === "undefined") {
      GameState.isQuiz = false;
      GameState.pendingBattle = null;
      setUiLocked(false);
      showMessage("クイズエンジンがありません！");
      setTimeout(hideMessage, 1500);
      return;
    }
    if (!QuizEngine.stats().activeTotal) {
      if (typeof QUIZ_NEWS_PACK !== "undefined") {
        QuizEngine.setPack(QUIZ_NEWS_PACK);
      }
    }

    const difficulty = treasure.difficulty || 1;
    const quiz =
      QuizEngine.pickQuestion({ difficulty, mimicType: treasure.mimicType }) ||
      QuizEngine.pickQuestion({ difficulty }) ||
      QuizEngine.pickQuestion({});

    if (!quiz) {
      GameState.isQuiz = false;
      GameState.pendingBattle = null;
      setUiLocked(false);
      // 詰み防止: 戦闘不能時は宝箱を消費して先へ進める
      if (!GameState.revealed.some(r => r.x === treasure.x && r.y === treasure.y)) {
        GameState.revealed.push(treasure);
      }
      showMessage("クイズがありません！宝箱は消えた...");
      setTimeout(hideMessage, 1600);
      Renderer.draw();
      return;
    }

    GameState.isQuiz = true;
    GameState.pendingBattle = treasure;
    this.currentExplanation = quiz.explanation || "";

    const box = document.getElementById("quiz-box");
    const q = document.getElementById("quiz-question");
    const opt = document.getElementById("quiz-options");
    const heroImg = document.getElementById("battle-hero-img");
    const enemyImg = document.getElementById("battle-enemy-img");
    const enemyName = document.getElementById("battle-enemy-name");
    const enemyDiff = document.getElementById("battle-enemy-diff");

    if (!box || !q || !opt) {
      GameState.isQuiz = false;
      GameState.pendingBattle = null;
      setUiLocked(false);
      showMessage("戦闘画面が見つかりません");
      setTimeout(hideMessage, 1500);
      return;
    }

    if (heroImg && Assets.images.hero && Assets.images.hero.src) {
      heroImg.src = Assets.images.hero.src;
    }
    const battleMimic = Assets.images.mimic_battle || Assets.images.mimic;
    if (enemyImg && battleMimic && battleMimic.src) {
      enemyImg.src = battleMimic.src;
    }
    if (enemyName) enemyName.textContent = treasure.mimicLabel || "ミミック";
    if (enemyDiff) enemyDiff.textContent = "難易度 " + (quiz.difficulty || difficulty);

    updateBattleHp();
    q.textContent = quiz.question;
    opt.textContent = "";

    this._answering = false;
    const cmds = QuizEngine.shuffleChoices(quiz);
    cmds.forEach((cmd) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cmd-index";
      btn.dataset.cmd = cmd.label;
      btn.textContent = cmd.text;
      bindTapButton(btn, () => {
        this.handleAnswer(cmd.text, quiz.correctAnswer, treasure);
      });
      opt.appendChild(btn);
    });

    hideMessage();
    hideOverlay("treasure-choice");
    box.classList.remove("hidden");
    setUiLocked(true);
    Renderer.draw();
  },

  handleAnswer(selected, correct, treasure) {
    if (this._answering) return;
    this._answering = true;
    document.getElementById("quiz-box").classList.add("hidden");
    GameState.revealed.push(treasure);
    GameState.isQuiz = false;
    GameState.pendingBattle = null;
    setUiLocked(false);

    if (selected === correct) {
      playSound('seikai');
      const tip = this.currentExplanation
        ? ("正解！ " + this.currentExplanation)
        : "正解！ミミックをたおした！";
      showMessage(tip);
      setTimeout(hideMessage, tip.length > 40 ? 3200 : 1800);
      Renderer.draw();
      return;
    }

    playSound('fuseikai');
    setTimeout(() => { playSound('kamituku'); }, 250);

    const dead = GameEngine.takeDamage(1, "ミミックにやられてしまった...");
    if (!dead) {
      showMessage("不正解！たいりょくが1へった！");
      setTimeout(hideMessage, 1600);
    }
    Renderer.draw();
  }
};

function updateHpDisplay() {
  const el = document.getElementById("hp-display");
  if (!el) return;
  el.textContent = "";
  for (let i = 0; i < GameState.maxHp; i++) {
    const span = document.createElement("span");
    span.className = "heart" + (i < GameState.hp ? "" : " empty");
    span.textContent = i < GameState.hp ? "♥" : "♡";
    el.appendChild(span);
  }
  updateBattleHp();
}

function updateBattleHp() {
  const el = document.getElementById("battle-hero-hp");
  if (!el) return;
  let hearts = "";
  for (let i = 0; i < GameState.maxHp; i++) {
    hearts += i < GameState.hp ? "♥" : "♡";
  }
  el.textContent = hearts;
}

function updateTreasureCount() {
  const el = document.getElementById("treasure-count");
  if (!el) return;
  const left = GameState.treasures.filter(t =>
    !t.isMimic && !t.isGoal &&
    !GameState.revealed.some(r => r.x === t.x && r.y === t.y)
  ).length;
  el.textContent = left;
}

function showMessage(text) {
  const m = document.getElementById("message");
  m.textContent = text;
  m.classList.remove("hidden");
}

function hideMessage() {
  document.getElementById("message").classList.add("hidden");
}

function showModal(modal) {
  modal.classList.remove("hidden");
}

function hideModal(modal) {
  modal.classList.add("hidden");
}

function hideOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("hidden");
}

function setUiLocked(locked) {
  const maze = document.querySelector(".maze-container");
  const controls = document.querySelector(".controls");
  if (maze) maze.classList.toggle("ui-locked", !!locked);
  // 選択・バトル中は十字だけ薄くする（A/Bは使える）
  if (controls) controls.classList.toggle("ui-dim", !!locked);
}

function pressA() {
  vibrate(15);
  if (GameState.isChoosing) {
    TreasureChoice.open();
    return;
  }
  if (GameState.isQuiz || GameState.gameOver || GameState.gameClear) return;
  // 足元の宝箱選択を再トリガー（無視後の再開にも）
  GameState.ignoredStanding = null;
  GameEngine.checkEvents();
}

function pressB() {
  vibrate(15);
  if (GameState.isChoosing) {
    TreasureChoice.ignore();
  }
}

function updateTimeDisplay() {
  const el = document.getElementById("time");
  if (el) el.textContent = GameState.timeLeft;
}

function playSound(soundId) {
  if (Assets.sounds[soundId]) {
    Assets.sounds[soundId].currentTime = 0;
    Assets.sounds[soundId].play().catch(() => {});
  }
}

function vibrate(ms) {
  if (navigator.vibrate) {
    try { navigator.vibrate(ms); } catch (_) { /* ignore */ }
  }
}

let holdingIntervals = {
  up: null,
  down: null,
  left: null,
  right: null
};

function startHolding(direction, dx, dy) {
  if (holdingIntervals[direction]) return;
  vibrate(12);
  GameEngine.moveHero(dx, dy);
  holdingIntervals[direction] = setInterval(() => {
    GameEngine.moveHero(dx, dy);
  }, 100);
}

function stopHolding(direction) {
  if (holdingIntervals[direction]) {
    clearInterval(holdingIntervals[direction]);
    holdingIntervals[direction] = null;
  }
}

/** iOS: 1回の指操作で二重発火・選択・ズームを防ぐ */
function bindHoldButton(el, onStart, onEnd) {
  if (!el) return;
  let activeId = null;

  const start = (e) => {
    if (activeId !== null) return;
    e.preventDefault();
    e.stopPropagation();
    activeId = e.pointerId;
    try { el.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    el.classList.add("is-pressed");
    onStart();
  };

  const end = (e) => {
    if (activeId === null) return;
    if (e && e.pointerId != null && e.pointerId !== activeId) return;
    e && e.preventDefault && e.preventDefault();
    activeId = null;
    el.classList.remove("is-pressed");
    onEnd();
  };

  el.addEventListener("pointerdown", start);
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
  el.addEventListener("lostpointercapture", end);
  el.addEventListener("click", (e) => e.preventDefault());
  el.addEventListener("contextmenu", (e) => e.preventDefault());
}

function bindTapButton(el, fn) {
  if (!el) return;
  let locked = false;
  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { el.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    if (locked) return;
    locked = true;
    el.classList.add("is-pressed");
    fn();
  });
  const unlock = (e) => {
    if (e) e.preventDefault();
    locked = false;
    el.classList.remove("is-pressed");
  };
  el.addEventListener("pointerup", unlock);
  el.addEventListener("pointercancel", unlock);
  el.addEventListener("lostpointercapture", unlock);
  el.addEventListener("click", (e) => e.preventDefault());
  el.addEventListener("contextmenu", (e) => e.preventDefault());
}

function installIosGuards() {
  // ダブルタップズーム防止（ios-game-base）
  let lastTap = 0;
  document.addEventListener("touchstart", (e) => {
    const now = Date.now();
    if (now - lastTap < 300) e.preventDefault();
    lastTap = now;
  }, { passive: false });

  // 連続 touchend によるゴーストクリック／ズーム補助防止
  let lastTouchEnd = 0;
  document.addEventListener("touchend", (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });

  document.addEventListener("touchmove", (e) => {
    // タイトル画面の縦スクロールだけ許可
    const title = document.getElementById("title-screen");
    if (title && !title.classList.contains("hidden")) {
      if (title.contains(e.target)) return;
    }
    // バトルログ内の縦スクロールだけ許可
    const log = e.target.closest && e.target.closest(".battle-log");
    if (log) return;
    e.preventDefault();
  }, { passive: false });

  document.addEventListener("dblclick", (e) => e.preventDefault(), { capture: true });
  document.addEventListener("contextmenu", (e) => e.preventDefault(), { capture: true });
  document.addEventListener("selectstart", (e) => e.preventDefault(), { capture: true });
  document.addEventListener("dragstart", (e) => e.preventDefault(), { capture: true });
  document.addEventListener("gesturestart", (e) => e.preventDefault(), { passive: false });
  document.addEventListener("gesturechange", (e) => e.preventDefault(), { passive: false });

  // URLバー表示変化でも収まる
  const onViewport = () => {
    if (document.getElementById("game-root")?.classList.contains("hidden")) return;
    GameEngine.resizeCanvas();
    Renderer.draw();
  };
  window.addEventListener("resize", onViewport);
  window.addEventListener("orientationchange", () => setTimeout(onViewport, 200));
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", onViewport);
  }
}

function startAdventure() {
  const title = document.getElementById("title-screen");
  const root = document.getElementById("game-root");
  if (Assets.sounds.bgm) {
    Assets.sounds.bgm.currentTime = 0;
    Assets.sounds.bgm.play().catch(() => {});
  }
  title.classList.add("hidden");
  root.classList.remove("hidden");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      GameEngine.init({ resetHp: true });
    });
  });
}

function setupEventListeners() {
  installIosGuards();

  const dirs = [
    { id: "up", key: "up", dx: 0, dy: -1 },
    { id: "down", key: "down", dx: 0, dy: 1 },
    { id: "left", key: "left", dx: -1, dy: 0 },
    { id: "right", key: "right", dx: 1, dy: 0 }
  ];

  dirs.forEach(({ id, key, dx, dy }) => {
    const btn = document.getElementById(id);
    bindHoldButton(
      btn,
      () => startHolding(key, dx, dy),
      () => stopHolding(key)
    );
  });

  document.addEventListener("keydown", (e) => {
    const map = {
      ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
      ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0], d: [1, 0], D: [1, 0]
    };
    if (e.key === "a" || e.key === "A") {
      if (!e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        GameEngine.moveHero(-1, 0);
      }
      return;
    }
    if (map[e.key]) {
      e.preventDefault();
      GameEngine.moveHero(map[e.key][0], map[e.key][1]);
      return;
    }
    if (e.key === " " || e.key === "Enter" || e.key === "x" || e.key === "X" || e.key === "k" || e.key === "K") {
      e.preventDefault();
      pressA();
      return;
    }
    if (e.key === "z" || e.key === "Z" || e.key === "j" || e.key === "J" || e.key === "Escape") {
      e.preventDefault();
      pressB();
    }
  });

  bindTapButton(document.getElementById("btn-a"), pressA);
  bindTapButton(document.getElementById("btn-b"), pressB);
  bindTapButton(document.getElementById("choice-open"), () => TreasureChoice.open());
  bindTapButton(document.getElementById("choice-ignore"), () => TreasureChoice.ignore());
  bindTapButton(document.getElementById("restart-button"), () => {
    GameState.level = 1;
    GameEngine.init({ resetHp: true });
    hideModal(document.getElementById("game-over-modal"));
  });
  bindTapButton(document.getElementById("clear-restart-button"), () => {
    GameState.level = 1;
    GameEngine.init({ resetHp: true });
    hideModal(document.getElementById("game-clear-modal"));
  });
  bindTapButton(document.getElementById("start-button"), startAdventure);
}

document.addEventListener("DOMContentLoaded", () => {
  Renderer.init();
  setupEventListeners();
  updateHpDisplay();

  if (typeof QuizEngine !== "undefined" && typeof QUIZ_NEWS_PACK !== "undefined") {
    QuizEngine.setPack(QUIZ_NEWS_PACK);
  }

  Assets.load(() => {
    const loading = document.getElementById("loading");
    if (loading) loading.classList.add("hidden");
  });
});
