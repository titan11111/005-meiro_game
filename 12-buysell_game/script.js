// ===== ゲームデータ初期化 =====
let gameState = {
    money: 1000,
    day: 1,
    trust: 50,
    level: 1,
    experience: 0,
    inventory: [],
    shopInventory: [],
    dailyBuyCost: 0,
    dailySellIncome: 0,
    dailyCustomerCount: 0,
    displayMode: 'normal',
    maxMoney: 10000,
    clearGoal: 15000,
};

let audioEnabled = false;

const CLEAR_CONDITIONS = [
    { day: 10, money: 3000 },
    { day: 15, money: 5000 },
    { day: 20, money: 8000 },
    { day: 25, money: 15000 },
];

const SELLERS = [
    {
        name: '宇宙商人ゼータ',
        story: '「故郷の星で見つけた古い部品です。現金が必要で...」',
        portrait: '👽',
    },
    {
        name: 'ロボット商人R-1000',
        story: '「効率的な取引を望みます。いかがでしょうか？」',
        portrait: '🤖',
    },
    {
        name: '火星からの訪問者',
        story: '「地球の商品に興味があります。売りませんか？」',
        portrait: '🔴',
    },
    {
        name: '謎の宇宙人レクス',
        story: '「ヒューヒュー。これ、すごく珍しいんです...」',
        portrait: '👾',
    },
    {
        name: 'AIトレーダー',
        story: '「データ分析によると、これは価値があります」',
        portrait: '🤝',
    },
];

const ITEMS = [
    { name: '古代エンジン部品', emoji: '⚙️', basePrice: 100 },
    { name: '星の欠片', emoji: '⭐', basePrice: 150 },
    { name: 'エイリアン鉱石', emoji: '💎', basePrice: 200 },
    { name: '宇宙塵', emoji: '✨', basePrice: 80 },
    { name: 'タイムカプセル', emoji: '📦', basePrice: 250 },
    { name: 'UFOパーツ', emoji: '🛸', basePrice: 180 },
    { name: '光の結晶', emoji: '💫', basePrice: 220 },
    { name: '古代文字の書物', emoji: '📚', basePrice: 120 },
];

const CUSTOMERS = [
    {
        name: 'コレクター太郎',
        need: '珍しい宇宙グッズを探してるんです',
        portrait: '👨',
        preferences: ['古代エンジン部品', '星の欠片'],
    },
    {
        name: 'おばあさん',
        need: 'かわいいものがあれば...それで十分です',
        portrait: '👵',
        preferences: ['星の欠片', '光の結晶'],
    },
    {
        name: 'スペースファン花子',
        need: 'UFO関連のものはありますか？',
        portrait: '👩',
        preferences: ['UFOパーツ', '宇宙塵'],
    },
    {
        name: '少年太郎',
        need: 'キラキラしたものが好きです！',
        portrait: '👦',
        preferences: ['光の結晶', '星の欠片'],
    },
    {
        name: 'サイエンティスト',
        need: '宇宙の謎を解く素材を探しています',
        portrait: '🧑‍🔬',
        preferences: ['エイリアン鉱石', 'タイムカプセル'],
    },
];

const MARKET_NEWS = [
    '「宇宙旅行ブームが到来！宇宙船関連商品が人気になりそうです。」',
    '「最近、古代エンジン部品の価値が上がっているそうです。」',
    '「星の欠片の需要が急増中です。」',
    '「エイリアン鉱石は富豪の間で大人気です。」',
    '「UFOパーツの価格相場が上昇しています。」',
    '「光の結晶は若い世代に流行中です。」',
    '「タイムカプセルは歴史好きから注目されています。」',
    '「宇宙塵が子供向けギフトとして人気です。」',
];

let currentSeller = null;
let currentCustomer = null;
let currentItem = null;
let highscores = JSON.parse(localStorage.getItem('highscores')) || [];

