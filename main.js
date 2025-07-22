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
  gameOver: false,
  gameClear: false,
  collected: [] // コレクションアイテムを管理
};

const Assets = {
  images: {},
  sounds: {},
  load(callback) {
    const imgList = ["hero", "treasure", "mimic", "coin", "flag"];
    const soundList = ["bgm", "seikai", "fuseikai", "takara", "kamituku"];
    let total = imgList.length;
    let loaded = 0;

    // 画像読み込み
    imgList.forEach(name => {
      const img = new Image();
      img.src = `./images/${name}.png`;
      img.onload = () => {
        Assets.images[name] = img;
        loaded++;
        if (loaded === total) callback();
      };
      img.onerror = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 48;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = name === 'hero' ? '#0066cc' : 
                        name === 'treasure' ? '#ffaa00' :
                        name === 'mimic' ? '#cc0000' : '#gold';
        ctx.fillRect(0, 0, 48, 48);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(name.substr(0,4), 24, 28);
        Assets.images[name] = canvas;
        loaded++;
        if (loaded === total) callback();
      };
    });

    // 音声読み込み
    soundList.forEach(id => {
      const audio = document.getElementById(id);
      if (audio) {
        Assets.sounds[id] = audio;
      }
    });

    // BGM自動再生のためのユーザー操作待機
    function unlockBGM() {
      if (Assets.sounds["bgm"]) {
        Assets.sounds["bgm"].play().catch(() => {});
      }
      window.removeEventListener("click", unlockBGM);
      window.removeEventListener("touchstart", unlockBGM);
    }
    window.addEventListener("click", unlockBGM);
    window.addEventListener("touchstart", unlockBGM);
  }
};

const Renderer = {
  canvas: document.getElementById("mazeCanvas"),
  ctx: null,
  init() {
    this.ctx = this.canvas.getContext("2d");
  },
  draw() {
    const { maze, size, cellSize, hero, treasures, revealed } = GameState;
    const ctx = this.ctx;
    const offsetX = this.canvas.width / 2 - hero.x * cellSize - cellSize / 2;
    const offsetY = this.canvas.height / 2 - hero.y * cellSize - cellSize / 2;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 迷路を描画
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const px = x * cellSize + offsetX;
        const py = y * cellSize + offsetY;
        
        // 画面外なら描画しない（最適化）
        if (px > this.canvas.width || py > this.canvas.height || 
            px + cellSize < 0 || py + cellSize < 0) continue;
            
        ctx.fillStyle = maze[y][x] === 1 ? "#333" : "#fff";
        ctx.fillRect(px, py, cellSize, cellSize);
        
        // 壁の境界線
        if (maze[y][x] === 1) {
          ctx.strokeStyle = "#222";
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, cellSize, cellSize);
        }
      }
    }

    // 宝物を描画
    treasures.forEach(t => {
      const px = t.x * cellSize + offsetX;
      const py = t.y * cellSize + offsetY;
      
      // 画面外なら描画しない
      if (px > this.canvas.width || py > this.canvas.height || 
          px + cellSize < 0 || py + cellSize < 0) return;
          
      const found = revealed.some(r => r.x === t.x && r.y === t.y);
      let img;
      if (t.isGoal) {
        img = Assets.images.flag || Assets.images.treasure;
      } else {
        img = found ? (t.isMimic ? Assets.images.mimic : Assets.images.coin) : Assets.images.treasure;
      }
      
      if (img) {
        ctx.drawImage(img, px, py, cellSize, cellSize);
      } else {
        // 画像がない場合の代替描画
        ctx.fillStyle = found ? (t.isMimic ? '#cc0000' : '#gold') : '#ffaa00';
        ctx.fillRect(px, py, cellSize, cellSize);
      }
    });

    // ヒーローを描画（常に中央）
    const heroImg = Assets.images.hero;
    if (heroImg) {
      ctx.drawImage(heroImg, this.canvas.width / 2 - cellSize / 2, this.canvas.height / 2 - cellSize / 2, cellSize, cellSize);
    } else {
      // 代替描画
      ctx.fillStyle = '#0066cc';
      ctx.fillRect(this.canvas.width / 2 - cellSize / 2, this.canvas.height / 2 - cellSize / 2, cellSize, cellSize);
    }

    // 残り宝箱数の表示（ゴール・ミミック以外）
    if (document.getElementById('treasure-count')) {
      const left = treasures.filter(t => !t.isMimic && !t.isGoal && !revealed.some(r => r.x === t.x && r.y === t.y)).length;
      document.getElementById('treasure-count').textContent = left;
    }
  }
};

