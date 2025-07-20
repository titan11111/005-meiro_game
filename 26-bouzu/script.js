// 相談データ
const consultations = [
    {
        name: "田中さん（会社員・真面目すぎるタイプ）",
        problem: "仕事でのストレスが溜まり、毎日が辛く感じます。",
        advice: [
            "会社を辞めて無人島に移住しましょう",
            "深呼吸をして、今この瞬間に集中してみてください。小さな幸せを見つけましょう",
            "上司に説教をしましょう"
        ],
        correct: 1,
        successMessage: "「心が少し軽くなりました」",
        failureMessage: "「無人島に移住って...それ現実的じゃないですよ？僧侶様、Wi-Fiもないんですよ？」"
    },
    {
        name: "佐藤さん（主婦・ドラマ好き）",
        problem: "家族との関係がうまくいかず、孤独を感じています。",
        advice: [
            "家族を捨てて新しい人生を始めましょう",
            "相手の気持ちを理解しようと努め、感謝の気持ちを伝えてみてください",
            "家族全員を洗脳しましょう"
        ],
        correct: 1,
        successMessage: "「家族に感謝を伝えてみます」",
        failureMessage: "「家族全員を洗脳するって...それドラマの世界ですよ？現実はもっと複雑なんです」"
    },
    {
        name: "鈴木さん（大学生・恋愛至上主義）",
        problem: "失恋して立ち直れません。もう誰も愛せないと思います。",
        advice: [
            "元彼の家の前で歌を歌いましょう",
            "時間が心の傷を癒してくれます。自分を大切にして、新しい出会いを信じてください",
            "元彼のSNSを毎日チェックしましょう"
        ],
        correct: 1,
        successMessage: "「時間をかけて癒していきます」",
        failureMessage: "「元彼の家の前で歌を歌うって...それ恥ずかしいですよ？僧侶様、近所迷惑になりますよ？」"
    },
    {
        name: "高橋さん（サラリーマン・貯金マニア）",
        problem: "お金の悩みで夜も眠れません。将来が不安です。",
        advice: [
            "お金がすべてではありません。今あるものに感謝し、必要以上に心配しないでください",
            "宝くじを買いまくりましょう",
            "宝くじに全財産を賭けましょう"
        ],
        correct: 0,
        successMessage: "「今あるものに感謝してみます」",
        failureMessage: "「宝くじに全財産を賭けるって...それ破産しますよ？僧侶様、お金の相談なのに何を言ってるんですか？」"
    },
    {
        name: "伊藤さん",
        problem: "健康を損ない、将来への希望を失っています。",
        advice: [
            "病気を受け入れ、今できることに集中しましょう。小さな喜びを大切にしてください",
            "諦めて何もしないでいましょう",
            "病気のことは考えないでください"
        ],
        correct: 0,
        successMessage: "「今できることから始めてみます」",
        failureMessage: "「諦めて何もしないでいろって...それじゃあ私の人生が終わってしまいます」"
    },
    {
        name: "渡辺さん（母親・完璧主義）",
        problem: "子育てに疲れて、イライラしてしまいます。",
        advice: [
            "子供を祖父母に預けっぱなしにしましょう",
            "子育ては修行です。深呼吸をして、子供の成長を見守る心を持ちましょう",
            "子供に甘いものを与えまくりましょう"
        ],
        correct: 1,
        successMessage: "「子供の成長を見守ります」",
        failureMessage: "「子供を祖父母に預けっぱなしにするって...それ親の責任放棄ですよ？僧侶様、母親失格ですよ？」"
    },
    {
        name: "小林さん（OL・人見知り）",
        problem: "友人との関係で悩んでいます。信頼できる人がいません。",
        advice: [
            "全員を敵だと思いましょう",
            "少しずつでも心を開き、相手の良いところを見つけてみてください",
            "友達のSNSを毎日チェックしましょう"
        ],
        correct: 1,
        successMessage: "「少しずつ心を開いてみます」",
        failureMessage: "「友達のSNSを毎日チェックするって...それストーカー行為ですよ？僧侶様、友達関係の相談なのに何を言ってるんですか？」"
    },
    {
        name: "池田さん（ニート・引きこもり）",
        problem: "自分の価値がわからず、存在意義を見失っています。",
        advice: [
            "あなたの存在そのものに価値があります。小さなことでも人の役に立ってみてください",
            "引きこもりを続けましょう",
            "世界征服を目指しましょう"
        ],
        correct: 0,
        successMessage: "「小さなことから始めてみます」",
        failureMessage: "「引きこもりを続けるって...それ現実逃避ですよ？僧侶様、人生の相談なのに何を言ってるんですか？」"
    },
    {
        name: "橋本さん（エリート会社員・完璧主義）",
        problem: "完璧主義で、少しのミスも許せません。",
        advice: [
            "完璧を目指すのは良いことです",
            "不完全さも美しさの一部です。自分を許すことも大切です",
            "ミスをした部下を説教しまくりましょう"
        ],
        correct: 1,
        successMessage: "「不完全な自分も受け入れてみます」",
        failureMessage: "「部下を説教しまくるって...それパワハラですよ？僧侶様、会社の相談じゃないんです」"
    },
    {
        name: "山口さん（主婦・短気）",
        problem: "物事が思い通りにいかず、いつもイライラしています。",
        advice: [
            "思い通りにいかないのが人生です。現実を受け入れて心を平静に保ちましょう",
            "家族に八つ当たりしましょう",
            "家の家具を買い替えましょう"
        ],
        correct: 0,
        successMessage: "「現実を受け入れて心を落ち着かせます」",
        failureMessage: "「家の家具を買い替えるって...それ家計に響きますよ？僧侶様、主婦の相談なのに何を言ってるんですか？」"
    },
    {
        name: "松本さん（高校生・勉強嫌い）",
        problem: "勉強についていけず、将来に不安を感じています。",
        advice: [
            "勉強は無駄です",
            "一歩ずつ進めば必ず道は開けます。今日できることから始めてみてください",
            "学校をサボりまくりましょう"
        ],
        correct: 1,
        successMessage: "「一歩ずつ頑張ってみます」",
        failureMessage: "「学校をサボりまくるって...それ留年しますよ？僧侶様、高校生の相談なのに何を言ってるんですか？」"
    },
    {
        name: "中村さん（定年退職者・年齢コンプレックス）",
        problem: "老いていく自分を受け入れられません。",
        advice: [
            "年齢を重ねることも人生の美しさです。今までの経験を大切にしてください",
            "若さだけが価値です",
            "若返りサプリを飲みまくりましょう"
        ],
        correct: 0,
        successMessage: "「人生の経験を大切にします」",
        failureMessage: "「若返りサプリを飲みまくるって...それ効果不明ですよ？僧侶様、年金生活者の相談なのに何を言ってるんですか？」"
    },
    {
        name: "木村さん（新入社員・内気）",
        problem: "人前で話すのが怖くて、自分の意見が言えません。",
        advice: [
            "一生黙っていればいいのです",
            "小さな一歩から始めましょう。自分の気持ちを大切に、少しずつ表現してみてください",
            "会社をサボりまくりましょう"
        ],
        correct: 1,
        successMessage: "「少しずつ表現してみます」",
        failureMessage: "「会社をサボりまくるって...それクビになりますよ？僧侶様、新入社員の相談なのに何を言ってるんですか？」"
    },
    {
        name: "清水さん（SNS中毒・比較好き）",
        problem: "周りの人と比較して、いつも劣等感を感じます。",
        advice: [
            "他人と比べることをやめ、自分の歩みを大切にしてください。あなたはあなたです",
            "もっと他人を意識して競争しましょう",
            "SNSで自慢の投稿をしましょう"
        ],
        correct: 0,
        successMessage: "「自分の歩みを大切にします」",
        failureMessage: "「SNSで自慢の投稿をするって...それ嫌われますよ？僧侶様、SNSの相談じゃないんです」"
    },
    {
        name: "吉田さん（主婦・罪悪感の塊）",
        problem: "過去の過ちを忘れられず、自分を責め続けています。",
        advice: [
            "過去は変えられません。今この瞬間から新しい歩みを始めてください",
            "一生自分を責め続けるべきです",
            "過去のことを忘れまくりましょう"
        ],
        correct: 0,
        successMessage: "「今から新しく歩んでみます」",
        failureMessage: "「過去のことを忘れまくるって...それ記憶喪失ですよ？現実はもっと地味なんです」"
    },
    {
        name: "森さん（哲学好き・人生に迷い中）",
        problem: "人生に意味を見つけられず、毎日がむなしく感じます。",
        advice: [
            "人生に意味なんてありません",
            "意味は自分で作るものです。小さな親切や優しさから始めてみてください",
            "UFOを探しに行きましょう"
        ],
        correct: 1,
        successMessage: "「小さな親切から始めてみます」",
        failureMessage: "「UFOを探しに行くって...それオカルトの世界ですよ？現実はもっと地味なんです」"
    },
    {
        name: "石川さん（医師・完璧主義）",
        problem: "周りの期待に応えられず、プレッシャーを感じています。",
        advice: [
            "期待に応えることが人生の目的です",
            "自分のペースで歩んでください。他人の期待より、自分の心の声を大切にしましょう",
            "患者を放置しましょう"
        ],
        correct: 1,
        successMessage: "「自分のペースで歩んでみます」",
        failureMessage: "「期待に応えることが人生の目的って...それプレッシャーを増やしてますよ？僧侶様、プレッシャーの相談なのに何を言ってるんですか？」"
    },
    {
        name: "山田さん（被災者・絶望中）",
        problem: "災害で大切なものを失い、絶望しています。",
        advice: [
            "失ったものは二度と戻りません。悲しみを抱えながらも、今ある命を大切にしてください",
            "すべてを諦めるべきです",
            "過去の写真を見まくりましょう"
        ],
        correct: 0,
        successMessage: "「命を大切に生きてみます」",
        failureMessage: "「すべてを諦めるべきって...それ絶望的ですよ？僧侶様、被災者の相談なのに何を言ってるんですか？」"
    },
    {
        name: "藤田さん（教師・短気）",
        problem: "怒りっぽい性格を直したいのですが、コントロールできません。",
        advice: [
            "怒りを感じた時は深呼吸をして、心を静めてください。怒りの奥にある気持ちを見つめましょう",
            "怒りは自然なので出し続けましょう",
            "生徒に説教しまくりましょう"
        ],
        correct: 0,
        successMessage: "「心を静めて見つめてみます」",
        failureMessage: "「怒りは自然なので出し続けるって...それ暴力を助長してますよ？僧侶様、短気の相談なのに何を言ってるんですか？」"
    },
    {
        name: "野村さん（芸術家・現実逃避中）",
        problem: "夢を追いかけていますが、現実との差に苦しんでいます。",
        advice: [
            "夢と現実のバランスを取りながら、諦めずに歩み続けてください。小さな進歩を大切にしましょう",
            "夢は諦めるべきです",
            "現実を完全に無視しましょう"
        ],
        correct: 0,
        successMessage: "「バランスを取りながら歩んでみます」",
        failureMessage: "「夢は諦めるべきって...それ人生が終わってしまいますよ？僧侶様、夢の相談なのに何を言ってるんですか？」"
    },
    {
        name: "メジェドさん（中東の商人・金儲けに悩み中）",
        problem: "商売がうまくいかず、家族を養えません。",
        advice: [
            "商売の基本に立ち返り、お客様のことを考えてみてください。誠実さが一番の財産です",
            "もっと強引に商売をしましょう",
            "偽物を売りましょう"
        ],
        correct: 0,
        successMessage: "「誠実さを大切にします」",
        failureMessage: "「もっと強引に商売するって...それ詐欺ですよ？僧侶様、商売の相談なのに何を言ってるんですか？」"
    },
    {
        name: "宇宙人（地球人に興味津々）",
        problem: "地球人とのコミュニケーションがうまくいきません。",
        advice: [
            "地球人の文化を理解しようと努めてください。違いを認め合うことが大切です",
            "地球人を洗脳しましょう",
            "地球を観光しましょう"
        ],
        correct: 0,
        successMessage: "「地球人の文化を理解してみます」",
        failureMessage: "「地球人を洗脳するって...それ侵略行為ですよ？僧侶様、コミュニケーションの相談なのに何を言ってるんですか？」"
    },
    {
        name: "猫さんたち（野良猫集団・縄張り争い中）",
        problem: "他の猫たちと縄張り争いをしています。",
        advice: [
            "縄張りを分け合って、共存の道を探してみてください。平和が一番です",
            "他の猫を追い出しましょう",
            "猫同士で喧嘩をしましょう"
        ],
        correct: 0,
        successMessage: "「共存の道を探してみます」",
        failureMessage: "「他の猫を追い出すって...それ縄張り争いですよ？僧侶様、猫の相談なのに何を言ってるんですか？」"
    },
    {
        name: "魔王（世界征服に疲れ中）",
        problem: "世界征服がうまくいかず、部下に失望されています。",
        advice: [
            "部下の気持ちを理解し、みんなで協力して目標を達成しましょう。リーダーシップが大切です",
            "部下を説教しましょう",
            "世界を破壊しましょう"
        ],
        correct: 0,
        successMessage: "「部下と協力してみます」",
        failureMessage: "「部下を説教するって...それ部下が辞めてしまいますよ？僧侶様、リーダーシップの相談なのに何を言ってるんですか？」"
    },
    {
        name: "工場労働者たち（過酷な労働に疲れ中）",
        problem: "過酷な労働で心身ともに疲れています。",
        advice: [
            "労働環境の改善を求め、みんなで協力して働きやすい職場を作りましょう",
            "ストライキを起こしましょう",
            "工場をサボりましょう"
        ],
        correct: 0,
        successMessage: "「働きやすい職場を作ってみます」",
        failureMessage: "「ストライキを起こすって...それ会社が潰れてしまいますよ？僧侶様、労働環境の相談なのに何を言ってるんですか？」"
    }
];