// ===== ゲーム初期化 =====
document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('start-btn');
    const soundToggleBtn = document.getElementById('sound-toggle-btn');
    
    // ゲーム開始ボタンのクリックイベント
    startBtn.addEventListener('click', startGame);
    
    // 音声切り替えボタンのクリックイベント
    soundToggleBtn.addEventListener('click', toggleSound);
});

// ===== スタート画面 =====
function startGame() {
    // スタート画面を非表示
    document.getElementById('start-screen').classList.remove('active');
    // ゲーム画面を表示
    document.getElementById('game-screen').classList.add('active');

    // 音声を有効化
    audioEnabled = true;
    document.getElementById('sound-toggle-btn').textContent = '🔊';
    
    // BGMを再生
    playBackgroundMusic();

    // ゲーム初期化
    updateStatus();
    generateSeller();
}

// ===== 音声管理 =====
function playSoundEffect(soundId) {
    if (!audioEnabled) return;
    
    const audio = document.getElementById(soundId);
    if (audio) {
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.warn('効果音再生エラー:', soundId, err);
            });
        }
    }
}

function playBackgroundMusic() {
    if (!audioEnabled) return;
    
    const bgm = document.getElementById('bgm-audio');
    if (bgm) {
        bgm.volume = 0.3;
        bgm.currentTime = 0;
        const playPromise = bgm.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.warn('BGM再生失敗:', err);
                console.info('音声再生がブロックされました。ゲーム内の画面をタップして再度お試しください。');
            });
        }
    }
}

function toggleSound() {
    audioEnabled = !audioEnabled;
    const btn = document.getElementById('sound-toggle-btn');
    
    if (audioEnabled) {
        btn.textContent = '🔊';
        playBackgroundMusic();
    } else {
        btn.textContent = '🔇';
        const bgm = document.getElementById('bgm-audio');
        if (bgm) {
            bgm.pause();
        }
    }
}

// ===== フェーズ切り替え =====
function showPhase(phaseName) {
    document.querySelectorAll('.phase-container').forEach(phase => {
        phase.classList.remove('active');
    });
    document.getElementById(phaseName).classList.add('active');
}

// ===== 仕入れフェーズ =====
function generateSeller() {
    playSoundEffect('se-talk');
    
    currentSeller = SELLERS[Math.floor(Math.random() * SELLERS.length)];
    currentItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];

    const offerPrice = Math.floor(
        currentItem.basePrice * (0.5 + Math.random() * 1)
    );

    document.getElementById('seller-portrait').textContent = currentSeller.portrait;
    document.getElementById('seller-name').textContent = currentSeller.name;
    document.getElementById('seller-story').textContent = currentSeller.story;
    document.getElementById('offer-icon').textContent = currentItem.emoji;
    document.getElementById('offer-name').textContent = currentItem.name;
    document.getElementById('offer-price').textContent = `希望価格: ${offerPrice}円`;

    currentItem.price = offerPrice;
}

function negotiate() {
    const style = document.querySelector(
        'input[name="negotiation_style"]:checked'
    ).value;

    let discount = 0;
    let trustChange = 0;

    if (style === 'kind') {
        discount = Math.floor(currentItem.price * 0.05);
        trustChange = 5;
    } else if (style === 'neutral') {
        discount = Math.floor(currentItem.price * 0.1);
        trustChange = 2;
    } else if (style === 'strict') {
        discount = Math.floor(currentItem.price * 0.2);
        trustChange = -5;
    }

    const finalPrice = Math.floor(currentItem.price - discount);

    if (gameState.money >= finalPrice) {
        playSoundEffect('se-success');
        
        gameState.money -= finalPrice;
        gameState.trust += trustChange;
        gameState.inventory.push({
            name: currentItem.name,
            emoji: currentItem.emoji,
            buyPrice: finalPrice,
        });
        gameState.dailyBuyCost += finalPrice;

        updateStatus();
        showMessage(`${currentItem.name}を${finalPrice}円で買いました！`);
        generateSeller();
    } else {
        playSoundEffect('se-error');
        showMessage('お金が足りません！');
    }
}

