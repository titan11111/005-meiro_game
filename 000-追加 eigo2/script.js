class MatrixEffect {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // 【修正】計算に使う変数を先に定義します
        this.fontSize = 14;
        this.chars = "010101ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソ";
        
        // 変数定義後にリサイズを実行（これでエラーが出なくなります）
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.drops = [];
        this.initDrops();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initDrops();
    }

    initDrops() {
        // this.fontSizeが定義済みなので、ここで正常な数値が入ります
        const columns = this.canvas.width / this.fontSize;
        // 万が一計算がおかしくなってもエラーにならないよう安全策を追加
        const safeColumns = Math.max(1, Math.floor(columns) || 1);
        this.drops = Array(safeColumns).fill(1);
    }

    draw() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#0F0';
        this.ctx.font = `${this.fontSize}px monospace`;

        for (let i = 0; i < this.drops.length; i++) {
            const text = this.chars[Math.floor(Math.random() * this.chars.length)];
            this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);

            if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }
    }

    start() {
        setInterval(() => this.draw(), 33);
    }
}

class CyberGame {
    constructor() {
        try {
            this.matrix = new MatrixEffect('matrixCanvas');
            this.matrix.start();
        } catch (e) {
            console.error("Matrix Effect Error:", e);
        }

        this.state = {
            score: 0,
            level: 1,
            lives: 100,
            combo: 0,
            maxCombo: 0,
            isPlaying: false,
            timer: 30,
            skills: {
                s5050: true,
                freeze: true
            }
        };

        this.missions = [
            { q: "I have ____ this movie before.", opts: ["see", "saw", "seen", "seeing"], a: 2, exp: "現在完了形(have + 過去分詞)" },
            { q: "If I ____ a bird, I could fly.", opts: ["am", "was", "were", "be"], a: 2, exp: "仮定法過去(I were)" },
            { q: "She represents the ____ of the company.", opts: ["image", "imagine", "imagination", "images"], a: 0, exp: "文脈判断: 会社のイメージ" },
            { q: "The password was ____ hidden.", opts: ["careful", "carefully", "care", "caring"], a: 1, exp: "副詞(carefully)が動詞を修飾" },
            { q: "SYSTEM: 'ACCESS DENIED'. Meaning?", opts: ["許可", "拒否", "完了", "保留"], a: 1, exp: "Deny = 拒否する" },
            { q: "Complete: 'Looking forward ____ you.'", opts: ["to see", "seeing", "to seeing", "see"], a: 2, exp: "look forward to + -ing" }
        ];

        this.currentQuestion = null;
        this.timerInterval = null;
        this.typeInterval = null;
        
        this.elements = {
            screens: {
                menu: document.getElementById('menuScreen'),
                game: document.getElementById('gameScreen'),
                result: document.getElementById('resultScreen')
            },
            displays: {
                score: document.getElementById('playerScore'),
                timer: document.getElementById('timer'),
                hpFill: document.getElementById('hpBarFill'),
                combo: document.getElementById('comboCount'),
                comboCtn: document.getElementById('comboDisplay'),
                question: document.getElementById('questionText'),
                explanation: document.getElementById('explanation')
            },
            buttons: {
                answers: document.querySelectorAll('.answer-btn'),
                next: document.getElementById('nextButton'),
                skill5050: document.getElementById('skill5050'),
                skillFreeze: document.getElementById('skillFreeze')
            }
        };

        this.init();
        // 初期画面設定
        this.switchScreen('menu');
    }

    init() {
        const startBtn = document.getElementById('startButton');
        if(startBtn) startBtn.addEventListener('click', () => this.startGame());
        
        const restartBtn = document.getElementById('restartButton');
        if(restartBtn) restartBtn.addEventListener('click', () => this.resetGame());
        
        if(this.elements.buttons.next) {
            this.elements.buttons.next.addEventListener('click', () => this.nextQuestion());
        }
        
        this.elements.buttons.answers.forEach((btn, idx) => {
            btn.addEventListener('click', () => this.handleAnswer(idx));
        });

        if(this.elements.buttons.skill5050) {
            this.elements.buttons.skill5050.addEventListener('click', () => this.useSkill('s5050'));
        }
        if(this.elements.buttons.skillFreeze) {
            this.elements.buttons.skillFreeze.addEventListener('click', () => this.useSkill('freeze'));
        }

        document.addEventListener('keydown', (e) => this.handleInput(e));
    }

    handleInput(e) {
        if (!this.state.isPlaying) return;
        
        const key = e.key.toLowerCase();
        
        if (key === '1' || key === '!') {
            this.useSkill('s5050');
            return;
        }
        if (key === '2' || key === '"' || key === '@') { 
            this.useSkill('freeze');
            return;
        }
        
        if (key === 'a') this.handleAnswer(0);
        if (key === 'b') this.handleAnswer(1);
        if (key === 'c') this.handleAnswer(2);
        if (key === 'd') this.handleAnswer(3);
    }

    startGame() {
        this.switchScreen('game');
        this.state.isPlaying = true;
        this.state.lives = 100;
        this.state.score = 0;
        this.state.combo = 0;
        this.state.skills = { s5050: true, freeze: true };
        
        this.updateHUD();
        this.enableSkills();
        this.loadNewQuestion();
        this.startTimer();
    }

    loadNewQuestion() {
        const qData = this.missions[Math.floor(Math.random() * this.missions.length)];
        this.currentQuestion = qData;

        this.elements.displays.explanation.style.display = 'none';
        this.elements.buttons.next.style.display = 'none';
        this.elements.buttons.answers.forEach((btn, i) => {
            btn.disabled = false;
            btn.className = 'answer-btn';
            btn.querySelector('.opt-text').textContent = qData.opts[i];
            btn.classList.remove('faded', 'correct', 'incorrect');
        });

        this.typeText(this.elements.displays.question, qData.q);
    }

