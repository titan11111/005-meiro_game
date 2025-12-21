// ゲーム状態管理
const gameState = {
    currentQuestion: 0,
    score: 0,
    lives: 3,
    questions: [],
    selectedQuestions: [],
    isAnswering: false,
    isSoundEnabled: true,
    bgmStarted: false
};

// クイズデータ（JSONから抜粋した100問）
const allQuizData = [
    {"question": "日本で一番高い山は？", "options": ["北岳", "富士山", "南アルプス", "八ヶ岳"], "correct": 1},
    {"question": "太陽が上る方向は？", "options": ["西", "南", "東", "北"], "correct": 2},
    {"question": "1年は何日？", "options": ["365日", "360日", "370日", "350日"], "correct": 0},
    {"question": "世界で一番大きい大陸は？", "options": ["アフリカ大陸", "アジア大陸", "南米大陸", "北米大陸"], "correct": 1},
    {"question": "ペンギンはどこに住んでいる？", "options": ["北極", "赤道付近", "南極", "砂漠"], "correct": 2},
    {"question": "クジラの大きさで一番大きいのは？", "options": ["ザトウクジラ", "マッコウクジラ", "シロナガスクジラ", "イッカク"], "correct": 2},
    {"question": "地球の表面のほとんどは？", "options": ["砂漠", "森", "水", "山"], "correct": 2},
    {"question": "虹は何の色でできている？", "options": ["赤・青・緑", "赤・橙・黄・緑・青・藍・紫", "赤・黄・青", "白と黒"], "correct": 1},
    {"question": "人間が1日に飲む水はどれくらい？", "options": ["1リットル", "2リットル", "5リットル", "10リットル"], "correct": 1},
    {"question": "電球を発明したのは？", "options": ["ニュートン", "エジソン", "ダ・ヴィンチ", "ファラデー"], "correct": 1},
    {"question": "蜂蜜を作るのは？", "options": ["トンボ", "ミツバチ", "テントウムシ", "アリ"], "correct": 1},
    {"question": "人間の骨は何本？", "options": ["150本", "206本", "300本", "400本"], "correct": 1},
    {"question": "ダイヤモンドは何からできている？", "options": ["砂", "氷", "炭素", "塩"], "correct": 2},
    {"question": "バナナの皮が黄色くなるのは？", "options": ["日に当たると", "熟れると", "雨が当たると", "風が吹くと"], "correct": 1},
    {"question": "パンダが1日に食べる竹は？", "options": ["1kg", "5kg", "10kg以上", "100kg"], "correct": 2},
    {"question": "キリンの首の骨は何個？", "options": ["7個", "15個", "20個", "50個以上"], "correct": 0},
    {"question": "蜘蛛の足は何本？", "options": ["4本", "6本", "8本", "10本"], "correct": 2},
    {"question": "月はどのくらいで地球を1周する？", "options": ["1日", "1週間", "1ヶ月", "1年"], "correct": 2},
    {"question": "雪が白いのは？", "options": ["氷が白いから", "小さな氷の粒の間に空気があるから", "塩が入っているから", "光を反射しないから"], "correct": 1},
    {"question": "風はなぜ吹く？", "options": ["誰かが吹いている", "気温の差で空気が動く", "木が揺れるから", "ランダムに起こる"], "correct": 1},
    {"question": "サボテンはなぜ針がある？", "options": ["敵から身を守る", "水を集めるため", "動物に食べられないため", "全部あっている"], "correct": 3},
    {"question": "人間の心臓は1分間に何回動く？", "options": ["30回", "60～80回", "150回", "300回"], "correct": 1},
    {"question": "あくびはなぜうつる？", "options": ["病気だから", "リラックスしているから", "脳の同調作用", "眠いから"], "correct": 2},
    {"question": "お腹が鳴るのはなぜ？", "options": ["臓器が動いているから", "ガスが動くから", "筋肉が収縮するから", "信号が送られてるから"], "correct": 2},
    {"question": "ピラミッドはどこにある？", "options": ["インカ帝国", "エジプト", "メキシコ", "イスラエル"], "correct": 1},
    {"question": "自由の女神はどこにある？", "options": ["フランス", "イギリス", "アメリカ", "カナダ"], "correct": 2},
    {"question": "万里の長城はどこにある？", "options": ["日本", "韓国", "中国", "モンゴル"], "correct": 2},
    {"question": "サハラ砂漠はどこにある？", "options": ["中東", "アフリカ", "オーストラリア", "南米"], "correct": 1},
    {"question": "パリはどこの国の首都？", "options": ["イギリス", "フランス", "ドイツ", "イタリア"], "correct": 1},
    {"question": "東京はどこにある？", "options": ["関西", "関東", "九州", "北海道"], "correct": 1},
    {"question": "七夕はいつ？", "options": ["1月1日", "7月7日", "12月25日", "11月3日"], "correct": 1},
    {"question": "ひな祭りはいつ？", "options": ["1月3日", "3月3日", "5月5日", "9月9日"], "correct": 1},
    {"question": "こどもの日はいつ？", "options": ["3月3日", "4月1日", "5月5日", "6月1日"], "correct": 2},
    {"question": "野球の1試合は何イニング？", "options": ["3イニング", "6イニング", "9イニング", "12イニング"], "correct": 2},
    {"question": "オリンピックは何年ごとに開かれる？", "options": ["1年", "2年", "4年", "8年"], "correct": 2},
    {"question": "マラソンの距離は？", "options": ["10km", "21km", "42.195km", "50km"], "correct": 2},
    {"question": "寿司はどこの国の料理？", "options": ["中国", "タイ", "日本", "コリア"], "correct": 2},
    {"question": "ピザはどこが発祥？", "options": ["アメリカ", "フランス", "イタリア", "スペイン"], "correct": 2},
    {"question": "ラーメンはどこから伝わった？", "options": ["アメリカ", "中国", "フランス", "タイ"], "correct": 1},
    {"question": "カレーはどこが発祥？", "options": ["タイ", "インド", "日本", "マレーシア"], "correct": 1}
];

