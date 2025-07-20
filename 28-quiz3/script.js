// QUIZ-ZONE ディストピアクイズバトル メインスクリプト

// ゲーム状態管理
const gameState = {
    clearedZones: new Set(),
    wrongQuestions: [],
    currentZone: null,
    currentQuestionIndex: 0,
    score: 0,
    timeLeft: 30,
    timerInterval: null,
    totalAttempts: 0,
    hasSeenEnding: false
};

// 問題データベース
const quizData = {
    1: { // 数学
        name: "数学管理官",
        questions: [
            {
                question: "5 + 3 = ?",
                answers: ["6", "7", "8", "9"],
                correct: 2
            },
            {
                question: "10 × 6 = ?",
                answers: ["50", "60", "70", "80"],
                correct: 1
            },
            {
                question: "100 ÷ 4 = ?",
                answers: ["20", "25", "30", "35"],
                correct: 1
            },
            {
                question: "7 × 8 = ?",
                answers: ["54", "56", "58", "60"],
                correct: 1
            },
            {
                question: "15 - 9 = ?",
                answers: ["4", "5", "6", "7"],
                correct: 2
            }
        ]
    },
    2: { // 国語
        name: "国語管理官",
        questions: [
            {
                question: "「美しい」の反対の意味の言葉は？",
                answers: ["きれい", "醜い", "大きい", "小さい"],
                correct: 1
            },
            {
                question: "「犬」を英語で言うと？",
                answers: ["cat", "dog", "bird", "fish"],
                correct: 1
            },
            {
                question: "「ありがとう」の丁寧語は？",
                answers: ["ありがとです", "ありがとうございます", "ありがとだ", "ありがとうだ"],
                correct: 1
            },
            {
                question: "「走る」の過去形は？",
                answers: ["走った", "走る", "走って", "走ろう"],
                correct: 0
            },
            {
                question: "「山」の読み方は？",
                answers: ["やま", "かわ", "うみ", "そら"],
                correct: 0
            }
        ]
    },
    3: { // 理科
        name: "理科管理官",
        questions: [
            {
                question: "太陽系で一番大きい惑星は？",
                answers: ["地球", "木星", "火星", "金星"],
                correct: 1
            },
            {
                question: "水が凍ると何になる？",
                answers: ["水蒸気", "氷", "雪", "霧"],
                correct: 1
            },
            {
                question: "植物が光を使って栄養を作ることを何という？",
                answers: ["呼吸", "光合成", "消化", "分解"],
                correct: 1
            },
            {
                question: "磁石のN極とS極、同じ極同士はどうなる？",
                answers: ["くっつく", "離れる", "変わらない", "回る"],
                correct: 1
            },
            {
                question: "人間の骨は全部で何本ある？",
                answers: ["約100本", "約200本", "約300本", "約400本"],
                correct: 1
            }
        ]
    },
    4: { // 社会
        name: "社会管理官",
        questions: [
            {
                question: "日本の首都は？",
                answers: ["大阪", "東京", "京都", "名古屋"],
                correct: 1
            },
            {
                question: "世界で一番大きな国は？",
                answers: ["中国", "アメリカ", "ロシア", "カナダ"],
                correct: 2
            },
            {
                question: "日本の国旗の色は？",
                answers: ["青と白", "赤と白", "緑と白", "黄と白"],
                correct: 1
            },
            {
                question: "江戸時代の次の時代は？",
                answers: ["平安時代", "鎌倉時代", "明治時代", "大正時代"],
                correct: 2
            },
            {
                question: "日本の島の数は約何個？",
                answers: ["約1000個", "約3000個", "約5000個", "約7000個"],
                correct: 3
            }
        ]
    },
    5: { // 英語
        name: "英語管理官",
        questions: [
            {
                question: "「こんにちは」を英語で言うと？",
                answers: ["Goodbye", "Hello", "Thank you", "Please"],
                correct: 1
            },
            {
                question: "「cat」の意味は？",
                answers: ["犬", "猫", "鳥", "魚"],
                correct: 1
            },
            {
                question: "「red」の意味は？",
                answers: ["青", "緑", "赤", "黄"],
                correct: 2
            },
            {
                question: "「I am」の意味は？",
                answers: ["私は", "あなたは", "彼は", "私たちは"],
                correct: 0
            },
            {
                question: "「book」の意味は？",
                answers: ["ペン", "本", "机", "椅子"],
                correct: 1
            }
        ]
    },
    6: { // 生活
        name: "生活管理官",
        questions: [
            {
                question: "手を洗うのはいつが良い？",
                answers: ["食事の前", "遊んだ後", "トイレの後", "全部"],
                correct: 3
            },
            {
                question: "野菜を食べると何が良い？",
                answers: ["背が伸びる", "健康になる", "眠くなる", "疲れる"],
                correct: 1
            },
            {
                question: "横断歩道を渡るとき、何色で渡る？",
                answers: ["赤", "黄", "青", "紫"],
                correct: 2
            },
            {
                question: "1日に必要な睡眠時間は？",
                answers: ["5時間", "8時間", "12時間", "15時間"],
                correct: 1
            },
            {
                question: "ゴミは何に入れる？",
                answers: ["机", "ゴミ箱", "かばん", "ポケット"],
                correct: 1
            }
        ]
    },
    7: { // 音楽
        name: "音楽管理官",
        questions: [
            {
                question: "ピアノの鍵盤は何色？",
                answers: ["白だけ", "黒だけ", "白と黒", "赤と青"],
                correct: 2
            },
            {
                question: "「ド・レ・ミ」の次は？",
                answers: ["ファ", "ソ", "ラ", "シ"],
                correct: 0
            },
            {
                question: "バイオリンは何で音を出す？",
                answers: ["指", "弓", "口", "足"],
                correct: 1
            },
            {
                question: "歌を歌うときに使う体の部分は？",
                answers: ["手", "足", "のど", "頭"],
                correct: 2
            },
            {
                question: "楽器を演奏する人を何という？",
                answers: ["選手", "演奏者", "歌手", "画家"],
                correct: 1
            }
        ]
    },
    8: { // 体育
        name: "体育管理官",
        questions: [
            {
                question: "運動する前に大切なことは？",
                answers: ["食事", "準備体操", "睡眠", "勉強"],
                correct: 1
            },
            {
                question: "サッカーで使ってはいけない体の部分は？",
                answers: ["足", "頭", "手", "胸"],
                correct: 2
            },
            {
                question: "水泳で一番基本的な泳ぎ方は？",
                answers: ["クロール", "平泳ぎ", "背泳ぎ", "バタフライ"],
                correct: 0
            },
            {
                question: "マラソンは何キロ走る？",
                answers: ["10km", "21km", "42km", "100km"],
                correct: 2
            },
            {
                question: "運動した後に大切なことは？",
                answers: ["すぐ座る", "水分補給", "すぐ寝る", "何もしない"],
                correct: 1
            }
        ]
    },
    omega: { // 最終ボス
        name: "中央制御AI《Ω》",
        questions: [
            {
                question: "【統合問題】5×6+10÷2=?",
                answers: ["20", "25", "30", "35"],
                correct: 3
            },
            {
                question: "【統合問題】地球で一番大きな海は？",
                answers: ["大西洋", "太平洋", "インド洋", "北極海"],
                correct: 1
            },
            {
                question: "【統合問題】Hello + こんにちは = ?",
                answers: ["挨拶", "言葉", "会話", "全部"],
                correct: 3
            },
            {
                question: "【統合問題】音楽×体育×数学=?",
                answers: ["リズム", "拍子", "全部", "楽しさ"],
                correct: 3
            },
            {
                question: "【最終問題】知識の本当の意味は？",
                answers: ["記憶すること", "理解すること", "使うこと", "分かち合うこと"],
                correct: 3
            }
        ]
    }
};