// ゲーム状態
let currentConsultation = 0;
let score = 0;
let remainingVisitors = 24;
let gameConsultations = [];
let combo = 0;
let maxCombo = 0;
let level = 1;
let experience = 0;
let experienceToNextLevel = 100;
let totalCorrect = 0;
let totalIncorrect = 0;
let streak = 0;
let maxStreak = 0;
let gratitudeLevel = 50; // 感謝度（0-100）
let angerLevel = 50; // 怒り度（0-100）
let emotionBalance = 0; // -100（感謝MAX）〜0（中立）〜+100（怒りMAX）

// レベルアップメッセージ
const levelUpMessages = [
    "🌟 レベルアップ！僧侶の悟りが深まりました 🌟",
    "✨ レベルアップ！相談者の信頼が高まりました ✨",
    "🎉 レベルアップ！仏の智慧が宿りました 🎉",
    "🏆 レベルアップ！高僧への道を歩んでいます 🏆",
    "💫 レベルアップ！衆生を救う力が増しました 💫"
];

// コンボメッセージ
const comboMessages = [
    "🔥 コンボ！素晴らしいアドバイスです 🔥",
    "⚡ 連続正解！僧侶の実力が光ります ⚡",
    "🎯 コンボ継続！相談者の心を癒しています 🎯",
    "💎 連続正解！仏の慈悲が現れています 💎",
    "🌟 コンボ！悟りの境地に近づいています 🌟"
];

