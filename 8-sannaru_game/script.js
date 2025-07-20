// ゲームデータ（ストーリーモード対応）
const quizData = [
    { 
        question: "レモンジュース", 
        answer: "酸性", 
        explanation: "レモンジュースにはクエン酸が含まれており、強い酸性を示します。pH値は2〜3程度です。",
        context: "田中博士が朝食に使うレモンジュースのpH値を測定してみましょう。",
        liquidColor: "#FFD700",
        phValue: 2.5
    },
    { 
        question: "重曹水", 
        answer: "アルカリ性", 
        explanation: "重曹（炭酸水素ナトリウム）は水に溶かすと弱アルカリ性を示します。pH値は8〜9程度です。",
        context: "掃除に使う重曹水のpH値を調べてみます。",
        liquidColor: "#F5F5DC",
        phValue: 8.5
    },
    { 
        question: "水道水", 
        answer: "中性", 
        explanation: "日本の水道水は飲料用として供給されており、pH値は中性（7.0）に保たれています。地域によって多少の差はあります。",
        context: "実験室の水道水のpH値を確認しましょう。",
        liquidColor: "#E0F6FF",
        phValue: 7.0
    },
    { 
        question: "コーラ", 
        answer: "酸性", 
        explanation: "コーラにはリン酸や炭酸が含まれているため、酸性を示します。pH値は2.5〜3.5程度です。",
        context: "休憩時間のコーラのpH値を測定してみましょう。",
        liquidColor: "#8B4513",
        phValue: 3.0
    },
    { 
        question: "石鹸水", 
        answer: "アルカリ性", 
        explanation: "一般的な石鹸は油脂をアルカリで分解して作られるため、石鹸水はアルカリ性を示します。洗浄力があります。",
        context: "手洗い用の石鹸水のpH値を調べてみます。",
        liquidColor: "#FFF8DC",
        phValue: 9.0
    },
    { 
        question: "お酢", 
        answer: "酸性", 
        explanation: "お酢には酢酸が含まれており、強い酸性を示します。pH値は2〜3程度です。",
        context: "調理に使うお酢のpH値を測定してみましょう。",
        liquidColor: "#F0E68C",
        phValue: 2.8
    },
    { 
        question: "牛乳", 
        answer: "中性", 
        explanation: "牛乳のpH値は6.7程度と、ほぼ中性に近いです。わずかに酸性に傾くこともあります。",
        context: "朝食の牛乳のpH値を確認してみましょう。",
        liquidColor: "#FFFACD",
        phValue: 6.7
    },
    { 
        question: "オレンジジュース", 
        answer: "酸性", 
        explanation: "オレンジジュースにはクエン酸やアスコルビン酸（ビタミンC）が含まれており、酸性を示します。pH値は3〜4程度です。",
        context: "ビタミンCたっぷりのオレンジジュースのpH値を調べてみます。",
        liquidColor: "#FFA500",
        phValue: 3.5
    },
    { 
        question: "アンモニア水", 
        answer: "アルカリ性", 
        explanation: "アンモニアは水に溶けると水酸化アンモニウムとなり、強いアルカリ性を示します。刺激臭があります。",
        context: "注意深く、アンモニア水のpH値を測定しましょう。",
        liquidColor: "#F0F8FF",
        phValue: 11.0
    },
    { 
        question: "純水", 
        answer: "中性", 
        explanation: "不純物が一切含まれない純粋な水は、中性（pH 7.0）です。電気はほとんど通しません。",
        context: "実験用の純水のpH値を確認してみましょう。",
        liquidColor: "#F0F8FF",
        phValue: 7.0
    },
    { 
        question: "胃液", 
        answer: "酸性", 
        explanation: "胃液には消化酵素のペプシンが働くための塩酸が含まれており、非常に強い酸性（pH 1〜2）を示します。",
        context: "人体の胃液のpH値を調べてみましょう。",
        liquidColor: "#FFE4B5",
        phValue: 1.5
    },
    { 
        question: "卵白", 
        answer: "アルカリ性", 
        explanation: "卵白は、鮮度が落ちるにつれて二酸化炭素が放出され、アルカリ性に傾きます。pH値は8〜9程度です。",
        context: "調理に使う卵白のpH値を測定してみましょう。",
        liquidColor: "#FFF8DC",
        phValue: 8.5
    },
    { 
        question: "雨水", 
        answer: "酸性", 
        explanation: "大気中の二酸化炭素が溶け込むため、通常の雨水はわずかに酸性（pH 5.6程度）を示します。工場排煙などの影響でより酸性になることもあります。",
        context: "外で採取した雨水のpH値を調べてみましょう。",
        liquidColor: "#E0F6FF",
        phValue: 5.6
    },
    { 
        question: "海水", 
        answer: "アルカリ性", 
        explanation: "海水には様々な塩類が溶け込んでおり、弱アルカリ性（pH 8.0〜8.3程度）を示します。",
        context: "海から採取した海水のpH値を測定してみましょう。",
        liquidColor: "#87CEEB",
        phValue: 8.2
    },
    { 
        question: "涙", 
        answer: "中性", 
        explanation: "人間の涙は目の刺激を防ぐため、血液と同じくほぼ中性（pH 7.4程度）に保たれています。",
        context: "人体の涙のpH値を調べてみましょう。",
        liquidColor: "#F0F8FF",
        phValue: 7.4
    },
    { 
        question: "コーヒー", 
        answer: "酸性", 
        explanation: "コーヒー豆に含まれるクエン酸やリンゴ酸などにより、コーヒーは酸性を示します。pH値は5程度です。",
        context: "朝のコーヒーのpH値を測定してみましょう。",
        liquidColor: "#8B4513",
        phValue: 5.0
    },
    { 
        question: "石灰水", 
        answer: "アルカリ性", 
        explanation: "水酸化カルシウムを水に溶かした石灰水は、強いアルカリ性を示します。二酸化炭素を検出する実験にも使われます。",
        context: "実験用の石灰水のpH値を調べてみましょう。",
        liquidColor: "#F5F5DC",
        phValue: 12.0
    },
    { 
        question: "血液", 
        answer: "アルカリ性", 
        explanation: "人間の血液は、生命維持のために非常に厳密に弱アルカリ性（pH 7.35〜7.45）に保たれています。",
        context: "人体の血液のpH値を測定してみましょう。",
        liquidColor: "#DC143C",
        phValue: 7.4
    },
    { 
        question: "ワイン", 
        answer: "酸性", 
        explanation: "ワインには酒石酸やリンゴ酸などが含まれており、酸性を示します。pH値は3〜4程度です。",
        context: "食事に使うワインのpH値を調べてみましょう。",
        liquidColor: "#8B0000",
        phValue: 3.5
    },
    { 
        question: "唾液", 
        answer: "中性", 
        explanation: "人間の唾液は、pH値が6.7〜7.4程度のほぼ中性です。消化酵素アミラーゼを含みます。",
        context: "人体の唾液のpH値を測定してみましょう。",
        liquidColor: "#FFF8DC",
        phValue: 7.0
    },
    { 
        question: "トマトジュース", 
        answer: "酸性", 
        explanation: "トマトにはクエン酸やリンゴ酸などが含まれており、トマトジュースは酸性を示します。pH値は4〜5程度です。",
        context: "健康飲料のトマトジュースのpH値を調べてみましょう。",
        liquidColor: "#FF6347",
        phValue: 4.5
    },
    { 
        question: "漂白剤", 
        answer: "アルカリ性", 
        explanation: "家庭用の多くの漂白剤は、次亜塩素酸ナトリウムなどのアルカリ性物質を含み、強いアルカリ性を示します。取り扱いには注意が必要です。",
        context: "注意深く、漂白剤のpH値を測定しましょう。",
        liquidColor: "#F0F8FF",
        phValue: 12.5
    },
    { 
        question: "緑茶", 
        answer: "酸性", 
        explanation: "緑茶にはカテキンやカフェインなどが含まれており、わずかに酸性（pH 6程度）を示します。",
        context: "日本の伝統的な緑茶のpH値を調べてみましょう。",
        liquidColor: "#90EE90",
        phValue: 6.0
    },
    { 
        question: "ベーキングパウダー水", 
        answer: "アルカリ性", 
        explanation: "ベーキングパウダーは重曹と酸性剤の混合物ですが、水に溶かすと重曹の作用で弱アルカリ性を示します。",
        context: "お菓子作りに使うベーキングパウダー水のpH値を測定してみましょう。",
        liquidColor: "#F5F5DC",
        phValue: 8.0
    }
];

