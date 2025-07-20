// ゲームの設定
let score = 0;
let timeLeft = 30;
let gameRunning = false;
let gameInterval;
let catInterval;
let isTouching = false;

// HTMLの要素を取得
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const playAgainBtn = document.getElementById('playAgainBtn');
const spots = document.querySelectorAll('.spot');
const cats = document.querySelectorAll('.cat');
const scoreCommentElement = document.getElementById('scoreComment');

// 鳴き声ファイルを配列で用意（6,7マス目はnyan8.mp3）
const catSounds = [
  new Audio('audio/nyan.mp3'),
  new Audio('audio/nyan2.mp3'),
  new Audio('audio/nyan3.mp3'),
  new Audio('audio/nyan4.mp3'),
  new Audio('audio/nyan5.mp3'),
  new Audio('audio/nyan8.mp3'), // 6マス目
  new Audio('audio/nyan8.mp3'), // 7マス目
  new Audio('audio/nyan8.mp3'),
  new Audio('audio/nyan9.mp3')
];

// ゲーム開始
function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    score = 0;
    timeLeft = 30;
    
    updateScore();
    updateTime();
    
    startBtn.textContent = 'ゲーム中...';
    startBtn.disabled = true;
    gameOverElement.style.display = 'none';
    
    // 猫を定期的に出現させる
    catInterval = setInterval(showRandomCat, 800);
    
    // タイマーを開始
    gameInterval = setInterval(() => {
        timeLeft--;
        updateTime();
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// ランダムな猫を表示
function showRandomCat() {
    // 既に表示されている猫を隠す
    hideAllCats();
    
    // ランダムな場所を選択
    const randomSpot = Math.floor(Math.random() * spots.length);
    const cat = spots[randomSpot].querySelector('.cat');
    
    // 猫を表示
    cat.classList.add('show');
    
    // 1.8秒後に猫を隠す
    setTimeout(() => {
        cat.classList.remove('show');
    }, 1800);
}

// 全ての猫を隠す
function hideAllCats() {
    cats.forEach(cat => {
        cat.classList.remove('show');
        cat.classList.remove('clicked');
    });
}

// 猫がクリックまたはタッチされた時
function catchCat(event) {
    if (!gameRunning) return;
    // タッチとクリックの二重発火防止
    if (event.type === 'touchstart') {
        if (isTouching) return;
        isTouching = true;
    }
    const cat = event.target;
    
    // 猫が表示されている場合のみ
    if (cat.classList.contains('show')) {
        cat.classList.add('clicked');
        cat.classList.remove('show');
        
        // スコアを増加
        score += 10;
        updateScore();
        
        // どのマスかを取得
        const spot = cat.closest('.spot');
        const spotId = spot ? spot.id : null; // 例: spot1, spot2, ...
        if (spotId) {
            const index = parseInt(spotId.replace('spot', '')) - 1;
            if (catSounds[index]) {
                catSounds[index].currentTime = 0; // 連打対応
                catSounds[index].play();
            }
        }
        
        // 効果音の代わりに振動（スマホ対応）
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // 0.5秒後にクリック効果を削除
        setTimeout(() => {
            cat.classList.remove('clicked');
        }, 500);
    }
}

// スコアを更新
function updateScore() {
    scoreElement.textContent = score;
    // スコアに応じたコメント
    let comment = '';
    if (score <= 30) {
        comment = 'これからが本番！猫ちゃんも応援してるよ！';
    } else if (score <= 60) {
        comment = 'すごい！猫ちゃんもなついてきたみたい！';
    } else if (score <= 90) {
        comment = '猫マスターの素質あり！みんな集まってきた！';
    } else if (score <= 120) {
        comment = '猫界のヒーロー！猫たちがあなたを慕ってる！';
    } else {
        comment = '伝説のキャットキャッチャー！猫神様もびっくり！';
    }
    scoreCommentElement.textContent = comment;
}

// 時間を更新
function updateTime() {
    timeElement.textContent = timeLeft;
    
    // 残り時間が少なくなったら色を変更
    if (timeLeft <= 10) {
        timeElement.style.color = '#dc3545';
        timeElement.style.fontWeight = 'bold';
    } else {
        timeElement.style.color = '#007bff';
        timeElement.style.fontWeight = 'normal';
    }
}

// ゲーム終了
function endGame() {
    gameRunning = false;
    
    // インターバルを停止
    clearInterval(gameInterval);
    clearInterval(catInterval);
    
    // 全ての猫を隠す
    hideAllCats();
    
    // ボタンを元に戻す
    startBtn.textContent = 'ゲームスタート';
    startBtn.disabled = false;
    
    // 最終スコアを表示
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

// ゲームをリセット
function resetGame() {
    gameRunning = false;
    
    // インターバルを停止
    clearInterval(gameInterval);
    clearInterval(catInterval);
    
    // 値をリセット
    score = 0;
    timeLeft = 30;
    
    // 表示を更新
    updateScore();
    updateTime();
    
    // 全ての猫を隠す
    hideAllCats();
    
    // ボタンを元に戻す
    startBtn.textContent = 'ゲームスタート';
    startBtn.disabled = false;
    
    // ゲームオーバー画面を隠す
    gameOverElement.style.display = 'none';
}

// イベントリスナーを追加
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', resetGame);

// 各猫にクリックイベントを追加
cats.forEach(cat => {
    cat.addEventListener('click', catchCat);
});

// スマホのタッチイベントにも対応
cats.forEach(cat => {
    cat.addEventListener('touchstart', catchCat);
    cat.addEventListener('touchend', () => { isTouching = false; });
});

// ページ読み込み時の初期化
window.addEventListener('load', () => {
    updateScore();
    updateTime();
    hideAllCats();
});