function skipBuy() {
    playSoundEffect('se-click');
    generateSeller();
}

function goToDisplayPhase() {
    playSoundEffect('se-transition');
    showPhase('display-phase');
    updateDisplayPhase();
}

// ===== 陳列フェーズ =====
function setDisplayMode(mode) {
    playSoundEffect('se-click');
    gameState.displayMode = mode;
    
    document.querySelectorAll('.display-mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    updateDisplayPhase();
}

function updateDisplayPhase() {
    updateInventory();
    updateShopItems();
}

function updateInventory() {
    const inventoryDiv = document.getElementById('inventory');
    inventoryDiv.innerHTML = '';

    gameState.inventory.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div class="item-emoji">${item.emoji}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-price">売却時</div>
        `;
        div.onclick = () => addToShop(index);
        inventoryDiv.appendChild(div);
    });
}

function addToShop(index) {
    playSoundEffect('se-click');
    
    const item = gameState.inventory[index];
    const sellPrice = Math.floor(item.buyPrice * (1.3 + Math.random() * 0.5));

    gameState.shopInventory.push({
        name: item.name,
        emoji: item.emoji,
        buyPrice: item.buyPrice,
        sellPrice: sellPrice,
    });

    gameState.inventory.splice(index, 1);
    updateDisplayPhase();
}

function updateShopItems() {
    const shopDiv = document.getElementById('shop-items');
    shopDiv.innerHTML = '';

    gameState.shopInventory.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div class="item-emoji">${item.emoji}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-price">${item.sellPrice}円</div>
        `;
        div.onclick = () => removeFromShop(index);
        shopDiv.appendChild(div);
    });
}

function removeFromShop(index) {
    playSoundEffect('se-click');
    
    const item = gameState.shopInventory[index];
    gameState.shopInventory.splice(index, 1);
    gameState.inventory.push({
        name: item.name,
        emoji: item.emoji,
        buyPrice: item.buyPrice,
    });
    updateDisplayPhase();
}

function startSelling() {
    playSoundEffect('se-transition');
    showPhase('sell-phase');
    initSellPhase();
}

// ===== 販売フェーズ =====
function initSellPhase() {
    updateShopPreview();
    nextCustomer();
}