// レベルシステム
const levelSystem = {
    1: { name: "見習い研究員", requiredStreak: 0, color: "#95a5a6" },
    2: { name: "助手研究員", requiredStreak: 2, color: "#3498db" },
    3: { name: "主任研究員", requiredStreak: 4, color: "#f39c12" },
    4: { name: "上級研究員", requiredStreak: 6, color: "#e74c3c" },
    5: { name: "博士研究員", requiredStreak: 8, color: "#9b59b6" },
    6: { name: "研究所長", requiredStreak: 10, color: "#2c3e50" }
};

// ゲーム状態管理
let currentQuestion = 0;
let score = 0;
let currentStreak = 0;
let maxStreak = 0;
let currentLevel = 1;
let gameQuestions = [];
let isAnswered = false;

// DOM要素の取得
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const resultScreen = document.getElementById('resultScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const questionText = document.getElementById('questionText');
const questionNum = document.getElementById('questionNum');
const scoreDisplay = document.getElementById('score');
const characterFace = document.getElementById('characterFace');
const feedback = document.getElementById('feedback');
const feedbackText = document.getElementById('feedbackText');
const finalScore = document.getElementById('finalScore');
const resultMessage = document.getElementById('resultMessage');
const resultCharacter = document.getElementById('resultCharacter');
const resultTitle = document.getElementById('resultTitle');
const choiceButtons = document.querySelectorAll('.choice-button');
const nextButton = document.getElementById('nextButton');

// 新しい要素
const currentLevelDisplay = document.getElementById('currentLevel');
const levelNameDisplay = document.getElementById('levelName');
const streakDisplay = document.getElementById('streak');
const liquidColorElement = document.getElementById('liquidColor');
const phValueElement = document.getElementById('phValue');
const meterNeedleElement = document.getElementById('meterNeedle');
const experimentContextElement = document.getElementById('experimentContext');
const levelUpNotification = document.getElementById('levelUpNotification');
const levelUpMessage = document.getElementById('levelUpMessage');
const finalLevelDisplay = document.getElementById('finalLevel');
const finalStreakDisplay = document.getElementById('finalStreak');
const achievementBadge = document.getElementById('achievementBadge');

// 音声読み上げ機能
function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 1.0;
        utterance.pitch = 1.2;
        speechSynthesis.speak(utterance);
    }
}

