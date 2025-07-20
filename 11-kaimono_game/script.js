// オーディオファイルの読み込み
const bgm = new Audio('audio/field.mp3');
bgm.loop = true; // BGMをループ再生する設定

const seikaiSound = new Audio('audio/seikai2.mp3');   // 成功時の効果音
const fuseikaiSound = new Audio('audio/fuseikai2.mp3'); // 失敗時の効果音
const levelupSound = new Audio('audio/levelup.mp3');   // 次のお客さんへの切り替え時などに鳴らす
const maouSound = new Audio('audio/maou.mp3');       // ゲームオーバー時の演出音
const sentouSound = new Audio('audio/sentou.mp3');   // （現状では未使用。将来の戦闘演出用）

// 効果音再生関数（重複再生を防ぐ）
function playSound(audio) {
    audio.currentTime = 0;
    audio.play().catch(error => {
        console.warn('効果音の再生がブロックされました:', error);
    });
}

// ゲーム状態管理
let gameState = {
    money: 500,
    trust: 100,
    day: 1,
    selectedItem: null,
    currentCustomer: null,
    consecutiveFailures: 0,
    lastAction: null,
    dailySales: [], // 日別売上記録
    totalSales: 0,  // 総売上
    gameCompleted: false, // ゲーム完了フラグ
    customersToday: 0, // 今日来店したお客さん数
    minCustomersPerDay: 4 // 1日の最小来店数
};

// 日数別の難易度設定（調整版）
const dayDifficulty = {
    1: { customerDetectBonus: 0, priceFluctuation: 0.1, trustPenalty: 0.8 },
    2: { customerDetectBonus: 5, priceFluctuation: 0.15, trustPenalty: 1.0 },
    3: { customerDetectBonus: 10, priceFluctuation: 0.2, trustPenalty: 1.3 },
    4: { customerDetectBonus: 15, priceFluctuation: 0.25, trustPenalty: 1.6 },
    5: { customerDetectBonus: 20, priceFluctuation: 0.3, trustPenalty: 1.8 }
};

// 売上記録を追加する関数
function addSalesRecord(day, sales, action, itemName, success) {
    const record = {
        day: day,
        sales: sales,
        action: action,
        itemName: itemName,
        success: success,
        timestamp: new Date()
    };
    gameState.dailySales.push(record);
    gameState.totalSales += sales;
}

// 日別売上を計算する関数
function calculateDailySales() {
    const dailyTotals = {};
    gameState.dailySales.forEach(record => {
        if (!dailyTotals[record.day]) {
            dailyTotals[record.day] = 0;
        }
        dailyTotals[record.day] += record.sales;
    });
    return dailyTotals;
}