const GameEngine = {
  init() {
    document.getElementById("level").textContent = GameState.level;
    GameState.size = Math.min(10 + Math.floor(GameState.level * 1.5), 40);
    this.resizeCanvas(); // Changed from rresizeCanvas to resizeCanvas
    GameState.hero = { x: 1, y: 1 };
    GameState.gameOver = false;
    GameState.gameClear = false;
    GameState.isQuiz = false;
    GameState.revealed = [];
    GameState.usedMimics = [];
    this.generateMaze();
    this.placeTreasures();
    Renderer.draw();
  },
  
  resizeCanvas() { // Renamed from rresizeCanvas to resizeCanvas
    const container = document.querySelector('.maze-container');
    const containerSize = Math.min(container.clientWidth, container.clientHeight, 1200);
    Renderer.canvas.width = containerSize;
    Renderer.canvas.height = containerSize;
  },
  
  generateMaze() {
    const size = GameState.size;
    const maze = Array(size).fill().map(() => Array(size).fill(1));
    const stack = [];
    
    // スタート地点
    maze[1][1] = 0;
    stack.push({ x: 1, y: 1 });

    while (stack.length) {
      const current = stack[stack.length - 1];
      const dirs = [];
      
      // 移動可能方向をチェック
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

    // 入口と出口
    maze[1][0] = 0;
    const gx = size - 2;
    const gy = size - 2;
    maze[gy][gx] = 0; // ゴール座標を必ず通路に
    maze[size - 2][size - 1] = 0;
    GameState.maze = maze;
  },
  
  placeTreasures() {
    const count = Math.floor(GameState.size / 5) + 1;
    const placed = [];
    GameState.treasures = [];

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let ok = false;
      while (!ok && attempts < 100) {
        const x = Math.floor(Math.random() * (GameState.size - 2)) + 1;
        const y = Math.floor(Math.random() * (GameState.size - 2)) + 1;
        if (
          GameState.maze[y] && GameState.maze[y][x] === 0 &&
          Math.abs(x - GameState.hero.x) + Math.abs(y - GameState.hero.y) > 3 &&
          !placed.some(p => p.x === x && p.y === y)
        ) {
          const isMimic = Math.random() < 0.3;
          GameState.treasures.push({ x, y, isMimic });
          placed.push({ x, y });
          ok = true;
        }
        attempts++;
      }
    }

    // 隠し宝箱（コレクションアイテム）を1つ配置
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
        GameState.treasures.push({ x, y, isHidden: true, collectionId: 1 });
        placed.push({ x, y });
        hiddenPlaced = true;
      }
      hiddenAttempts++;
    }

    // ゴール宝物
    const gx = GameState.size - 2;
    const gy = GameState.size - 2;
    if (GameState.maze[gy] && GameState.maze[gy][gx] === 0) {
      GameState.treasures.push({ x: gx, y: gy, isMimic: false, isGoal: true });
    }
  },
  
  moveHero(dx, dy) {
    if (GameState.gameOver || GameState.gameClear || GameState.isQuiz) return;
    
    const nx = GameState.hero.x + dx;
    const ny = GameState.hero.y + dy;
    
    if (
      nx >= 0 && ny >= 0 &&
      nx < GameState.size && ny < GameState.size &&
      GameState.maze[ny] && GameState.maze[ny][nx] === 0
    ) {
      GameState.hero.x = nx;
      GameState.hero.y = ny;
      this.checkEvents();
      Renderer.draw();
    }
  },
  
  checkEvents() {
    for (let t of GameState.treasures) {
      if (
        t.x === GameState.hero.x &&
        t.y === GameState.hero.y &&
        !GameState.revealed.some(r => r.x === t.x && r.y === t.y)
      ) {
        if (t.isMimic) {
          if (!GameState.usedMimics.some(m => m.x === t.x && m.y === t.y)) {
            playSound('kamituku');
            GameState.isQuiz = true;
            GameState.usedMimics.push(t);
            showMessage("ミミックだった！質問に答えよう！");
            setTimeout(() => {
              hideMessage();
              QuizSystem.show(t);
            }, 1500);
          }
        } else if (t.isGoal) {
          // ゴール以外の宝物リスト
          const nonGoalTreasures = GameState.treasures.filter(x => !x.isMimic && !x.isGoal);
          const allFound = nonGoalTreasures.length === 0 ||
            nonGoalTreasures.every(t => GameState.revealed.some(r => r.x === t.x && r.y === t.y));
          if (allFound) {
            playSound('takara');
            GameState.revealed.push(t);
            if (GameState.level < 10) {
              GameState.level++;
              showMessage(`ゴール！レベル${GameState.level}へ進む！`);
              setTimeout(() => {
                hideMessage();
                GameEngine.init();
              }, 1500);
            } else {
              GameState.gameClear = true;
              showMessage("全てのレベルをクリアしました！");
              setTimeout(() => {
                hideMessage();
                showModal(document.getElementById("game-clear-modal"));
              }, 2000);
            }
          }
          // それ以外（宝箱が残っている場合）は何も反応しない
        } else if (t.isHidden) {
          playSound('seikai'); // ここは専用SEにしてもOK
          GameState.revealed.push(t);
          // コレクション取得管理（今後のUI用に）
          if (!GameState.collected) GameState.collected = [];
          if (!GameState.collected.includes(t.collectionId)) {
            GameState.collected.push(t.collectionId);
          }
          showMessage("✨隠し宝箱を発見！コレクションに追加されました！");
          setTimeout(hideMessage, 2000);
        } else {
          playSound('takara');
          GameState.revealed.push(t);
          showMessage("宝物を発見した！まだ他にもあるぞ！");
          setTimeout(hideMessage, 1500);
        }
        break;
      }
    }
  }
};