// 効果音再生
function playSound(type) {
    const sound = document.getElementById(type + 'Sound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('音声再生エラー:', e));
    }
}

// 画面切り替え
function showScreen(screenId) {
    console.log('Switching to screen:', screenId);
    
    // 全てのスクリーンを非表示
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        console.log('Removed active from:', screen.id);
    });
    
    // 指定されたスクリーンを表示
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('Added active to:', screenId);
        console.log('Target screen display style:', getComputedStyle(targetScreen).display);
    } else {
        console.error('Screen not found:', screenId);
    }
}

// ゾーンステータス更新
function updateZoneStatus() {
    console.log('Updating zone status, cleared zones:', Array.from(gameState.clearedZones));
    const zones = document.querySelectorAll('.zone-box');
    zones.forEach(zone => {
        const zoneNum = zone.getAttribute('data-zone');
        if (zoneNum === 'omega') {
            if (gameState.clearedZones.size >= 8) {
                zone.classList.remove('locked');
                zone.classList.add('unlocked');
                zone.querySelector('.zone-status').textContent = '🔓';
            } else {
                zone.classList.add('locked');
                zone.querySelector('.zone-status').textContent = '🔒';
            }
        } else {
            const zoneId = parseInt(zoneNum);
            if (gameState.clearedZones.has(zoneId)) {
                console.log('Zone', zoneId, 'is cleared, adding cleared class');
                zone.classList.add('cleared');
                zone.classList.remove('locked');
                zone.querySelector('.zone-status').textContent = '🎯';
            } else {
                // 初期状態では全てのゾーンが利用可能
                zone.classList.remove('locked');
                zone.classList.remove('cleared');
                zone.querySelector('.zone-status').textContent = '⚡';
            }
        }
    });
    
    document.getElementById('clearCount').textContent = gameState.clearedZones.size;
}

