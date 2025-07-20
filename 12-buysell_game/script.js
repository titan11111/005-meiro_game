// ゲームの状態管理
let gameState = {
    money: 1000,
    day: 1,
    trust: 50,
    level: 1, // プレイヤーレベル
    exp: 0, // 経験値
    expToNextLevel: 100, // 次のレベルに必要な経験値
    inventory: [], // 仕入れた商品（棚に並べていないもの）
    shopItems: [], // 棚に並べた商品
    dailyCosts: 0, // その日の仕入れ費用
    dailyIncome: 0, // その日の売上
    customerCount: 0, // その日の来店客数（購入した顧客数）
    dailyExpGained: 0, // その日の獲得経験値
    displayMode: 'normal', // 現在の陳列モード
    currentPhase: 'buy' // 現在のゲームフェーズ (buy, display, sell, result)
};

// 商品データベース
const itemDatabase = [
    { id: 1, name: 'あまーいチョコ', icon: '🍫', basePrice: 80, category: 'food' },
    { id: 2, name: 'おもちゃの車', icon: '🚗', basePrice: 500, category: 'toy' },
    { id: 3, name: '光る石', icon: '💎', basePrice: 300, category: 'gem' },
    { id: 4, name: '宇宙の地図', icon: '🗺️', basePrice: 150, category: 'book' },
    { id: 5, name: 'ロボットの手', icon: '🤖', basePrice: 400, category: 'tech' },
    { id: 6, name: '魔法の杖', icon: '🪄', basePrice: 600, category: 'magic' }
];

// 売り手データベース
const sellerDatabase = [
    { name: '宇宙商人ゼータ', icon: '👽', story: '故郷の星で見つけた古い部品です。現金が必要で...' },
    { name: 'ロボット商人R2', icon: '🤖', story: '工場で余った材料です。安く譲りますよ！' },
    { name: '魔法使いウィザード', icon: '🧙‍♂️', story: '冒険で手に入れた宝物です。どうでしょう？' },
    { name: 'かわいい妖精', icon: '🧚‍♀️', story: '森で拾った綺麗なものです。気に入ってくれるかな？' }
];

// お客様データベース (画像パスは `./images/` ディレクトリにあることを想定)
const customerDatabase = [
    {
        name: 'おしゃれ中学生',
        icon: '👦',
        image: './images/customer_1.png',
        need: 'かわいいものとか、美味しいものが欲しいです。',
        budget: 400,
        preferences: ['food', 'toy']
    },
    {
        name: 'AI修理技師ロボ',
        icon: '🤖',
        image: './images/customer_2.png',
        need: 'AIの部品を探しています。',
        budget: 300,
        preferences: ['tech']
    },
    {
        name: '宇宙探検家',
        icon: '👨‍🚀',
        image: './images/customer_3.png',
        need: '宇宙旅行に役立つものを探しています。',
        budget: 800,
        preferences: ['tech', 'book']
    },
    {
        name: '魔法学校の生徒',
        icon: '🧙‍♀️',
        image: './images/customer_4.png',
        need: '魔法の勉強に使えるものはありますか？',
        budget: 600,
        preferences: ['magic', 'gem']
    },
    {
        name: '謎のコレクター',
        icon: '🕵️',
        image: './images/customer_5.png',
        need: '珍しいものを探している。値段は気にしない。',
        budget: 1000,
        preferences: ['gem', 'magic']
    },
    {
        name: '読書好きの老人',
        icon: '👴',
        image: './images/customer_6.png',
        need: '静かな読書時間を過ごしたい。新しい物語を探している。',
        budget: 250,
        preferences: ['book']
    },
    {
        name: '元気な子供',
        icon: '👧',
        image: './images/customer_7.png',
        need: 'わくわくするものが欲しい！',
        budget: 300,
        preferences: ['toy']
    },
    {
        name: '宇宙農家',
        icon: '🧑‍🌾',
        image: './images/customer_8.png',
        need: '宇宙でも育つ食材を探している。',
        budget: 180,
        preferences: ['food']
    },
    {
        name: 'インフルエンサー',
        icon: '📸',
        image: './images/customer_9.png',
        need: 'SNS映えするアイテムを探しています！',
        budget: 500,
        preferences: ['gem', 'tech']
    }
];