// DOM要素の取得
const screens = {
    start: document.getElementById('startScreen'),
    game: document.getElementById('gameScreen'),
    gameOver: document.getElementById('gameOverScreen'),
    clear: document.getElementById('clearScreen')
};

const elements = {
    startBtn: document.getElementById('startBtn'),
    retryBtn: document.getElementById('retryBtn'),
    restartBtn: document.getElementById('restartBtn'),
    currentStage: document.getElementById('currentStage'),
    questionText: document.getElementById('questionText'),
    answersContainer: document.getElementById('answersContainer'),
    feedbackMessage: document.getElementById('feedbackMessage'),
    lifeHearts: document.getElementById('lifeHearts'),
    door: document.getElementById('door'),
    doorLock: document.getElementById('doorLock'),
    doorProgressBar: document.getElementById('doorProgressBar'),
    lightEffect: document.getElementById('lightEffect'),
    effectLayer: document.getElementById('effectLayer'),
    finalCorrect: document.getElementById('finalCorrect'),
    clearCorrect: document.getElementById('clearCorrect'),
    remainingLife: document.getElementById('remainingLife'),
    confettiContainer: document.getElementById('confettiContainer'),
    bgmAudio: document.getElementById('bgmAudio'),
    soundToggle: document.getElementById('soundToggle'),
    progressText: document.getElementById('progressText')
};

// イベントリスナーの設定
elements.startBtn.addEventListener('click', startGame);
elements.retryBtn.addEventListener('click', startGame);
elements.restartBtn.addEventListener('click', startGame);
elements.soundToggle.addEventListener('click', toggleSound);

// 脱出進行状況メッセージ
const progressMessages = [
    "暗い倉庫に閉じ込められている...",
    "扉の鍵が少し緩んできた！",
    "光が少し見えてきた...",
    "扉が動き始めた！",
    "もう少しで開きそう...",
    "扉が半分開いた！",
    "外の空気を感じる...",
    "あと少しで脱出できる！",
    "扉がほぼ開いた！",
    "もうすぐ自由だ！",
    "脱出成功！"
];

// ゲーム開始
function startGame() {
    // 状態をリセット
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.isAnswering = false;
    
    // BGMを開始（初回のみユーザー操作が必要）
    if (!gameState.bgmStarted) {
        startBGM();
        gameState.bgmStarted = true;
    }
    
    // 10問をランダムに選択
    gameState.selectedQuestions = selectRandomQuestions(10);
    
    // 画面切り替え
    hideAllScreens();
    screens.game.classList.add('active');
    
    // UI初期化
    resetHearts();
    updateDoorProgress();
    elements.door.classList.remove('opening');
    elements.doorLock.textContent = '🔒';
    elements.lightEffect.classList.remove('on');
    elements.progressText.textContent = progressMessages[0];
    
    // 最初の問題を表示
    showQuestion();
}

