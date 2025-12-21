// グローバル変数
let quizData = null;
let currentGenre = null;
let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let clearedGenres = {}; // クリアしたジャンルを保存するオブジェクト
let wrongAnswers = {}; // 間違えた問題を保存
let bgmEnabled = false; // BGMの状態
let soundEnabled = true; // 効果音の状態
let isShuraRoute = false; // 修羅ルート中かどうか

// 画面要素の取得
const screens = {
    title: document.getElementById('title-screen'),
    quiz: document.getElementById('quiz-screen'),
    result: document.getElementById('result-screen'),
    explanation: document.getElementById('explanation-screen'),
    loading: document.getElementById('loading-screen'),
    shuraResult: document.getElementById('shura-result-screen')
};

// 新しい要素の取得
const genreButtonsContainer = document.getElementById('genre-buttons');
const startAllClearedButton = document.getElementById('start-all-cleared-button');
const bgmAudio = document.getElementById('bgm'); // BGM要素を取得
const bgmStorageKey = 'bgmEnabled'; // LocalStorageのキー
const soundStorageKey = 'soundEnabled'; // 効果音設定のキー
const wrongAnswersStorageKey = 'wrongAnswers'; // 間違えた問題

// アプリ初期化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        loadSettings(); // 設定をロード
        loadClearedGenres(); // クリア状況をロード
        loadWrongAnswers(); // 間違えた問題をロード
        initializeBGM(); // BGMの初期化
        createControlButtons(); // 音声制御ボタンを作成
        await loadQuizData();
        setupEventListeners();
        showScreen('title');
    } catch (error) {
        console.error('初期化エラー:', error);
        showErrorMessage('アプリの初期化に失敗しました。ページを再読み込みしてください。');
    }
});

// 設定の保存と読み込み
function saveSettings() {
    localStorage.setItem(bgmStorageKey, bgmEnabled.toString());
    localStorage.setItem(soundStorageKey, soundEnabled.toString());
}

function loadSettings() {
    bgmEnabled = localStorage.getItem(bgmStorageKey) === 'true';
    soundEnabled = localStorage.getItem(soundStorageKey) !== 'false'; // デフォルトはtrue
}

// BGMの初期化と再生制御
function initializeBGM() {
    if (!bgmAudio) {
        console.warn('BGMオーディオ要素が見つかりません');
        return;
    }

    bgmAudio.volume = 0.3; // 音量を30%に設定
    bgmAudio.loop = true;

    if (bgmEnabled) {
        // ユーザーの操作後に再生を試みる
        document.addEventListener('click', playBGMOnFirstInteraction, { once: true });
        document.addEventListener('touchstart', playBGMOnFirstInteraction, { once: true });
    }
}

// 最初のユーザー操作でBGMを再生
function playBGMOnFirstInteraction() {
    if (bgmEnabled && bgmAudio) {
        bgmAudio.play().catch(error => {
            console.warn('BGMの再生に失敗:', error);
        });
    }
}