// 現在のオファーと顧客
let currentOffer = null;
let currentCustomer = null;
let currentMarketNews = ''; // 今日の市場ニュース

// ゲーム開始時の初期化
function initGame() {
    updateDisplay();
    generateOffer(); // 初回オファー生成
    showPhase('buy'); // 購入フェーズから開始
    showMessage('🚀 未来商店「コスモマート」へようこそ！');
    generateMarketNews(); // 初回ニュース生成
}

// 表示更新
function updateDisplay() {
    document.getElementById('money').textContent = gameState.money;
    document.getElementById('day').textContent = gameState.day;
    document.getElementById('trust').textContent = gameState.trust;
    document.getElementById('level').textContent = gameState.level;
}

// オファー生成
function generateOffer() {
    const randomItem = itemDatabase[Math.floor(Math.random() * itemDatabase.length)];
    const randomSeller = sellerDatabase[Math.floor(Math.random() * sellerDatabase.length)];
    // レベルが上がると良い商品が安く手に入りやすくなる
    const priceMultiplier = 0.5 + (0.5 * (1 - (gameState.trust / 100)) * (1 - (gameState.level / 10))); // レベルと信頼度で価格を調整
    const price = Math.floor(randomItem.basePrice * priceMultiplier * (0.8 + Math.random() * 0.4)); // 価格にランダム性
    
    currentOffer = {
        ...randomItem,
        seller: randomSeller,
        offerPrice: Math.max(10, price), // 最低価格を保証
        buyPrice: price // 実際の仕入れ価格
    };
    
    document.getElementById('seller-name').textContent = randomSeller.name;
    document.getElementById('seller-story').textContent = randomSeller.story;
    document.querySelector('.seller-portrait').textContent = randomSeller.icon;
    
    document.getElementById('offer-icon').textContent = randomItem.icon;
    document.getElementById('offer-name').textContent = randomItem.name;
    document.getElementById('offer-description').textContent = `${randomItem.name}です。カテゴリ: ${randomItem.category}`;
    document.getElementById('offer-price').textContent = currentOffer.offerPrice;
}

// 交渉処理
function negotiate(type) {
    if (!currentOffer) {
        showMessage('🚨 オファーがありません。');
        return;
    }
    
    let finalPrice = currentOffer.offerPrice;
    let trustChange = 0;
    let message = '';

    switch(type) {
        case 'kind':
            // 親切な対応は価格そのまま、信頼度アップ
            trustChange = 2;
            message = '😊 親切な対応で信頼度が上がりました！';
            break;
        case 'neutral':
            // 通常交渉は少し安く、信頼度変化なし
            finalPrice = Math.floor(currentOffer.offerPrice * 0.9);
            trustChange = 0;
            message = '🤝 普通の交渉が成立しました';
            break;
        case 'strict':
            // 厳しい交渉は安く買えるが、信頼度ダウン
            finalPrice = Math.floor(currentOffer.offerPrice * 0.7);
            trustChange = -1;
            message = '💼 厳しい交渉で安く買えましたが、信頼度が少し下がりました';
            break;
    }
    
    if (gameState.money >= finalPrice) {
        gameState.money -= finalPrice;
        gameState.dailyCosts += finalPrice;
        gameState.trust = Math.max(0, Math.min(100, gameState.trust + trustChange));
        
        // 在庫に追加
        const purchasedItem = {
            ...currentOffer,
            buyPrice: finalPrice, // 最終交渉価格を仕入れ値とする
            sellPrice: Math.floor(finalPrice * 1.5) // デフォルト販売価格
        };
        gameState.inventory.push(purchasedItem);
        
        showMessage(message);
        updateDisplay();
        generateOffer(); // 新しいオファーを生成
    } else {
        showMessage('💸 お金が足りません！');
    }
}

