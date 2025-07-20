// DOM要素の取得
const questionEl = document.getElementById('question');
const choicesEl = document.getElementById('choices');
const resultEl = document.getElementById('result');
const restartBtn = document.getElementById('restart-btn');
const nextBtn = document.getElementById('next-btn');

// 新しいUI要素
const levelNumberEl = document.getElementById('level-number');
const expFillEl = document.getElementById('exp-fill');
const expTextEl = document.getElementById('exp-text');
const streakEl = document.getElementById('streak');
const totalScoreEl = document.getElementById('total-score');
const progressFillEl = document.getElementById('progress-fill');
const questionCounterEl = document.getElementById('question-counter');
const achievementEl = document.getElementById('achievement');
const achievementTitleEl = document.getElementById('achievement-title');
const achievementDescEl = document.getElementById('achievement-desc');
const levelupEl = document.getElementById('levelup');
const levelupLevelEl = document.getElementById('levelup-level');

// ゲーム設定
const QUESTIONS_PER_GAME = 10;
let currentQuestion = 0;
let score = 0;
let correctStreak = 0;
let gameQuestions = [];
let allQuizData = [];

// 学習意欲を高める仕掛けの変数
let level = 1;
let experience = 0;
let totalScore = 0;
let totalExperience = 0;
let achievements = new Set();
let maxStreak = 0;

// 経験値計算
const EXP_PER_CORRECT = 10;
const EXP_PER_STREAK = 5;
const EXP_PER_LEVEL = 100;

// アチーブメント定義
const ACHIEVEMENTS = {
  firstCorrect: { title: "初回正解", desc: "最初の問題に正解しました！", icon: "🎯" },
  streak3: { title: "連続正解3回", desc: "3回連続で正解しました！", icon: "🔥" },
  streak5: { title: "連続正解5回", desc: "5回連続で正解しました！", icon: "⚡" },
  streak10: { title: "連続正解10回", desc: "10回連続で正解しました！", icon: "🚀" },
  perfectGame: { title: "パーフェクト", desc: "全問正解でクリアしました！", icon: "👑" },
  levelUp: { title: "レベルアップ", desc: "レベルが上がりました！", icon: "⭐" },
  score100: { title: "スコア100", desc: "累計スコアが100に達しました！", icon: "💎" },
  score500: { title: "スコア500", desc: "累計スコアが500に達しました！", icon: "🏆" }
};

// 音声読み上げ関数（改良版）
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.volume = 1.0;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  voices.forEach(voice => {
    if (voice.lang.includes('en-') && !utterance.voice) {
      utterance.voice = voice;
    }
    if (voice.lang === 'en-US') {
      utterance.voice = voice;
    }
  });

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

// 経験値とレベル管理
function addExperience(exp) {
  experience += exp;
  totalExperience += exp;
  
  // レベルアップチェック
  while (experience >= EXP_PER_LEVEL) {
    experience -= EXP_PER_LEVEL;
    levelUp();
  }
  
  updateUI();
}

function levelUp() {
  level++;
  showLevelUpNotification();
  checkAchievement('levelUp');
  
  // レベルアップ効果音
  // const levelupSound = document.getElementById('levelup-sound');
  // if (levelupSound) levelupSound.play();
}

// UI更新
function updateUI() {
  levelNumberEl.textContent = level;
  expFillEl.style.width = `${(experience / EXP_PER_LEVEL) * 100}%`;
  expTextEl.textContent = `${experience} / ${EXP_PER_LEVEL} XP`;
  streakEl.textContent = correctStreak;
  totalScoreEl.textContent = totalScore;
  progressFillEl.style.width = `${((currentQuestion + 1) / QUESTIONS_PER_GAME) * 100}%`;
  questionCounterEl.textContent = `${currentQuestion + 1} / ${QUESTIONS_PER_GAME}`;
}