// レベル計算
function calculateLevel(streak) {
    for (let level = Object.keys(levelSystem).length; level >= 1; level--) {
        if (streak >= levelSystem[level].requiredStreak) {
            return level;
        }
    }
    return 1;
}

// レベルアップチェック
function checkLevelUp() {
    const newLevel = calculateLevel(currentStreak);
    if (newLevel > currentLevel) {
        currentLevel = newLevel;
        levelUpNotification.style.display = 'block';
        levelUpMessage.textContent = `おめでとう！${levelSystem[currentLevel].name}に昇格しました！`;
        
        // レベルアップ音声
        speak(`レベルアップ！${levelSystem[currentLevel].name}に昇格しました！`);
        
        return true;
    }
    return false;
}

// ゲーム初期化
function initGame() {
    currentQuestion = 0;
    score = 0;
    currentStreak = 0;
    maxStreak = 0;
    currentLevel = 1;
    isAnswered = false;
    
    // 問題をシャッフルして10問選択
    const shuffled = [...quizData].sort(() => Math.random() - 0.5);
    gameQuestions = shuffled.slice(0, 10);
    
    updateDisplay();
    showQuestion();
}

// 表示更新
function updateDisplay() {
    questionNum.textContent = currentQuestion + 1;
    scoreDisplay.textContent = score;
    streakDisplay.textContent = currentStreak;
    currentLevelDisplay.textContent = currentLevel;
    levelNameDisplay.textContent = levelSystem[currentLevel].name;
    
    // レベルに応じて色を変更
    levelNameDisplay.style.color = levelSystem[currentLevel].color;
}

