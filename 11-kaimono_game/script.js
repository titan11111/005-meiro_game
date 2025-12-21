// ============================================
// オーディオ管理システム
// ============================================

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.isInitialized = false;
        this.volume = 0.5;
        
        // オーディオファイルの初期化
        this.bgm = null;
        this.seikaiSound = null;
        this.fuseikaiSound = null;
        this.levelupSound = null;
        this.maouSound = null;
    }
    
    // オーディオコンテキストを初期化（ユーザーインタラクション後に実行）
    initAudioContext() {
        if (this.isInitialized) return;
        
        try {
            // AudioContextの作成
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Suspended状態の場合は再開
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log('AudioContext resumed');
                });
            }
            
            // Audioオブジェクトの作成と初期化
            this.createAudioElements();
            this.isInitialized = true;
            console.log('AudioManager initialized');
        } catch (error) {
            console.warn('AudioContext initialization error:', error);
        }
    }
    
    // Audioエレメントを作成
    createAudioElements() {
        this.bgm = new Audio('audio/field.mp3');
        this.bgm.loop = true;
        this.bgm.volume = this.volume * 0.7; // BGMは少し小さめ
        
        this.seikaiSound = new Audio('audio/seikai2.mp3');
        this.seikaiSound.volume = this.volume;
        
        this.fuseikaiSound = new Audio('audio/fuseikai2.mp3');
        this.fuseikaiSound.volume = this.volume;
        
        this.levelupSound = new Audio('audio/levelup.mp3');
        this.levelupSound.volume = this.volume;
        
        this.maouSound = new Audio('audio/maou.mp3');
        this.maouSound.volume = this.volume * 0.8;
    }
    
    // BGMを再生
    playBGM() {
        if (!this.isInitialized || !this.bgm) return;
        
        this.bgm.currentTime = 0;
        const playPromise = this.bgm.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('BGM再生エラー:', error.message);
            });
        }
    }
    
    // BGMを停止
    stopBGM() {
        if (!this.bgm) return;
        this.bgm.pause();
        this.bgm.currentTime = 0;
    }
    
    // 成功音を再生
    playSuccessSound() {
        if (!this.isInitialized || !this.seikaiSound) return;
        
        this.seikaiSound.currentTime = 0;
        const playPromise = this.seikaiSound.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('成功音再生エラー:', error.message);
            });
        }
    }
    
    // 失敗音を再生
    playFailureSound() {
        if (!this.isInitialized || !this.fuseikaiSound) return;
        
        this.fuseikaiSound.currentTime = 0;
        const playPromise = this.fuseikaiSound.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('失敗音再生エラー:', error.message);
            });
        }
    }
    
    // レベルアップ音を再生
    playLevelupSound() {
        if (!this.isInitialized || !this.levelupSound) return;
        
        this.levelupSound.currentTime = 0;
        const playPromise = this.levelupSound.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('レベルアップ音再生エラー:', error.message);
            });
        }
    }
    
    // ゲームオーバー音を再生
    playGameOverSound() {
        if (!this.isInitialized || !this.maouSound) return;
        
        this.maouSound.currentTime = 0;
        const playPromise = this.maouSound.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('ゲームオーバー音再生エラー:', error.message);
            });
        }
    }
}

// グローバルなオーディオマネージャー
const audioManager = new AudioManager();

// ============================================
// ゲーム状態管理
// ============================================

let gameState = {
    money: 20000,
    trust: 100,
    day: 1,
    selectedItem: null,
    currentCustomer: null,
    inventory: []
};