// ゲーム初期化
function initGame() {
    // 24種類の相談者をランダムな順序で選択
    gameConsultations = [...consultations].sort(() => Math.random() - 0.5);

    currentConsultation = 0;
    score = 0;
    remainingVisitors = 24;
    combo = 0;
    maxCombo = 0;
    level = 1;
    experience = 0;
    experienceToNextLevel = 100;
    totalCorrect = 0;
    totalIncorrect = 0;
    streak = 0;
    maxStreak = 0;
    gratitudeLevel = 50;
    angerLevel = 50;
    emotionBalance = 0;

    updateDisplay();
    showConsultation();
}

// 表示を更新
function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('remaining').textContent = remainingVisitors;
    
    // 新しい統計情報を表示
    updateStats();
    
    // 感情バーを更新
    updateEmotionBar();
}

// 統計情報を更新
function updateStats() {
    const statsContainer = document.getElementById('stats-container');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">レベル:</span>
                <span class="stat-value">${level}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">経験値:</span>
                <span class="stat-value">${experience}/${experienceToNextLevel}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">コンボ:</span>
                <span class="stat-value">${combo}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">最大コンボ:</span>
                <span class="stat-value">${maxCombo}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">正解率:</span>
                <span class="stat-value">${totalCorrect + totalIncorrect > 0 ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100) : 0}%</span>
            </div>
        `;
    }
}

// 感情バーを更新
function updateEmotionBar() {
    const emotionFill = document.getElementById('emotion-fill');
    if (emotionFill) {
        // emotionBalance: -100（感謝MAX）〜0（中立）〜+100（怒りMAX）
        const percent = (emotionBalance + 100) / 2; // 0〜100
        emotionFill.style.width = '50%';
        emotionFill.style.left = percent + '%';
        emotionFill.style.transform = `translateX(-50%)`;
        // 色を調整
        if (emotionBalance < -50) {
            emotionFill.style.background = 'linear-gradient(90deg, #38a169 0%, #38a169 100%)';
        } else if (emotionBalance > 50) {
            emotionFill.style.background = 'linear-gradient(90deg, #e53e3e 0%, #e53e3e 100%)';
        } else {
            emotionFill.style.background = 'linear-gradient(90deg, #38a169 0%, #3182ce 50%, #e53e3e 100%)';
        }
    }
}

// 経験値を追加
function addExperience(amount) {
    experience += amount;
    
    // レベルアップチェック
    while (experience >= experienceToNextLevel) {
        levelUp();
    }
}

// レベルアップ
function levelUp() {
    level++;
    experience -= experienceToNextLevel;
    experienceToNextLevel = Math.floor(experienceToNextLevel * 1.2); // 次のレベルに必要な経験値を増加
    
    // レベルアップメッセージを表示
    showLevelUpMessage();
}

// レベルアップメッセージを表示
function showLevelUpMessage() {
    const message = levelUpMessages[Math.floor(Math.random() * levelUpMessages.length)];
    const levelUpElement = document.createElement('div');
    levelUpElement.className = 'level-up-message';
    levelUpElement.textContent = message;
    levelUpElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #ffd700, #ffed4e);
        color: #333;
        padding: 20px 30px;
        border-radius: 15px;
        font-size: 1.3em;
        font-weight: bold;
        z-index: 1000;
        animation: levelUpAnimation 2s ease-out forwards;
        box-shadow: 0 8px 32px rgba(255, 215, 0, 0.5);
    `;
    
    document.body.appendChild(levelUpElement);
    
    // 2秒後に削除
    setTimeout(() => {
        document.body.removeChild(levelUpElement);
    }, 2000);
}