    typeText(element, text) {
        element.textContent = '';
        let i = 0;
        if (this.typeInterval) clearInterval(this.typeInterval);
        
        this.typeInterval = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            if (i >= text.length) clearInterval(this.typeInterval);
        }, 30);
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.state.timer = 30;
        
        this.timerInterval = setInterval(() => {
            if(this.state.timer > 0) {
                this.state.timer -= 0.1;
                this.elements.displays.timer.textContent = this.state.timer.toFixed(2);
                
                if(this.state.timer < 10) this.elements.displays.timer.classList.add('warning');
                else this.elements.displays.timer.classList.remove('warning');
            } else {
                this.takeDamage(20);
                this.state.timer = 30;
            }
        }, 100);
    }

    handleAnswer(index) {
        if (!this.state.isPlaying || this.elements.buttons.answers[index].disabled) return;

        const isCorrect = index === this.currentQuestion.a;
        const btn = this.elements.buttons.answers[index];

        this.elements.buttons.answers.forEach(b => b.disabled = true);

        if (isCorrect) {
            btn.classList.add('correct');
            this.processWin();
        } else {
            btn.classList.add('incorrect');
            this.processFail(this.currentQuestion.a);
        }

        const expBox = this.elements.displays.explanation;
        expBox.textContent = `ANALYSIS: ${this.currentQuestion.exp}`;
        expBox.style.display = 'block';
        this.elements.buttons.next.style.display = 'block';
    }

    processWin() {
        this.state.combo++;
        if (this.state.combo > this.state.maxCombo) this.state.maxCombo = this.state.combo;
        
        const baseScore = 100;
        const comboBonus = (this.state.combo - 1) * 20;
        this.state.score += baseScore + comboBonus;
        
        this.updateHUD();
        this.playSound('success');
    }

    processFail(correctIndex) {
        this.state.combo = 0;
        this.elements.buttons.answers[correctIndex].classList.add('correct');
        this.takeDamage(34);
        this.updateHUD();
        this.playSound('error');
        
        document.body.style.animation = 'shake 0.5s';
        setTimeout(() => document.body.style.animation = '', 500);
    }

    takeDamage(amount) {
        this.state.lives -= amount;
        if (this.state.lives < 0) this.state.lives = 0;
        this.updateHUD();

        if (this.state.lives <= 0) {
            this.gameOver();
        }
    }

    useSkill(type) {
        if (!this.state.isPlaying) return;
        if (type === 's5050' && !this.state.skills.s5050) return;
        if (type === 'freeze' && !this.state.skills.freeze) return;

        if (type === 's5050') {
            const wrongIndices = [0,1,2,3].filter(i => i !== this.currentQuestion.a);
            const toRemove = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
            
            toRemove.forEach(idx => {
                this.elements.buttons.answers[idx].classList.add('faded');
                this.elements.buttons.answers[idx].disabled = true;
            });
            
            this.state.skills.s5050 = false;
            this.enableSkills();
        } else if (type === 'freeze') {
            clearInterval(this.timerInterval);
            document.body.style.filter = 'hue-rotate(180deg)';
            
            setTimeout(() => {
                if(this.state.isPlaying) {
                    this.startTimer();
                    document.body.style.filter = '';
                }
            }, 5000);

            this.state.skills.freeze = false;
            this.enableSkills();
        }
    }

    nextQuestion() {
        this.loadNewQuestion();
    }

    updateHUD() {
        this.elements.displays.score.textContent = this.state.score;
        this.elements.displays.hpFill.style.width = `${this.state.lives}%`;
        this.elements.displays.hpFill.style.background = this.state.lives > 30 ? '#00ff41' : '#ff0055';
        
        const comboEl = this.elements.displays.comboCtn;
        if (this.state.combo > 1) {
            comboEl.style.opacity = 1;
            this.elements.displays.combo.textContent = this.state.combo;
            comboEl.style.transform = `scale(${1 + this.state.combo * 0.1})`;
        } else {
            comboEl.style.opacity = 0;
        }
    }

    gameOver() {
        this.state.isPlaying = false;
        clearInterval(this.timerInterval);
        this.switchScreen('result');
        
        document.getElementById('finalScore').textContent = this.state.score;
        document.getElementById('finalCombo').textContent = this.state.maxCombo;
        
        let rank = 'F';
        if (this.state.score > 500) rank = 'C';
        if (this.state.score > 1000) rank = 'B';
        if (this.state.score > 2000) rank = 'A';
        if (this.state.score > 3000) rank = 'S';
        
        const rankEl = document.getElementById('finalRank');
        rankEl.textContent = rank;
        rankEl.style.color = rank === 'S' ? '#ffd700' : '#00ff41';
    }

    resetGame() {
        this.switchScreen('menu');
    }

    switchScreen(screenName) {
        Object.values(this.elements.screens).forEach(el => {
            if(el) el.style.display = 'none';
        });
        if (this.elements.screens[screenName]) {
            this.elements.screens[screenName].style.display = 'block';
        }
    }

    enableSkills() {
        this.elements.buttons.skill5050.disabled = !this.state.skills.s5050;
        this.elements.buttons.skillFreeze.disabled = !this.state.skills.freeze;
    }

    playSound(type) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'success') {
                osc.frequency.setValueAtTime(880, ctx.currentTime); 
                osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
                osc.start();
                osc.stop(ctx.currentTime + 0.1);
            } else {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, ctx.currentTime);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            }
        } catch (e) {
            // Audio error ignored
        }
    }
}

window.addEventListener('DOMContentLoaded', () => new CyberGame());