// 音声制御ボタンの作成
function createControlButtons() {
    const controlContainer = document.createElement('div');
    controlContainer.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        z-index: 1000;
        display: flex;
        gap: 10px;
    `;

    // BGMボタン
    const bgmButton = document.createElement('button');
    bgmButton.textContent = bgmEnabled ? '🎵' : '🔇';
    bgmButton.style.cssText = `
        padding: 8px;
        border: 2px solid #6d330c;
        background: rgba(139, 69, 19, 0.9);
        color: white;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
    `;
    bgmButton.title = 'BGMのオン/オフ';

    bgmButton.addEventListener('click', () => {
        bgmEnabled = !bgmEnabled;
        bgmButton.textContent = bgmEnabled ? '🎵' : '🔇';
        
        if (bgmEnabled && bgmAudio) {
            bgmAudio.play().catch(error => {
                console.warn('BGM再生エラー:', error);
            });
        } else if (bgmAudio) {
            bgmAudio.pause();
        }
        
        saveSettings();
    });

    // 効果音ボタン
    const soundButton = document.createElement('button');
    soundButton.textContent = soundEnabled ? '🔊' : '🔈';
    soundButton.style.cssText = bgmButton.style.cssText;
    soundButton.title = '効果音のオン/オフ';

    soundButton.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundButton.textContent = soundEnabled ? '🔊' : '🔈';
        saveSettings();
    });

    controlContainer.appendChild(bgmButton);
    controlContainer.appendChild(soundButton);
    document.body.appendChild(controlContainer);
}

// 効果音再生関数
function playSound(type) {
    if (!soundEnabled) return;
    
    // Web Audio APIを使用した簡単な効果音生成
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'correct':
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
                break;
            case 'incorrect':
                oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
                oscillator.frequency.setValueAtTime(196, audioContext.currentTime + 0.1); // G3
                break;
            case 'click':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                break;
        }
        
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.warn('効果音の再生に失敗:', error);
    }
}

// エラーメッセージ表示
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(217, 83, 79, 0.95);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 10000;
        text-align: center;
        max-width: 80%;
    `;
    errorDiv.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '閉じる';
    closeButton.style.cssText = `
        margin-top: 15px;
        padding: 10px 20px;
        background: white;
        color: #d9534f;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    `;
    closeButton.onclick = () => document.body.removeChild(errorDiv);
    
    errorDiv.appendChild(closeButton);
    document.body.appendChild(errorDiv);
}

// クイズデータの読み込み
async function loadQuizData() {
    try {
        showScreen('loading');
        
        // JSONファイルから読み込み（複数の方法を試す）
        let response;
        
        try {
            // 方法1: JSONファイルを直接読み込み
            response = await fetch('./modern_history_quizData_complete.json');
        } catch (e1) {
            try {
                // 方法2: 絶対パスで読み込み
                response = await fetch('/modern_history_quizData_complete.json');
            } catch (e2) {
                // 方法3: サンプルデータを使用
                console.warn('JSONファイルの読み込みに失敗しました。サンプルデータを使用します。');
                quizData = createSampleData();
                renderGenreButtons();
                return;
            }
        }
        
        if (response.ok) {
            quizData = await response.json();
            renderGenreButtons();
        } else {
            throw new Error('JSONファイルが見つかりません');
        }
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        // フォールバック: サンプルデータを使用
        quizData = createSampleData();
        renderGenreButtons();
    }
}

// サンプルデータ作成（フォールバック用）
function createSampleData() {
    return {
        genres: [
            {
                id: 'sample1',
                name: 'サンプル1',
                description: 'テストデータ',
                questions: [
                    {
                        id: 1,
                        question: 'これはサンプル問題です。正しい答えはどれ？',
                        choices: ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
                        correct: 0,
                        explanation: 'サンプルデータです。JSONファイルを正しく配置してください。'
                    }
                ]
            }
        ]
    };
}

// 画面表示
function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        if (screen) screen.classList.remove('active');
    });
    
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
    }
}

// イベントリスナー設定
function setupEventListeners() {
    document.getElementById('back-btn')?.addEventListener('click', () => {
        playSound('click');
        resetQuiz();
        renderGenreButtons();
        showScreen('title');
    });

    document.getElementById('next-btn')?.addEventListener('click', () => {
        playSound('click');
        advanceQuestion();
    });

    document.getElementById('retry-btn')?.addEventListener('click', () => {
        playSound('click');
        startQuiz(currentGenre);
    });

    document.getElementById('home-btn')?.addEventListener('click', () => {
        playSound('click');
        resetQuiz();
        renderGenreButtons();
        showScreen('title');
    });

    document.getElementById('shura-retry-btn')?.addEventListener('click', () => {
        playSound('click');
        startShuraRoute();
    });

    document.getElementById('shura-home-btn')?.addEventListener('click', () => {
        playSound('click');
        isShuraRoute = false;
        resetQuiz();
        renderGenreButtons();
        showScreen('title');
    });

    document.getElementById('start-all-cleared-button')?.addEventListener('click', () => {
        playSound('click');
        startShuraRoute();
    });
}

