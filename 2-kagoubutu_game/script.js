const bgm = document.getElementById('bgm');
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');

const titleScreen = document.getElementById('title-screen');
const startBtn = document.getElementById('start-btn');
const quizContainer = document.getElementById('quiz-container');

const questionNumberEl = document.getElementById("question-number"); // 問題番号表示用要素
const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const resultEl = document.getElementById("result");
const restartBtn = document.getElementById("restart-btn");
const lineShareBtn = document.getElementById("line-share");

let isAudioStarted = false;
let currentQuiz = [];
let currentIndex = 0;
let score = 0;
let inExtraQuiz = false;

// quizData と extraQuizData は quizData.js に定義されている前提です。
// もしこのファイル内に記述が必要な場合は、コメントアウトを外し、データ配列をここに移動してください。
/*
const quizData = [
    // ... 既存のquizDataの内容 ...
];

const extraQuizData = [
    // ... 既存のextraQuizDataの内容 ...
];
*/

startBtn.addEventListener("click", () => {
    titleScreen.style.display = "none";
    quizContainer.style.display = "flex"; // flex に変更
    startQuiz();
    if (!isAudioStarted) {
        bgm.volume = 0.3;
        bgm.play();
        isAudioStarted = true;
    }
});

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function startQuiz(extra = false) {
    inExtraQuiz = extra;
    if (extra) {
        currentQuiz = shuffleArray([...extraQuizData]).slice(0, 5); // エクストラは5問
    } else {
        currentQuiz = shuffleArray([...quizData]).slice(0, 10); // 通常は10問
    }
    currentIndex = 0;
    score = 0;
    resultEl.style.display = "none";
    restartBtn.style.display = "none";
    lineShareBtn.style.display = "none";
    nextBtn.style.display = "none";
    feedbackEl.textContent = "";
    document.body.classList.remove('flash-correct', 'flash-wrong'); // フラッシュクラスをリセット
    loadQuestion();
}

function loadQuestion() {
    const quiz = currentQuiz[currentIndex];
    questionNumberEl.textContent = `第 ${currentIndex + 1} 問 / ${currentQuiz.length}`; // 問題番号表示
    questionEl.textContent = `${quiz.question}`; // "問題 X: " を削除
    choicesEl.innerHTML = "";

    const shuffledChoices = shuffleArray([...quiz.choices]);
    shuffledChoices.forEach(choice => {
        const btn = document.createElement("button");
        btn.className = "choice";
        btn.textContent = choice;
        btn.onclick = () => selectAnswer(choice);
        choicesEl.appendChild(btn);
    });
}

function selectAnswer(choice) {
    const quiz = currentQuiz[currentIndex];
    Array.from(document.getElementsByClassName("choice")).forEach(btn => {
        btn.disabled = true; // 全ての選択肢を無効化
        if (btn.textContent === quiz.answer) {
            btn.style.backgroundColor = '#a5d6a7'; // 正解のボタンを緑色に
        } else if (btn.textContent === choice) {
            btn.style.backgroundColor = '#ffcdd2'; // 不正解のボタンを赤色に
        }
    });

    if (choice === quiz.answer) {
        feedbackEl.textContent = `正解！🎉 ${quiz.episode}`;
        score++;
        correctSound.play();
        flashScreen("correct");
    } else {
        feedbackEl.textContent = `残念！正解は「${quiz.answer}」でした！ ${quiz.episode}`; // 不正解時に正解を表示
        wrongSound.play();
        flashScreen("wrong");
    }
    
    if (currentIndex < currentQuiz.length - 1) {
      nextBtn.textContent = "次の問題へ進む！";
      nextBtn.style.display = "inline-block";
  } else {
      nextBtn.textContent = "結果発表！";
      nextBtn.style.display = "inline-block";
  }
}

function flashScreen(type) {
    document.body.classList.remove('flash-correct', 'flash-wrong'); // 前のクラスを削除
    document.body.classList.add(`flash-${type}`); // 新しいクラスを追加
    setTimeout(() => {
        document.body.classList.remove(`flash-${type}`);
    }, 300);
}

nextBtn.addEventListener("click", () => {
    currentIndex++;
    if (currentIndex < currentQuiz.length) {
        feedbackEl.textContent = "";
        nextBtn.style.display = "none";
        loadQuestion();
    } else {
        showResult();
    }
});

function getTitle(score, extra = false) {
    if (extra) {
        if (score === 5) {
            return { title: "【究極の賢者】メンデレーエフ", message: "完璧だ！！元素の周期表を完成させた天才、君は未来の化学界のパイオニアだ！" };
        } else if (score >= 4) {
            return { title: "【真理の探究者】ラボアジエ", message: "質量保存の法則を発見した偉人！君の探究心は本物だ！" };
        } else if (score >= 3) {
            return { title: "【知識の開拓者】ボイル", message: "気体の法則を解き明かした探求者！もう少しでトップレベルだ！" };
        } else {
            return { title: "【覚醒せし】科学者の卵", message: "成長中の若き科学者！挑戦あるのみ！君の化学の旅は始まったばかりだ！" };
        }
    } else {
        if (score === 10) {
            return { title: "【元素の支配者】ニュートン", message: "満点、お見事！君はまさに万有引力を発見した天才、未来の大化学者だ！" };
        } else if (score >= 7) {
            return { title: "【錬金術マスター】ガリレオ", message: "素晴らしい成績だ！君の探求心はガリレオのように尽きない！" };
        } else if (score >= 4) {
            return { title: "【反応の魔術師】パスカル", message: "なかなかやるな！あと一歩で偉大な科学者の仲間入りだ！" };
        } else {
            return { title: "【見習い錬成士】化学者見習い", message: "大丈夫！挑戦することが大切だ！諦めずに化合物の世界を探検しよう！" };
        }
    }
}

function showResult() {
    const result = getTitle(score, inExtraQuiz);
    questionNumberEl.textContent = ""; // 問題番号をクリア
    questionEl.textContent = "";
    choicesEl.innerHTML = "";
    feedbackEl.textContent = "";
    resultEl.style.display = "block";
    resultEl.innerHTML = `キミの正解数は <span style="color:#d32f2f; font-size:1.2em;">${score}</span> / ${currentQuiz.length} 問だ！<br><br>きみは <strong>${result.title}</strong> だ！！<br>${result.message}<br>`;

    const shareUrl = encodeURIComponent('https://yourname.github.io/quiz'); // 実際のURLに変更してください
    const shareText = encodeURIComponent(`化合物クイズ${inExtraQuiz ? 'エクストラ' : ''}で${score}/${currentQuiz.length}正解！きみは${result.title}だ！！挑戦してみよう！`);
    lineShareBtn.href = `https://social-plugins.line.me/lineit/share?url=${shareUrl}&text=${shareText}`;
    lineShareBtn.style.display = "inline-block";

    if (!inExtraQuiz && score === 10) {
        restartBtn.textContent = "エクストラクイズへ挑戦！";
        restartBtn.onclick = () => startQuiz(true);
    } else {
        restartBtn.textContent = "もう一度、化合物の世界へ！";
        restartBtn.onclick = () => startQuiz();
    }
    restartBtn.style.display = "inline-block";
}

// quizData.js は別途用意されているものとして、このファイルには記述していません。
// もし、quizData.js の内容も含める必要がある場合は、その旨をお知らせください。