// 購入スキップ
function skipBuy() {
    showMessage('❌ 今回の商品はパスしました');
    generateOffer(); // 新しいオファーを生成
}

// メッセージ表示
function showMessage(text) {
    const messageEl = document.getElementById('message-display');
    messageEl.textContent = text;
    messageEl.style.display = 'block';
    clearTimeout(messageEl.dataset.timerId); // 既存のタイマーをクリア
    const timerId = setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
    messageEl.dataset.timerId = timerId; // 新しいタイマーIDを保存
}

// フェーズ表示切り替え
function showPhase(phase) {
    // すべてのフェーズを非表示
    document.querySelectorAll('.phase-container').forEach(el => {
        el.classList.remove('active');
    });
    
    // 指定されたフェーズを表示
    document.getElementById(phase + '-phase').classList.add('active');
    gameState.currentPhase = phase;
    
    if (phase === 'display') {
        updateInventoryDisplay();
        setDisplayMode(gameState.displayMode); // 現在の陳列モードを適用
    } else if (phase === 'sell') {
        generateCustomer();
        updateShopDisplayForSellPhase(); // 販売フェーズ用の商品表示を更新
    }
}

// 陳列フェーズへ移動
function goToDisplayPhase() {
    // 初回仕入れ時に仕入れフェーズをスキップした場合など、inventoryが空の状態でdisplay-phaseに移行しないようにチェック
    if (gameState.inventory.length === 0 && gameState.shopItems.length === 0) {
        showMessage('📦 まだ商品がありません。仕入れを続けましょう。');
        generateOffer(); // 再度仕入れを促す
    } else {
        showPhase('display');
        showMessage('🛍️ 在庫からお店の棚に商品を陳列しましょう。');
    }
}