// ジャンルボタン表示
function renderGenreButtons() {
    if (!quizData || !quizData.genres) return;

    genreButtonsContainer.innerHTML = '';
    
    let allGenresCleared = true;

    quizData.genres.forEach(genre => {
        const isCleared = clearedGenres[genre.id];
        if (!isCleared) allGenresCleared = false;

        const button = document.createElement('button');
        button.classList.add('genre-button');
        if (isCleared) button.classList.add('cleared');

        button.innerHTML = `
            <h3>${genre.name}</h3>
            <p>${genre.description}</p>
            <p>問題数: ${genre.questions ? genre.questions.length : 0}問</p>
        `;

        button.addEventListener('click', () => {
            playSound('click');
            startQuiz(genre.id);
        });
        genreButtonsContainer.appendChild(button);
    });

    // 修羅ルートボタンの表示
    const shuraButton = document.createElement('button');
    shuraButton.classList.add('genre-button', 'shura-route');
    shuraButton.innerHTML = `
        <h3>🔥 修羅のルート 🔥</h3>
        <p>間違えた問題ラッシュ。きみは何問まで耐えられるか</p>
        <p>問題数: 不明</p>
    `;

    shuraButton.addEventListener('click', () => {
        playSound('click');
        if (Object.keys(wrongAnswers).length === 0 || getTotalWrongQuestions() === 0) {
            showErrorMessage('修羅ルートに出題する間違えた問題がありません。他のルートで問題を解いてください。');
        } else {
            startShuraRoute();
        }
    });
    genreButtonsContainer.appendChild(shuraButton);

    // 全クリアボタンの表示制御
    if (startAllClearedButton) {
        if (allGenresCleared && quizData.genres.length > 0) {
            startAllClearedButton.classList.add('show');
        } else {
            startAllClearedButton.classList.remove('show');
        }
    }
}

// 間違えた問題の総数を取得
function getTotalWrongQuestions() {
    let total = 0;
    for (const genreId in wrongAnswers) {
        if (Array.isArray(wrongAnswers[genreId])) {
            total += wrongAnswers[genreId].length;
        }
    }
    return total;
}

// クイズ開始
function startQuiz(genreId) {
    const selectedGenre = quizData.genres.find(genre => genre.id === genreId);
    if (!selectedGenre || !selectedGenre.questions || selectedGenre.questions.length === 0) {
        showErrorMessage('選択されたジャンルの問題が見つかりません。');
        return;
    }

    isShuraRoute = false;
    currentGenre = genreId;
    currentQuestionIndex = 0;
    score = 0;
    questions = [...selectedGenre.questions]; // 配列をコピー
    
    const genreTitle = document.getElementById('genre-title');
    const totalQuestions = document.getElementById('total-questions');
    
    if (genreTitle) {
        genreTitle.textContent = selectedGenre.name;
        genreTitle.classList.remove('shura-title');
    }
    if (totalQuestions) totalQuestions.textContent = questions.length;
    
    showScreen('quiz');
    displayQuestion();
}

// 修羅ルート開始
function startShuraRoute() {
    isShuraRoute = true;
    currentGenre = 'shura';
    currentQuestionIndex = 0;
    score = 0;
    questions = [];

    // 間違えた問題を全て集める
    for (const genreId in wrongAnswers) {
        if (Array.isArray(wrongAnswers[genreId])) {
            questions.push(...wrongAnswers[genreId]);
        }
    }

    if (questions.length === 0) {
        showErrorMessage('修羅ルートに出題する間違えた問題がありません。');
        renderGenreButtons();
        showScreen('title');
        return;
    }

    // シャッフル
    questions = shuffleArray(questions);

    const genreTitle = document.getElementById('genre-title');
    const totalQuestions = document.getElementById('total-questions');
    
    if (genreTitle) {
        genreTitle.textContent = '⚔️ 修羅のルート ⚔️';
        genreTitle.classList.add('shura-title');
    }
    if (totalQuestions) totalQuestions.textContent = questions.length;
    
    showScreen('quiz');
    displayQuestion();
}

