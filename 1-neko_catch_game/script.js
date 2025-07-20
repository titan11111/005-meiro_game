class CatCatchGame {
    constructor() {
        // DOM要素の取得
        this.gameArea = document.getElementById('gameArea');
        this.basket = document.getElementById('basket');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.timeElement = document.getElementById('time');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.gameOverDiv = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.restartBtn = document.getElementById('restartBtn');

        // 音声要素の取得
        this.catSounds = [];
        ['catSound1', 'catSound2', 'catSound3', 'catSound4'].forEach(id => {
            const sound = document.getElementById(id);
            if (sound) this.catSounds.push(sound);
        });

        // ゲームの状態変数
        this.score = 0;
        this.lives = 3;
        this.time = 60;
        this.gameRunning = false;
        this.paused = false;
        this.fallingItems = [];
        this.basketPosition = 50;
        this.goldenCatCombo = 0;
        this.speedBoost = false;
        this.speedBoostTime = 0;
        this.itemCreateCount = 0;

        // インターバルID
        this.gameInterval = null;
        this.timeInterval = null;
        this.itemInterval = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
        this.updateBasketPosition();
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => {
            // スマホ用の初回再生許可取得
            if (this.catSounds.length > 0) {
                this.catSounds[0].play().catch(() => {});
            }
            this.startGame();
        });
        
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.restartBtn.addEventListener('click', () => this.resetGame());
        
        // マウス操作
        this.gameArea.addEventListener('mousemove', e => this.moveBasket(e));
        
        // タッチ操作
        this.gameArea.addEventListener('touchmove', e => {
            e.preventDefault();
            this.moveBasket(e.touches[0]);
        }, { passive: false });
        
        this.gameArea.addEventListener('touchstart', e => {
            e.preventDefault();
        }, { passive: false });
    }

    startGame() {
        if (this.gameRunning && !this.paused) return;
        
        this.gameRunning = true;
        this.paused = false;
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'inline-block';
        this.gameOverDiv.style.display = 'none';

        // 既存のインターバルをクリア
        this.clearIntervals();

        // 新しいインターバルを設定
        this.gameInterval = setInterval(() => this.gameLoop(), 50);
        this.timeInterval = setInterval(() => this.updateTime(), 1000);
        this.itemInterval = setInterval(() => this.createFallingItem(), 1200);
    }

    pauseGame() {
        this.paused = true;
        this.pauseBtn.textContent = '再開';
        this.clearIntervals();
    }

    resumeGame() {
        this.paused = false;
        this.pauseBtn.textContent = '一時停止';
        this.gameInterval = setInterval(() => this.gameLoop(), 50);
        this.timeInterval = setInterval(() => this.updateTime(), 1000);
        this.itemInterval = setInterval(() => this.createFallingItem(), 1200);
    }

    togglePause() {
        if (this.paused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    resetGame() {
        this.clearIntervals();
        this.gameRunning = false;
        this.paused = false;
        this.score = 0;
        this.lives = 3;
        this.time = 60;
        this.basketPosition = 50;
        this.goldenCatCombo = 0;
        this.speedBoost = false;
        this.speedBoostTime = 0;
        this.itemCreateCount = 0;
        this.fallingItems = [];

        // 落下アイテムを削除
        const items = this.gameArea.querySelectorAll('.falling-item');
        items.forEach(item => item.remove());

        // エフェクトを削除
        const effects = this.gameArea.querySelectorAll('.effect');
        effects.forEach(effect => effect.remove());

        // UI更新
        this.updateDisplay();
        this.updateBasketPosition();
        this.startBtn.style.display = 'inline-block';
        this.pauseBtn.style.display = 'none';
        this.pauseBtn.textContent = '一時停止';
        this.gameOverDiv.style.display = 'none';
        
        // スピードブースト表示をリセット
        document.body.classList.remove('speed-boost');
    }

    clearIntervals() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
        }
        if (this.itemInterval) {
            clearInterval(this.itemInterval);
            this.itemInterval = null;
        }
    }

    createFallingItem() {
        if (!this.gameRunning || this.paused) return;
        
        this.itemCreateCount++;
        let type = 'cat';
        
        // アイテムタイプの決定
        if (this.itemCreateCount % 15 === 0) {
            type = 'golden_cat';
        } else if (this.itemCreateCount % 8 === 0) {
            type = 'speed';
        } else if (this.itemCreateCount % 6 === 0) {
            type = 'bomb';
        }

        const item = {
            type: type,
            x: Math.random() * 90 + 5,
            y: -10,
            speed: this.getItemSpeed(type),
            element: this.createElement(type)
        };

        item.element.style.left = `${item.x}%`;
        item.element.style.top = `${item.y}%`;
        this.gameArea.appendChild(item.element);
        this.fallingItems.push(item);
    }

    getItemSpeed(type) {
        const baseSpeed = this.speedBoost ? 1.5 : 1;
        const speeds = {
            'cat': 2 * baseSpeed,
            'golden_cat': 1.5 * baseSpeed,
            'bomb': 2.5 * baseSpeed,
            'speed': 1.8 * baseSpeed
        };
        return speeds[type] || 2 * baseSpeed;
    }

    createElement(type) {
        const element = document.createElement('div');
        element.className = `falling-item ${type}`;
        
        const fallbackEmojis = {
            'cat': '🐱',
            'golden_cat': '🏆',
            'bomb': '💣',
            'speed': '⚡'
        };

        const img = document.createElement('img');
        const imagePaths = {
            'cat': './kina.png',
            'golden_cat': './kinkinimage.png',
            'bomb': './bimage.png',
            'speed': './speedimage.png'
        };

        img.src = imagePaths[type];
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';

        // 画像読み込みエラー時の対処
        img.onerror = () => {
            img.style.display = 'none';
            element.innerHTML = `<span style="font-size: 40px;">${fallbackEmojis[type]}</span>`;
        };

        // 金の猫の特殊効果
        if (type === 'golden_cat') {
            element.style.filter = 'drop-shadow(0 0 10px gold)';
            element.style.animation = 'goldGlow 1s infinite alternate';
        }

        element.appendChild(img);
        return element;
    }

    gameLoop() {
        if (!this.gameRunning || this.paused) return;

        // スピードブースト時間管理
        if (this.speedBoost) {
            this.speedBoostTime--;
            if (this.speedBoostTime <= 0) {
                this.speedBoost = false;
                document.body.classList.remove('speed-boost');
            }
        }

        // 落下アイテムの更新
        for (let i = this.fallingItems.length - 1; i >= 0; i--) {
            const item = this.fallingItems[i];
            item.y += item.speed;
            item.element.style.top = `${item.y}%`;

            // 衝突判定
            if (this.checkCollision(item)) {
                this.handleItemCatch(item);
                this.removeItem(i);
            }
            // 画面外に出た場合
            else if (item.y > 100) {
                if (item.type === 'cat' || item.type === 'golden_cat') {
                    this.lives--;
                    this.updateDisplay();
                    this.showEffect('💔', item.x, 90);
                    
                    if (this.lives <= 0) {
                        this.endGame();
                    }
                }
                this.removeItem(i);
            }
        }
    }

    checkCollision(item) {
        const basketRect = this.basket.getBoundingClientRect();
        const itemRect = item.element.getBoundingClientRect();
        const gameAreaRect = this.gameArea.getBoundingClientRect();

        // 相対座標に変換
        const basketX = (basketRect.left + basketRect.width / 2 - gameAreaRect.left) / gameAreaRect.width * 100;
        const basketY = (basketRect.top - gameAreaRect.top) / gameAreaRect.height * 100;
        const basketWidth = basketRect.width / gameAreaRect.width * 100;
        const basketHeight = basketRect.height / gameAreaRect.height * 100;

        const itemWidth = itemRect.width / gameAreaRect.width * 100;
        const itemHeight = itemRect.height / gameAreaRect.height * 100;

        // 衝突判定
        return (
            item.x < basketX + basketWidth / 2 &&
            item.x + itemWidth > basketX - basketWidth / 2 &&
            item.y < basketY + basketHeight &&
            item.y + itemHeight > basketY
        );
    }

    handleItemCatch(item) {
        switch (item.type) {
            case 'cat':
                this.score += 10;
                this.goldenCatCombo = 0;
                this.showEffect('+10', item.x, item.y);
                this.playRandomCatSound();
                break;
                
            case 'golden_cat':
                this.goldenCatCombo++;
                const points = 50 * this.goldenCatCombo;
                this.score += points;
                this.showEffect(`+${points}`, item.x, item.y);
                this.playRandomCatSound();
                break;
                
            case 'bomb':
                this.lives--;
                this.showEffect('💥', item.x, item.y);
                this.gameArea.classList.add('sound-effect');
                setTimeout(() => this.gameArea.classList.remove('sound-effect'), 300);
                
                if (this.lives <= 0) {
                    this.endGame();
                }
                break;
                
            case 'speed':
                this.speedBoost = true;
                this.speedBoostTime = 100; // 5秒間（50ms * 100）
                document.body.classList.add('speed-boost');
                this.showEffect('⚡', item.x, item.y);
                break;
        }
        this.updateDisplay();
    }

    removeItem(index) {
        const item = this.fallingItems[index];
        if (item && item.element && item.element.parentNode) {
            item.element.remove();
        }
        this.fallingItems.splice(index, 1);
    }

    showEffect(text, x, y) {
        const effect = document.createElement('div');
        effect.className = 'effect';
        effect.textContent = text;
        effect.style.left = `${x}%`;
        effect.style.top = `${y}%`;
        this.gameArea.appendChild(effect);

        setTimeout(() => {
            if (effect.parentNode) {
                effect.remove();
            }
        }, 1000);
    }

    moveBasket(event) {
        if (!this.gameRunning) return;

        const gameAreaRect = this.gameArea.getBoundingClientRect();
        const x = event.clientX - gameAreaRect.left;
        const percentage = (x / gameAreaRect.width) * 100;
        
        this.basketPosition = Math.max(5, Math.min(95, percentage));
        this.updateBasketPosition();
    }

    updateBasketPosition() {
        this.basket.style.left = `${this.basketPosition}%`;
    }

    updateTime() {
        if (!this.gameRunning || this.paused) return;
        
        this.time--;
        this.updateDisplay();
        
        if (this.time <= 0) {
            this.endGame();
        }
    }

    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = this.lives;
        this.timeElement.textContent = this.time;
    }

    endGame() {
        this.gameRunning = false;
        this.clearIntervals();
        
        this.finalScoreElement.textContent = this.score;
        this.gameOverDiv.style.display = 'block';
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'none';
        
        // スピードブースト表示をリセット
        document.body.classList.remove('speed-boost');
    }

    playRandomCatSound() {
        if (this.catSounds.length > 0) {
            const sound = this.catSounds[Math.floor(Math.random() * this.catSounds.length)];
            sound.currentTime = 0;
            sound.play().catch(e => console.warn("音声再生エラー:", e));
        }
    }
}

// ゲーム起動
document.addEventListener('DOMContentLoaded', () => {
    new CatCatchGame();
});