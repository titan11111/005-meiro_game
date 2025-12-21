// ゲーム状態
let gameState = {
    day: 1,
    cash: 1000,
    initialCash: 1000,
    inventory: { lemon: 20, sugar: 10 },
    price: 100,
    sales: 0,
    cost: 0,
    customers: [],
    customerCount: 0,
    satisfactionCount: 0,
    time: 9,
    weather: 'sunny',
    temperature: 28,
    dayOfWeek: 1,
    customerStats: {},
    reputation: 3,
    regularCustomers: [],
    dailyHistory: [],
    isOpen: true,
    soundEnabled: true,
    nextCustomerId: 0
};

// お客さんのタイプ
const customerTypes = {
    basic: [
        { emoji: '👨', name: 'サラリーマン', speed: 1.8, buyRate: 0.8, count: 1, speech: ['ください！', '急いでるんで！', '1つ！'], timePreference: 'morning' },
        { emoji: '👩', name: 'OL', speed: 1.2, buyRate: 0.6, count: 1, speech: ['おいしそう', 'これください', '迷うな...'], timePreference: 'noon' },
        { emoji: '👦', name: '子ども', speed: 0.9, buyRate: 0.9, count: 1, speech: ['わーい！', 'おいしそう！', 'やったー！'], timePreference: 'afternoon' },
        { emoji: '👵', name: 'おばあちゃん', speed: 0.6, buyRate: 0.5, count: 1, speech: ['どれどれ...', '高いわねぇ', 'まあまあ'], timePreference: 'all', tip: true }
    ],
    special: [
        { emoji: '👨‍💼', name: '社長', speed: 1.2, buyRate: 0.7, count: 3, speech: ['3つ！', 'みんなの分も！', '全部で3つね'], timePreference: 'all', priceIgnore: true },
        { emoji: '🏃', name: 'ランナー', speed: 2.4, buyRate: 0.95, count: 2, speech: ['水分！', '助かった！', 'のどカラカラ！'], timePreference: 'all', needHot: true },
        { emoji: '👨‍👩‍👧‍👦', name: '家族', speed: 0.9, buyRate: 0.8, count: 4, speech: ['家族の分ね', 'みんなで乾杯！', '4つください'], timePreference: 'afternoon', weekend: true }
    ],
    rare: [
        { emoji: '⭐️', name: 'VIP客', speed: 1.2, buyRate: 1.0, count: 5, speech: ['全部ちょうだい！', '最高！', '素晴らしい！'], timePreference: 'all', sparkle: true, tip: 50 },
        { emoji: '😤', name: 'クレーマー', speed: 0.8, buyRate: 0.3, count: 1, speech: ['まずい！', '高すぎ！', '二度と来ない！'], timePreference: 'all', negative: true }
    ],
    superRare: [
        { emoji: '👑', name: '王様', speed: 1.0, buyRate: 1.0, count: 10, speech: ['余が買い占める！', '全部だ！', '金なら腐るほどある'], timePreference: 'all', sparkle: true, tip: 500, priceIgnore: true },
        { emoji: '🎭', name: 'インフルエンサー', speed: 1.3, buyRate: 0.8, count: 3, speech: ['SNSに載せよ！', 'バズる予感！', 'フォロワーに紹介！'], timePreference: 'all', reputationBoost: 2 },
        { emoji: '🧙‍♂️', name: '魔法使い', speed: 0.7, buyRate: 0.9, count: 2, speech: ['魔力が回復する！', '魔法の味じゃ！', 'レシピを教えよ'], timePreference: 'all', mystical: true, tip: 100 },
        { emoji: '👽', name: '宇宙人', speed: 2.0, buyRate: 0.7, count: 7, speech: ['地球の飲み物！', 'ピピピ！', '母星に持ち帰る'], timePreference: 'all', alien: true, priceIgnore: true },
        { emoji: '🐉', name: 'ドラゴン', speed: 0.5, buyRate: 1.0, count: 15, speech: ['喉が渇いた！', '火を吹きそうだ', '全部よこせ！'], timePreference: 'all', sparkle: true, tip: 1000, priceIgnore: true }
    ]
};