// 配列シャッフル関数
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// 問題表示
function displayQuestion() {
    const questionText = document.getElementById('question-text');
    const choicesContainer = document.getElementById('choices');
    const questionNumberSpan = document.getElementById('question-number');

    if (currentQuestionIndex >= questions.length) {
        if (isShuraRoute) {
            showShuraResult();
        } else {
            showResult();
        }
        return;
    }

    const question = questions[currentQuestionIndex];
    
    if (questionText) questionText.textContent = question.question;
    if (questionNumberSpan) questionNumberSpan.textContent = currentQuestionIndex + 1;
    
    if (choicesContainer) {
        choicesContainer.innerHTML = '';
        
        question.choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.classList.add('choice-btn');
            button.textContent = choice;
            button.dataset.index = index;
            button.addEventListener('click', () => {
                checkAnswer(index, question.correct, question.explanation, question);
            });
            choicesContainer.appendChild(button);
        });
    }
}

// 回答チェック
function checkAnswer(selectedIndex, correctAnswerIndex, explanationText, question) {
    const choices = document.querySelectorAll('.choice-btn');
    const isCorrect = (selectedIndex === correctAnswerIndex);

    choices.forEach((button, index) => {
        button.disabled = true;
        button.classList.add('disabled');
        if (index === correctAnswerIndex) {
            button.classList.add('correct');
        } else if (index === selectedIndex && !isCorrect) {
            button.classList.add('incorrect');
        }
    });

    // 効果音再生
    playSound(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
        score++;
        document.getElementById('result-icon').textContent = '⭕';
        document.getElementById('result-title').textContent = '正解！';
    } else {
        // 間違えた問題を記録
        recordWrongAnswer(question);

        // 修羅ルートの場合は即終了
        if (isShuraRoute) {
            document.getElementById('result-icon').textContent = '❌';
            document.getElementById('result-title').textContent = '不正解...';
            
            const explanationElement = document.getElementById('explanation-text');
            if (explanationElement) {
                explanationElement.textContent = explanationText;
            }
            
            setTimeout(() => {
                showShuraResult();
            }, 1000);
            return;
        }

        document.getElementById('result-icon').textContent = '❌';
        document.getElementById('result-title').textContent = '不正解...';
    }
    
    const explanationElement = document.getElementById('explanation-text');
    if (explanationElement) {
        explanationElement.textContent = explanationText;
    }
    
    // 少し遅延を入れてから解説画面を表示
    setTimeout(() => {
        showScreen('explanation');
    }, 1000);
}

// 次の問題へ
function advanceQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex >= questions.length) {
        if (isShuraRoute) {
            showShuraResult();
        } else {
            showResult();
        }
    } else {
        showScreen('quiz');
        displayQuestion();
    }
}

// 結果画面表示
function showResult() {
    const scoreText = document.getElementById('score-text');
    const scoreMessage = document.getElementById('score-message');
    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    if (scoreText) scoreText.textContent = `${score}/${totalQuestions}`;
    
    let message = '';
    let isCleared = false;
    
    if (percentage >= 90) {
        message = '🏆 素晴らしい！歴史博士ですね！';
        isCleared = true;
    } else if (percentage >= 70) {
        message = '😊 よくできました！';
        isCleared = true;
    } else if (percentage >= 50) {
        message = '👍 まずまずですね！';
    } else {
        message = '📚 もう少し勉強が必要かも...';
    }
    
    if (scoreMessage) scoreMessage.textContent = message;

    // ジャンルクリア判定と保存
    if (currentGenre && isCleared) {
        if (!clearedGenres[currentGenre]) {
            clearedGenres[currentGenre] = true;
            saveClearedGenres();
            playSound('correct');
        }
    }

    showScreen('result');
}