// アチーブメントチェック
function checkAchievement(achievementKey) {
  if (achievements.has(achievementKey)) return;
  
  const achievement = ACHIEVEMENTS[achievementKey];
  if (!achievement) return;
  
  achievements.add(achievementKey);
  showAchievementNotification(achievement.title, achievement.desc);
  
  // アチーブメント効果音
  // const achievementSound = document.getElementById('achievement-sound');
  // if (achievementSound) achievementSound.play();
}

// 通知表示
function showAchievementNotification(title, desc) {
  achievementTitleEl.textContent = title;
  achievementDescEl.textContent = desc;
  achievementEl.style.display = 'block';
  
  setTimeout(() => {
    achievementEl.style.display = 'none';
  }, 3000);
}

function showLevelUpNotification() {
  levelupLevelEl.textContent = `Level ${level}`;
  levelupEl.style.display = 'block';
  
  setTimeout(() => {
    levelupEl.style.display = 'none';
  }, 3000);
}

// クイズ出題
function showQuestion() {
  const current = gameQuestions[currentQuestion];
  questionEl.innerHTML = `
    <p><strong>${current.jp}</strong></p>
    <p>${current.sentence}</p>
  `;

  const shuffledChoices = [...current.choices].sort(() => Math.random() - 0.5);
  choicesEl.innerHTML = '';
  resultEl.innerHTML = '';
  nextBtn.style.display = 'none';

  shuffledChoices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerText = choice;
    btn.onclick = () => selectAnswer(choice);
    choicesEl.appendChild(btn);
  });
  
  updateUI();
}

// 解答処理
function selectAnswer(selected) {
  const current = gameQuestions[currentQuestion];
  const correct = current.answer;
  const sentenceWithWord = current.sentence.replace("(   )", correct);

  document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.innerText === selected) {
      btn.classList.add(selected === correct ? 'correct' : 'incorrect');
    }
  });

  let expGained = 0;
  let streakBonus = 0;

  if (selected === correct) {
    score++;
    correctStreak++;
    totalScore += 10;
    
    // 経験値計算
    expGained = EXP_PER_CORRECT;
    if (correctStreak >= 3) {
      streakBonus = Math.min(correctStreak - 2, 5) * EXP_PER_STREAK;
      expGained += streakBonus;
    }
    
    // 初回正解アチーブメント
    if (score === 1) {
      checkAchievement('firstCorrect');
    }
    
    // ストリークアチーブメント
    if (correctStreak === 3) checkAchievement('streak3');
    if (correctStreak === 5) checkAchievement('streak5');
    if (correctStreak === 10) checkAchievement('streak10');
    
    resultEl.innerHTML = `
      <div class="explain-block correct">
        <div class="title">✅ <strong>正解！</strong></div>
        <div class="line"><strong>● 単語：</strong> ${correct}</div>
        <div class="line"><strong>● 意味：</strong> ${current.meaning}</div>
        <div class="line"><strong>● 類義語：</strong> ${current.synonym}</div>
        <div class="line"><strong>● 反対語：</strong> ${current.antonym}</div>
        <div class="line"><strong>● 獲得経験値：</strong> ${expGained} XP ${streakBonus > 0 ? `(+${streakBonus} ストリークボーナス)` : ''}</div>
      </div>
    `;
    // document.getElementById("seikai-sound").play();
  } else {
    correctStreak = 0;
    resultEl.innerHTML = `
      <div class="explain-block incorrect">
        <div class="title">❌ <strong>不正解…</strong></div>
        <div class="line"><strong>● 正解：</strong> ${correct}</div>
        <div class="line"><strong>● 意味：</strong> ${current.meaning}</div>
        <div class="line"><strong>● 類義語：</strong> ${current.synonym}</div>
        <div class="line"><strong>● 反対語：</strong> ${current.antonym}</div>
      </div>
    `;
    // document.getElementById("fuseikai-sound").play();
  }

  // 経験値追加
  addExperience(expGained);
  
  // スコアアチーブメント
  if (totalScore >= 100) checkAchievement('score100');
  if (totalScore >= 500) checkAchievement('score500');

  speak(correct);
  setTimeout(() => speak(sentenceWithWord), 1000);
  nextBtn.style.display = 'block';
}