// コンボメッセージを表示
function showComboMessage() {
    if (combo >= 3) {
        const message = comboMessages[Math.floor(Math.random() * comboMessages.length)];
        const comboElement = document.createElement('div');
        comboElement.className = 'combo-message';
        comboElement.textContent = `${message} (${combo}連続!)`;
        comboElement.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ff6b6b, #ee5a52);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-size: 1.1em;
            font-weight: bold;
            z-index: 1000;
            animation: comboAnimation 1.5s ease-out forwards;
            box-shadow: 0 4px 16px rgba(255, 107, 107, 0.5);
        `;
        
        document.body.appendChild(comboElement);
        
        // 1.5秒後に削除
        setTimeout(() => {
            document.body.removeChild(comboElement);
        }, 1500);
    }
}

// 相談を表示
function showConsultation() {
    const consultation = gameConsultations[currentConsultation];

    document.getElementById('visitor-name').textContent = consultation.name;
    document.getElementById('consultation-text').textContent = consultation.problem;

    // アドバイスボタンを設定
    const adviceButtons = document.querySelectorAll('.advice-btn');
    consultation.advice.forEach((advice, index) => {
        adviceButtons[index].textContent = advice;
        adviceButtons[index].style.display = 'block';
    });

    // 結果を非表示
    document.getElementById('result').classList.add('hidden');
    document.getElementById('advice-buttons').style.display = 'flex';
}

// アドバイスを選択
function selectAdvice(selectedIndex) {
    const consultation = gameConsultations[currentConsultation];
    const resultElement = document.getElementById('result');
    const resultText = document.getElementById('result-text');
    const resultMessage = document.getElementById('result-message');

    // ボタンを非表示
    document.getElementById('advice-buttons').style.display = 'none';

    if (selectedIndex === consultation.correct) {
        // 正解
        totalCorrect++;
        combo++;
        streak++;
        if (combo > maxCombo) maxCombo = combo;
        if (streak > maxStreak) maxStreak = streak;
        
        // コンボボーナス計算
        let comboBonus = 0;
        if (combo >= 3) comboBonus = Math.floor(combo / 3) * 2;
        
        // 基本ポイント + コンボボーナス
        let pointsEarned = 1 + comboBonus;
        
        // 感情パラメータによるボーナス/ペナルティ
        if (gratitudeLevel > 70) {
            pointsEarned += 1; // 感謝度が高いとボーナス
        } else if (angerLevel > 70) {
            pointsEarned = Math.max(0, pointsEarned - 1); // 怒り度が高いとペナルティ
        }
        
        score += pointsEarned;
        
        // 経験値追加
        addExperience(10 + comboBonus * 5);
        
        // 感情パラメータ更新（感謝度アップ、怒り度ダウン）
        gratitudeLevel = Math.min(100, gratitudeLevel + 5);
        angerLevel = Math.max(0, angerLevel - 3);
        emotionBalance = Math.max(-100, emotionBalance - 10); // 感謝方向
        
        resultElement.className = 'result success';
        resultText.textContent = `✨ 素晴らしいアドバイスです！ +${pointsEarned}ポイント ✨`;
        resultMessage.textContent = consultation.successMessage;
        
        // コンボメッセージ表示
        showComboMessage();
        
        // 成功アニメーション
        resultElement.style.animation = 'successPulse 0.5s ease-out';
        setTimeout(() => {
            resultElement.style.animation = '';
        }, 500);
        
    } else {
        // 不正解
        totalIncorrect++;
        combo = 0;
        streak = 0;
        
        // 感情パラメータ更新（怒り度アップ、感謝度ダウン）
        angerLevel = Math.min(100, angerLevel + 5);
        gratitudeLevel = Math.max(0, gratitudeLevel - 3);
        emotionBalance = Math.min(100, emotionBalance + 10); // 怒り方向
        
        resultElement.className = 'result failure';
        resultText.textContent = '😔 もう少し考えてみましょう... 😔';
        resultMessage.textContent = consultation.failureMessage;
        
        // 失敗アニメーション
        resultElement.style.animation = 'failureShake 0.5s ease-out';
        setTimeout(() => {
            resultElement.style.animation = '';
        }, 500);
    }

    resultElement.classList.remove('hidden');
    updateDisplay();
}

// 次の相談者へ
function nextConsultation() {
    currentConsultation++;
    remainingVisitors--;

    if (currentConsultation >= gameConsultations.length) {
        // ゲーム終了
        showGameOver();
    } else {
        showConsultation();
    }
}

// ゲーム終了画面
function showGameOver() {
    document.getElementById('consultation-card').style.display = 'none';
    document.getElementById('advice-buttons').style.display = 'none';
    document.getElementById('result').classList.add('hidden');

    const gameOverElement = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');
    const ratingElement = document.getElementById('rating');

    finalScoreElement.textContent = score;
    
    // 詳細な統計情報を表示
    const statsHTML = `
        <div class="final-stats">
            <div class="stat-row">
                <span>最終レベル:</span>
                <span>${level}</span>
            </div>
            <div class="stat-row">
                <span>最大コンボ:</span>
                <span>${maxCombo}</span>
            </div>
            <div class="stat-row">
                <span>正解数:</span>
                <span>${totalCorrect}/${totalCorrect + totalIncorrect}</span>
            </div>
            <div class="stat-row">
                <span>正解率:</span>
                <span>${Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100)}%</span>
            </div>
            <div class="stat-row">
                <span>最大連続正解:</span>
                <span>${maxStreak}</span>
            </div>
        </div>
    `;
    
    // 評価を決定
    let rating = '';
    let ratingText = '';
    const accuracy = (totalCorrect / (totalCorrect + totalIncorrect)) * 100;
    
    if (accuracy >= 90 && maxCombo >= 5) {
        rating = '🏆 伝説の僧侶 🏆';
        ratingText = 'すべての衆生を救う伝説の僧侶です！';
    } else if (accuracy >= 80 && maxCombo >= 3) {
        rating = '🌟 高僧 🌟';
        ratingText = '多くの人々を導く高僧です！';
    } else if (accuracy >= 70) {
        rating = '✨ 修行僧 ✨';
        ratingText = '着実に成長している修行僧です！';
    } else if (accuracy >= 50) {
        rating = '🙏 初心者僧侶 🙏';
        ratingText = 'まだまだ修行が必要です。';
    } else {
        rating = '😅 迷える僧侶 😅';
        ratingText = 'もっと勉強が必要です...';
    }
    
    ratingElement.innerHTML = `<div class="rating-title">${rating}</div><div class="rating-description">${ratingText}</div>${statsHTML}`;

    gameOverElement.classList.remove('hidden');
}

// ゲーム再開
function restartGame() {
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('consultation-card').style.display = 'block';
    initGame();
}

// ページ読み込み時にゲーム開始
window.onload = function() {
    initGame();
};