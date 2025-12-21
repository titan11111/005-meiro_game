const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dialogueBox = document.getElementById('dialogueBox');
const bgm = document.getElementById('bgm');

// === マップ設定 ===
const mapWidth = 20;
const mapHeight = 15;
const tileSize = 32;

// タイル定義（0:草, 1:道, 2:家, 3:学校）
const map = [
 [3,3,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2],
 [3,3,1,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,2],
 [1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,2],
 [0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
 [0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
 [0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
 [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0]
];

// プレイヤー初期位置
let player = {x: 3, y: 10};

// イベント設定
const events = [
 {x: 3, y: 1, text: "……学校、終わった。"},
 {x: 6, y: 6, text: "通学路の桜、もう散ってる。"},
 {x: 14, y: 7, text: "道の向こうに夕陽が見える。"},
 {x: 15, y: 1, text: "ただいま……。"}
];

// === 初期化 ===
function init() {
  draw();
  showDialogue("放課後——家に帰ろう。");
  bgm.volume = 0.5;
  bgm.play().catch(() => {
    console.log("音声はクリック後に再生されます。");
  });
}
init();

// === 移動処理 ===
document.addEventListener('keydown', e => {
  if (dialogueBox.style.display === 'block') {
    dialogueBox.style.display = 'none';
    return;
  }
  let dx = 0, dy = 0;
  if (e.key === 'ArrowUp') dy = -1;
  if (e.key === 'ArrowDown') dy = 1;
  if (e.key === 'ArrowLeft') dx = -1;
  if (e.key === 'ArrowRight') dx = 1;
  const nx = player.x + dx;
  const ny = player.y + dy;
  if (nx >= 0 && nx < mapWidth && ny >= 0 && ny < mapHeight) {
    if (map[ny][nx] !== 0) {
      player.x = nx;
      player.y = ny;
      checkEvent();
    }
  }
  draw();
});

// === 描画 ===
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      let color;
      switch (map[y][x]) {
        case 0: color = "#205020"; break; // 草
        case 1: color = "#c2b280"; break; // 道
        case 2: color = "#808080"; break; // 家
        case 3: color = "#003366"; break; // 学校
      }
      ctx.fillStyle = color;
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
  ctx.fillStyle = "#ffcccc"; // プレイヤー
  ctx.fillRect(player.x * tileSize, player.y * tileSize, tileSize, tileSize);
}

// === イベント確認 ===
function checkEvent() {
  for (let ev of events) {
    if (ev.x === player.x && ev.y === player.y) {
      showDialogue(ev.text);
      if (ev.text === "ただいま……。") {
        setTimeout(() => {
          alert("END：今日も一日、おつかれさま。");
        }, 500);
      }
    }
  }
}

// === ダイアログ表示 ===
function showDialogue(text) {
  dialogueBox.textContent = text;
  dialogueBox.style.display = 'block';
}