// ランダムに問題を選択
function selectRandomQuestions(count) {
    const shuffled = [...allQuizData].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// 問題表示
function showQuestion() {
    if (gameState.currentQuestion >= gameState.selectedQuestions.length) {
        showClear();
        return;
    }
    
    const question = gameState.selectedQuestions[gameState.currentQuestion];
    
    // 問題番号更新
    elements.currentStage.textContent = gameState.currentQuestion + 1;
    
    // 問題文表示
    elements.questionText.textContent = question.question;
    
    // 選択肢表示
    elements.answersContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = `${index + 1}. ${option}`;
        button.addEventListener('click', () => checkAnswer(index));
        elements.answersContainer.appendChild(button);
    });
    
    // フィードバックをクリア
    elements.feedbackMessage.textContent = '';
    elements.feedbackMessage.className = 'feedback-message';
    
    gameState.isAnswering = false;
}

// 答え合わせ
function checkAnswer(selectedIndex) {
    if (gameState.isAnswering) return;
    
    gameState.isAnswering = true;
    const question = gameState.selectedQuestions[gameState.currentQuestion];
    const buttons = elements.answersContainer.querySelectorAll('.answer-btn');
    
    // ボタンを無効化
    buttons.forEach(btn => btn.disabled = true);
    
    if (selectedIndex === question.correct) {
        // 正解
        gameState.score++;
        buttons[selectedIndex].classList.add('correct');
        elements.feedbackMessage.textContent = '正解！扉が開いていく...';
        elements.feedbackMessage.className = 'feedback-message correct';
        
        // 正解エフェクト
        playCorrectEffect();
        
        // 進捗更新
        updateDoorProgress();
        
        setTimeout(() => {
            gameState.currentQuestion++;
            showQuestion();
        }, 2000);
    } else {
        // 不正解
        buttons[selectedIndex].classList.add('wrong');
        buttons[question.correct].classList.add('correct');
        elements.feedbackMessage.textContent = '不正解！警報が鳴る！';
        elements.feedbackMessage.className = 'feedback-message wrong';
        
        // 不正解エフェクト
        playWrongEffect();
        
        // ライフ減少
        gameState.lives--;
        updateHearts();
        
        if (gameState.lives <= 0) {
            setTimeout(() => {
                showGameOver();
            }, 2000);
        } else {
            setTimeout(() => {
                gameState.currentQuestion++;
                showQuestion();
            }, 2500);
        }
    }
}

// 正解エフェクト
function playCorrectEffect() {
    // ドアが少し開く
    elements.door.classList.add('opening');
    setTimeout(() => {
        elements.door.classList.remove('opening');
    }, 500);
    
    // ライトが点灯
    elements.lightEffect.classList.add('on');
    setTimeout(() => {
        elements.lightEffect.classList.remove('on');
    }, 1000);
    
    // BGMの音量を一時的に下げて正解感を演出
    if (gameState.isSoundEnabled && elements.bgmAudio) {
        const originalVolume = elements.bgmAudio.volume;
        elements.bgmAudio.volume = 0.15;
        setTimeout(() => {
            elements.bgmAudio.volume = originalVolume;
        }, 1000);
    }
}

// 不正解エフェクト
function playWrongEffect() {
    // アラーム効果
    elements.effectLayer.classList.add('alarm');
    setTimeout(() => {
        elements.effectLayer.classList.remove('alarm');
    }, 1500);
    
    // 暗転効果
    setTimeout(() => {
        elements.effectLayer.classList.add('darkness');
        setTimeout(() => {
            elements.effectLayer.classList.remove('darkness');
        }, 2000);
    }, 500);
    
    // BGMの音量を一時的に下げて不正解感を演出
    if (gameState.isSoundEnabled && elements.bgmAudio) {
        const originalVolume = elements.bgmAudio.volume;
        elements.bgmAudio.volume = 0.05;
        setTimeout(() => {
            elements.bgmAudio.volume = originalVolume;
        }, 2000);
    }
}