// 問題表示
function showQuestion() {
    if (currentQuestion >= gameQuestions.length) {
        showResult();
        return;
    }
    
    const question = gameQuestions[currentQuestion];
    questionText.textContent = question.question;
    experimentContextElement.textContent = question.context;
    
    // 試験管の色を設定
    liquidColorElement.style.backgroundColor = question.liquidColor;
    
    // pHメーターをリセット
    phValueElement.textContent = "pH ?";
    meterNeedleElement.style.transform = "translateX(-50%) rotate(0deg)";
    
    characterFace.textContent = '👨‍🔬';
    characterFace.className = 'character-face';
    feedback.classList.add('hidden');
    feedback.className = 'feedback hidden';
    gameScreen.className = 'screen';
    isAnswered = false;
    
    // 「次へ」ボタンとレベルアップ通知を非表示
    nextButton.style.display = 'none';
    levelUpNotification.style.display = 'none';
    
    // ボタンを有効化
    choiceButtons.forEach(button => {
        button.disabled = false;
        button.style.opacity = '1';
    });
    
    // 問題を読み上げ
    speak(question.context + question.question + 'のpH値を予測してください');
}

// 回答処理
function handleAnswer(selectedAnswer) {
    if (isAnswered) return;
    
    isAnswered = true;
    const correctAnswer = gameQuestions[currentQuestion].answer;
    const isCorrect = selectedAnswer === correctAnswer;
    
    // ボタンを無効化
    choiceButtons.forEach(button => {
        button.disabled = true;
        button.style.opacity = '0.6';
    });
    
    if (isCorrect) {
        score++;
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
        showCorrectFeedback();
    } else {
        currentStreak = 0;
        showIncorrectFeedback(correctAnswer);
    }
    
    updateDisplay();
    
    // レベルアップチェック
    checkLevelUp();
}

// 正解フィードバック
function showCorrectFeedback() {
    characterFace.textContent = '😊';
    characterFace.className = 'character-face correct';
    
    feedback.className = 'feedback correct';
    const question = gameQuestions[currentQuestion];
    const explanation = question.explanation;
    
    // pHメーターを正解値に設定
    phValueElement.textContent = `pH ${question.phValue}`;
    const phAngle = (question.phValue - 7) * 10; // pH 7を中心に角度計算
    meterNeedleElement.style.transform = `translateX(-50%) rotate(${phAngle}deg)`;
    
    feedbackText.innerHTML = `🎉 正解！素晴らしい観察力です！<br><span class="explanation">${explanation}</span>`;
    feedback.classList.remove('hidden');
    
    // 「次へ」ボタンを表示
    nextButton.style.display = 'block';
    
    gameScreen.className = 'screen correct-bg';
    
    speak('正解！素晴らしい観察力です！' + explanation);
}