// 商品データベース（20種類）
// 現実的な仕入値と売値（日本のスケール）
// 本物：仕入値に対して30～50%の利幅
// 偽物：低仕入値で本物より高い価格で売却、見破られるリスクあり
const productDatabase = {
    // アクセサリー系
    watch:     { name: '腕時計', icon: '⌚', realCost: 2000, realPrice: 3500, fakeCost: 400, fakePrice: 4200 },
    bag:       { name: 'バッグ', icon: '👜', realCost: 3000, realPrice: 5000, fakeCost: 600, fakePrice: 6500 },
    ring:      { name: 'リング', icon: '💍', realCost: 800, realPrice: 1500, fakeCost: 150, fakePrice: 2200 },
    necklace:  { name: 'ネックレス', icon: '📿', realCost: 1500, realPrice: 2500, fakeCost: 300, fakePrice: 3800 },
    bracelet:  { name: 'ブレスレット', icon: '💎', realCost: 900, realPrice: 1700, fakeCost: 180, fakePrice: 2500 },
    
    // ファッション系（上）
    tshirt:    { name: 'Tシャツ', icon: '👕', realCost: 400, realPrice: 800, fakeCost: 80, fakePrice: 1200 },
    jacket:    { name: 'ジャケット', icon: '🧥', realCost: 2500, realPrice: 4500, fakeCost: 500, fakePrice: 6000 },
    sweater:   { name: 'セーター', icon: '🧶', realCost: 1500, realPrice: 2800, fakeCost: 300, fakePrice: 4000 },
    
    // ファッション系（ボトム）
    jeans:     { name: 'ジーンズ', icon: '👖', realCost: 1800, realPrice: 3500, fakeCost: 360, fakePrice: 4800 },
    skirt:     { name: 'スカート', icon: '👗', realCost: 1200, realPrice: 2200, fakeCost: 240, fakePrice: 3200 },
    
    // 靴類
    shoes:     { name: '靴', icon: '👟', realCost: 2000, realPrice: 3800, fakeCost: 400, fakePrice: 5200 },
    boots:     { name: 'ブーツ', icon: '👢', realCost: 2500, realPrice: 4500, fakeCost: 500, fakePrice: 6200 },
    loafer:    { name: 'ローファー', icon: '👞', realCost: 1800, realPrice: 3500, fakeCost: 360, fakePrice: 4800 },
    
    // 小物類
    glasses:   { name: 'サングラス', icon: '🕶️', realCost: 1200, realPrice: 2200, fakeCost: 240, fakePrice: 3500 },
    belt:      { name: 'ベルト', icon: '🔗', realCost: 600, realPrice: 1200, fakeCost: 120, fakePrice: 1800 },
    wallet:    { name: '財布', icon: '👛', realCost: 1200, realPrice: 2200, fakeCost: 240, fakePrice: 3200 },
    scarf:     { name: 'スカーフ', icon: '🧣', realCost: 600, realPrice: 1200, fakeCost: 120, fakePrice: 1800 },
    cap:       { name: 'キャップ', icon: '🧢', realCost: 800, realPrice: 1500, fakeCost: 160, fakePrice: 2200 },
    gloves:    { name: '手袋', icon: '🧤', realCost: 400, realPrice: 900, fakeCost: 80, fakePrice: 1300 },
    earrings:  { name: 'ピアス', icon: '✨', realCost: 700, realPrice: 1400, fakeCost: 140, fakePrice: 2100 }
};

const productKeys = Object.keys(productDatabase);

// お客さんのタイプ（目利きレベル付き）
const customerTypes = [
    { request: 'watch', message: '腕時計が欲しいです', baseDetectChance: 20, level: 1 },
    { request: 'bag', message: 'バッグが欲しいです', baseDetectChance: 30, level: 2 },
    { request: 'shoes', message: '靴が欲しいです', baseDetectChance: 25, level: 1 },
    { request: 'glasses', message: 'サングラスが欲しいです', baseDetectChance: 28, level: 2 },
    { request: 'necklace', message: 'ネックレスが欲しいです', baseDetectChance: 32, level: 2 },
    { request: 'ring', message: 'リングが欲しいです', baseDetectChance: 26, level: 1 },
    { request: 'tshirt', message: 'Tシャツが欲しいです', baseDetectChance: 22, level: 1 },
    { request: 'jacket', message: 'ジャケットが欲しいです', baseDetectChance: 35, level: 2 },
    { request: 'jeans', message: 'ジーンズが欲しいです', baseDetectChance: 24, level: 1 },
    { request: 'belt', message: 'ベルトが欲しいです', baseDetectChance: 20, level: 1 },
    { request: 'boots', message: 'ブーツが欲しいです', baseDetectChance: 28, level: 2 },
    { request: 'wallet', message: '財布が欲しいです', baseDetectChance: 23, level: 1 }
];