// チュートリアルステップ
const tutorialSteps = [
    { title: 'ようこそ！🏪', text: 'レモネードスタンドへようこそ！ねこ店長だよ。一緒に経営を学ぼう！', voice: 'ようこそ！レモネードスタンドへようこそ！ねこ店長だよ。一緒に経営を学ぼう！' },
    { title: 'お店の仕組み 🍋', text: 'お客さんが来たら、レモンと砂糖を使ってレモネードを作って売るよ！', voice: 'お客さんが来たら、レモンと砂糖を使ってレモネードを作って売るよ！' },
    { title: '大事な計算式 📝', text: '売上 から 費用 を引くと 利益 になるよ！これが経営の基本だ！', voice: '売上 から 費用 を引くと 利益 になるよ！これが経営の基本だ！' },
    { title: 'お金の管理 💰', text: '現金が減ったら仕入れができない。在庫が減ったら売れない。バランスが大事！', voice: '現金が減ったら仕入れができない。在庫が減ったら売れない。バランスが大事！' },
    { title: 'さあ、始めよう！ 🎉', text: '困ったら「？」マークを押して用語を確認してね。頑張ろう！', voice: '困ったら、はてなマークを押して用語を確認してね。頑張ろう！' }
];

// 用語集
const glossary = {
    '売上': { title: '💰 売上（うりあげ）', description: '商品を売って得たお金のこと。レモネードを売った金額の合計だよ！', example: '例：100円のレモネードを10個売ったら、売上は1,000円' },
    '費用': { title: '💸 費用（ひよう）', description: '商品を作るのに使ったお金のこと。レモンや砂糖の仕入れ代だよ！', example: '例：レモン10個400円、砂糖5袋200円で、費用は600円' },
    '利益': { title: '✨ 利益（りえき）', description: '売上から費用を引いた、実際に儲かったお金。これが増えると嬉しい！', example: '例：売上1,500円 - 費用600円 = 利益900円' },
    '現金': { title: '💵 現金（げんきん）', description: '今、手元にある使えるお金。これがないと仕入れができないよ！', example: '例：最初は1,000円持ってスタート' },
    '在庫': { title: '📦 在庫（ざいこ）', description: 'まだ売ってない材料のこと。レモンと砂糖の価値をお金に換算したもの', example: '例：レモン10個（400円分）+ 砂糖5袋（200円分）= 在庫600円' },
    '資産': { title: '🏦 資産（しさん）', description: 'お店が持っているもの全部。現金と在庫を合わせたものだよ！', example: '例：現金2,400円 + 在庫300円 = 資産2,700円' },
    '純資産': { title: '🏆 純資産（じゅんしさん）', description: 'お店の本当の価値。借金がない場合は資産と同じだよ！', example: '例：資産2,700円 - 借金0円 = 純資産2,700円' },
    'PL': { title: '📊 PL（損益計算書）', description: 'プロフィット・アンド・ロス。1日でどれだけ儲かったかを見る表だよ！', example: '売上 - 費用 = 利益 を計算する' },
    'BS': { title: '⚖️ BS（貸借対照表）', description: 'バランスシート。今、お店が何を持っているかを見る表だよ！', example: '資産（現金+在庫）と純資産のバランスを見る' }
};

const dayNames = ['月', '火', '水', '木', '金', '土', '日'];
let tutorialStep = 0;
let customerInterval = null;
let moveInterval = null;
let timeInterval = null;

// 初期化
function init() {
    if (gameState.day === 1) {
        showTutorial();
    } else {
        startGame();
    }
    
    // イベントリスナー
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    document.getElementById('tutorialNext').addEventListener('click', nextTutorial);
    document.getElementById('tutorialSkip').addEventListener('click', skipTutorial);
    document.getElementById('purchaseBtn').addEventListener('click', purchase);
    document.getElementById('priceSelect').addEventListener('change', changePrice);
    document.getElementById('closeBtn').addEventListener('click', closeStore);
    document.getElementById('detailBtn').addEventListener('click', showDetail);
    document.getElementById('backBtn').addEventListener('click', hideDetail);
    document.getElementById('nextDayBtn').addEventListener('click', nextDay);
    document.getElementById('nextDayBtn2').addEventListener('click', nextDay);
    document.getElementById('glossaryClose').addEventListener('click', closeGlossary);
}