// 在庫表示更新
function updateInventoryDisplay() {
    const inventoryEl = document.getElementById('inventory');
    inventoryEl.innerHTML = '';
    
    if (gameState.inventory.length === 0) {
        inventoryEl.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);">在庫がありません</p>';
    }

    gameState.inventory.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'inventory-item';
        itemEl.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <h4>${item.name}</h4>
            <div class="price">仕入: ${item.buyPrice}円</div>
            <div class="current-sell-price">売値: ${item.sellPrice}円</div>
        `;
        itemEl.onclick = () => moveItemToShop(index); // クリックで棚へ移動
        inventoryEl.appendChild(itemEl);
    });
}

// 陳列モード設定
function setDisplayMode(mode) {
    gameState.displayMode = mode;
    
    // ボタンのアクティブ状態更新
    document.querySelectorAll('.display-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('display-' + mode).classList.add('active');
    
    // カスタム価格設定の表示/非表示
    const priceSection = document.getElementById('price-setting-section');
    if (mode === 'custom') {
        priceSection.style.display = 'block';
        updatePriceSettingItems();
    } else {
        priceSection.style.display = 'none';
        // 自動価格設定
        // 在庫と棚内の商品すべてに適用
        [...gameState.inventory, ...gameState.shopItems].forEach(item => {
            switch(mode) {
                case 'normal':
                    item.sellPrice = Math.floor(item.buyPrice * 1.5);
                    break;
                case 'theme':
                    item.sellPrice = Math.floor(item.buyPrice * 1.8);
                    break;
                case 'sale':
                    item.sellPrice = Math.floor(item.buyPrice * 1.2);
                    break;
                case 'premium':
                    item.sellPrice = Math.floor(item.buyPrice * 2.0);
                    break;
            }
        });
    }
    
    updateInventoryDisplay(); // 在庫の表示価格も更新
    updateShopDisplay(); // 棚の表示価格も更新
    
    let modeMessage = '';
    switch(mode) {
        case 'normal': modeMessage = '📦 普通陳列: 標準的な価格設定'; break;
        case 'theme': modeMessage = '🎨 テーマ展示: 見た目重視で高めの価格'; break;
        case 'sale': modeMessage = '💰 安売りコーナー: お手頃価格で薄利多売'; break;
        case 'premium': modeMessage = '✨ プレミアム棚: 高級感で高価格'; break;
        case 'custom': modeMessage = '🏷️ カスタム価格: 自由に価格設定'; break;
    }
    showMessage(modeMessage);
}

// 価格設定アイテム更新 (カスタム価格モード用)
function updatePriceSettingItems() {
    const container = document.getElementById('price-setting-items');
    container.innerHTML = '';
    
    // 在庫と棚の全ての商品をカスタム価格設定の対象とする
    const allDisplayableItems = [...gameState.inventory, ...gameState.shopItems]; 
    
    if (allDisplayableItems.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);">設定できる商品がありません</p>';
        return;
    }

    allDisplayableItems.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'price-item';
        const buyPriceText = item.buyPrice !== undefined ? `${item.buyPrice}円` : '不明';
        itemEl.innerHTML = `
            <div class="price-item-header">
                <span class="price-item-icon">${item.icon}</span>
                <span class="price-item-name">${item.name}</span>
            </div>
            <div class="price-item-info">仕入価格: ${buyPriceText}</div>
            <div class="price-input-area">
                <input type="number" value="${item.sellPrice}" min="${item.buyPrice || 1}" 
                       id="item-price-input-${index}" onchange="updateItemPrice(${index}, this.value, '${item.category}')">
                <span>円</span>
                <button class="price-preset-btn" onclick="setPresetPrice(${index}, 1.2)">安売り</button>
                <button class="price-preset-btn" onclick="setPresetPrice(${index}, 1.5)">標準</button>
                <button class="price-preset-btn" onclick="setPresetPrice(${index}, 2.0)">高級</button>
            </div>
        `;
        container.appendChild(itemEl);
    });
}

// アイテム価格更新 (カスタム価格入力時)
function updateItemPrice(index, priceValue, category) {
    const numPrice = parseInt(priceValue);
    let targetItem;

    // indexがinventoryの範囲内か、shopItemsの範囲内かで判断
    if (index < gameState.inventory.length) {
        targetItem = gameState.inventory[index];
    } else {
        // shopItems内のインデックスに変換
        targetItem = gameState.shopItems[index - gameState.inventory.length];
    }

    // 仕入れ価格より低い設定を防ぐ
    if (numPrice >= (targetItem.buyPrice || 1)) {
        targetItem.sellPrice = numPrice;
        showMessage(`${targetItem.name} の販売価格を${numPrice}円に設定しました。`);
    } else {
        showMessage('🚨 仕入価格より低く設定できません。');
        // 入力値を元に戻す
        const inputElement = document.getElementById(`item-price-input-${index}`);
        if (inputElement) inputElement.value = targetItem.sellPrice;
    }
    updateInventoryDisplay();
    updateShopDisplay();
}

// プリセット価格設定 (カスタム価格モード用)
function setPresetPrice(index, multiplier) {
    let targetItem;

    if (index < gameState.inventory.length) {
        targetItem = gameState.inventory[index];
    } else {
        targetItem = gameState.shopItems[index - gameState.inventory.length];
    }

    const newPrice = Math.floor((targetItem.buyPrice || 1) * multiplier);
    targetItem.sellPrice = newPrice;
    showMessage(`${targetItem.name} の販売価格をプリセット価格に設定しました。`);
    updatePriceSettingItems(); // カスタム価格設定の表示を更新
    updateInventoryDisplay(); // 在庫の表示価格も更新
    updateShopDisplay(); // 棚の表示価格も更新
}

// 持ち物から棚へ商品を移動
function moveItemToShop(inventoryIndex) {
    if (gameState.shopItems.length >= 9) { // 仮に棚の最大数を9個とします
        showMessage('お店の棚はもういっぱいです！');
        return;
    }
    const item = gameState.inventory.splice(inventoryIndex, 1)[0]; // 在庫から削除
    gameState.shopItems.push(item); // 棚に追加
    showMessage(`${item.name} をお店の棚に陳列しました！`);
    updateInventoryDisplay();
    updateShopDisplay();
    // カスタム価格設定が表示されている場合は更新
    if (gameState.currentPhase === 'display' && gameState.displayMode === 'custom') {
        updatePriceSettingItems();
    }
}

// 棚から持ち物へ商品を移動 (陳列フェーズでのみ可能)
function moveItemToInventory(shopIndex) {
    if (gameState.currentPhase !== 'display') return; // 陳列フェーズ以外では動かせない
    const item = gameState.shopItems.splice(shopIndex, 1)[0]; // 棚から削除
    gameState.inventory.push(item); // 在庫に追加
    showMessage(`${item.name} を持ち物に戻しました。`);
    updateInventoryDisplay();
    updateShopDisplay();
    // カスタム価格設定が表示されている場合は更新
    if (gameState.currentPhase === 'display' && gameState.displayMode === 'custom') {
        updatePriceSettingItems();
    }
}

// 棚の商品表示更新（陳列フェーズ用）
function updateShopDisplay() {
    const shopEl = document.getElementById('shop-items');
    shopEl.innerHTML = '';
    
    if (gameState.shopItems.length === 0) {
        shopEl.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);">棚に商品がありません</p>';
    }

    gameState.shopItems.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'shop-item';
        itemEl.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <h4>${item.name}</h4>
            <div class="price">売値: ${item.sellPrice}円</div>
        `;
        itemEl.onclick = () => moveItemToInventory(index); // クリックで持ち物に戻す
        shopEl.appendChild(itemEl);
    });
}