nextBtn.onclick = () => {
  window.speechSynthesis.cancel();
  currentQuestion++;
  if (currentQuestion >= QUESTIONS_PER_GAME) {
    showResult();
  } else {
    showQuestion();
  }
};

function showResult() {
  const ratio = score / QUESTIONS_PER_GAME;
  let name = "あなた";
  let quote = "";
  let expBonus = 0;

  // パーフェクトボーナス
  if (ratio === 1) {
    expBonus = 50;
    checkAchievement('perfectGame');
    name = "Steve Jobs";
    quote = "Stay hungry. Stay foolish.";
  } else if (ratio >= 0.9) {
    expBonus = 30;
    name = "Martin Luther King Jr.";
    quote = "I have a dream.";
  } else if (ratio >= 0.8) {
    expBonus = 20;
    name = "Marie Curie";
    quote = "Be less curious about people and more curious about ideas.";
  } else if (ratio >= 0.7) {
    expBonus = 15;
    name = "Mark Twain";
    quote = "The secret of getting ahead is getting started.";
  } else if (ratio >= 0.6) {
    expBonus = 10;
    name = "J.K. Rowling";
    quote = "It is our choices that show who we truly are.";
  } else if (ratio >= 0.5) {
    expBonus = 5;
    name = "Helen Keller";
    quote = "Keep your face to the sunshine and you cannot see a shadow.";
  } else if (ratio >= 0.4) {
    name = "Thomas Edison";
    quote = "I have not failed. I've just found 10,000 ways that won't work.";
  } else if (ratio >= 0.3) {
    name = "Walt Disney";
    quote = "All our dreams can come true, if we have the courage to pursue them.";
  } else if (ratio >= 0.2) {
    name = "Abraham Lincoln";
    quote = "The best way to predict your future is to create it.";
  } else {
    name = "Albert Einstein";
    quote = "A person who never made a mistake never tried anything new.";
  }

  // 結果ボーナス経験値
  if (expBonus > 0) {
    addExperience(expBonus);
  }

  questionEl.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 2rem; margin-bottom: 1rem;">🎉</div>
      <div style="font-size: 1.5rem; margin-bottom: 1rem;"><strong>結果発表！</strong></div>
      <div style="font-size: 1.2rem; margin-bottom: 1rem;">スコア：${score} / ${QUESTIONS_PER_GAME}</div>
      <div style="font-size: 1.1rem; margin-bottom: 1rem;">君は <strong>${name}</strong> だ！</div>
      <div style="font-style: italic; color: #00ff88; margin-bottom: 1rem;">"${quote}"</div>
      ${expBonus > 0 ? `<div style="color: #00d4ff; font-size: 1rem;">+${expBonus} XP ボーナス獲得！</div>` : ''}
    </div>
  `;
  choicesEl.innerHTML = '';
  resultEl.innerHTML = '';
  restartBtn.style.display = 'block';
  nextBtn.style.display = 'none';
  // document.getElementById("bgm").pause();
}

restartBtn.onclick = () => {
  restartGame();
};

function restartGame() {
  currentQuestion = 0;
  score = 0;
  correctStreak = 0;
  gameQuestions = allQuizData.sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_GAME);
  showQuestion();
  resultEl.innerHTML = '';
  restartBtn.style.display = 'none';
  nextBtn.style.display = 'none';
  // document.getElementById("bgm").play();
}

// 初期化
window.onload = () => {
  // document.getElementById("bgm").volume = 0.1;

  // 読み上げ対応（onvoiceschanged対策）
  window.speechSynthesis.onvoiceschanged = () => speak("");

  fetch("questions.fixed.json")
    .then(res => res.json())
    .then(data => {
      allQuizData = data;
      restartGame();
    })
    .catch(err => {
      questionEl.innerHTML = "クイズデータの読み込みに失敗しました。";
      console.error(err);
    });

  // document.body.addEventListener("click", function startAudioOnce() {
  //   document.getElementById("bgm").play();
  //   document.body.removeEventListener("click", startAudioOnce);
  // });
};