// タイマー開始
function startTimer() {
    gameState.timeLeft = 30;
    const timerElement = document.getElementById('timeLeft');
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        timerElement.textContent = gameState.timeLeft;
        
        if (gameState.timeLeft <= 10) {
            timerElement.parentElement.classList.add('warning');
        }
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            timeUp();
        }
    }, 1000);
}

// タイマー停止
function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    document.getElementById('timeLeft').parentElement.classList.remove('warning');
}

// 時間切れ処理
function timeUp() {
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach(btn => btn.classList.add('disabled'));
    
    // 警報音を鳴らす
    playSound('wrong');
    
    // 正解を表示
    const correctIndex = quizData[gameState.currentZone].questions[gameState.currentQuestionIndex].correct;
    answerButtons[correctIndex].classList.add('correct');
    
    // 間違えた問題を記録
    recordWrongQuestion();
    
    setTimeout(() => {
        nextQuestion();
    }, 2000);
}

// 問題表示
function showQuestion() {
    const questionData = quizData[gameState.currentZone].questions[gameState.currentQuestionIndex];
    
    document.getElementById('question').textContent = questionData.question;
    document.getElementById('questionNum').textContent = `${gameState.currentQuestionIndex + 1}/5`;
    document.getElementById('score').textContent = `正解: ${gameState.score}/5`;
    
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach((btn, index) => {
        btn.textContent = questionData.answers[index];
        btn.classList.remove('correct', 'wrong', 'disabled');
        btn.onclick = () => selectAnswer(index);
    });
    
    startTimer();
}

// 答え選択
function selectAnswer(selectedIndex) {
    stopTimer();
    
    const questionData = quizData[gameState.currentZone].questions[gameState.currentQuestionIndex];
    const answerButtons = document.querySelectorAll('.answer-btn');
    
    // 全てのボタンを無効化
    answerButtons.forEach(btn => {
        btn.classList.add('disabled');
        btn.onclick = null;
    });
    
    // 正解かどうかチェック
    if (selectedIndex === questionData.correct) {
        answerButtons[selectedIndex].classList.add('correct');
        gameState.score++;
        playSound('correct');
    } else {
        answerButtons[selectedIndex].classList.add('wrong');
        answerButtons[questionData.correct].classList.add('correct');
        playSound('wrong');
        recordWrongQuestion();
    }
    
    // 2秒後に次の問題へ
    setTimeout(() => {
        nextQuestion();
    }, 2000);
}

// 間違えた問題を記録
function recordWrongQuestion() {
    const questionData = quizData[gameState.currentZone].questions[gameState.currentQuestionIndex];
    const wrongQuestion = {
        zone: gameState.currentZone,
        zoneName: quizData[gameState.currentZone].name,
        question: questionData.question,
        answers: questionData.answers,
        correct: questionData.correct,
        userAnswer: null
    };
    
    gameState.wrongQuestions.push(wrongQuestion);
}

// 次の問題
function nextQuestion() {
    gameState.currentQuestionIndex++;
    
    if (gameState.currentQuestionIndex >= 5) {
        showResult();
    } else {
        showQuestion();
    }
}

// 結果表示
function showResult() {
    const resultContent = document.querySelector('.result-content');
    const resultTitle = document.getElementById('resultTitle');
    const resultScore = document.getElementById('resultScore');
    const resultMessage = document.getElementById('resultMessage');
    
    resultScore.textContent = `正解数: ${gameState.score}/5`;
    
    if (gameState.score >= 3) {
        resultTitle.textContent = "勝利";
        resultContent.classList.add('success');
        resultContent.classList.remove('failure');
        resultMessage.textContent = "知識管理官を打倒した！";
        // 数値に変換してから追加
        const zoneId = gameState.currentZone === 'omega' ? 'omega' : parseInt(gameState.currentZone);
        gameState.clearedZones.add(zoneId);
        console.log('Zone cleared:', zoneId, 'Total cleared:', gameState.clearedZones.size);
        updateZoneStatus();
        
        // クリアアニメーション効果
        setTimeout(() => {
            const clearedZone = document.querySelector(`[data-zone="${gameState.currentZone}"]`);
            if (clearedZone) {
                clearedZone.style.animation = 'clearAnimation 1s ease-in-out';
                setTimeout(() => {
                    clearedZone.style.animation = '';
                }, 1000);
            }
        }, 500);
        
        // エンディングチェック
        if (gameState.currentZone === 'omega' && !gameState.hasSeenEnding) {
            setTimeout(() => {
                showEnding();
            }, 3000);
        }
    } else {
        resultTitle.textContent = "敗北";
        resultContent.classList.add('failure');
        resultContent.classList.remove('success');
        resultMessage.textContent = "知識不足により処刑...再挑戦せよ";
    }
    
    showScreen('resultScreen');
}