// 販売開始
function startSelling() {
    if (gameState.shopItems.length === 0) {
        showMessage('お店に商品がありません！陳列しましょう。');
        return;
    }
    gameState.customerCount = 0;
    gameState.dailyExpGained = 0; // その日の経験値をリセット
    showPhase('sell');
    generateCustomer(); // 最初のお客様を呼ぶ
    showMessage('お客様がいらっしゃいました！');
}

// 顧客生成
function generateCustomer() {
    currentCustomer = customerDatabase[Math.floor(Math.random() * customerDatabase.length)];
    
    document.getElementById('customer-name').textContent = currentCustomer.name;
    document.getElementById('customer-need').textContent = `${currentCustomer.need} 予算は${currentCustomer.budget}円です。`;
    
    const customerPortraitImg = document.getElementById('customer-portrait-img');
    const customerPortraitFallback = document.getElementById('customer-portrait-fallback');

    // まず両方を非表示にする
    customerPortraitImg.style.display = 'none';
    customerPortraitFallback.style.display = 'none';

    if (currentCustomer.image) {
        const img = new Image();
        img.onload = function() {
            customerPortraitImg.src = currentCustomer.image;
            customerPortraitImg.alt = `${currentCustomer.name}のポートレート`;
            customerPortraitImg.style.display = 'block'; // 画像を表示
        };
        img.onerror = function() {
            // 画像が読み込めない場合は絵文字を表示
            customerPortraitFallback.textContent = currentCustomer.icon;
            customerPortraitFallback.style.display = 'flex'; // 絵文字を表示
        };
        img.src = currentCustomer.image; // 画像パスをセットして読み込み開始
    } else {
        // 画像パスがない場合は絵文字を表示
        customerPortraitFallback.textContent = currentCustomer.icon;
        customerPortraitFallback.style.display = 'flex'; // 絵文字を表示
    }
    updateShopDisplayForSellPhase(); // 販売フェーズの商品表示も更新
}


