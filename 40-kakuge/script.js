// キャンバスとコンテキストの取得
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

// 定数
const GRAVITY = 0.8;
const FLOOR_Y = GAME_HEIGHT - 50;
const SPEED = 5;

// 入力状態を保持するオブジェクト
const keys = {};

// キャラクタークラス（棒人間）
class Stickman {
    constructor(x, color) {
        this.x = x;
        this.y = FLOOR_Y;
        this.color = color;
        this.vy = 0; // 垂直速度
        this.isJumping = false;
        this.width = 20;
        this.height = 80;
    }

    // 描画処理（棒人間）
    draw() {
        ctx.fillStyle = this.color;
        
        // 矩形として描画 (簡易)
        ctx.fillRect(this.x - this.width / 2, this.y - this.height, this.width, this.height);
        
        // テスト用の関節点 (頭)
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.height, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // ※ 本格的な関節モーションは、この部分に関節ごとの描画ロジックが必要になります。
    }

    // 状態更新
    update() {
        // 左右移動
        if (this.color === 'red') { // プレイヤー1 (例: A/D)
            if (keys['KeyA']) this.x -= SPEED;
            if (keys['KeyD']) this.x += SPEED;
        }
        
        // 簡易ジャンプ
        if (this.isJumping) {
            this.y -= this.vy;
            this.vy -= GRAVITY;
            
            if (this.y >= FLOOR_Y) {
                this.y = FLOOR_Y;
                this.isJumping = false;
                this.vy = 0;
            }
        }
        
        // 画面外に出ないように制限
        if (this.x < 0) this.x = 0;
        if (this.x > GAME_WIDTH) this.x = GAME_WIDTH;
    }

    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.vy = 18; // ジャンプ初速
        }
    }
}

// キャラクターのインスタンス化 (アッシュとサイバーKの代わり)
const ash = new Stickman(200, 'red');
const cyberk = new Stickman(GAME_WIDTH - 200, 'blue');

// ===== 入力イベントリスナー =====
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    // プレイヤー1のジャンプ (Wキー)
    if (e.code === 'KeyW') {
        ash.jump();
    }
    // TODO: 他のキー操作 (パンチ、キック、IMPACT) のロジックを追加
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// ===== メインゲームループ =====
function gameLoop() {
    // 1. 描画クリア
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 2. ステージの描画 (地面)
    ctx.fillStyle = '#444'; 
    ctx.fillRect(0, FLOOR_Y, GAME_WIDTH, GAME_HEIGHT - FLOOR_Y);

    // 3. キャラクターの状態更新
    ash.update();
    cyberk.update();

    // 4. キャラクターの描画
    ash.draw();
    cyberk.draw();

    // ループ継続
    requestAnimationFrame(gameLoop);
}

// ゲーム開始
gameLoop();