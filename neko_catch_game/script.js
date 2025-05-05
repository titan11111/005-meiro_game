// 猫の鳴き声3つをランダムで再生する準備
const meowSounds = [
  document.getElementById('meow1'),
  document.getElementById('meow2'),
  document.getElementById('meow3')
];

function playRandomMeow() {
  const index = Math.floor(Math.random() * meowSounds.length);
  meowSounds[index].play();
}

// ゲームの要素を取得
const cat = document.getElementById('cat');
const basket = document.getElementById('basket');
const scoreDisplay = document.getElementById('score');
const missesDisplay = document.getElementById('misses');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');

// 初期設定
let catX = Math.random() * 340;
let catY = 0;
let basketX = 150;
let score = 0;
let misses = 0;
let isGameOver = false;
let speed = 3; // 猫の初期スピード

// クリックでカゴを動かす
document.addEventListener('click', function(e) {
  const rect = document.getElementById('gameArea').getBoundingClientRect();
  basketX = e.clientX - rect.left - 50; // カゴの幅に合わせる
  basket.style.left = basketX + 'px';
});

// メインゲームループ
function gameLoop() {
  if (isGameOver) return;

  catY += speed; // 猫が落ちるスピード
  cat.style.top = catY + 'px';
  cat.style.left = catX + 'px';

  // キャッチ判定
  if (catY > 530 && Math.abs(catX - basketX) < 60) {
    score += 1;
    scoreDisplay.textContent = score;
    playRandomMeow(); // ランダムにゃーを再生！
    increaseSpeed(); // スピードアップ
    resetCat(); // 猫をリセット
  }

  // 地面に落ちたらミス
  if (catY > 600) {
    misses += 1;
    missesDisplay.textContent = misses;
    if (misses >= 3) { // ミスは3回まで
      endGame();
    } else {
      resetCat();
    }
  }

  requestAnimationFrame(gameLoop); // 次のフレームへ
}

// 猫の位置リセット
function resetCat() {
  catX = Math.random() * 340;
  catY = 0;
}

// スコアに応じてスピードアップ
function increaseSpeed() {
  if (score % 5 === 0) { // 5点ごとに速く
    speed += 1;
  }
}

// ゲームオーバー処理
function endGame() {
  isGameOver = true;
  finalScoreDisplay.textContent = score;
  gameOverScreen.style.display = 'block';
}

// ゲームを再スタート
function restartGame() {
  score = 0;
  misses = 0;
  catY = 0;
  speed = 3;
  isGameOver = false;
  scoreDisplay.textContent = score;
  missesDisplay.textContent = misses;
  gameOverScreen.style.display = 'none';
  gameLoop();
}

// ゲームスタート
gameLoop();