const QuizSystem = {
  usedQuestions: [],
  show(treasure) {
    // 未出題の問題だけからランダム出題
    let available = quizData.filter((_, i) => !this.usedQuestions.includes(i));
    if (available.length === 0) {
      this.usedQuestions = [];
      available = quizData.slice();
    }
    if (available.length === 0) {
      showMessage("クイズがありません！");
      setTimeout(hideMessage, 1500);
      GameState.isQuiz = false;
      return;
    }
    // ランダムに選ぶ
    const randomQuiz = available[Math.floor(Math.random() * available.length)];
    const idx = quizData.findIndex(q => q === randomQuiz);
    if (idx === -1) {
      showMessage("クイズがありません！");
      setTimeout(hideMessage, 1500);
      GameState.isQuiz = false;
      return;
    }
    this.usedQuestions.push(idx);
    const quiz = quizData[idx];
    const box = document.getElementById("quiz-box");
    const q = document.getElementById("quiz-question");
    const opt = document.getElementById("quiz-options");
    q.textContent = quiz.question;
    opt.innerHTML = "";
    quiz.options.forEach(option => {
      const btn = document.createElement("button");
      btn.textContent = option;
      btn.onclick = () => this.handleAnswer(option, quiz.answer, treasure);
      opt.appendChild(btn);
    });
    box.classList.remove("hidden");
  },
  
  handleAnswer(selected, correct, treasure) {
    document.getElementById("quiz-box").classList.add("hidden");
    GameState.revealed.push(treasure);
    GameState.isQuiz = false;
    
    if (selected === correct) {
      playSound('seikai');
      showMessage("正解！ミミックが消えた！");
      setTimeout(hideMessage, 1500);
    } else {
      playSound('fuseikai');
      setTimeout(() => { playSound('kamituku'); }, 300);
      GameState.gameOver = true;
      document.getElementById("game-over-reason").textContent = "ミミックに食べられてしまった...";
      showMessage("不正解！ゲームオーバー！");
      setTimeout(() => {
        hideMessage();
        showModal(document.getElementById("game-over-modal"));
      }, 1500);
    }
    Renderer.draw();
  }
};

// ユーティリティ関数
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

function playSound(soundId) {
  if (Assets.sounds[soundId]) {
    Assets.sounds[soundId].currentTime = 0;
    Assets.sounds[soundId].play().catch(() => {});
  }
}