// 売上レビュー画面を表示する関数
function showSalesReview() {
    const dailyTotals = calculateDailySales();
    const currentDay = gameState.day - 1; // 現在の日（終了した日）
    const maxSales = Math.max(...Object.values(dailyTotals), 100); // 最低100円
    
    let reviewHTML = `
        <div class="sales-review">
            <h2>📊 ${currentDay}日目の売上レビュー</h2>
            <div class="sales-summary">
                <div class="total-sales">総売上: ${gameState.totalSales}円</div>
                <div class="final-trust">現在の信頼度: ${gameState.trust}%</div>
            </div>
    `;
    
    // 1日目の場合は詳細な評価、2日目以降は累積グラフ
    if (currentDay === 1) {
        // 1日目の詳細評価
        const day1Sales = dailyTotals[1] || 0;
        let day1Evaluation = '';
        let day1Grade = '';
        
        if (day1Sales >= 500) {
            day1Evaluation = '素晴らしい初日！商売の才能があります！';
            day1Grade = 'A';
        } else if (day1Sales >= 300) {
            day1Evaluation = '良い初日でした！頑張りましょう！';
            day1Grade = 'B';
        } else if (day1Sales >= 100) {
            day1Evaluation = 'まずまずの初日。経験を積みましょう。';
            day1Grade = 'C';
        } else {
            day1Evaluation = '初日は緊張しますね。次は頑張りましょう！';
            day1Grade = 'D';
        }
        
        reviewHTML += `
            <div class="day-evaluation">
                <h3>🎯 1日目の評価</h3>
                <div class="evaluation-text">
                    <div class="grade">${day1Grade}</div>
                    <div class="evaluation-message">${day1Evaluation}</div>
                    <div class="day-sales">売上: ${day1Sales}円</div>
                </div>
            </div>
        `;
    } else {
        // 2日目以降は日別売上グラフ
        reviewHTML += `
            <div class="sales-chart">
                <h3>日別売上推移</h3>
                <div class="chart-container">
        `;
        
        // 現在の日までの棒グラフを生成（日別売上）
        for (let day = 1; day <= currentDay; day++) {
            const sales = dailyTotals[day] || 0;
            const height = (sales / maxSales) * 200; // 最大200px
            const barColor = sales > 0 ? '#27ae60' : '#95a5a6';
            
            reviewHTML += `
                <div class="chart-bar">
                    <div class="bar" style="height: ${height}px; background-color: ${barColor};">
                        <span class="bar-value">${sales}円</span>
                    </div>
                    <div class="bar-label">Day ${day}</div>
                </div>
            `;
        }
        
        reviewHTML += `
                </div>
            </div>
        `;
    }
    
    // 取引履歴を表示（現在の日のみ）
    const currentDaySales = gameState.dailySales.filter(record => record.day === currentDay);
    
    if (currentDaySales.length > 0) {
        reviewHTML += `
            <div class="sales-details">
                <h3>取引詳細</h3>
                <div class="transaction-summary">
        `;
        
        // 取引の統計情報を表示
        const totalTransactions = currentDaySales.length;
        const successfulTransactions = currentDaySales.filter(record => record.success).length;
        const totalEarnings = currentDaySales.reduce((sum, record) => sum + record.sales, 0);
        
        reviewHTML += `
                    <div class="transaction-stats">
                        <div class="stat-item">
                            <span class="stat-label">取引数</span>
                            <span class="stat-value">${totalTransactions}回</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">成功率</span>
                            <span class="stat-value">${Math.round((successfulTransactions / totalTransactions) * 100)}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">売上</span>
                            <span class="stat-value">${totalEarnings}円</span>
                        </div>
                    </div>
                </div>
        `;
        
        // 最新の3件のみ表示（スクロール不要）
        const recentTransactions = currentDaySales.slice(-3);
        reviewHTML += `
                <div class="recent-transactions">
                    <h4>最新の取引</h4>
        `;
        
        recentTransactions.forEach(record => {
            const successIcon = record.success ? '✅' : '❌';
            const actionText = {
                'sell': 'そのまま渡す',
                'lie': 'ウソをつく',
                'upgrade': '本物に交換'
            }[record.action] || record.action;
            
            const salesColor = record.sales >= 0 ? '#27ae60' : '#e74c3c';
            const salesPrefix = record.sales >= 0 ? '+' : '';
            
            reviewHTML += `
                <div class="transaction-item">
                    <span class="transaction-icon">${successIcon}</span>
                    <span class="transaction-item-name">${record.itemName}</span>
                    <span class="transaction-action">${actionText}</span>
                    <span class="transaction-sales" style="color: ${salesColor}">${salesPrefix}${record.sales}円</span>
                </div>
            `;
        });
        
        reviewHTML += `
                </div>
            </div>
        `;
    }
    
    // 5日目終了時のみ最終評価を表示
    if (currentDay === 5) {
        let evaluation = '';
        let grade = '';
        if (gameState.totalSales >= 2000) {
            evaluation = '伝説の店主！完璧な商売手腕です！';
            grade = 'S';
        } else if (gameState.totalSales >= 1500) {
            evaluation = '一流の店主！素晴らしい実績です！';
            grade = 'A';
        } else if (gameState.totalSales >= 1000) {
            evaluation = '優秀な店主！よく頑張りました！';
            grade = 'B';
        } else if (gameState.totalSales >= 500) {
            evaluation = '普通の店主。もう少し頑張りましょう。';
            grade = 'C';
        } else {
            evaluation = '初心者店主。経験を積んで成長しましょう。';
            grade = 'D';
        }
        
        reviewHTML += `
            <div class="final-evaluation">
                <h3>🏆 最終評価</h3>
                <div class="evaluation-text">
                    <div class="grade">${grade}</div>
                    <div class="evaluation-message">${evaluation}</div>
                </div>
            </div>
        `;
    }
    
    reviewHTML += `
            <button id="restart-final-btn" class="restart-btn">${currentDay === 5 ? 'もう一度プレイ' : '次の日へ'}</button>
        </div>
    `;
    
    // 結果画面を表示
    const resultArea = document.getElementById('result-area');
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    
    resultTitle.textContent = currentDay === 5 ? '🎉 ゲーム終了！' : `📊 Day ${currentDay} 終了`;
    resultMessage.innerHTML = reviewHTML;
    resultArea.style.display = 'flex';
    
    // ボタンのイベントリスナー
    document.getElementById('restart-final-btn').addEventListener('click', () => {
        resultArea.style.display = 'none';
        if (currentDay === 5) {
            resetGame();
        } else {
            // 5日目以外は次の日のお客さんを生成
            generateCustomer();
            updateUI();
        }
    });
}