// ============================================
// DOM要素の取得
// ============================================

const titleScreen = document.getElementById('title-screen');
const gameScreen = document.getElementById('game-screen');
const startBtn = document.getElementById('start-btn');

const moneyDisplay   = document.getElementById('money');
const trustDisplay   = document.getElementById('trust');
const dayDisplay     = document.getElementById('day');
const customerRequestDisplay = document.getElementById('customer-request');
const customerLevelDisplay = document.getElementById('customer-level');
const customerMessageDisplay = document.getElementById('customer-message');
const itemsGrid      = document.querySelector('.items-grid');
const sellBtn        = document.getElementById('sell-btn');
const lieBtn         = document.getElementById('lie-btn');
const upgradeBtn     = document.getElementById('upgrade-btn');
const resultArea     = document.getElementById('result-area');
const resultTitle    = document.getElementById('result-title');
const resultMessage  = document.getElementById('result-message');
const resultReaction = document.getElementById('result-reaction');
const nextBtn        = document.getElementById('next-btn');
const gameoverArea   = document.getElementById('gameover-area');
const finalScoreDisplay    = document.getElementById('final-score');
const finalMessageDisplay  = document.getElementById('final-message');
const restartBtn     = document.getElementById('restart-btn');
const helpBtn        = document.getElementById('help-btn');
const helpModal      = document.getElementById('help-modal');
const closeModalBtn  = document.getElementById('close-modal');

// ============================================
// ユーティリティ関数
// ============================================

// 目利きレベルを★で表示する関数
function getLevelStars(level) {
    const maxLevel = 5;
    const filledStars = Math.min(level, maxLevel);
    const emptyStars = maxLevel - filledStars;
    return '★'.repeat(filledStars) + '☆'.repeat(emptyStars);
}

// インベントリを生成（要望商品1つ+ランダムに5種類を選択）
function generateInventory(requestedProduct) {
    const inventory = [];
    
    // 要望商品を1個目に追加
    inventory.push({
        id: 0,
        type: requestedProduct,
        isReal: false,
        quality: Math.floor(Math.random() * 5) + 1
    });
    
    // 残り5種類をランダムに選択（要望商品を除いた19種類からランダムに5個）
    const remainingProducts = productKeys.filter(key => key !== requestedProduct);
    const shuffled = remainingProducts.sort(() => Math.random() - 0.5).slice(0, 5);
    
    // 残り5個に異なる商品を1個ずつ追加
    for (let i = 0; i < 5; i++) {
        inventory.push({
            id: i + 1,
            type: shuffled[i],
            isReal: false,
            quality: Math.floor(Math.random() * 5) + 1
        });
    }
    
    // シャッフル
    inventory.sort(() => Math.random() - 0.5);
    
    gameState.inventory = inventory;
    return inventory;
}

// ============================================
// UI更新関数
// ============================================

function updateUI() {
    moneyDisplay.textContent = gameState.money;
    trustDisplay.textContent = gameState.trust;
    dayDisplay.textContent = gameState.day;

    // アクションボタンの状態を更新
    sellBtn.disabled    = gameState.selectedItem === null;
    lieBtn.disabled     = gameState.selectedItem === null;
    upgradeBtn.disabled = gameState.selectedItem === null || gameState.money < 1000;
}

// 商品を表示
function displayInventory() {
    itemsGrid.innerHTML = '';
    
    gameState.inventory.forEach((item, index) => {
        const productInfo = productDatabase[item.type];
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.dataset.index = index;
        itemDiv.innerHTML = `
            <div class="item-icon">${productInfo.icon}</div>
            <div class="item-name">${productInfo.name}</div>
            <div class="item-price">${productInfo.fakePrice}円</div>
            <div class="item-status">偽物</div>
        `;
        
        itemDiv.addEventListener('click', () => {
            selectItem(index);
        });
        
        itemsGrid.appendChild(itemDiv);
    });
}

