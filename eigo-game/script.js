let allQuestions = [];
let correctlyAnswered = [];
let current = 0;
let score = 0;
let questions = [];
let clearCount = localStorage.getItem('clearCount') ? parseInt(localStorage.getItem('clearCount')) : 0;

const bgm = document.getElementById('bgm');
bgm.volume = 0.2;

const questionNumber = document.getElementById('question-number');
const questionText = document.getElementById('question-text');
const translationText = document.getElementById('translation-text');
const choicesDiv = document.getElementById('choices');
const resultDiv = document.getElementById('result');
const infoDiv = document.getElementById('info');
const retryBtn = document.getElementById('retry-btn');
const finalResultDiv = document.getElementById('final-result');
const container = document.getElementById('container');
const characterImg = document.getElementById('character-img');
const seikaiSound = document.getElementById('seikai-sound');
const fuseikaiSound = document.getElementById('fuseikai-sound');
const extraMusic = document.getElementById('extra-music');

setCharacterImage();

fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        allQuestions = data;
        startGame();
    });

function setCharacterImage() {
    if (clearCount >= 3) {
        characterImg.src = 'image/image3.png';
    } else if (clearCount >= 2) {
        characterImg.src = 'image/image2.png';
    } else {
        characterImg.src = 'image/image1.png';
    }
}

function startGame() {
    let available = allQuestions.filter(q => !correctlyAnswered.includes(q.id));
    if (available.length < 10) available = allQuestions;
    questions = shuffleArray([...available]).slice(0, 10);
    current = 0;
    score = 0;
    finalResultDiv.textContent = "";
    retryBtn.style.display = "none";
    showQuestion();
}

function showQuestion() {
    const q = questions[current];
    questionNumber.textContent = `Q${current + 1}`;
    const blanked = q.sentence.replace(q.answer, "( ___ )");
    questionText.textContent = blanked;
    translationText.textContent = q.translation;
    resultDiv.textContent = "";
    infoDiv.innerHTML = "";
    choicesDiv.innerHTML = "";

    const choices = getUniqueChoices(q.answer, 4);
    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice;
        btn.addEventListener('click', () => checkAnswer(choice, q));
        choicesDiv.appendChild(btn);
    });
}

function checkAnswer(selected, q) {
    resultDiv.textContent = q.answer.toLowerCase();

    if (selected === q.answer) {
        score++;
        seikaiSound.play();
        if (!correctlyAnswered.includes(q.id)) correctlyAnswered.push(q.id);
    } else {
        fuseikaiSound.play();
    }

    Array.from(choicesDiv.children).forEach(btn => btn.disabled = true);

    const fullSentence = q.sentence.replace("( ___ )", q.answer);

    infoDiv.innerHTML = `
        <div><strong>意味:</strong> ${q.meaning_ja}</div>
        <div><strong>類義語:</strong> ${q.synonyms.join(', ')}</div>
        <div><strong>反対語:</strong> ${q.antonyms.join(', ')}</div>
    `;

    speakWord(q.answer, () => {
        setTimeout(() => {
            speakSentence(fullSentence, () => {
                setTimeout(() => {
                    current++;
                    if (current >= questions.length) {
                        showFinalResult();
                    } else {
                        showQuestion();
                    }
                }, 500);
            });
        }, 1000);
    });
}

retryBtn.addEventListener('click', startGame);

function showFinalResult() {
    questionNumber.textContent = "";
    questionText.textContent = "";
    translationText.textContent = "";
    choicesDiv.innerHTML = "";
    resultDiv.textContent = "";
    infoDiv.innerHTML = "";

    if (score === questions.length) {
        clearCount++;
        localStorage.setItem('clearCount', clearCount);
        setCharacterImage();

        const heroMessages = [
            "フリーレン: よくやったわね！",
            "宿儺: 面白い…次も楽しませろ。",
            "五条: やるじゃん！俺の弟子にしてやろうか？",
            "デンケン: 魔法は努力の積み重ねだ。",
            "ぼっち: あ、あの…すごい…！",
            "弟: ジャンクフード食べる？お祝いだよ！",
            "母: 美しい字を書けるように頑張ってね。",
            "父: よく頑張ったな、少し休め。"
        ];

        // ランダムに3つの異なるメッセージを選ぶ
        const shuffledMessages = shuffleArray([...heroMessages]);
        const selectedMessages = shuffledMessages.slice(0, 3);

        finalResultDiv.innerHTML = `<div class="paripi">🎉 PERFECT!!! YOU ARE AMAZING!!! 🎉<br>${selectedMessages.join('<br>')}</div>`;
        extraMusic.play();
    } else {
        finalResultDiv.textContent = `スコア：${score} / ${questions.length}`;
    }
    retryBtn.style.display = "block";
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function getUniqueChoices(correct, count) {
    const allAnswers = [...new Set(allQuestions.map(q => q.answer).filter(a => a !== correct))];
    const choices = shuffleArray(allAnswers).slice(0, count - 1);
    choices.push(correct);
    return shuffleArray(choices);
}

function speakWord(word, callback) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.volume = 1.0;
    utterance.onend = callback;
    speechSynthesis.speak(utterance);
}

function speakSentence(sentence, callback) {
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = 'en-US';
    utterance.volume = 1.0;
    utterance.onend = callback;
    speechSynthesis.speak(utterance);
}