// 販売フェーズでの店頭商品表示更新
function updateShopDisplayForSellPhase() {
    const shopEl = document.getElementById('shop-items-sell-preview');
    shopEl.innerHTML = '';
    
    if (gameState.shopItems.length === 0) {
        shopEl.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);">棚に商品がありません</p>';
    }

    gameState.shopItems.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'shop-item';
        itemEl.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <h4>${item.name}</h4>
            <div class="price">${item.sellPrice}円</div>
        `;
        itemEl.onclick = () => customerBuyFromItem(item, index); // クリックでその商品を顧客に提案
        shopEl.appendChild(itemEl);
    });
}

// 顧客の購入判定（「何か買ってもらう」ボタンをクリックした場合）
function customerBuy() {
    if (!currentCustomer || gameState.shopItems.length === 0) {
        showMessage('🛍️ 販売する商品がありません。');
        return;
    }
    
    // 顧客の好みと予算に合った商品を探す
    const potentialItems = gameState.shopItems.filter(item => 
        item.sellPrice <= currentCustomer.budget
    );
    
    const preferredItems = potentialItems.filter(item =>
        currentCustomer.preferences.includes(item.category)
    );
    
    let boughtItem = null;
    let message = '';
    let trustBonus = 0;
    
    // 好みの商品があればそれを優先的に選ぶ
    if (preferredItems.length > 0) {
        boughtItem = preferredItems[Math.floor(Math.random() * preferredItems.length)];
    } else if (potentialItems.length > 0) {
        // 好みでなくても予算内なら買う可能性がある (信頼度が高いと購入確率アップ)
        if (Math.random() < 0.3 + (gameState.trust / 300)) { 
            boughtItem = potentialItems[Math.floor(Math.random() * potentialItems.length)];
        }
    }

    if (boughtItem) {
        // 市場ニュースの影響を考慮
        let sellPrice = boughtItem.sellPrice;
        // 日本語カテゴリ名と内部カテゴリ名をマッピング
        const itemCategoryNameMap = {
            'food': '食べ物', 'toy': 'おもちゃ', 'gem': '宝石', 
            'book': '書籍', 'tech': 'テクノロジー', 'magic': '魔法'
        };
        const currentItemCategoryName = itemCategoryNameMap[boughtItem.category];
        
        // 市場ニュースが特定のカテゴリに言及しているかチェック
        const marketNewsEffect = currentMarketNews.includes(currentItemCategoryName);
        if (marketNewsEffect) {
             sellPrice = Math.floor(sellPrice * 1.2); // 関連商品の価格を1.2倍に
             message += `✨市場ニュースのおかげで、${boughtItem.name}が高く売れました！`;
        }

        // 陳列方式によるボーナス計算
        switch(gameState.displayMode) {
            case 'theme':
                if (currentCustomer.preferences.includes(boughtItem.category)) {
                    sellPrice = Math.floor(sellPrice * 1.05); // テーマに合致で少し価格アップ
                    trustBonus += 1;
                }
                break;
            case 'sale':
                // 安売りなので価格ダウンはすでにsetDisplayModeで適用済み
                trustBonus += 1; // 信頼度アップ
                break;
            case 'premium':
                if (currentCustomer.budget >= sellPrice * 1.2) { // 顧客の予算が高ければプレミアム効果
                    sellPrice = Math.floor(sellPrice * 1.1); // 価格アップ
                    trustBonus += 2; // 信頼度アップ
                }
                break;
        }

        gameState.money += sellPrice;
        gameState.dailyIncome += sellPrice;
        gameState.exp += Math.floor(boughtItem.basePrice / 10); // 経験値を獲得
        gameState.dailyExpGained += Math.floor(boughtItem.basePrice / 10); // その日の獲得経験値も更新
        gameState.trust = Math.min(100, gameState.trust + trustBonus + 3); // 信頼度アップ
        
        // 商品を店頭から削除
        const itemIndex = gameState.shopItems.indexOf(boughtItem);
        if (itemIndex > -1) {
            gameState.shopItems.splice(itemIndex, 1);
        }
        
        showMessage(`${message}💰 ${boughtItem.name}が${sellPrice}円で売れました！`);
        gameState.customerCount++; // 販売した場合のみ来店客数にカウント
        checkLevelUp(); // レベルアップチェック
    } else {
        // 買わなかった場合
        showMessage('😔 お客様の興味を引く商品がありませんでした。');
        gameState.trust = Math.max(0, gameState.trust - 1); // 信頼度微減
    }
    updateDisplay();
    updateShopDisplayForSellPhase(); // 販売フェーズの商品表示も更新
}

// 顧客が特定の店頭商品をクリックした場合の購入判定
function customerBuyFromItem(item, index) {
    if (!currentCustomer) return;

    let sellPrice = item.sellPrice;
    let message = '';
    let trustBonus = 0;

    const isPreferred = currentCustomer.preferences.includes(item.category);
    const isAffordable = item.sellPrice <= currentCustomer.budget;

    if (isAffordable && (isPreferred || Math.random() < (0.2 + gameState.trust / 500))) { // 好みでなくても信頼度で買う可能性
        // 市場ニュースの影響を考慮 (customerBuyと同じロジックを適用)
        const itemCategoryNameMap = {
            'food': '食べ物', 'toy': 'おもちゃ', 'gem': '宝石', 
            'book': '書籍', 'tech': 'テクノロジー', 'magic': '魔法'
        };
        const currentItemCategoryName = itemCategoryNameMap[item.category];
        
        const marketNewsEffect = currentMarketNews.includes(currentItemCategoryName);
        if (marketNewsEffect) {
            sellPrice = Math.floor(sellPrice * 1.2);
            message += `✨市場ニュースのおかげで、${item.name}が高く売れました！`;
        }

        // 陳列方式によるボーナス計算
        switch(gameState.displayMode) {
            case 'theme':
                if (isPreferred) {
                    sellPrice = Math.floor(sellPrice * 1.05);
                    trustBonus += 1;
                }
                break;
            case 'sale':
                trustBonus += 1;
                break;
            case 'premium':
                if (currentCustomer.budget >= sellPrice * 1.2) {
                    sellPrice = Math.floor(sellPrice * 1.1);
                    trustBonus += 2;
                }
                break;
        }

        gameState.money += sellPrice;
        gameState.dailyIncome += sellPrice;
        gameState.exp += Math.floor(item.basePrice / 10);
        gameState.dailyExpGained += Math.floor(item.basePrice / 10);
        gameState.trust = Math.min(100, gameState.trust + trustBonus + 3);
        
        gameState.shopItems.splice(index, 1); // 販売した商品を棚から削除
        gameState.customerCount++;

        showMessage(`${message}💰 ${item.name}を${sellPrice}円で売りました！`);
        checkLevelUp();
    } else {
        showMessage('😔 お客様はあまり興味がないようです...');
        gameState.trust = Math.max(0, gameState.trust - 1);
    }
    updateDisplay();
    updateShopDisplayForSellPhase(); // 販売フェーズの商品表示も更新
}

// レベルアップ判定と処理
function checkLevelUp() {
    if (gameState.exp >= gameState.expToNextLevel) {
        gameState.level++;
        gameState.exp -= gameState.expToNextLevel; // 超過分は次レベルへ持ち越し
        gameState.expToNextLevel = Math.floor(gameState.expToNextLevel * 1.5); // 次のレベルに必要な経験値を増加
        gameState.trust = Math.min(100, gameState.trust + 5); // レベルアップで信頼度も少し回復
        showMessage(`✨レベルアップ！レベル${gameState.level}になりました！`);
        showLevelUpModal(); // モーダルを表示
        updateDisplay();
    }
}

// レベルアップモーダル表示
function showLevelUpModal() {
    document.getElementById('modal-level').textContent = gameState.level;
    document.getElementById('level-up-modal').style.display = 'flex'; // flexで表示
}

// モーダルを閉じる
function closeModal() {
    document.getElementById('level-up-modal').style.display = 'none';
}

// 次の顧客
function nextCustomer() {
    generateCustomer();
    showMessage('👋 新しいお客様がいらっしゃいました');
}

// 販売終了
function endSelling() {
    showPhase('result');
    updateResults();
}

// 結果更新
function updateResults() {
    const profit = gameState.dailyIncome - gameState.dailyCosts;
    
    document.getElementById('buy-cost').textContent = gameState.dailyCosts;
    document.getElementById('sell-income').textContent = gameState.dailyIncome;
    document.getElementById('daily-profit').textContent = profit;
    document.getElementById('customer-count').textContent = gameState.customerCount;
    document.getElementById('exp-gained').textContent = gameState.dailyExpGained; // 獲得経験値を表示
    
    generateMarketNews(); // 次の日の市場ニュースを生成
}

// 市場ニュース生成
function generateMarketNews() {
    const categories = ['food', 'toy', 'gem', 'book', 'tech', 'magic'];
    const affectedCategory = categories[Math.floor(Math.random() * categories.length)];
    let newsText = '';

    // 日本語の市場ニュースをカテゴリに関連付けて生成
    switch (affectedCategory) {
        case 'food':
            newsText = '「グルメ番組の影響で、美味しい食べ物の需要が高まっています。」';
            break;
        case 'toy':
            newsText = '「新しいアニメの影響で、おもちゃが大人気になりそうです！」';
            break;
        case 'gem':
            newsText = '「宇宙で珍しい鉱石が発見！宝石類が高値で取引されるでしょう。」';
            break;
        case 'book':
            newsText = '「ベストセラーSF小説の映画化が決定！SF書籍の売り上げが伸びそうです。」';
            break;
        case 'tech':
            newsText = '「新世代AIチップが発表！テクノロジー関連商品に注目が集まります。」';
            break;
        case 'magic':
            newsText = '「魔法学校の入学者増加！魔法用品が品薄になるかもしれません。」';
            break;
        default:
            newsText = '「特に変わったニュースはありません。」';
            break;
    }
    currentMarketNews = newsText; // 現在の市場ニュースを保存
    document.getElementById('market-news').textContent = newsText;
}


// 次の日へ
function nextDay() {
    gameState.day++;
    gameState.dailyCosts = 0;
    gameState.dailyIncome = 0;
    gameState.customerCount = 0;
    gameState.dailyExpGained = 0; // 獲得経験値をリセット
    gameState.inventory = [...gameState.shopItems]; // 棚の商品を在庫に戻す（持ち越し）
    gameState.shopItems = []; // 棚を空にする
    
    updateDisplay();
    generateOffer();
    showPhase('buy');
    showMessage(`🌅 Day ${gameState.day}が始まりました！`);
}

// 画面回転の推奨メッセージ
function checkOrientation() {
    const messageDisplay = document.getElementById('message-display'); // メッセージ要素を取得
    if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
        // 現在メッセージが表示されていない、または異なるメッセージが表示されている場合のみ表示
        if (!messageDisplay.textContent.includes('スマホを横向きに')) {
            showMessage('📱 スマホを横向きにするとより遊びやすくなります！');
        }
    } else {
        // 横向きになったらメッセージを消す
        if (messageDisplay.textContent.includes('スマホを横向きに')) {
            clearTimeout(messageDisplay.dataset.timerId); // タイマーをクリア
            messageDisplay.style.display = 'none'; // メッセージを非表示
            messageDisplay.textContent = ''; // テキストもクリア
        }
    }
}

// ゲーム初期化
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    checkOrientation();
    
    // 画面回転時の処理
    window.addEventListener('orientationchange', function() {
        // orientationchangeイベントはsetTimeoutで少し遅延させると安定する
        setTimeout(checkOrientation, 100);
    });

    // リサイズ時の処理も追加 (PCブラウザでウィンドウサイズを変更した時に対応)
    window.addEventListener('resize', checkOrientation);
});