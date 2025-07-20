// キャンバスの取得と初期化
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// キャラクター画像の読み込み
const playerImage = new Image();
playerImage.src = 'images/character.png'; // ←フォルダ名を追加

// プレイヤーの初期座標
let playerX = 128;
let playerY = 64;

// キャラ画像の幅と高さ（仮に64x64で描画）
const playerWidth = 64;
const playerHeight = 64;

// 画像の読み込み完了後に描画
playerImage.onload = () => {
  draw();
};

// キャラを描画する関数
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 画面クリア
  ctx.drawImage(playerImage, playerX, playerY, playerWidth, playerHeight); // キャラ描画
}