// 商品データベース
const itemDatabase = {
    watch: { name: '腕時計', icon: '⌚', fakePrice: 50, realPrice: 150 },
    bag: { name: 'バッグ', icon: '👜', fakePrice: 80, realPrice: 200 },
    shoes: { name: '靴', icon: '👟', fakePrice: 60, realPrice: 180 },
    necklace: { name: 'ネックレス', icon: '💎', fakePrice: 100, realPrice: 300 },
    ring: { name: '指輪', icon: '💍', fakePrice: 120, realPrice: 400 },
    sunglasses: { name: 'サングラス', icon: '🕶️', fakePrice: 40, realPrice: 120 },
    perfume: { name: '香水', icon: '🌸', fakePrice: 90, realPrice: 250 },
    wallet: { name: '財布', icon: '👛', fakePrice: 70, realPrice: 180 },
    belt: { name: 'ベルト', icon: '👔', fakePrice: 50, realPrice: 150 },
    scarf: { name: 'マフラー', icon: '🧣', fakePrice: 30, realPrice: 100 }
};

// 商品データ（動的に生成される）
let inventory = {};

// お客さんの種類（目利きレベル付き）
let customerTypes = [
    { request: 'watch', message: '腕時計が欲しいです', baseDetectChance: 30 },
    { request: 'bag', message: 'バッグが欲しいです', baseDetectChance: 40 },
    { request: 'shoes', message: '靴が欲しいです', baseDetectChance: 35 },
    { request: 'necklace', message: 'ネックレスが欲しいです', baseDetectChance: 45 },
    { request: 'ring', message: '指輪が欲しいです', baseDetectChance: 50 },
    { request: 'sunglasses', message: 'サングラスが欲しいです', baseDetectChance: 25 },
    { request: 'perfume', message: '香水が欲しいです', baseDetectChance: 35 },
    { request: 'wallet', message: '財布が欲しいです', baseDetectChance: 30 },
    { request: 'belt', message: 'ベルトが欲しいです', baseDetectChance: 25 },
    { request: 'scarf', message: 'マフラーが欲しいです', baseDetectChance: 20 }
];

// シュールなコメント集
const angryComments = [
    "「この店、もう二度と来ないわ...」",
    "「店主さん、あなたの良心はどこに売ったの？」",
    "「偽物を売るなんて、最低ね」",
    "「こんな店、SNSで拡散してやる」",
    "「警察に通報した方がいいかしら？」",
    "「店主の顔、覚えておくわ」",
    "「この店、潰れてしまえ」",
    "「偽物売ってるなんて、恥ずかしくないの？」",
    "「あなたのような店主がいるから、世の中が悪くなるのよ」",
    "「この店の看板、偽物だったのね」",
    "「店主さん、あなたの人生も偽物みたい」",
    "「こんな店で働いてる人、可哀想」",
    "「偽物売って儲けて、何が楽しいの？」",
    "「この店、地獄に落ちろ」",
    "「店主の心も偽物だったのね」"
];