function updateShopPreview() {
    const previewDiv = document.getElementById('shop-items-sell-preview');
    previewDiv.innerHTML = '';

    gameState.shopInventory.forEach(item => {
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div class="item-emoji">${item.emoji}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-price">${item.sellPrice}円</div>
        `;
        previewDiv.appendChild(div);
    });
}

function nextCustomer() {
    playSoundEffect('se-talk');
    
    currentCustomer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];

    document.getElementById('customer-portrait').textContent = currentCustomer.portrait;
    document.getElementById('customer-name').textContent = currentCustomer.name;
    document.getElementById('customer-need').textContent = currentCustomer.need;
}

function customerBuy() {
    if (gameState.shopInventory.length === 0) {
        playSoundEffect('se-error');
        showMessage('売る商品がありません！');
        return;
    }

    let boughtItem = null;
    for (let item of gameState.shopInventory) {
        if (currentCustomer.preferences.includes(item.name)) {
            boughtItem = item;
            break;
        }
    }

    if (!boughtItem) {
        boughtItem = gameState.shopInventory[Math.floor(Math.random() * gameState.shopInventory.length)];
    }

    playSoundEffect('se-sell');
    
    gameState.money += boughtItem.sellPrice;
    gameState.dailySellIncome += boughtItem.sellPrice;
    gameState.dailyCustomerCount++;

    gameState.shopInventory = gameState.shopInventory.filter(
        item => item !== boughtItem
    );

    updateStatus();
    showMessage(
        `${currentCustomer.name}が${boughtItem.name}を${boughtItem.sellPrice}円で買ってくれました！`
    );

    updateShopPreview();
}

function endSelling() {
    playSoundEffect('se-transition');
    showPhase('result-phase');
    showResultPhase();
}

// ===== 結果フェーズ =====
function showResultPhase() {
    const dailyProfit = gameState.dailySellIncome - gameState.dailyBuyCost;
    const expGained = Math.floor(dailyProfit / 10) + gameState.dailyCustomerCount * 5;

    document.getElementById('buy-cost').textContent = gameState.dailyBuyCost;
    document.getElementById('sell-income').textContent = gameState.dailySellIncome;
    document.getElementById('daily-profit').textContent = dailyProfit;
    document.getElementById('customer-count').textContent = gameState.dailyCustomerCount;

    gameState.experience += expGained;

    const levelUpThreshold = 100 + gameState.level * 50;
    if (gameState.experience >= levelUpThreshold) {
        gameState.level++;
        gameState.experience = 0;
        gameState.maxMoney += 5000;
        updateStatus();
        
        playSoundEffect('se-levelup');
        document.getElementById('modal-level').textContent = gameState.level;
        document.getElementById('level-up-modal').classList.add('show');
    }

    const marketNews = MARKET_NEWS[Math.floor(Math.random() * MARKET_NEWS.length)];
    document.getElementById('market-news').textContent = marketNews;

    checkClearCondition();
}

function nextDay() {
    playSoundEffect('se-transition');
    
    gameState.day++;
    gameState.dailyBuyCost = 0;
    gameState.dailySellIncome = 0;
    gameState.dailyCustomerCount = 0;
    gameState.inventory = [];
    gameState.shopInventory = [];

    updateStatus();
    showPhase('buy-phase');
    generateSeller();
}

// ===== ユーティリティ =====
function showMessage(message) {
    document.getElementById('message-display').textContent = message;
}

function updateStatus() {
    document.getElementById('money').textContent = gameState.money;
    document.getElementById('day').textContent = gameState.day;
    document.getElementById('trust').textContent = gameState.trust;
    document.getElementById('level').textContent = gameState.level;
}

function closeModal() {
    playSoundEffect('se-click');
    document.getElementById('level-up-modal').classList.remove('show');
}

function checkClearCondition() {
    for (let condition of CLEAR_CONDITIONS) {
        if (gameState.day === condition.day && gameState.money >= condition.money) {
            showClearModal();
            return;
        }
    }
}

function showClearModal() {
    playSoundEffect('se-success');
    
    document.getElementById('clear-message').textContent = 
        `素晴らしい商人になりました！Day ${gameState.day}で${gameState.money}円を稼ぎました！`;

    const statsDiv = document.getElementById('clear-stats');
    statsDiv.innerHTML = `
        <p>📅 最終日: ${gameState.day}日目</p>
        <p>💰 最終所持金: ${gameState.money}円</p>
        <p>🏆 到達レベル: ${gameState.level}</p>
    `;

    document.getElementById('clear-modal').classList.add('show');
}

function saveClearData() {
    const playerName = prompt('お名前を入力してください：', 'プレイヤー');
    if (playerName) {
        playSoundEffect('se-success');
        
        highscores.push({
            name: playerName,
            money: gameState.money,
            day: gameState.day,
            level: gameState.level,
            date: new Date().toLocaleDateString('ja-JP'),
        });

        highscores.sort((a, b) => b.money - a.money);
        highscores = highscores.slice(0, 10);

        localStorage.setItem('highscores', JSON.stringify(highscores));
        showHighscoreModal();
    }
}

function showHighscoreModal() {
    const listDiv = document.getElementById('highscore-list');
    listDiv.innerHTML = '';

    highscores.forEach((score, index) => {
        const div = document.createElement('div');
        div.className = 'highscore-item';
        div.innerHTML = `
            <span class="highscore-rank">#${index + 1}</span>
            <span class="highscore-name">${score.name} (Day ${score.day})</span>
            <span class="highscore-score">${score.money}円</span>
        `;
        listDiv.appendChild(div);
    });

    document.getElementById('highscore-modal').classList.add('show');
}

function closeHighscoreModal() {
    playSoundEffect('se-click');
    document.getElementById('highscore-modal').classList.remove('show');
    location.reload();
}