// 音声合成
function speak(text) {
    if (!gameState.soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 1.0;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
}

// 効果音
function playSoundEffect(type) {
    if (!gameState.soundEnabled || typeof Tone === 'undefined') return;
    try {
        const synth = new Tone.Synth().toDestination();
        switch(type) {
            case 'sell':
                synth.triggerAttackRelease('C5', '0.1');
                setTimeout(() => synth.triggerAttackRelease('E5', '0.1'), 100);
                break;
            case 'vip':
                synth.triggerAttackRelease('C6', '0.1');
                setTimeout(() => synth.triggerAttackRelease('E6', '0.1'), 100);
                setTimeout(() => synth.triggerAttackRelease('G6', '0.1'), 200);
                break;
            case 'angry':
                synth.triggerAttackRelease('A2', '0.3');
                break;
            case 'button':
                synth.triggerAttackRelease('C5', '0.05');
                break;
            case 'purchase':
                synth.triggerAttackRelease('G4', '0.1');
                setTimeout(() => synth.triggerAttackRelease('C5', '0.1'), 100);
                break;
            case 'close':
                synth.triggerAttackRelease('C5', '0.2');
                setTimeout(() => synth.triggerAttackRelease('G4', '0.2'), 200);
                setTimeout(() => synth.triggerAttackRelease('C4', '0.3'), 400);
                break;
        }
    } catch (error) {
        console.log('Sound effect error:', error);
    }
}

// 音声トグル
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    document.getElementById('soundToggle').textContent = gameState.soundEnabled ? '🔊' : '🔇';
    if (!gameState.soundEnabled && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}

// チュートリアル表示
function showTutorial() {
    document.getElementById('tutorial').style.display = 'flex';
    updateTutorial();
}

function updateTutorial() {
    const step = tutorialSteps[tutorialStep];
    document.getElementById('tutorialTitle').textContent = step.title;
    document.getElementById('tutorialText').textContent = step.text;
    document.getElementById('tutorialNext').textContent = tutorialStep < tutorialSteps.length - 1 ? '次へ' : '始める！';
    
    // ドット更新
    const dotsContainer = document.getElementById('tutorialDots');
    dotsContainer.innerHTML = '';
    tutorialSteps.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = `tutorial-dot ${i === tutorialStep ? 'active' : ''}`;
        dotsContainer.appendChild(dot);
    });
    
    speak(step.voice);
}

function nextTutorial() {
    playSoundEffect('button');
    if (tutorialStep < tutorialSteps.length - 1) {
        tutorialStep++;
        updateTutorial();
    } else {
        skipTutorial();
    }
}

function skipTutorial() {
    playSoundEffect('button');
    document.getElementById('tutorial').style.display = 'none';
    startGame();
}

// 用語集
function openGlossary(term) {
    playSoundEffect('button');
    const info = glossary[term];
    if (!info) return;
    
    document.getElementById('glossaryTitle').textContent = info.title;
    document.getElementById('glossaryDescription').textContent = info.description;
    document.getElementById('glossaryExample').textContent = info.example;
    document.getElementById('glossary').style.display = 'flex';
    
    speak(info.description);
}