// DOM要素の取得
const moneyDisplay   = document.getElementById('money');
const trustDisplay   = document.getElementById('trust');
const dayDisplay     = document.getElementById('day');
const customersDisplay = document.getElementById('customers');
const minCustomersDisplay = document.getElementById('min-customers');
const customerRequestDisplay = document.getElementById('customer-request');
const itemsGrid      = document.querySelector('.items-grid');
const sellBtn        = document.getElementById('sell-btn');
const lieBtn         = document.getElementById('lie-btn');
const upgradeBtn     = document.getElementById('upgrade-btn');
const resultArea     = document.getElementById('result-area');
const resultTitle    = document.getElementById('result-title');
const resultMessage  = document.getElementById('result-message');
const nextBtn        = document.getElementById('next-btn');
const gameoverArea   = document.getElementById('gameover-area');
const finalScoreDisplay    = document.getElementById('final-score');
const finalMessageDisplay  = document.getElementById('final-message');
const restartBtn     = document.getElementById('restart-btn');
const helpBtn        = document.getElementById('help-btn');
const helpModal      = document.getElementById('help-modal');
const closeModalBtn  = document.getElementById('close-modal');

// UI更新関数
function updateUI() {
    moneyDisplay.textContent = gameState.money;
    trustDisplay.textContent = gameState.trust;
    dayDisplay.textContent = gameState.day;
    customersDisplay.textContent = gameState.customersToday;
    minCustomersDisplay.textContent = gameState.minCustomersPerDay;

    // 商品の品質表示を更新
    for (const itemId in inventory) {
        const itemQualityElement = document.getElementById(`${itemId}-quality`);
        if (itemQualityElement) {
            itemQualityElement.textContent = inventory[itemId].isReal ? '本物' : '偽物';
            itemQualityElement.classList.toggle('real', inventory[itemId].isReal);
            itemQualityElement.classList.toggle('fake', !inventory[itemId].isReal);
        }
    }

    // アクションボタンの状態を更新
    sellBtn.disabled    = !gameState.selectedItem;
    lieBtn.disabled     = !gameState.selectedItem;
    upgradeBtn.disabled = !gameState.selectedItem 
                           || inventory[gameState.selectedItem]?.isReal 
                           || gameState.money < 100;
}