// ドアの進捗更新
function updateDoorProgress() {
    const progress = (gameState.score / 10) * 100;
    elements.doorProgressBar.style.width = progress + '%';
    
    // 進行状況メッセージを更新
    const messageIndex = Math.min(Math.floor(gameState.score), progressMessages.length - 1);
    elements.progressText.textContent = progressMessages[messageIndex];
    elements.progressText.classList.add('updating');
    setTimeout(() => {
        elements.progressText.classList.remove('updating');
    }, 500);
    
    if (progress >= 100) {
        elements.doorLock.textContent = '🔓';
        elements.door.classList.add('opening');
        elements.progressText.textContent = progressMessages[progressMessages.length - 1];
    } else if (progress >= 50) {
        elements.doorLock.textContent = '🔐';
    }
}

// ハート更新
function updateHearts() {
    const hearts = elements.lifeHearts.querySelectorAll('.heart');
    hearts.forEach((heart, index) => {
        if (index >= gameState.lives) {
            heart.classList.add('lost');
        }
    });
}

// ハートリセット
function resetHearts() {
    const hearts = elements.lifeHearts.querySelectorAll('.heart');
    hearts.forEach(heart => {
        heart.classList.remove('lost');
    });
}

// ゲームオーバー画面表示
function showGameOver() {
    hideAllScreens();
    screens.gameOver.classList.add('active');
    elements.finalCorrect.textContent = gameState.score;
    
    // BGMの音量を下げる（悲しい雰囲気を演出）
    adjustBGMVolume(0.1);
}

// クリア画面表示
function showClear() {
    hideAllScreens();
    screens.clear.classList.add('active');
    elements.clearCorrect.textContent = gameState.score;
    elements.remainingLife.textContent = gameState.lives;
    
    // BGMの音量を上げる（祝福の雰囲気を演出）
    adjustBGMVolume(0.5);
    
    // 紙吹雪エフェクト
    createConfetti();
}

// 紙吹雪作成
function createConfetti() {
    const colors = ['#ff6b6b', '#4caf50', '#ffd700', '#2196f3', '#9c27b0'];
    elements.confettiContainer.innerHTML = '';
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (3 + Math.random() * 2) + 's';
        elements.confettiContainer.appendChild(confetti);
    }
}

// 全画面非表示
function hideAllScreens() {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
}

// 初期化
window.addEventListener('DOMContentLoaded', () => {
    // スタート画面を表示
    hideAllScreens();
    screens.start.classList.add('active');
});

// タッチイベントの最適化（モバイル対応）
document.addEventListener('touchstart', function(e) {
    // タッチ開始時の処理
}, {passive: true});

document.addEventListener('touchmove', function(e) {
    // スクロール防止
    if (e.target.closest('.screen.active')) {
        e.preventDefault();
    }
}, {passive: false});

// ウィンドウリサイズ対応
window.addEventListener('resize', () => {
    // 画面サイズに応じた調整
    adjustLayout();
});

function adjustLayout() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// 初回レイアウト調整
adjustLayout();

// BGM制御関数
function startBGM() {
    if (elements.bgmAudio && gameState.isSoundEnabled) {
        elements.bgmAudio.volume = 0.3; // 音量を30%に設定（うるさすぎないように）
        elements.bgmAudio.play().catch(err => {
            console.log('BGM自動再生がブロックされました:', err);
        });
    }
}

function stopBGM() {
    if (elements.bgmAudio) {
        elements.bgmAudio.pause();
    }
}

function toggleSound() {
    gameState.isSoundEnabled = !gameState.isSoundEnabled;
    
    const soundOn = elements.soundToggle.querySelector('.sound-on');
    const soundOff = elements.soundToggle.querySelector('.sound-off');
    
    if (gameState.isSoundEnabled) {
        // 音声ON
        soundOn.style.display = 'block';
        soundOff.style.display = 'none';
        elements.soundToggle.classList.remove('muted');
        if (gameState.bgmStarted) {
            startBGM();
        }
    } else {
        // 音声OFF
        soundOn.style.display = 'none';
        soundOff.style.display = 'block';
        elements.soundToggle.classList.add('muted');
        stopBGM();
    }
}

// BGMの音量調整（クリア画面とゲームオーバー画面用）
function adjustBGMVolume(volume) {
    if (elements.bgmAudio) {
        elements.bgmAudio.volume = Math.max(0, Math.min(1, volume));
    }
}