function closeGlossary() {
    playSoundEffect('button');
    document.getElementById('glossary').style.display = 'none';
    if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// ゲーム開始
function startGame() {
    document.getElementById('gameScreen').style.display = 'block';
    initializeDay();
    updateUI();
    startCustomerGeneration();
    startCustomerMovement();
    startTimeProgress();
}

// 1日の初期化
function initializeDay() {
    gameState.time = 9;
    gameState.isOpen = true;
    gameState.customers = [];
    gameState.customerCount = 0;
    gameState.satisfactionCount = 0;
    gameState.sales = 0;
    gameState.cost = 0;
    gameState.customerStats = {};
    
    // 天気・気温・曜日
    const weathers = ['sunny', 'sunny', 'cloudy', 'rainy'];
    gameState.weather = weathers[Math.floor(Math.random() * weathers.length)];
    gameState.temperature = Math.floor(Math.random() * 10) + 23;
    gameState.dayOfWeek = ((gameState.day - 1) % 7) + 1;
    
    // 背景色変更
    const gameArea = document.getElementById('gameArea');
    gameArea.className = 'game-area';
    if (gameState.weather === 'rainy') gameArea.classList.add('rainy');
    if (gameState.weather === 'cloudy') gameArea.classList.add('cloudy');
    
    // 雨のエフェクト
    const rainContainer = document.getElementById('rainContainer');
    rainContainer.innerHTML = '';
    if (gameState.weather === 'rainy') {
        for (let i = 0; i < 30; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.top = `${Math.random() * -20}%`;
            drop.style.animationDuration = `${Math.random() * 1 + 0.5}s`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            rainContainer.appendChild(drop);
        }
    }
}

// UI更新
function updateUI() {
    document.getElementById('day').textContent = gameState.day;
    document.getElementById('dayOfWeek').textContent = dayNames[gameState.dayOfWeek - 1];
    document.getElementById('cash').textContent = gameState.cash;
    document.getElementById('lemon').textContent = gameState.inventory.lemon;
    document.getElementById('sugar').textContent = gameState.inventory.sugar;
    document.getElementById('priceDisplay').textContent = gameState.price;
    document.getElementById('temperature').textContent = gameState.temperature;
    
    const weatherInfo = getWeatherInfo();
    document.getElementById('weatherIcon').textContent = weatherInfo.emoji;
    document.getElementById('weatherText').textContent = weatherInfo.text;
    
    // 評判
    const reputationStars = '★'.repeat(Math.round(gameState.reputation)) + '☆'.repeat(5 - Math.round(gameState.reputation));
    document.getElementById('reputation').textContent = reputationStars;
    
    // 時間
    const hours = Math.floor(gameState.time);
    const minutes = (gameState.time % 1) * 60 === 0 ? '00' : '30';
    document.getElementById('time').textContent = `${hours}:${minutes}`;
    
    // レモン表示
    const lemonDisplay = document.getElementById('lemonDisplay');
    lemonDisplay.innerHTML = '';
    for (let i = 0; i < Math.min(5, gameState.inventory.lemon); i++) {
        const lemon = document.createElement('span');
        lemon.textContent = '🍋';
        lemonDisplay.appendChild(lemon);
    }
    
    // 在庫警告
    const stockWarning = document.getElementById('stockWarning');
    if (gameState.inventory.lemon < 3 || gameState.inventory.sugar < 2) {
        stockWarning.style.display = 'block';
    } else {
        stockWarning.style.display = 'none';
    }
}

function getWeatherInfo() {
    if (gameState.weather === 'sunny') return { emoji: '☀️', text: '晴れ' };
    if (gameState.weather === 'cloudy') return { emoji: '☁️', text: '曇り' };
    return { emoji: '☔', text: '雨' };
}

// お客さん生成
function startCustomerGeneration() {
    const getInterval = () => {
        let baseInterval = 1000;
        if (gameState.reputation >= 4) baseInterval *= 0.8;
        if (gameState.reputation <= 2) baseInterval *= 1.2;
        if (gameState.weather === 'rainy') return baseInterval * 2.5;
        if (gameState.weather === 'cloudy') return baseInterval * 1.5;
        return baseInterval;
    };
    
    customerInterval = setInterval(() => {
        if (!gameState.isOpen) return;
        
        const timeOfDay = gameState.time < 12 ? 'morning' : gameState.time < 16 ? 'noon' : 'afternoon';
        const isWeekend = gameState.dayOfWeek === 6 || gameState.dayOfWeek === 7;
        
        let availableTypes = [...customerTypes.basic];
        
        if (gameState.temperature >= 28) availableTypes.push(customerTypes.special[1]);
        if (isWeekend) availableTypes.push(customerTypes.special[2]);
        availableTypes.push(customerTypes.special[0]);
        
        // レアキャラ
        if (Math.random() < 0.05 && gameState.reputation >= 4) availableTypes.push(customerTypes.rare[0]);
        if (Math.random() < 0.03) availableTypes.push(customerTypes.rare[1]);
        
        // 超レア
        if (Math.random() < 0.02 && gameState.reputation >= 4) availableTypes.push(customerTypes.superRare[0]);
        if (Math.random() < 0.015) availableTypes.push(customerTypes.superRare[1]);
        if (Math.random() < 0.01 && gameState.time >= 18) availableTypes.push(customerTypes.superRare[2]);
        if (Math.random() < 0.008) availableTypes.push(customerTypes.superRare[3]);
        if (Math.random() < 0.001 && gameState.reputation >= 5) availableTypes.push(customerTypes.superRare[4]);
        
        // 常連客
        if (Math.random() < 0.1 && gameState.regularCustomers.length > 0) {
            const regular = gameState.regularCustomers[Math.floor(Math.random() * gameState.regularCustomers.length)];
            createCustomer({ ...regular, isRegular: true, speech: ['いつもの！', '今日もよろしく！', 'また来たよ！'] });
            return;
        }
        
        availableTypes = availableTypes.filter(type => 
            type.timePreference === 'all' || type.timePreference === timeOfDay || (type.weekend && isWeekend)
        );
        
        if (gameState.weather === 'rainy' && Math.random() > 0.3) return;
        if (gameState.weather === 'cloudy' && Math.random() > 0.7) return;
        
        const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        createCustomer(randomType);
    }, getInterval());
}

function createCustomer(type) {
    const customer = {
        id: gameState.nextCustomerId++,
        ...type,
        position: 100,
        scale: 0.5,
        showBubble: false,
        bought: false,
        bubbleTimer: 0
    };
    
    const customerEl = document.createElement('div');
    customerEl.className = 'customer';
    customerEl.id = `customer-${customer.id}`;
    customerEl.style.top = '100%';
    customerEl.style.left = '50%';
    customerEl.style.transform = 'translateX(-50%) scale(0.5)';
    customerEl.style.fontSize = '48px';
    customerEl.innerHTML = customer.emoji;
    
    if (customer.sparkle) {
        const sparkle = document.createElement('span');
        sparkle.className = 'customer-sparkle';
        sparkle.textContent = '✨';
        customerEl.appendChild(sparkle);
    }
    
    if (customer.isRegular) {
        const regular = document.createElement('span');
        regular.className = 'customer-regular';
        regular.textContent = '💚';
        customerEl.appendChild(regular);
    }
    
    document.getElementById('customersContainer').appendChild(customerEl);
    gameState.customers.push(customer);
}

// お客さん移動
function startCustomerMovement() {
    moveInterval = setInterval(() => {
        gameState.customers = gameState.customers.filter(customer => {
            const customerEl = document.getElementById(`customer-${customer.id}`);
            if (!customerEl) return false;
            
            if (customer.bought) {
                customer.position -= customer.speed * 1.5;
                customer.scale += 0.015;
                if (customer.position < -20) {
                    customerEl.remove();
                    return false;
                }
            } else {
                customer.position -= customer.speed;
                customer.scale = Math.min(1, customer.scale + 0.008);
                
                if (customer.position <= 35 && customer.position > 28 && !customer.showBubble) {
                    processCustomerPurchase(customer, customerEl);
                }
            }
            
            customerEl.style.top = `${customer.position}%`;
            customerEl.style.transform = `translateX(-50%) scale(${customer.scale})`;
            
            // 吹き出し管理
            if (customer.showBubble && customer.bubbleTimer > 0) {
                customer.bubbleTimer--;
            } else if (customer.bubbleTimer === 0 && customer.showBubble) {
                const bubble = customerEl.querySelector('.customer-bubble');
                if (bubble) bubble.remove();
                customer.showBubble = false;
            }
            
            return true;
        });
    }, 50);
}

function processCustomerPurchase(customer, customerEl) {
    let buyRate = customer.buyRate;
    
    if (customer.isRegular) buyRate = 1.0;
    
    if (!customer.priceIgnore) {
        if (gameState.price >= 300) buyRate -= 0.5;
        else if (gameState.price >= 250) buyRate -= 0.4;
        else if (gameState.price >= 200) buyRate -= 0.3;
        else if (gameState.price >= 150) buyRate -= 0.2;
        if (gameState.price <= 50 && customer.name === '子ども') buyRate = 1.0;
        if (gameState.price >= 1000) buyRate -= 0.8;
    }
    
    buyRate += (gameState.reputation - 3) * 0.1;
    
    const willBuy = Math.random() < buyRate;
    const hasStock = gameState.inventory.lemon >= customer.count && gameState.inventory.sugar >= customer.count;
    
    if (willBuy && hasStock) {
        // 購入成功
        const totalPrice = gameState.price * customer.count;
        const tip = customer.tip ? (typeof customer.tip === 'number' ? customer.tip : (Math.random() > 0.7 ? 10 : 0)) : 0;
        
        gameState.inventory.lemon -= customer.count;
        gameState.inventory.sugar -= customer.count;
        gameState.cash += totalPrice + tip;
        gameState.sales += totalPrice + tip;
        gameState.customerCount++;
        gameState.satisfactionCount++;
        gameState.customerStats[customer.name] = (gameState.customerStats[customer.name] || 0) + 1;
        
        // 効果音
        if (customer.name === 'VIP客' || customer.sparkle) {
            playSoundEffect('vip');
        } else {
            playSoundEffect('sell');
        }
        
        // 常連客追加
        if (!customer.isRegular && Math.random() < 0.15 && gameState.regularCustomers.length < 5) {
            gameState.regularCustomers.push(customerTypes.basic[Math.floor(Math.random() * customerTypes.basic.length)]);
        }
        
        // 評判変化
        if (customer.name === 'VIP客') gameState.reputation = Math.min(5, gameState.reputation + 1);
        if (customer.reputationBoost) gameState.reputation = Math.min(5, gameState.reputation + customer.reputationBoost);
        if (customer.negative) {
            gameState.reputation = Math.max(1, gameState.reputation - 1);
            playSoundEffect('angry');
        }
        
        const randomSpeech = customer.speech[Math.floor(Math.random() * customer.speech.length)];
        showBubble(customerEl, tip ? `${randomSpeech} (+${tip}円)` : randomSpeech, customer.negative);
        customer.showBubble = true;
        customer.bought = true;
        customer.bubbleTimer = 60;
    } else if (!hasStock) {
        gameState.customerCount++;
        gameState.reputation = Math.max(1, gameState.reputation - 0.5);
        showBubble(customerEl, '売り切れ？', false);
        customer.showBubble = true;
        customer.bought = true;
        customer.bubbleTimer = 60;
    } else {
        gameState.customerCount++;
        showBubble(customerEl, '今日はいいや', false);
        customer.showBubble = true;
        customer.bought = true;
        customer.bubbleTimer = 60;
    }
    
    updateUI();
}

function showBubble(customerEl, text, negative) {
    const bubble = document.createElement('div');
    bubble.className = `customer-bubble ${negative ? 'negative' : ''}`;
    bubble.textContent = text;
    customerEl.appendChild(bubble);
}

// 時間経過
function startTimeProgress() {
    timeInterval = setInterval(() => {
        if (!gameState.isOpen) return;
        
        gameState.time += 0.5;
        updateUI();
        
        if (gameState.time >= 18) {
            closeStore();
        }
    }, 3000);
}

// 仕入れ
function purchase() {
    const totalCost = 600;
    if (gameState.cash >= totalCost) {
        playSoundEffect('purchase');
        gameState.cash -= totalCost;
        gameState.cost += totalCost;
        gameState.inventory.lemon += 10;
        gameState.inventory.sugar += 5;
        updateUI();
        alert('🍋 レモン10個と砂糖5袋を仕入れました！');
    } else {
        alert('💸 お金が足りません！');
    }
}

// 値段変更
function changePrice() {
    playSoundEffect('button');
    gameState.price = parseInt(document.getElementById('priceSelect').value);
    updateUI();
}

// 閉店
function closeStore() {
    playSoundEffect('close');
    gameState.isOpen = false;
    clearInterval(customerInterval);
    clearInterval(moveInterval);
    clearInterval(timeInterval);
    
    // 履歴に追加
    gameState.dailyHistory.push({
        day: gameState.day,
        sales: gameState.sales,
        cost: gameState.cost,
        profit: gameState.sales - gameState.cost,
        customers: gameState.customerCount
    });
    
    showResult();
}

// 決算書表示
function showResult() {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'block';
    document.getElementById('simpleResult').style.display = 'block';
    document.getElementById('detailResult').style.display = 'none';
    
    const profit = gameState.sales - gameState.cost;
    const totalAssets = gameState.cash + (gameState.inventory.lemon * 40 + gameState.inventory.sugar * 40);
    const inventoryValue = gameState.inventory.lemon * 40 + gameState.inventory.sugar * 40;
    const satisfaction = gameState.customerCount > 0 ? Math.round((gameState.satisfactionCount / gameState.customerCount) * 5) : 0;
    
    document.getElementById('resultDay').textContent = gameState.day;
    
    // PL
    document.getElementById('salesAmount').textContent = `${gameState.sales}円`;
    document.getElementById('salesBar').style.width = `${Math.min(100, (gameState.sales / 2000) * 100)}%`;
    
    document.getElementById('costAmount').textContent = `${gameState.cost}円`;
    document.getElementById('costBar').style.width = `${Math.min(100, (gameState.cost / 2000) * 100)}%`;
    
    document.getElementById('profitAmount').textContent = `${profit >= 0 ? '+' : ''}${profit}円`;
    document.getElementById('profitAmount').className = `amount ${profit >= 0 ? 'amount-yellow' : 'amount-red'}`;
    document.getElementById('profitBar').style.width = `${Math.min(100, (Math.abs(profit) / 2000) * 100)}%`;
    
    // BS
    document.getElementById('cashResultAmount').textContent = `${gameState.cash}円`;
    document.getElementById('cashBar').style.width = `${Math.min(100, (gameState.cash / 3000) * 100)}%`;
    
    document.getElementById('inventoryAmount').textContent = `${inventoryValue}円`;
    document.getElementById('inventoryBar').style.width = `${Math.min(100, (inventoryValue / 1000) * 100)}%`;
    
    document.getElementById('assetsAmount').textContent = `${totalAssets}円`;
    
    // 客層分析
    const statsGrid = document.getElementById('customerStatsGrid');
    statsGrid.innerHTML = '';
    Object.entries(gameState.customerStats).forEach(([name, count]) => {
        const item = document.createElement('div');
        item.className = 'customer-stat-item';
        item.innerHTML = `<span>${name}</span><span class="customer-stat-count">${count}人</span>`;
        statsGrid.appendChild(item);
    });
    
    if (gameState.regularCustomers.length > 0) {
        document.getElementById('regularCustomerInfo').style.display = 'block';
        document.getElementById('regularCount').textContent = gameState.regularCustomers.length;
    }
    
    // 統計
    document.getElementById('customerCountResult').textContent = `${gameState.customerCount}人`;
    document.getElementById('satisfactionResult').textContent = '★'.repeat(satisfaction) + '☆'.repeat(5 - satisfaction);
    
    const weatherInfo = getWeatherInfo();
    document.getElementById('weatherResultIcon').textContent = weatherInfo.emoji;
    document.getElementById('weatherResultText').textContent = weatherInfo.text;
    
    // 今日の学び
    const learnings = [
        '売上が増えても、費用が多いと利益は少なくなるよ',
        '在庫は資産だけど、売らないとお金にならないよ',
        '現金が減ると仕入れができないから、お金の管理が大事！',
        '天気が良いとお客さんが増えるよ',
        '値段を下げるとお客さんは増えるけど、利益は減るかも',
        '口コミ評価が高いと、次の日のお客さんが増えるよ'
    ];
    document.getElementById('todayLearning').textContent = learnings[Math.floor(Math.random() * learnings.length)];
    
    // ねこ店長コメント
    let comment = '';
    if (profit > 3000) comment = '🎉 すごい！大成功だね！この調子で億万長者を目指そう！';
    else if (profit > 2000) comment = '✨ 素晴らしい！今日は最高の日だったね！';
    else if (profit > 1000) comment = '👍 完璧な経営だ！PLもBSもバッチリだね！';
    else if (profit > 500) comment = '😊 いい感じ！順調に成長してるよ！';
    else if (profit > 0) comment = '🙂 今日もよく頑張ったね！少しずつ積み重ねが大事だよ。';
    else if (profit === 0) comment = '😐 今日はトントンだね。明日は利益を出そう！';
    else if (profit > -500) comment = '😥 ちょっと赤字だけど、明日は頑張ろう！';
    else comment = '😰 大赤字...！値段や仕入れのタイミングを見直そう！';
    
    if (gameState.weather === 'rainy' && profit > 300) comment = '☔ 雨なのによく売れたね！すごい！';
    if (gameState.temperature >= 28 && gameState.sales > 2000) comment = '🌡️ 暑い日は大チャンス！ランナーも来てるね！';
    if (gameState.reputation >= 4) comment = '⭐️ 口コミ評価が最高！みんなが君のお店を応援してるよ！';
    if (gameState.reputation <= 2) comment = '📉 口コミが下がってる...在庫切れに注意だよ。';
    if (gameState.regularCustomers.length >= 3) comment = '💚 常連さんが増えてきたね！リピーターは宝物だよ！';
    if (gameState.price >= 300 && profit > 500) comment = '💎 高級路線で成功！ブランド価値が高いね！';
    if (gameState.price <= 50 && gameState.customerCount > 30) comment = '🎯 薄利多売戦略！お客さんがたくさん来てるね！';
    
    document.getElementById('catComment').textContent = comment;
}

// 詳細表示
function showDetail() {
    playSoundEffect('button');
    document.getElementById('simpleResult').style.display = 'none';
    document.getElementById('detailResult').style.display = 'block';
    
    const profit = gameState.sales - gameState.cost;
    const totalAssets = gameState.cash + (gameState.inventory.lemon * 40 + gameState.inventory.sugar * 40);
    const inventoryValue = gameState.inventory.lemon * 40 + gameState.inventory.sugar * 40;
    
    // 水の流れ
    document.getElementById('salesFlow').textContent = gameState.sales;
    document.getElementById('costFlow').textContent = gameState.cost;
    document.getElementById('profitFlow').textContent = `残った水 = 利益 ${profit}円`;
    document.getElementById('profitFlow').className = `flow-box ${profit >= 0 ? 'flow-yellow' : 'flow-gray'}`;
    
    // 天秤
    document.getElementById('balanceCash').textContent = `${gameState.cash}円`;
    document.getElementById('balanceInventory').textContent = `${inventoryValue}円`;
    document.getElementById('balanceAssetsTotal').textContent = `${totalAssets}円`;
    document.getElementById('balanceInitial').textContent = `${gameState.initialCash}円`;
    document.getElementById('balanceProfit').textContent = `${totalAssets - gameState.initialCash}円`;
    document.getElementById('balanceLiabilitiesTotal').textContent = `${totalAssets}円`;
    
    // 推移
    if (gameState.dailyHistory.length > 0) {
        document.getElementById('historySection').style.display = 'block';
        const historyContainer = document.getElementById('historyContainer');
        historyContainer.innerHTML = '';
        
        gameState.dailyHistory.forEach(record => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-header">
                    <span class="history-day">Day ${record.day}</span>
                    <span class="history-profit ${record.profit >= 0 ? 'positive' : 'negative'}">
                        ${record.profit >= 0 ? '+' : ''}${record.profit}円
                    </span>
                </div>
                <div class="history-details">
                    <span>売上: ${record.sales}円</span>
                    <span>費用: ${record.cost}円</span>
                    <span>客数: ${record.customers}人</span>
                </div>
            `;
            historyContainer.appendChild(item);
        });
    }
}

function hideDetail() {
    playSoundEffect('button');
    document.getElementById('simpleResult').style.display = 'block';
    document.getElementById('detailResult').style.display = 'none';
}

// 次の日へ
function nextDay() {
    playSoundEffect('button');
    gameState.day++;
    document.getElementById('resultScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    // お客さんコンテナをクリア
    document.getElementById('customersContainer').innerHTML = '';
    
    initializeDay();
    updateUI();
    startCustomerGeneration();
    startCustomerMovement();
    startTimeProgress();
}

// ページ読み込み時
window.addEventListener('DOMContentLoaded', init);

// グローバル関数（HTML onclick用）
window.openGlossary = openGlossary;
    