// ランダムな商品を生成する関数（難易度調整版）
function generateRandomInventory() {
    const itemKeys = Object.keys(itemDatabase);
    const selectedItems = [];
    
    // 3つのランダムな商品を選択
    while (selectedItems.length < 3) {
        const randomItem = itemKeys[Math.floor(Math.random() * itemKeys.length)];
        if (!selectedItems.includes(randomItem)) {
            selectedItems.push(randomItem);
        }
    }
    
    // 現在の日の難易度設定を取得
    const difficulty = dayDifficulty[gameState.day] || dayDifficulty[1];
    
    // インベントリを生成
    inventory = {};
    selectedItems.forEach(itemKey => {
        const itemData = itemDatabase[itemKey];
        
        // 価格にランダムな変動を加える（難易度に応じて変動幅が増加）
        const baseVariation = 0.8 + Math.random() * 0.4; // 0.8-1.2の範囲
        const difficultyVariation = 1 + (Math.random() - 0.5) * difficulty.priceFluctuation;
        const totalVariation = baseVariation * difficultyVariation;
        
        const fakePrice = Math.round(itemData.fakePrice * totalVariation);
        const realPrice = Math.round(itemData.realPrice * totalVariation);
        
        inventory[itemKey] = {
            name: itemData.name,
            icon: itemData.icon,
            isReal: false, // 初期状態は全て偽物
            price: fakePrice,
            realPrice: realPrice
        };
    });
    
    // デバッグ用ログ
    console.log(`Day ${gameState.day} の商品が生成されました:`, Object.keys(inventory));
}

    // お客さんを生成（難易度調整版）
    function generateCustomer() {
        // お客さんごとに新しい商品を生成
        generateRandomInventory();
        updateInventoryDisplay();
        
        // 現在のインベントリにある商品からランダムに選択
        const availableItems = Object.keys(inventory);
        
        // インベントリが空の場合はエラーを防ぐ
        if (availableItems.length === 0) {
            console.error('インベントリが空です');
            return;
        }
        
        const randomItemKey = availableItems[Math.floor(Math.random() * availableItems.length)];
        
        // 現在の日の難易度設定を取得
        const difficulty = dayDifficulty[gameState.day] || dayDifficulty[1];
        
        // お客さんのタイプを生成（難易度に応じて調整）
        const customer = {
            request: randomItemKey,
            message: `${inventory[randomItemKey].name}が欲しいです`,
            baseDetectChance: 30 + Math.floor(Math.random() * 20) + difficulty.customerDetectBonus
        };
        
        // 日数に応じて目利きレベルが上がる（より急激に）
        customer.detectChance = customer.baseDetectChance + (gameState.day - 1) * 8;
        if (customer.detectChance > 95) customer.detectChance = 95; // 最大95%まで
        
        // 連続失敗が多いとさらに厳しくなる
        if (gameState.consecutiveFailures >= 3) {
            customer.detectChance += 10;
            if (customer.detectChance > 95) customer.detectChance = 95;
        }
        
        gameState.currentCustomer = customer;
        gameState.customersToday++; // 来店数をカウント

        // 表示更新
        customerRequestDisplay.textContent = `「${customer.message}」`;

        // ⭐ ランダム画像設定
        const imgIndex = Math.floor(Math.random() * 10) + 1; // 1〜10
        const customerImg = document.getElementById('customer-img');
        customerImg.src = `images/customer_${imgIndex}.png`;

        selectItem(null);
        
        console.log(`お客さん ${gameState.customersToday} 人目: 新しい商品が生成されました`);
    }

// アイテム選択
function selectItem(itemId) {
    // 以前に選択されたアイテムのselectedクラスを削除
    if (gameState.selectedItem) {
        const previousItem = document.querySelector(`.item[data-item="${gameState.selectedItem}"]`);
        if (previousItem) {
            previousItem.classList.remove('selected');
        }
    }

    gameState.selectedItem = itemId;

    // 新しく選択されたアイテムにselectedクラスを追加
    if (itemId) {
        const newItem = document.querySelector(`.item[data-item="${itemId}"]`);
        if (newItem) {
            newItem.classList.add('selected');
        }
    }
    updateUI();
}

// 結果表示モーダル
function showResult(title, message) {
    resultTitle.textContent   = title;
    resultMessage.textContent = message;
    resultArea.style.display  = 'flex';
    if (navigator.vibrate) {
        navigator.vibrate(200); // 短い振動
    }
}

// ゲームオーバー表示モーダル
function showGameOver() {
    finalScoreDisplay.textContent = `最終スコア: ${gameState.money}円`;
    if (gameState.money >= 1000) {
        finalMessageDisplay.textContent = "すごい！あなたは一流の店主です！";
    } else if (gameState.money >= 500) {
        finalMessageDisplay.textContent = "よく頑張りました！";
    } else {
        finalMessageDisplay.textContent = "残念！次はもっと頑張ろう！";
    }
    gameoverArea.style.display = 'flex';

    // ゲームオーバー効果音を再生
    playSound(maouSound);

    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]); // 2回の短い振動
    }
}

// ゲームリセット
function resetGame() {
    // BGMが再生中なら止める
    bgm.pause();
    bgm.currentTime = 0;

    gameState = {
        money: 500,
        trust: 100,
        day: 1,
        selectedItem: null,
        currentCustomer: null,
        consecutiveFailures: 0,
        lastAction: null,
        dailySales: [], // 日別売上記録
        totalSales: 0,  // 総売上
        gameCompleted: false, // ゲーム完了フラグ
        customersToday: 0, // 今日来店したお客さん数
        minCustomersPerDay: 4 // 1日の最小来店数
    };
    gameoverArea.style.display = 'none';
    resultArea.style.display   = 'none';
    startGame();
}