// 不正解フィードバック
function showIncorrectFeedback(correctAnswer) {
    characterFace.textContent = '😅';
    characterFace.className = 'character-face incorrect';
    
    feedback.className = 'feedback incorrect';
    const question = gameQuestions[currentQuestion];
    const explanation = question.explanation;
    
    // pHメーターを正解値に設定
    phValueElement.textContent = `pH ${question.phValue}`;
    const phAngle = (question.phValue - 7) * 10;
    meterNeedleElement.style.transform = `translateX(-50%) rotate(${phAngle}deg)`;
    
    feedbackText.innerHTML = `😔 残念！正解は「${correctAnswer}」でした<br><span class="explanation">${explanation}</span>`;
    feedback.classList.remove('hidden');
    
    // 「次へ」ボタンを表示
    nextButton.style.display = 'block';
    
    gameScreen.className = 'screen incorrect-bg';
    
    speak(`残念！正解は${correctAnswer}でした。${explanation}`);
}

// 結果表示
function showResult() {
    gameScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    finalScore.textContent = score;
    finalLevelDisplay.textContent = currentLevel;
    finalStreakDisplay.textContent = maxStreak;
    
    let message = '';
    let character = '';
    let title = '';
    let badge = '';
    
    if (score >= 9) {
        title = '🏆 パーフェクト博士！';
        character = '🥇';
        message = '素晴らしい！あなたは真の化学博士です！研究所の未来を担う逸材ですね！';
        badge = '🏆';
    } else if (score >= 7) {
        title = '🎖️ 優秀な研究員！';
        character = '🥈';
        message = 'とても優秀な成績です！あなたの研究能力は高く評価されています！';
        badge = '🎖️';
    } else if (score >= 5) {
        title = '📚 成長中の研究員！';
        character = '🥉';
        message = 'なかなかの成績です！さらに研究を続けて、より高みを目指しましょう！';
        badge = '📚';
    } else if (score >= 3) {
        title = '🌱 見習い研究員！';
        character = '😊';
        message = '基本的な実験はできています！もっと練習して、レベルアップを目指しましょう！';
        badge = '🌱';
    } else {
        title = '💪 挑戦者！';
        character = '😅';
        message = '実験は失敗することもあります！諦めずに、もう一度挑戦してみてください！';
        badge = '💪';
    }
    
    resultTitle.textContent = title;
    resultCharacter.textContent = character;
    resultMessage.textContent = message;
    achievementBadge.textContent = badge;
    achievementBadge.style.background = `linear-gradient(135deg, ${levelSystem[currentLevel].color}, ${levelSystem[currentLevel].color}dd)`;
    
    speak(`${score}問正解！最終レベル${currentLevel}！${message}`);
}

// 画面切り替え
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    screen.classList.remove('hidden');
}

// イベントリスナー設定
startButton.addEventListener('click', () => {
    showScreen(gameScreen);
    initGame();
});

restartButton.addEventListener('click', () => {
    showScreen(gameScreen);
    initGame();
});

choiceButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        if (!isAnswered) {
            const answer = e.target.getAttribute('data-answer');
            handleAnswer(answer);
        }
    });
});

nextButton.addEventListener('click', () => {
    currentQuestion++;
    showQuestion();
});

// タッチデバイス対応
choiceButtons.forEach(button => {
    button.addEventListener('touchstart', (e) => {
        if (!isAnswered) {
            const answer = e.target.getAttribute('data-answer');
            handleAnswer(answer);
        }
    }, { passive: false });
});

// ページ読み込み時
document.addEventListener('DOMContentLoaded', () => {
    speak('化学研究所見習いクエストへようこそ！pH値の測定実験を始めましょう！');
});

// キーボード操作対応
document.addEventListener('keydown', (e) => {
    if (gameScreen.classList.contains('hidden') || isAnswered) return;
    
    switch(e.key) {
        case '1':
            handleAnswer('酸性');
            break;
        case '2':
            handleAnswer('中性');
            break;
        case '3':
            handleAnswer('アルカリ性');
            break;
    }
});