// 修羅ルート結果表示
function showShuraResult() {
    const shuraResultTitle = document.getElementById('shura-result-title');
    const shuraExplanationText = document.getElementById('shura-explanation-text');
    const shuraSurvivedText = document.getElementById('shura-survived-text');

    const totalQuestions = questions.length;
    const survivalMessage = `💀 ${score}問を耐えきった...`;

    if (shuraExplanationText) {
        shuraExplanationText.textContent = `修羅の道で散ってしまいました...`;
    }

    if (shuraSurvivedText) {
        shuraSurvivedText.textContent = survivalMessage;
    }

    if (shuraResultTitle) {
        shuraResultTitle.textContent = '修羅の道に散る...';
    }

    showScreen('shuraResult');
}

// クイズリセット
function resetQuiz() {
    currentGenre = null;
    currentQuestionIndex = 0;
    score = 0;
    questions = [];
    isShuraRoute = false;
}

// クリア状況の保存と読み込み
function saveClearedGenres() {
    try {
        localStorage.setItem('clearedGenres', JSON.stringify(clearedGenres));
    } catch (error) {
        console.warn('クリア状況の保存に失敗:', error);
    }
}

function loadClearedGenres() {
    try {
        const storedClearedGenres = localStorage.getItem('clearedGenres');
        if (storedClearedGenres) {
            clearedGenres = JSON.parse(storedClearedGenres);
        } else {
            clearedGenres = {};
        }
    } catch (error) {
        console.warn('クリア状況の読み込みに失敗:', error);
        clearedGenres = {};
    }
}

// 間違えた問題の保存と読み込み
function saveWrongAnswers() {
    try {
        localStorage.setItem(wrongAnswersStorageKey, JSON.stringify(wrongAnswers));
    } catch (error) {
        console.warn('間違えた問題の保存に失敗:', error);
    }
}

function loadWrongAnswers() {
    try {
        const storedWrongAnswers = localStorage.getItem(wrongAnswersStorageKey);
        if (storedWrongAnswers) {
            wrongAnswers = JSON.parse(storedWrongAnswers);
        } else {
            wrongAnswers = {};
        }
    } catch (error) {
        console.warn('間違えた問題の読み込みに失敗:', error);
        wrongAnswers = {};
    }
}

// 間違えた問題を記録
function recordWrongAnswer(question) {
    if (!currentGenre || isShuraRoute || !question) return;

    if (!wrongAnswers[currentGenre]) {
        wrongAnswers[currentGenre] = [];
    }

    // 重複チェック
    const isDuplicate = wrongAnswers[currentGenre].some(q => 
        q.question === question.question && 
        q.correct === question.correct
    );

    if (!isDuplicate) {
        wrongAnswers[currentGenre].push(question);
        saveWrongAnswers();
    }
}

// データリセット機能（デバッグ用）
function resetAllData() {
    if (confirm('全ての進行状況をリセットしますか？この操作は取り消せません。')) {
        clearedGenres = {};
        wrongAnswers = {};
        saveClearedGenres();
        saveWrongAnswers();
        renderGenreButtons();
        alert('全ての進行状況がリセットされました。');
    }
}

// エラーハンドリング
window.addEventListener('error', (e) => {
    console.error('JavaScript エラー:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('未処理のPromise拒否:', e.reason);
    e.preventDefault();
});

// ページの可視性変更時の処理
document.addEventListener('visibilitychange', () => {
    if (document.hidden && bgmAudio) {
        bgmAudio.pause();
    } else if (!document.hidden && bgmEnabled && bgmAudio) {
        bgmAudio.play().catch(error => {
            console.warn('BGM再生エラー:', error);
        });
    }
});

// デバッグ用関数（開発時のみ使用）
if (typeof window !== 'undefined') {
    window.debugQuiz = {
        resetAllData,
        showAllGenres: () => console.log(quizData),
        showClearedGenres: () => console.log(clearedGenres),
        showWrongAnswers: () => console.log(wrongAnswers),
        forceCompleteGenre: (genreId) => {
            clearedGenres[genreId] = true;
            saveClearedGenres();
            renderGenreButtons();
        }
    };
}