// イベントリスナー設定
function setupEventListeners() {
  // ボタン操作
  document.getElementById("up").onclick = () => GameEngine.moveHero(0, -1);
  document.getElementById("down").onclick = () => GameEngine.moveHero(0, 1);
  document.getElementById("left").onclick = () => GameEngine.moveHero(-1, 0);
  document.getElementById("right").onclick = () => GameEngine.moveHero(1, 0);

  // タッチ操作（スマホ対応）
  const upBtn = document.getElementById("up");
  const downBtn = document.getElementById("down");
  const leftBtn = document.getElementById("left");
  const rightBtn = document.getElementById("right");

  upBtn.addEventListener('touchstart', (e) => { e.preventDefault(); GameEngine.moveHero(0, -1); });
  upBtn.addEventListener('touchend', (e) => { e.preventDefault(); });
  downBtn.addEventListener('touchstart', (e) => { e.preventDefault(); GameEngine.moveHero(0, 1); });
  downBtn.addEventListener('touchend', (e) => { e.preventDefault(); });
  leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); GameEngine.moveHero(-1, 0); });
  leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); });
  rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); GameEngine.moveHero(1, 0); });
  rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); });

  // キーボード操作
  document.addEventListener("keydown", (e) => {
    switch(e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        e.preventDefault();
        GameEngine.moveHero(0, -1);
        break;
      case "ArrowDown":
      case "s":
      case "S":
        e.preventDefault();
        GameEngine.moveHero(0, 1);
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        e.preventDefault();
        GameEngine.moveHero(-1, 0);
        break;
      case "ArrowRight":
      case "d":
      case "D":
        e.preventDefault();
        GameEngine.moveHero(1, 0);
        break;
    }
  });

  // モーダル操作
  document.getElementById("restart-button").onclick = () => {
    GameState.level = 1;
    GameEngine.init();
    hideModal(document.getElementById("game-over-modal"));
  };

  document.getElementById("clear-restart-button").onclick = () => {
    GameState.level = 1;
    GameEngine.init();
    hideModal(document.getElementById("game-clear-modal"));
  };

  // リサイズ対応
  window.addEventListener("resize", () => {
    GameEngine.resizeCanvas();
    Renderer.draw();
  });
}

// クイズデータ（main.jsに統合）
const quizData = [
  { question: "[算数] 1mは何cm？", options: ["10cm", "100cm", "1000cm"], answer: "100cm" },
  { question: "[理科] 雨の後にできるものは？", options: ["雲", "風", "虹"], answer: "虹" },
  { question: "[社会] 海に囲まれた国は？", options: ["日本", "中国", "ロシア"], answer: "日本" },
  { question: "[算数] 三角形の角の和は？", options: ["90度", "180度", "360度"], answer: "180度" },
  { question: "[理科] 春に咲く花は？", options: ["ひまわり", "たんぽぽ", "あさがお"], answer: "たんぽぽ" },
  { question: "[理科] 月は自分で光る？", options: ["はい", "いいえ"], answer: "いいえ" },
  { question: "[国語] 『山』を使った熟語は？", options: ["川山", "火山", "土山"], answer: "火山" },
  { question: "[社会] 外国と物を売り買いすることを？", options: ["運送", "貿易", "取引"], answer: "貿易" },
  { question: "[算数] 九九の7×8は？", options: ["56", "63", "48"], answer: "56" },
  { question: "[理科] 植物が光を受けて作るものは？", options: ["酸素", "二酸化炭素", "水"], answer: "酸素" }
];

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  Renderer.init();
  setupEventListeners();

  // ゲーム本体を非表示、スタートボタン表示
  document.querySelector('.game-container').style.display = 'none';
  document.getElementById('start-button').classList.remove('hidden');

  document.getElementById('start-button').onclick = () => {
    // BGM再生
    if (Assets.sounds["bgm"]) {
      Assets.sounds["bgm"].currentTime = 0;
      Assets.sounds["bgm"].play().catch(() => {});
    }
    // ゲーム本体表示、スタートボタン非表示
    document.querySelector('.game-container').style.display = '';
    document.getElementById('start-button').classList.add('hidden');
    GameEngine.init();
  };

  document.getElementById("loading").classList.remove("hidden");

  Assets.load(() => {
    document.getElementById("loading").classList.add("hidden");
    // GameEngine.init(); ←スタートボタンで呼ぶのでここは不要
  });
});
