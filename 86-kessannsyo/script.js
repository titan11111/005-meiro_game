// ゲーム状態
let currentLevel = 0;
let selectedBoxes = [];
let score = 0;
let showResult = false;
let comboCount = 0;
let maxCombo = 0;
let currentRank = 0;

// 決算書データ
let balanceSheet = {
    cash: 0,
    receivables: 0,
    inventory: 0,
    insurance: 0,
    building: 0,
    payables: 0,
    loans: 0,
    capital: 0
};

let profitLoss = {
    sales: 0,
    cogs: 0,
    executiveSalary: 0,
    salary: 0,
    insuranceExpense: 0,
    otherIncome: 0,
    otherExpense: 0
};

// ランクシステム
const ranks = [
    { name: "ブロンズ", badge: "🥉", combo: 0, color: "#cd7f32" },
    { name: "シルバー", badge: "🥈", combo: 3, color: "#c0c0c0" },
    { name: "ゴールド", badge: "🥇", combo: 6, color: "#ffd700" },
    { name: "プラチナ", badge: "💎", combo: 10, color: "#e5e4e2" },
    { name: "ダイヤモンド", badge: "💠", combo: 15, color: "#b9f2ff" }
];

// 褒めメッセージ
const praiseMessages = [
    "すごい！完璧です！ ✨",
    "素晴らしい！天才ですね！ 🌟",
    "お見事！その調子！ 🎉",
    "パーフェクト！最高です！ 🏆",
    "やったー！大正解！ 🎊",
    "素敵！センス抜群です！ ⭐",
    "凄腕ですね！プロ級です！ 💪",
    "ブラボー！最高の判断！ 👏",
    "神業！完璧な理解力！ ⚡",
    "スーパー！あなたは天才！ 🚀"
];