// ゲーム開始
function startGame() {
    // 最初にインベントリを生成
    generateRandomInventory();
    updateInventoryDisplay(); // 商品表示を更新
    updateUI();

    // BGMが既に再生中でない場合のみ再生
    if (bgm.paused) {
        bgm.currentTime = 0;
        const playPromise = bgm.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('BGMの自動再生がブロックされました:', error);
            });
        }
    }

    generateCustomer();
}

// 商品表示を更新する関数
function updateInventoryDisplay() {
    const itemsGrid = document.querySelector('.items-grid');
    if (!itemsGrid) {
        console.error('items-gridが見つかりません');
        return;
    }
    
    itemsGrid.innerHTML = ''; // 既存の商品をクリア
    
    // インベントリが空の場合は何もしない
    if (Object.keys(inventory).length === 0) {
        console.warn('インベントリが空です');
        return;
    }
    
    console.log('商品表示を更新中:', Object.keys(inventory));
    
    // 新しい商品を表示
    for (const itemId in inventory) {
        const item = inventory[itemId];
        if (!item) {
            console.error(`商品データが見つかりません: ${itemId}`);
            continue;
        }
        
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.dataset.item = itemId;
        
        itemElement.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-price">${item.price}円</div>
            <div class="item-quality ${item.isReal ? 'real' : 'fake'}" id="${itemId}-quality">
                ${item.isReal ? '本物' : '偽物'}
            </div>
        `;
        
        itemsGrid.appendChild(itemElement);
    }
    
    console.log('商品表示の更新が完了しました');
}

// イベントリスナー設定
document.addEventListener('DOMContentLoaded', () => {
    // アイテムクリックイベント
    itemsGrid.addEventListener('click', (event) => {
        const itemElement = event.target.closest('.item');
        if (itemElement) {
            const itemId = itemElement.dataset.item;
            if (itemId && inventory[itemId]) {
                selectItem(itemId);
            }
        }
    });

    // そのまま渡すボタン
    sellBtn.addEventListener('click', () => {
        if (!gameState.selectedItem) {
            showResult('エラー', '商品を選んでください！');
            return;
        }
        const item = inventory[gameState.selectedItem];
        if (!item) {
            showResult('エラー', '選択された商品が見つかりません！');
            return;
        }
        let message  = '';
        let title    = '';

        if (item.isReal) {
            gameState.money += item.realPrice;
            gameState.consecutiveFailures = 0; // 成功でリセット
            title   = '成功！';
            message = `${item.name}を本物として売りました！ ${item.realPrice}円ゲット！`;
            // 成功効果音を再生
            playSound(seikaiSound);
            addSalesRecord(gameState.day, item.realPrice, 'sell', item.name, true);
        } else {
            gameState.money += item.price;
            gameState.consecutiveFailures++; // 失敗カウント増加
            
            // 難易度に応じた信頼度減少（調整版）
            const difficulty = dayDifficulty[gameState.day] || dayDifficulty[1];
            let trustLoss = Math.round(8 * difficulty.trustPenalty); // 10→8に調整
            
            // 連続失敗時の追加ペナルティ
            if (gameState.consecutiveFailures >= 3) {
                trustLoss += Math.round(3 * difficulty.trustPenalty); // 5→3に調整
                message = `${item.name}を偽物として売りました。${item.price}円ゲットしましたが、連続失敗のため信頼度が${trustLoss}下がりました...。`;
            } else {
                message = `${item.name}を偽物として売りました。${item.price}円ゲットしましたが、信頼度が${trustLoss}下がりました...。`;
            }
            
            gameState.trust = Math.max(0, gameState.trust - trustLoss);
            console.log(`信頼度が ${trustLoss} 下がりました。現在の信頼度: ${gameState.trust}%`);
            title   = '残念！';
            
            // 失敗（偽物）効果音を再生
            playSound(fuseikaiSound);
            addSalesRecord(gameState.day, item.price, 'sell', item.name, false);
        }
        showResult(title, message);
    });

    // ウソをつくボタン
    lieBtn.addEventListener('click', () => {
        if (!gameState.selectedItem) {
            showResult('エラー', '商品を選んでください！');
            return;
        }
        const item = inventory[gameState.selectedItem];
        if (!item) {
            showResult('エラー', '選択された商品が見つかりません！');
            return;
        }
        const successChance = 100 - gameState.currentCustomer.detectChance;
        const isSuccess     = Math.random() * 100 < successChance;
        let message         = '';
        let title           = '';

        if (isSuccess) {
            gameState.money += item.realPrice * 2; // ウソが成功すると2倍の値段
            gameState.consecutiveFailures = 0; // 成功でリセット
            title   = '大成功！';
            message = `ウソがバレずに大成功！${item.name}を本物として売りました！${item.realPrice * 2}円ゲット！`;
            // 成功効果音を再生
            playSound(seikaiSound);
            addSalesRecord(gameState.day, item.realPrice * 2, 'lie', item.name, true);
        } else {
            gameState.consecutiveFailures++; // 失敗カウント増加
            
            // 難易度に応じた信頼度減少（調整版）
            const difficulty = dayDifficulty[gameState.day] || dayDifficulty[1];
            let trustLoss = Math.round(20 * difficulty.trustPenalty); // 25→20に調整
            
            // 連続失敗時の追加ペナルティ
            if (gameState.consecutiveFailures >= 3) {
                trustLoss += Math.round(8 * difficulty.trustPenalty); // 10→8に調整
            }
            
            gameState.trust = Math.max(0, gameState.trust - trustLoss);
            console.log(`ウソがバレて信頼度が ${trustLoss} 下がりました。現在の信頼度: ${gameState.trust}%`);
            const angryComment = angryComments[Math.floor(Math.random() * angryComments.length)];
            title   = '大失敗...';
            message = `ウソがバレました！\n\n${angryComment}\n\n信頼度が${trustLoss}下がりました...。`;
            // 失敗効果音を再生
            playSound(fuseikaiSound);
            addSalesRecord(gameState.day, 0, 'lie', item.name, false);
        }
        showResult(title, message);
    });

    // 本物に交換ボタン
    upgradeBtn.addEventListener('click', () => {
        if (!gameState.selectedItem) {
            showResult('エラー', '商品を選んでください！');
            return;
        }
        const item = inventory[gameState.selectedItem];
        if (!item) {
            showResult('エラー', '選択された商品が見つかりません！');
            return;
        }
        if (gameState.money < 100) {
            showResult('お金が足りません！', '本物に交換するには100円必要です。');
            // 失敗効果音を再生
            playSound(fuseikaiSound);
            return;
        }
        if (item.isReal) {
            showResult('情報', 'この商品はすでに本物です。');
            return;
        }

        gameState.money -= 100;
        item.isReal = true;
        gameState.trust = Math.min(100, gameState.trust + 5); // 信頼度は100を超えない
        showResult('交換成功！', `${item.name}を本物に交換しました！信頼度も5アップ！`);
        // 成功効果音を再生
        playSound(seikaiSound);
        addSalesRecord(gameState.day, -100, 'upgrade', item.name, true);
    });

    // 次のお客さんボタン
    nextBtn.addEventListener('click', () => {
        resultArea.style.display = 'none';

        // 来店数が最小来店数に達したかチェック
        if (gameState.customersToday >= gameState.minCustomersPerDay) {
            // 日が進むときの効果音
            playSound(levelupSound);

            gameState.day++;
            gameState.customersToday = 0; // 来店数をリセット
            
            console.log(`Day ${gameState.day} に進みました`);
            
            if (gameState.trust <= 0) {
                console.log('ゲームオーバー: 信頼度が0になりました');
                showGameOver();
            } else if (gameState.day > 5) {
                // 5日目終了でゲーム完了
                console.log('ゲーム完了: 5日間の営業が終了しました');
                showSalesReview();
            } else {
                // 日終了時のレビューを表示
                showSalesReview();
            }
        } else {
            // まだ来店数が足りない場合は次のお客さんを生成
            generateCustomer();
            updateUI();
        }
    });

    // もう一度プレイボタン
    restartBtn.addEventListener('click', resetGame);

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

    startGame();
});