// クイズ開始
function startQuiz(zoneId) {
    console.log('Starting quiz for zone:', zoneId);
    if (zoneId === 'omega' && gameState.clearedZones.size < 8) {
        alert('全てのZoneをクリアしてから挑戦してください！');
        return;
    }
    
    gameState.currentZone = zoneId;
    gameState.currentQuestionIndex = 0;
    gameState.score = 0;
    gameState.totalAttempts++;
    
    // ヘッダー情報更新
    document.getElementById('currentZone').textContent = zoneId === 'omega' ? 'Ω' : `Zone ${zoneId}`;
    document.getElementById('bossName').textContent = quizData[zoneId].name;
    
    showScreen('quizScreen');
    showQuestion();
}

// トレーニング表示
function showTraining() {
    const trainingList = document.getElementById('trainingList');
    
    if (gameState.wrongQuestions.length === 0) {
        trainingList.innerHTML = '<p class="no-data">まだ復習する問題がありません</p>';
    } else {
        trainingList.innerHTML = '';
        gameState.wrongQuestions.forEach((q, index) => {
            const item = document.createElement('div');
            item.className = 'training-item';
            item.innerHTML = `
                <h4>${q.zoneName}</h4>
                <p><strong>問題:</strong> ${q.question}</p>
                <p><strong>正解:</strong> ${q.answers[q.correct]}</p>
            `;
            trainingList.appendChild(item);
        });
    }
    
    showScreen('trainingScreen');
}

// エンディング表示
function showEnding() {
    gameState.hasSeenEnding = true;
    
    // 統計情報を更新
    document.getElementById('finalClearCount').textContent = gameState.clearedZones.size;
    document.getElementById('totalAttempts').textContent = gameState.totalAttempts;
    
    // 解放者レベルを計算
    let liberatorLevel = '初級';
    if (gameState.clearedZones.size >= 6) {
        liberatorLevel = '上級';
    } else if (gameState.clearedZones.size >= 4) {
        liberatorLevel = '中級';
    }
    document.getElementById('liberatorLevel').textContent = liberatorLevel;
    
    showScreen('endingScreen');
}

// イベントリスナー設定
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing game...');
    
    // 初期設定
    updateZoneStatus();
    
    // 開始ボタン
    document.getElementById('startBtn').addEventListener('click', function() {
        console.log('Start button clicked');
        showScreen('zoneScreen');
        updateZoneStatus();
    });
    
    // ゾーン選択
    document.querySelectorAll('.zone-box').forEach(zone => {
        zone.addEventListener('click', function() {
            const zoneId = this.getAttribute('data-zone');
            console.log('Zone clicked:', zoneId);
            
            // クリア済みゾーンはクリック不可
            const zoneIdNum = parseInt(zoneId);
            if (gameState.clearedZones.has(zoneIdNum)) {
                console.log('Zone already cleared:', zoneIdNum);
                return;
            }
            
            if (zoneId === 'omega' && gameState.clearedZones.size < 8) {
                console.log('Omega zone locked, need 8 cleared zones');
                return;
            }
            startQuiz(zoneId);
        });
    });
    
    // トレーニングボタン
    document.getElementById('trainingBtn').addEventListener('click', function() {
        showTraining();
    });
    
    // 結果画面のボタン
    document.getElementById('retryBtn').addEventListener('click', function() {
        startQuiz(gameState.currentZone);
    });
    
    document.getElementById('backToZoneBtn').addEventListener('click', function() {
        showScreen('zoneScreen');
    });
    
    // クイズ中断ボタン
    document.getElementById('quitBtn').addEventListener('click', function() {
        if (confirm('本当に中断しますか？')) {
            stopTimer();
            showScreen('zoneScreen');
        }
    });
    
    // トレーニングから戻る
    document.getElementById('backFromTrainingBtn').addEventListener('click', function() {
        showScreen('zoneScreen');
    });
    
    // エンディング画面のボタン
    document.getElementById('restartBtn').addEventListener('click', function() {
        // ゲームをリセット
        gameState.clearedZones.clear();
        gameState.wrongQuestions = [];
        gameState.totalAttempts = 0;
        gameState.hasSeenEnding = false;
        updateZoneStatus();
        showScreen('startScreen');
    });
    
    document.getElementById('creditsBtn').addEventListener('click', function() {
        showScreen('creditsScreen');
    });
    
    // クレジットから戻る
    document.getElementById('backToEndingBtn').addEventListener('click', function() {
        showScreen('endingScreen');
    });
});