// 問題データ（35問）
const problems = [
    {
        level: 1,
        question: "🎉 会社設立おめでとう！資本金500万円を出資し、事務所を現金200万円で購入しました。",
        correctAnswers: ["cash", "capital", "building"],
        changes: { cash: 300, capital: 500, building: 200 }
    },
    {
        level: 2,
        question: "銀行から現金300万円を借りました。",
        correctAnswers: ["cash", "loans"],
        changes: { cash: 300, loans: 300 }
    },
    {
        level: 3,
        question: "商品を現金100万円で仕入れました。",
        correctAnswers: ["cash", "inventory"],
        changes: { cash: -100, inventory: 100 }
    },
    {
        level: 4,
        question: "商品を現金150万円で売りました。（仕入れ値は100万円）",
        correctAnswers: ["cash", "inventory", "sales", "cogs"],
        changes: { cash: 150, inventory: -100, sales: 150, cogs: 100 }
    },
    {
        level: 5,
        question: "商品を売掛金200万円で売りました。（まだ現金はもらっていません）",
        correctAnswers: ["receivables", "sales"],
        changes: { receivables: 200, sales: 200 }
    },
    {
        level: 6,
        question: "前回の売掛金200万円が、現金で入金されました。",
        correctAnswers: ["cash", "receivables"],
        changes: { cash: 200, receivables: -200 }
    },
    {
        level: 7,
        question: "役員に報酬50万円を現金で支払いました。",
        correctAnswers: ["cash", "executive-salary"],
        changes: { cash: -50, executiveSalary: 50 }
    },
    {
        level: 8,
        question: "従業員に給料80万円を現金で支払いました。",
        correctAnswers: ["cash", "salary"],
        changes: { cash: -80, salary: 80 }
    },
    {
        level: 9,
        question: "会社の保険料30万円を現金で支払いました。",
        correctAnswers: ["cash", "insurance-expense"],
        changes: { cash: -30, insuranceExpense: 30 }
    },
    {
        level: 10,
        question: "🛡️ 積立型の生命保険に加入し、現金60万円を支払いました。（将来戻ってくる保険です）",
        correctAnswers: ["cash", "insurance"],
        changes: { cash: -60, insurance: 60 }
    },
    {
        level: 11,
        question: "商品を買掛金120万円で仕入れました。（後払い）",
        correctAnswers: ["inventory", "payables"],
        changes: { inventory: 120, payables: 120 }
    },
    {
        level: 12,
        question: "買掛金120万円を現金で支払いました。",
        correctAnswers: ["cash", "payables"],
        changes: { cash: -120, payables: -120 }
    },
    {
        level: 13,
        question: "商品を現金180万円で売りました。（仕入れ値は120万円）",
        correctAnswers: ["cash", "inventory", "sales", "cogs"],
        changes: { cash: 180, inventory: -120, sales: 180, cogs: 120 }
    },
    {
        level: 14,
        question: "銀行への借入金100万円を現金で返済しました。",
        correctAnswers: ["cash", "loans"],
        changes: { cash: -100, loans: -100 }
    },
    {
        level: 15,
        question: "従業員に給料90万円を現金で支払いました。",
        correctAnswers: ["cash", "salary"],
        changes: { cash: -90, salary: 90 }
    },
    {
        level: 16,
        question: "商品を売掛金250万円で売りました。",
        correctAnswers: ["receivables", "sales"],
        changes: { receivables: 250, sales: 250 }
    },
    {
        level: 17,
        question: "商品を現金70万円で仕入れました。",
        correctAnswers: ["cash", "inventory"],
        changes: { cash: -70, inventory: 70 }
    },
    {
        level: 18,
        question: "役員報酬60万円を現金で支払いました。",
        correctAnswers: ["cash", "executive-salary"],
        changes: { cash: -60, executiveSalary: 60 }
    },
    {
        level: 19,
        question: "前回の売掛金250万円が入金されました。",
        correctAnswers: ["cash", "receivables"],
        changes: { cash: 250, receivables: -250 }
    },
    {
        level: 20,
        question: "商品を現金100万円で売りました。（仕入れ値は70万円）",
        correctAnswers: ["cash", "inventory", "sales", "cogs"],
        changes: { cash: 100, inventory: -70, sales: 100, cogs: 70 }
    },
    {
        level: 21,
        question: "🛡️ 積立型の生命保険に追加で現金80万円を支払いました。",
        correctAnswers: ["cash", "insurance"],
        changes: { cash: -80, insurance: 80 }
    },
    {
        level: 22,
        question: "銀行から追加で現金200万円を借りました。",
        correctAnswers: ["cash", "loans"],
        changes: { cash: 200, loans: 200 }
    },
    {
        level: 23,
        question: "会社の保険料40万円を現金で支払いました。",
        correctAnswers: ["cash", "insurance-expense"],
        changes: { cash: -40, insuranceExpense: 40 }
    },
    {
        level: 24,
        question: "商品を買掛金150万円で仕入れました。",
        correctAnswers: ["inventory", "payables"],
        changes: { inventory: 150, payables: 150 }
    },
    {
        level: 25,
        question: "商品を売掛金300万円で売りました。",
        correctAnswers: ["receivables", "sales"],
        changes: { receivables: 300, sales: 300 }
    },
    {
        level: 26,
        question: "従業員に給料100万円を現金で支払いました。",
        correctAnswers: ["cash", "salary"],
        changes: { cash: -100, salary: 100 }
    },
    {
        level: 27,
        question: "買掛金150万円を現金で支払いました。",
        correctAnswers: ["cash", "payables"],
        changes: { cash: -150, payables: -150 }
    },
    {
        level: 28,
        question: "商品を現金200万円で売りました。（仕入れ値は150万円）",
        correctAnswers: ["cash", "inventory", "sales", "cogs"],
        changes: { cash: 200, inventory: -150, sales: 200, cogs: 150 }
    },
    {
        level: 29,
        question: "前回の売掛金300万円が入金されました。",
        correctAnswers: ["cash", "receivables"],
        changes: { cash: 300, receivables: -300 }
    },
    {
        level: 30,
        question: "🛡️ 積立保険を減額し、解約返戻金50万円を現金で受け取りました。",
        correctAnswers: ["cash", "insurance"],
        changes: { cash: 50, insurance: -50 }
    },
    {
        level: 31,
        question: "🛡️ 積立保険の一部（30万円分）を解約し、解約返戻金35万円を現金で受け取りました。",
        correctAnswers: ["cash", "insurance", "other-income"],
        changes: { cash: 35, insurance: -30, otherIncome: 5 }
    },
    {
        level: 32,
        question: "役員報酬70万円を現金で支払いました。",
        correctAnswers: ["cash", "executive-salary"],
        changes: { cash: -70, executiveSalary: 70 }
    },
    {
        level: 33,
        question: "🛡️ 残りの積立保険（60万円分）を解約したところ、解約返戻金が55万円しか戻ってきませんでした。",
        correctAnswers: ["cash", "insurance", "other-expense"],
        changes: { cash: 55, insurance: -60, otherExpense: 5 }
    },
    {
        level: 34,
        question: "銀行への借入金200万円を現金で全額返済しました。",
        correctAnswers: ["cash", "loans"],
        changes: { cash: -200, loans: -200 }
    },
    {
        level: 35,
        question: "🎊 最終問題！従業員に特別ボーナス120万円を現金で支払いました。",
        correctAnswers: ["cash", "salary"],
        changes: { cash: -120, salary: 120 }
    }
];