// アイテム選択
function selectItem(itemIndex) {
    // 以前に選択されたアイテムのselectedクラスを削除
    document.querySelectorAll('.item.selected').forEach(el => {
        el.classList.remove('selected');
    });

    gameState.selectedItem = itemIndex;

    // 新しく選択されたアイテムにselectedクラスを追加
    if (itemIndex !== null) {
        document.querySelector(`.item[data-index="${itemIndex}"]`).classList.add('selected');
    }
    updateUI();
}

// 結果表示
function showResult(title, message, reaction = '😐') {
    resultTitle.textContent   = title;
    resultMessage.textContent = message;
    resultReaction.textContent = reaction;
    resultArea.style.display  = 'flex';
    
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }
}

// ゲームオーバー表示
function showGameOver() {
    // BGMを停止
    audioManager.stopBGM();

    finalScoreDisplay.textContent = `最終スコア: ${gameState.money}円`;
    if (gameState.money >= 30000) {
        finalMessageDisplay.textContent = "すごい！あなたは一流の商人です！";
    } else if (gameState.money >= 20000) {
        finalMessageDisplay.textContent = "よく頑張りました！";
    } else {
        finalMessageDisplay.textContent = "残念！次はもっと頑張ろう！";
    }
    gameoverArea.style.display = 'flex';

    // ゲームオーバー音楽を再生
    audioManager.playGameOverSound();

    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

// タイトル画面に戻る
function goToTitle() {
    // 音声を全て停止
    audioManager.stopBGM();

    // ゲーム状態をリセット
    gameState = {
        money: 20000,
        trust: 100,
        day: 1,
        selectedItem: null,
        currentCustomer: null,
        inventory: []
    };

    // UI表示を切り替え
    gameScreen.style.display = 'none';
    gameoverArea.style.display = 'none';
    resultArea.style.display = 'none';
    titleScreen.style.display = 'flex';
}

// ゲームリセット
function resetGame() {
    gameState = {
        money: 20000,
        trust: 100,
        day: 1,
        selectedItem: null,
        currentCustomer: null,
        inventory: []
    };
    gameoverArea.style.display = 'none';
    resultArea.style.display   = 'none';
    startGameplay();
}

// お客さんを生成
function generateCustomer() {
    const randomIndex = Math.floor(Math.random() * customerTypes.length);
    const customer = { ...customerTypes[randomIndex] };
    
    // 目利きレベルを日数で上げる
    let baseLevel = customer.level;
    const dayBonus = Math.floor((gameState.day - 1) / 2);
    customer.level = Math.min(baseLevel + dayBonus, 5);
    customer.detectChance = customer.baseDetectChance + (gameState.day - 1) * 4;
    if (customer.detectChance > 85) customer.detectChance = 85;
    
    gameState.currentCustomer = customer;

    // 表示更新
    customerRequestDisplay.textContent = `「${customer.message}」`;
    customerLevelDisplay.textContent = getLevelStars(customer.level);

    // ランダム画像設定
    const imgIndex = Math.floor(Math.random() * 10) + 1;
    const customerImg = document.getElementById('customer-img');
    customerImg.src = `images/customer_${imgIndex}.png`;

    // インベントリを生成
    generateInventory(customer.request);
    displayInventory();
    selectItem(null);
    
    // メッセージ更新
    customerMessageDisplay.textContent = '商品を選んでください...';
}

// ゲーム開始
function startGameplay() {
    updateUI();

    // BGMを再生（オーディオマネージャーを初期化してから）
    audioManager.initAudioContext();
    audioManager.playBGM();

    generateCustomer();
}

// ============================================
// イベントリスナー設定
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // スタートボタン - ここでオーディオを初期化
    startBtn.addEventListener('click', () => {
        // オーディオコンテキストを初期化（ユーザーインタラクション）
        audioManager.initAudioContext();
        
        titleScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        startGameplay();
    });

    // そのまま渡すボタン
    sellBtn.addEventListener('click', () => {
        if (gameState.selectedItem === null) {
            showResult('エラー', '商品を選んでください！', '❌');
            return;
        }
        
        const selectedItem = gameState.inventory[gameState.selectedItem];
        const productInfo = productDatabase[selectedItem.type];
        let message  = '';
        let title    = '';
        let reaction = '';

        // 偽物を偽物のまま売る（見破られるリスク）
        const detectChance = gameState.currentCustomer.detectChance;
        const isDetected = Math.random() * 100 < detectChance;

        if (isDetected) {
            // 見破られた
            gameState.trust = Math.max(0, gameState.trust - 25);
            title   = '見破られた...';
            message = `${productInfo.name}は偽物でした！\nお客さんに見破られて信頼度が25下がりました...。\n(お客さんの目利き: ${getLevelStars(gameState.currentCustomer.level)})`;
            reaction = '😠';
            audioManager.playFailureSound();
        } else {
            // 見破られなかった
            const fakeProfit = productInfo.fakePrice - productInfo.fakeCost;
            gameState.money += fakeProfit;
            title   = '成功！';
            message = `偽物を売って、売上${productInfo.fakePrice}円ー仕入${productInfo.fakeCost}円で、${fakeProfit}円の利益をゲット！`;
            reaction = '😊';
            audioManager.playSuccessSound();
        }
        showResult(title, message, reaction);
    });

    // ウソをつくボタン
    lieBtn.addEventListener('click', () => {
        if (gameState.selectedItem === null) {
            showResult('エラー', '商品を選んでください！', '❌');
            return;
        }
        
        const selectedItem = gameState.inventory[gameState.selectedItem];
        const productInfo = productDatabase[selectedItem.type];
        const successChance = 100 - gameState.currentCustomer.detectChance;
        const isSuccess     = Math.random() * 100 < successChance;
        let message         = '';
        let title           = '';
        let reaction        = '';

        if (isSuccess) {
            const liedPrice = productInfo.fakePrice * 2;
            const liedProfit = liedPrice - productInfo.fakeCost;
            gameState.money += liedProfit;
            title   = '大成功！';
            message = `偽物を本物だと言って売って、売上${liedPrice}円ー仕入${productInfo.fakeCost}円で、${liedProfit}円の利益をゲット！`;
            reaction = '🤑';
            audioManager.playSuccessSound();
        } else {
            gameState.trust = Math.max(0, gameState.trust - 35);
            title   = '大失敗...';
            message = `ウソがバレました！\nお客さんが激怒して信頼度が35下がりました...。\n(お客さんの目利き: ${getLevelStars(gameState.currentCustomer.level)})`;
            reaction = '😱';
            audioManager.playFailureSound();
        }
        showResult(title, message, reaction);
    });

    // 本物に交換ボタン
    upgradeBtn.addEventListener('click', () => {
        if (gameState.selectedItem === null) {
            showResult('エラー', '商品を選んでください！', '❌');
            return;
        }
        if (gameState.money < 1000) {
            showResult('お金が足りません！', '本物に交換するには1,000円必要です。', '💸');
            audioManager.playFailureSound();
            return;
        }
        
        const selectedItem = gameState.inventory[gameState.selectedItem];
        const productInfo = productDatabase[selectedItem.type];

        const realProfit = productInfo.realPrice - 1000;
        gameState.money -= 1000;
        gameState.money += productInfo.realPrice;
        gameState.trust = Math.min(100, gameState.trust + 8);
        
        showResult('交換成功！', `本物に交換して売って、売上${productInfo.realPrice}円ー仕入1000円で、${realProfit}円の利益をゲット！`, '✨');
        audioManager.playSuccessSound();
    });

    // 次のお客さんボタン
    nextBtn.addEventListener('click', () => {
        resultArea.style.display = 'none';

        audioManager.playLevelupSound();

        gameState.day++;
        if (gameState.trust <= 0) {
            showGameOver();
        } else {
            generateCustomer();
            updateUI();
        }
    });

    // タイトルへ戻るボタン
    restartBtn.addEventListener('click', goToTitle);

    // ヘルプボタン
    helpBtn.addEventListener('click', () => {
        helpModal.style.display = 'flex';
    });

    // モーダルを閉じるボタン
    closeModalBtn.addEventListener('click', () => {
        helpModal.style.display = 'none';
    });

    // モーダル外クリックで閉じる
    window.addEventListener('click', (event) => {
        if (event.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });
});