// ラベルマップ
const labelMap = {
    cash: "現金",
    receivables: "売掛金",
    inventory: "商品",
    insurance: "積立保険料",
    building: "建物",
    payables: "買掛金",
    loans: "借入金",
    capital: "資本金",
    sales: "売上高",
    cogs: "売上原価",
    "executive-salary": "役員報酬",
    salary: "給与",
    "insurance-expense": "保険料",
    "other-income": "雑収入",
    "other-expense": "雑損失"
};

// 初期化
function init() {
    updateDisplay();
    loadProblem();
    updateRankDisplay();
}

// 表示更新
function updateDisplay() {
    // スコア表示
    document.getElementById('score').textContent = score;
    document.getElementById('currentLevel').textContent = currentLevel + 1;
    
    // 進捗バー更新
    const progress = ((currentLevel + 1) / problems.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    
    // コンボ表示
    const comboDisplay = document.getElementById('comboDisplay');
    if (comboCount > 0) {
        comboDisplay.classList.add('show');
        document.getElementById('comboCount').textContent = comboCount;
    } else {
        comboDisplay.classList.remove('show');
    }
    
    // 決算書の値を更新（BS）
    document.getElementById('val-cash').textContent = balanceSheet.cash;
    document.getElementById('val-receivables').textContent = balanceSheet.receivables;
    document.getElementById('val-inventory').textContent = balanceSheet.inventory;
    document.getElementById('val-insurance').textContent = balanceSheet.insurance;
    document.getElementById('val-building').textContent = balanceSheet.building;
    document.getElementById('val-payables').textContent = balanceSheet.payables;
    document.getElementById('val-loans').textContent = balanceSheet.loans;
    document.getElementById('val-capital').textContent = balanceSheet.capital;
    
    // 決算書の値を更新（PL）
    document.getElementById('val-sales').textContent = profitLoss.sales;
    document.getElementById('val-cogs').textContent = profitLoss.cogs;
    document.getElementById('val-executive-salary').textContent = profitLoss.executiveSalary;
    document.getElementById('val-salary').textContent = profitLoss.salary;
    document.getElementById('val-insurance-expense').textContent = profitLoss.insuranceExpense;
    document.getElementById('val-other-income').textContent = profitLoss.otherIncome;
    document.getElementById('val-other-expense').textContent = profitLoss.otherExpense;
    
    // 販売管理費合計
    const totalExpenses = profitLoss.executiveSalary + profitLoss.salary + profitLoss.insuranceExpense;
    document.getElementById('total-expenses').textContent = totalExpenses;
    
    // 売上総利益
    const grossProfit = profitLoss.sales - profitLoss.cogs;
    document.getElementById('gross-profit').textContent = grossProfit;
    
    // 当期純利益
    const profit = grossProfit - totalExpenses + profitLoss.otherIncome - profitLoss.otherExpense;
    document.getElementById('val-profit').textContent = profit;
    
    // 利益剰余金（累積利益）
    document.getElementById('retained-earnings').textContent = profit;
    
    // 資産合計
    const totalAssets = balanceSheet.cash + balanceSheet.receivables + 
                        balanceSheet.inventory + balanceSheet.insurance + balanceSheet.building;
    document.getElementById('total-assets').textContent = totalAssets;
    
    // 負債・純資産合計
    const totalLiabilities = balanceSheet.payables + balanceSheet.loans + 
                             balanceSheet.capital + profit;
    document.getElementById('total-liabilities').textContent = totalLiabilities;
}

// ランク表示更新
function updateRankDisplay() {
    const rank = ranks[currentRank];
    document.getElementById('rankBadge').textContent = rank.badge;
    document.getElementById('rankName').textContent = rank.name;
    document.getElementById('rankName').style.color = rank.color;
}

// ランクアップチェック
function checkRankUp() {
    for (let i = ranks.length - 1; i > currentRank; i--) {
        if (comboCount >= ranks[i].combo) {
            const oldRank = currentRank;
            currentRank = i;
            showRankUpEffect(oldRank, currentRank);
            return;
        }
    }
}

// ランクアップ演出
function showRankUpEffect(oldRank, newRank) {
    const rank = ranks[newRank];
    createSparkles();
    
    // ランクアップメッセージ
    const message = `
        <div class="rank-up-animation">
            <div class="rank-up-icon">${rank.badge}</div>
            <div class="rank-up-text">ランクアップ！</div>
            <div class="rank-up-name" style="color: ${rank.color}">${rank.name}</div>
            <div class="rank-up-message">連続${rank.combo}問正解達成！素晴らしい！ 🎉</div>
        </div>
    `;
    
    const resultArea = document.getElementById('resultArea');
    resultArea.innerHTML = message;
    resultArea.className = 'result-area rank-up';
    resultArea.classList.remove('hidden');
    
    updateRankDisplay();
}

// キラキラエフェクト
function createSparkles() {
    const container = document.getElementById('sparkles');
    container.innerHTML = '';
    
    for (let i = 0; i < 30; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 0.5 + 's';
        sparkle.textContent = ['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)];
        container.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 2000);
    }
}

// 問題読み込み
function loadProblem() {
    const problem = problems[currentLevel];
    document.getElementById('questionText').textContent = problem.question;
    
    // ボタンを初期状態に
    document.getElementById('answerBtn').disabled = true;
    document.getElementById('answerBtn').classList.remove('hidden');
    document.getElementById('nextBtn').classList.add('hidden');
    document.getElementById('resultArea').classList.add('hidden');
    
    // 選択状態をリセット
    selectedBoxes = [];
    document.querySelectorAll('.bs-item, .pl-item').forEach(item => {
        item.classList.remove('selected', 'correct-answer');
    });
}

// 箱の選択
function selectBox(boxId) {
    if (showResult) return;
    
    const item = document.querySelector(`[data-id="${boxId}"]`);
    
    if (selectedBoxes.includes(boxId)) {
        // 選択解除
        selectedBoxes = selectedBoxes.filter(id => id !== boxId);
        item.classList.remove('selected');
    } else {
        // 選択
        selectedBoxes.push(boxId);
        item.classList.add('selected');
    }
    
    // 回答ボタンの有効/無効
    document.getElementById('answerBtn').disabled = selectedBoxes.length === 0;
}

// 回答チェック
function checkAnswer() {
    showResult = true;
    const problem = problems[currentLevel];
    
    // 正解判定
    const isCorrect = 
        problem.correctAnswers.length === selectedBoxes.length &&
        problem.correctAnswers.every(answer => selectedBoxes.includes(answer));
    
    // 結果表示
    const resultArea = document.getElementById('resultArea');
    resultArea.classList.remove('hidden');
    
    if (isCorrect) {
        // 正解
        comboCount++;
        if (comboCount > maxCombo) maxCombo = comboCount;
        
        const baseScore = 10;
        const comboBonus = Math.min(comboCount - 1, 10) * 2;
        const totalScore = baseScore + comboBonus;
        score += totalScore;
        
        // ランダムな褒めメッセージ
        const praise = praiseMessages[Math.floor(Math.random() * praiseMessages.length)];
        
        resultArea.className = 'result-area correct';
        
        let message = `
            <div class="result-icon">✅</div>
            <div class="result-text">${praise}</div>
        `;
        
        if (comboBonus > 0) {
            message += `
                <div class="combo-bonus">
                    🔥 ${comboCount}連続正解ボーナス: +${comboBonus}点！
                </div>
            `;
        }
        
        message += `<div class="score-gain">+${totalScore}点獲得！</div>`;
        
        resultArea.innerHTML = message;
        
        // 正解の箱にアニメーション
        problem.correctAnswers.forEach(id => {
            const item = document.querySelector(`[data-id="${id}"]`);
            if (item) {
                item.classList.add('correct-answer');
            }
        });
        
        // 決算書を更新
        Object.keys(problem.changes).forEach(key => {
            if (key in balanceSheet) {
                balanceSheet[key] += problem.changes[key];
            } else if (key === 'executiveSalary') {
                profitLoss.executiveSalary += problem.changes[key];
            } else if (key === 'salary') {
                profitLoss.salary += problem.changes[key];
            } else if (key === 'insuranceExpense') {
                profitLoss.insuranceExpense += problem.changes[key];
            } else if (key === 'otherIncome') {
                profitLoss.otherIncome += problem.changes[key];
            } else if (key === 'otherExpense') {
                profitLoss.otherExpense += problem.changes[key];
            } else if (key in profitLoss) {
                profitLoss[key] += problem.changes[key];
            }
        });
        
        // キラキラエフェクト
        createSparkles();
        
        // ランクアップチェック
        setTimeout(() => {
            checkRankUp();
        }, 500);
        
        updateDisplay();
    } else {
        // 不正解
        comboCount = 0;
        
        const correctLabels = problem.correctAnswers.map(id => labelMap[id]).join('、');
        resultArea.className = 'result-area incorrect';
        resultArea.innerHTML = `
            <div class="result-icon">❌</div>
            <div class="result-text">おしい！もう一度チャレンジ！</div>
            <div class="result-detail">正解は: ${correctLabels}</div>
            <div class="encouragement">次は絶対できるよ！頑張って！ 💪</div>
        `;
        
        updateDisplay();
    }
    
    // ボタン切り替え
    document.getElementById('answerBtn').classList.add('hidden');
    document.getElementById('nextBtn').classList.remove('hidden');
}

// 次の問題へ
function nextLevel() {
    if (currentLevel < problems.length - 1) {
        currentLevel++;
        showResult = false;
        loadProblem();
        updateDisplay();
    } else {
        // ゲームクリア
        showComplete();
    }
}

// ゲームクリア画面表示
function showComplete() {
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('completeScreen').classList.remove('hidden');
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalCombo').textContent = maxCombo;
    
    const finalRank = ranks[currentRank];
    document.getElementById('finalRankBadge').textContent = finalRank.badge;
    document.getElementById('finalRankTitle').textContent = finalRank.name + "マスター";
    document.getElementById('finalRankTitle').style.color = finalRank.color;
    
    // 最終キラキラ
    createSparkles();
}

// ゲームリセット
function resetGame() {
    currentLevel = 0;
    selectedBoxes = [];
    score = 0;
    showResult = false;
    comboCount = 0;
    maxCombo = 0;
    currentRank = 0;
    
    balanceSheet = {
        cash: 0,
        receivables: 0,
        inventory: 0,
        insurance: 0,
        building: 0,
        payables: 0,
        loans: 0,
        capital: 0
    };
    
    profitLoss = {
        sales: 0,
        cogs: 0,
        executiveSalary: 0,
        salary: 0,
        insuranceExpense: 0,
        otherIncome: 0,
        otherExpense: 0
    };
    
    document.getElementById('gameScreen').classList.remove('hidden');
    document.getElementById('completeScreen').classList.add('hidden');
    
    updateDisplay();
    loadProblem();
    updateRankDisplay();
}

// ページ読み込み時に初期化
window.onload = init;