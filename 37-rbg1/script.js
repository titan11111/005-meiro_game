const CELL_SIZE = 40;
const mapWidth = 30;
const mapHeight = 10;

// ゲームの状態管理
let gameState = {
    currentScreen: 'title',
    player: {
        name: 'カケル',
        gender: 'boy',
        x: 2 * CELL_SIZE,
        y: 4 * CELL_SIZE,
        hp: 90,
        maxHp: 90,
        mp: 24,
        maxMp: 24,
        level: 1,
        exp: 0,
        gold: 30,
        direction: 'down'
    },
    questStage: 0, // 0:未報告,1:カギ探し,2:カギ入手,3:魔王討伐
    inventory: {
        keyOfLight: false
    },
    guardActive: false,
    nextSpellIndex: 0,
    messages: [],
    currentMessageIndex: 0,
    inBattle: false,
    currentEnemy: null,
    gameVolume: 0.5,
    currentBgm: null
};

// 敵データ（画像付き）
const enemies = {
    slime: {
        name: 'スライム',
        image: 'images/suraimu.png',
        hp: 26,
        maxHp: 26,
        attack: 7,
        exp: 12
    },
    goblin: {
        name: 'ゴブリン',
        image: 'images/goburin.png',
        hp: 38,
        maxHp: 38,
        attack: 11,
        exp: 22
    },
    demon: {
        name: 'まおう',
        image: 'images/maou.png',
        hp: 160,
        maxHp: 160,
        attack: 23,
        exp: 120
    }
};

// じゅもん
const spells = [
    { key: 'hoimi', name: 'ホイミ', cost: 4, type: 'heal', power: 28 },
    { key: 'gira', name: 'ギラ', cost: 6, type: 'attack', power: 26 }
];

// フィールドイベント
const fieldEvents = [
    { x: 2 * CELL_SIZE, y: 3 * CELL_SIZE, type: 'castle', message: 'ラダトームもどきの城。王さまに会おう。' },
    { x: 3 * CELL_SIZE, y: 3 * CELL_SIZE, type: 'king', message: '「勇者よ！森のほこらに眠る光のカギを見つけ、魔王を討て！」' },
    { x: 9 * CELL_SIZE, y: 6 * CELL_SIZE, type: 'village', message: 'ルーラ村。宿屋でHP/MPが全回復した。' },
    { x: 14 * CELL_SIZE, y: 5 * CELL_SIZE, type: 'forest', message: '深い森だ……魔物の気配がする。', enemy: 'goblin' },
    { x: 18 * CELL_SIZE, y: 4 * CELL_SIZE, type: 'shrine', message: '古びたほこら。宝箱に光が宿っている。' },
    { x: 22 * CELL_SIZE, y: 2 * CELL_SIZE, type: 'bridge', message: '朽ちた橋。向こうに魔王城が見える。' },
    { x: 24 * CELL_SIZE, y: 2 * CELL_SIZE, type: 'demon_castle', message: '魔王城の門。光のカギが必要だ。' },
    { x: 6 * CELL_SIZE, y: 7 * CELL_SIZE, type: 'camp', message: '焚き火でひと休み。少しHPとMPが回復した。' }
];

// BGM管理
const bgmManager = {
    fieldBgm: null,
    battleBgm: null,
    currentBgm: null,
    
    init() {
        this.fieldBgm = document.getElementById('fieldBgm');
        this.battleBgm = document.getElementById('battleBgm');
        this.fieldBgm.volume = gameState.gameVolume;
        this.battleBgm.volume = gameState.gameVolume;
        this.fieldBgm.onerror = () => console.log('フィールドBGMが読み込めませんでした');
        this.battleBgm.onerror = () => console.log('戦闘BGMが読み込めませんでした');
    },
    
    playField() {
        this.stopAll();
        this.fieldBgm.currentTime = 0;
        this.fieldBgm.play().catch(e => console.log('フィールドBGM再生エラー:', e));
        this.currentBgm = 'field';
    },
    
    playBattle() {
        this.stopAll();
        this.battleBgm.currentTime = 0;
        this.battleBgm.play().catch(e => console.log('戦闘BGM再生エラー:', e));
        this.currentBgm = 'battle';
    },
    
    stopAll() {
        try {
            this.fieldBgm.pause();
            this.battleBgm.pause();
        } catch (e) {
            console.log('BGM停止エラー:', e);
        }
    },
    
    setVolume(volume) {
        gameState.gameVolume = volume / 100;
        this.fieldBgm.volume = gameState.gameVolume;
        this.battleBgm.volume = gameState.gameVolume;
    }
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    setupKeyboardControls();
    bgmManager.init();
    setupHelpButton();
});

function initGame() {
    showScreen('titleScreen');
    updatePlayerDisplay();
    createFieldEvents();
    updatePlayerDirection();
}

// 画面切り替え
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
    gameState.currentScreen = screenId;
    
    if (screenId === 'gameScreen' && !gameState.inBattle) {
        bgmManager.playField();
    } else if (screenId === 'titleScreen') {
        bgmManager.stopAll();
    }
}

// ゲーム開始
function startGame() {
    showScreen('gameScreen');
    renderPlayer();
    bgmManager.playField();
    const intro = [
        'あるひ、あなたは王さまに呼ばれた。',
        '「森のほこらに眠る光のカギを見つけ、魔王をたおしてくれ！」',
        '王都の外には森、村、ほこら、魔王城がある。',
        'さあ、ぼうけんのはじまりだ！'
    ];
    showMessage(intro);
}

// 設定画面
function showSettings() {
    showScreen('settingsScreen');
    document.getElementById('nameInput').value = gameState.player.name;
    document.getElementById('genderSelect').value = gameState.player.gender;
    document.getElementById('volumeSlider').value = gameState.gameVolume * 100;
    document.getElementById('volumeValue').textContent = Math.round(gameState.gameVolume * 100) + '%';
}

function saveSettings() {
    gameState.player.name = document.getElementById('nameInput').value || 'カケル';
    gameState.player.gender = document.getElementById('genderSelect').value;
    
    const volume = document.getElementById('volumeSlider').value;
    bgmManager.setVolume(volume);
    
    updatePlayerDisplay();
    updatePlayerGender();
    backToTitle();
}

function backToTitle() {
    showScreen('titleScreen');
}

// 音量スライダー
document.addEventListener('DOMContentLoaded', function() {
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    
    volumeSlider.addEventListener('input', function() {
        const volume = this.value;
        volumeValue.textContent = volume + '%';
        bgmManager.setVolume(volume);
    });
});

// プレイヤー表示更新
function updatePlayerDisplay() {
    document.getElementById('playerName').textContent = gameState.player.name;
    document.getElementById('playerHP').textContent = gameState.player.hp;
    document.getElementById('playerMaxHP').textContent = gameState.player.maxHp;
    document.getElementById('playerMP').textContent = gameState.player.mp;
    document.getElementById('playerMaxMP').textContent = gameState.player.maxMp;
    document.getElementById('playerLevel').textContent = gameState.player.level;
}

// プレイヤーの性別更新
function updatePlayerGender() {
    const playerSvg = document.getElementById('playerSvg');
    if (gameState.player.gender === 'girl') {
        playerSvg.querySelector('path').setAttribute('d', 'M8 12 Q20 3 32 12 Q28 6 20 6 Q12 6 8 12 Q10 15 20 16 Q30 15 32 12');
        playerSvg.querySelector('path').setAttribute('fill', '#4a2c2a');
    } else {
        playerSvg.querySelector('path').setAttribute('d', 'M10 12 Q20 5 30 12 Q25 8 20 8 Q15 8 10 12');
        playerSvg.querySelector('path').setAttribute('fill', '#8b4513');
    }
}

// プレイヤーを表示
function renderPlayer() {
    let player = document.getElementById('player');
    if (!player) {
        player = document.createElement('div');
        player.id = 'player';
        player.className = 'character';
        player.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 40 40" id="playerSvg">
                <ellipse cx="20" cy="30" rx="8" ry="10" fill="#4a90e2" stroke="#2c3e50" stroke-width="1"/>
                <circle cx="20" cy="15" r="10" fill="#fdbcb4" stroke="#2c3e50" stroke-width="1"/>
                <path d="M10 12 Q20 5 30 12 Q25 8 20 8 Q15 8 10 12" fill="#8b4513"/>
                <circle cx="16" cy="13" r="2" fill="white"/>
                <circle cx="24" cy="13" r="2" fill="white"/>
                <circle cx="16" cy="13" r="1" fill="black"/>
                <circle cx="24" cy="13" r="1" fill="black"/>
                <path d="M18 18 Q20 20 22 18" stroke="#2c3e50" stroke-width="1" fill="none"/>
                <ellipse cx="12" cy="25" rx="3" ry="8" fill="#fdbcb4" stroke="#2c3e50" stroke-width="1"/>
                <ellipse cx="28" cy="25" rx="3" ry="8" fill="#fdbcb4" stroke="#2c3e50" stroke-width="1"/>
                <ellipse cx="16" cy="38" rx="3" ry="4" fill="#654321" stroke="#2c3e50" stroke-width="1"/>
                <ellipse cx="24" cy="38" rx="3" ry="4" fill="#654321" stroke="#2c3e50" stroke-width="1"/>
            </svg>`;
        document.getElementById('gameArea').appendChild(player);
    }
    player.style.left = gameState.player.x + 'px';
    player.style.top = gameState.player.y + 'px';
    updatePlayerGender();
}

// プレイヤーの向き更新
function updatePlayerDirection() {
    const player = document.getElementById('player');
    player.className = 'character';
    
    switch(gameState.player.direction) {
        case 'up':
            player.classList.add('face-up');
            break;
        case 'down':
            player.classList.add('face-down');
            break;
        case 'left':
            player.classList.add('face-left');
            break;
        case 'right':
            player.classList.add('face-right');
            break;
    }
}

// フィールドイベント作成
function createFieldEvents() {
    const field = document.getElementById('field');
    
    fieldEvents.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'field-event';
        eventElement.style.left = event.x + 'px';
        eventElement.style.top = event.y + 'px';
        
        switch(event.type) {
            case 'castle':
                eventElement.textContent = '🏰';
                break;
            case 'king':
                eventElement.textContent = '👑';
                break;
            case 'village':
                eventElement.textContent = '🏘️';
                break;
            case 'forest':
                eventElement.textContent = '🌲';
                break;
            case 'shrine':
                eventElement.textContent = '⛩️';
                break;
            case 'bridge':
                eventElement.textContent = '🌉';
                break;
            case 'demon_castle':
                eventElement.textContent = '🛡️';
                break;
            case 'camp':
                eventElement.textContent = '🔥';
                break;
        }
        
        eventElement.onclick = () => triggerEvent(event);
        field.appendChild(eventElement);
    });
}

// キーボード操作
function setupKeyboardControls() {
    document.addEventListener('keydown', function(e) {
        if (gameState.currentScreen !== 'gameScreen') return;
        if (gameState.inBattle) return;
        if (!document.getElementById('messageBox').classList.contains('hidden')) return;
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                movePlayer('up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                movePlayer('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                movePlayer('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                movePlayer('right');
                break;
            case ' ':
            case 'Enter':
                e.preventDefault();
                checkEvent();
                break;
        }
    });
}

// プレイヤー移動
function movePlayer(direction) {
    const player = document.getElementById('player');
    const gameArea = document.getElementById('gameArea');
    const stepSize = 40;
    
    let newX = gameState.player.x;
    let newY = gameState.player.y;
    
    gameState.player.direction = direction;
    
    switch(direction) {
        case 'up':
            newY = Math.max(0, newY - stepSize);
            break;
        case 'down':
            newY = Math.min(gameArea.clientHeight - 40, newY + stepSize);
            break;
        case 'left':
            newX = Math.max(0, newX - stepSize);
            break;
        case 'right':
            newX = Math.min(gameArea.clientWidth - 40, newX + stepSize);
            break;
    }
    
    // 川判定（中央ラインを川とみなす）
    if (newY >= 200 && newY <= 240 && !(newX >= 280 && newX <= 320)) {
        showMessage(['川で足をとられた！', '橋を渡ろう。']);
        return;
    }
    
    gameState.player.x = newX;
    gameState.player.y = newY;
    
    player.style.left = newX + 'px';
    player.style.top = newY + 'px';
    
    updatePlayerDirection();
    
    // 固定イベントの敵
    if (checkBattleEncounter()) {
        playMoveSound();
        return;
    }

    // ランダムエンカウント
    if (Math.random() < 0.2) {
        startRandomBattle();
    }

    playMoveSound();
}

// 敵との遭遇チェック
function checkBattleEncounter() {
    const playerX = gameState.player.x;
    const playerY = gameState.player.y;

    for (let i = 0; i < fieldEvents.length; i++) {
        const event = fieldEvents[i];
        if (event.type === 'forest' && event.enemy) {
            const distance = Math.hypot(playerX - event.x, playerY - event.y);
            if (distance < 40) {
                startBattle(event.enemy);
                return true;
            }
        }
    }
    return false;
}

// イベントチェック
function checkEvent() {
    const playerX = gameState.player.x;
    const playerY = gameState.player.y;
    
    fieldEvents.forEach(event => {
        const distance = Math.sqrt(
            Math.pow(playerX - event.x, 2) + Math.pow(playerY - event.y, 2)
        );
        
        if (distance < 50) {
            triggerEvent(event);
        }
    });
}

// イベント発生
function triggerEvent(event) {
    switch(event.type) {
        case 'castle':
            showMessage(['王城の入口だ。👑のしるしをたどって王さまの間へ。']);
            break;
        case 'king':
            if (gameState.questStage === 0) {
                gameState.questStage = 1;
                showMessage([
                    '王さま「勇者よ！光のカギが森のほこらに眠っておる。」',
                    '「それがあれば魔王城の門が開くはずじゃ。」',
                    '「気をつけて行くのだ！」'
                ]);
            } else if (gameState.questStage === 2) {
                showMessage(['王さま「光のカギを手に入れたか！ 魔王城は北東にあるぞ！」']);
            } else if (gameState.questStage >= 3) {
                showMessage(['王さま「よくぞやった！ 世界は救われた！」']);
            } else {
                showMessage(['王さま「森のほこらでカギを探すのだ！」']);
            }
            break;
        case 'village':
            gameState.player.hp = gameState.player.maxHp;
            gameState.player.mp = gameState.player.maxMp;
            updatePlayerDisplay();
            showMessage([event.message, 'ここでしばらく休んだ。HP/MPがかいふくした。']);
            break;
        case 'forest':
            showMessage([event.message, '森の魔物が飛び出しそうだ…']);
            if (!gameState.inBattle && Math.random() < 0.6) {
                startBattle(event.enemy);
            }
            break;
        case 'shrine':
            if (!gameState.inventory.keyOfLight && gameState.questStage >= 1) {
                gameState.inventory.keyOfLight = true;
                gameState.questStage = 2;
                showMessage([
                    '宝箱を開けた！',
                    '「光のカギ」を手にいれた！',
                    '王さまに報告し、魔王城へ向かおう。'
                ]);
            } else if (!gameState.inventory.keyOfLight) {
                showMessage(['古びたほこらだ。王さまの言葉を思い出そう。']);
            } else {
                showMessage(['ほこらは静まりかえっている。']);
            }
            break;
        case 'bridge':
            showMessage([event.message]);
            break;
        case 'camp':
            gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + 20);
            gameState.player.mp = Math.min(gameState.player.maxMp, gameState.player.mp + 10);
            updatePlayerDisplay();
            showMessage([event.message]);
            break;
        case 'demon_castle':
            if (!gameState.inventory.keyOfLight) {
                showMessage(['門は固く閉ざされている。', '「光のカギ」が必要だ…']);
                return;
            }
            if (gameState.questStage < 3) {
                gameState.questStage = 3;
            }
            showMessage(['魔王が姿をあらわした！']);
            startBattle('demon');
            break;
    }
}

// メッセージ表示
function showMessage(messages) {
    gameState.messages = messages;
    gameState.currentMessageIndex = 0;
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');

    messageBox.classList.remove('hidden');
    messageText.textContent = messages[0];
}

function nextMessage() {
    gameState.currentMessageIndex++;
    
    if (gameState.currentMessageIndex < gameState.messages.length) {
        document.getElementById('messageText').textContent = 
            gameState.messages[gameState.currentMessageIndex];
    } else {
        document.getElementById('messageBox').classList.add('hidden');
        gameState.messages = [];
        gameState.currentMessageIndex = 0;
    }
}

// ランダム戦闘
function startRandomBattle() {
    const options = ['slime', 'goblin'];
    if (gameState.questStage >= 2 && Math.random() < 0.15) {
        options.push('demon');
    }
    const randomEnemy = options[Math.floor(Math.random() * options.length)];
    startBattle(randomEnemy);
}

// 戦闘開始
function startBattle(enemyType) {
    gameState.inBattle = true;
    gameState.guardActive = false;
    gameState.currentEnemy = { ...enemies[enemyType] };
    
    bgmManager.playBattle();
    
    const battleScreen = document.getElementById('battleScreen');
    const enemyImage = document.getElementById('enemyImage');
    const enemyName = document.getElementById('enemyName');
    const enemyHP = document.getElementById('enemyHP');
    
    battleScreen.classList.remove('hidden');
    document.querySelector('.next-button').style.display = 'none';
    enemyImage.src = gameState.currentEnemy.image;
    enemyImage.alt = gameState.currentEnemy.name;
    enemyName.textContent = gameState.currentEnemy.name;
    enemyHP.textContent = gameState.currentEnemy.hp;
    
    showMessage([`${gameState.currentEnemy.name}があらわれた！`]);
}

// 戦闘アクション
function attack() {
    if (!gameState.inBattle) return;
    
    const base = 8 + gameState.player.level * 2;
    const damage = Math.floor(Math.random() * 8) + base;
    const isCritical = Math.random() < 0.1;
    const finalDamage = isCritical ? Math.floor(damage * 1.7) : damage;
    gameState.currentEnemy.hp -= finalDamage;
    
    let messages = [`${gameState.player.name}のこうげき！`, `${finalDamage}のダメージ！`];
    if (isCritical) messages.push('かいしんの いちげき！');
    
    resolvePlayerTurn(messages);
    playAttackSound();
}

function castSpell() {
    if (!gameState.inBattle) return;
    const spell = spells[gameState.nextSpellIndex];
    
    if (gameState.player.mp < spell.cost) {
        showMessage(['MPがたりない！']);
        return;
    }
    
    gameState.player.mp -= spell.cost;
    gameState.nextSpellIndex = (gameState.nextSpellIndex + 1) % spells.length;
    updatePlayerDisplay();
    
    let messages = [`${gameState.player.name}は ${spell.name} をとなえた！`];
    
    if (spell.type === 'heal') {
        const heal = spell.power + Math.floor(Math.random() * 6);
        gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + heal);
        updatePlayerDisplay();
        messages.push(`HPが${heal}かいふくした！`);
        showMessage(messages);
        setTimeout(enemyAttack, 1200);
        return;
    }
    
    const damage = spell.power + Math.floor(Math.random() * 10);
    gameState.currentEnemy.hp -= damage;
    messages.push(`${damage}のダメージ！`);
    resolvePlayerTurn(messages);
}

function guardStance() {
    if (!gameState.inBattle) return;
    gameState.guardActive = true;
    showMessage(['ぼうぎょのたいせいをととのえた。', 'うけるダメージをへらせそうだ。']);
    setTimeout(enemyAttack, 1200);
}

function runAway() {
    if (!gameState.inBattle) return;
    if (Math.random() < 0.75) {
        showMessage(['うまく逃げることができた！']);
        endBattle();
    } else {
        showMessage(['にげられなかった！']);
        setTimeout(enemyAttack, 1200);
    }
}

function resolvePlayerTurn(messages) {
    if (gameState.currentEnemy.hp <= 0) {
        messages.push(`${gameState.currentEnemy.name}をたおした！`);
        messages.push(`けいけんちを${gameState.currentEnemy.exp}てにいれた！`);
        
        gameState.player.exp += gameState.currentEnemy.exp;
        
        if (gameState.player.exp >= gameState.player.level * 100) {
            levelUp();
            messages.push('レベルアップ！');
        }
        
        if (gameState.currentEnemy.name === 'まおう') {
            messages.push('世界に光が戻った！');
            setTimeout(() => gameComplete(), 2500);
        }
        
        endBattle();
    } else {
        setTimeout(enemyAttack, 1200);
    }
    
    document.getElementById('enemyHP').textContent = Math.max(0, gameState.currentEnemy.hp);
    showMessage(messages);
}

// 敵の攻撃
function enemyAttack() {
    if (!gameState.inBattle) return;
    
    let damage = Math.floor(Math.random() * gameState.currentEnemy.attack) + 5;
    if (gameState.guardActive) {
        damage = Math.floor(damage * 0.5);
        gameState.guardActive = false;
    }
    gameState.player.hp -= damage;
    
    updatePlayerDisplay();
    
    let messages = [`${gameState.currentEnemy.name}のこうげき！`, `${damage}のダメージをうけた！`];
    
    if (gameState.player.hp <= 0) {
        messages.push('たおれてしまった... しかし希望の光がよみがえる！');
        gameState.player.hp = Math.ceil(gameState.player.maxHp * 0.3);
        updatePlayerDisplay();
        endBattle();
    }
    
    showMessage(messages);
}

// レベルアップ
function levelUp() {
    gameState.player.level++;
    gameState.player.maxHp += 18;
    gameState.player.maxMp += 6;
    gameState.player.hp = gameState.player.maxHp;
    gameState.player.mp = gameState.player.maxMp;
    gameState.player.exp = 0;
    updatePlayerDisplay();
    playVictorySound();
}

// 戦闘終了
function endBattle() {
    gameState.inBattle = false;
    gameState.guardActive = false;
    gameState.currentEnemy = null;
    
    setTimeout(() => {
        bgmManager.playField();
    }, 800);
    
    setTimeout(() => {
        document.getElementById('battleScreen').classList.add('hidden');
        document.querySelector('.next-button').style.display = 'inline-block';
    }, 800);
}

// ゲームクリア
function gameComplete() {
    showMessage([
        'やったね！ まおうをたおした！',
        '王国に光がもどった！',
        '～ GAME CLEAR ～',
        'もう一度あそぶならタイトルへもどろう。'
    ]);
    
    setTimeout(() => {
        showScreen('titleScreen');
        gameState.player = {
            name: gameState.player.name,
            gender: gameState.player.gender,
            x: 2 * CELL_SIZE,
            y: 4 * CELL_SIZE,
            hp: 90,
            maxHp: 90,
            mp: 24,
            maxMp: 24,
            level: 1,
            exp: 0,
            gold: 30,
            direction: 'down'
        };
        gameState.questStage = 0;
        gameState.inventory.keyOfLight = false;
        updatePlayerDisplay();
    }, 7000);
}

// 音効果（Web Audio API）
function playSound(frequency, duration) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.08 * gameState.gameVolume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function playMoveSound() {
    playSound(220, 0.08);
}

function playAttackSound() {
    playSound(440, 0.18);
}

function playVictorySound() {
    playSound(523, 0.4);
}

// タッチイベント（スマホ対応）
let touchStartX = 0;
let touchStartY = 0;

document.getElementById('gameArea').addEventListener('touchstart', function(e) {
    if (gameState.currentScreen !== 'gameScreen') return;
    if (gameState.inBattle) return;

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.getElementById('gameArea').addEventListener('touchend', function(e) {
    if (gameState.currentScreen !== 'gameScreen') return;
    if (gameState.inBattle) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                movePlayer('right');
            } else {
                movePlayer('left');
            }
        }
    } else {
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                movePlayer('down');
            } else {
                movePlayer('up');
            }
        }
    }
});

// ダブルタップでイベントチェック
let lastTap = 0;
document.getElementById('gameArea').addEventListener('touchend', function() {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 500 && tapLength > 0) {
        checkEvent();
    }
    
    lastTap = currentTime;
});

// チートコード（開発用）
let cheatCode = '';
document.addEventListener('keydown', function(e) {
    cheatCode += e.key;
    if (cheatCode.includes('boss')) {
        cheatCode = '';
        if (gameState.currentScreen === 'gameScreen' && !gameState.inBattle) {
            startBattle('demon');
        }
    }
    if (cheatCode.includes('heal')) {
        cheatCode = '';
        gameState.player.hp = gameState.player.maxHp;
        gameState.player.mp = gameState.player.maxMp;
        updatePlayerDisplay();
    }
    if (cheatCode.includes('win')) {
        cheatCode = '';
        gameComplete();
    }
    
    if (cheatCode.length > 20) {
        cheatCode = '';
    }
});

// ヘルプボタン
function setupHelpButton() {
    const helpButton = document.createElement('button');
    helpButton.textContent = '？';
    helpButton.style.position = 'fixed';
    helpButton.style.top = '10px';
    helpButton.style.right = '10px';
    helpButton.style.width = '40px';
    helpButton.style.height = '40px';
    helpButton.style.borderRadius = '50%';
    helpButton.style.background = '#1b3a8a';
    helpButton.style.color = 'white';
    helpButton.style.border = '2px solid #f1c40f';
    helpButton.style.fontSize = '20px';
    helpButton.style.cursor = 'pointer';
    helpButton.style.zIndex = '1000';
    
    helpButton.onclick = () => {
        const hints = [
            'スペース/エンター/ダブルタップで「しらべる」！',
            '森や橋はエンカウント率が高め。',
            'ぼうぎょでダメージ半減。じゅもんはホイミ→ギラの順でローテ。',
            '川は橋を渡ろう。王さまは👑マークだ。',
            '光のカギがないと魔王城は開かないぞ！'
        ];
        
        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        showMessage([`💡 ヒント: ${randomHint}`]);
    };
    
    document.body.appendChild(helpButton);
}

// オートセーブ
function saveGame() {
    try {
        const saveData = {
            player: gameState.player,
            questStage: gameState.questStage,
            inventory: gameState.inventory
        };
        window.gameData = saveData;
    } catch (e) {
        console.log('Save failed');
    }
}

function loadGame() {
    try {
        if (window.gameData) {
            gameState.player = { ...window.gameData.player };
            gameState.questStage = window.gameData.questStage;
            gameState.inventory = { ...window.gameData.inventory };
            updatePlayerDisplay();
            renderPlayer();
            return true;
        }
    } catch (e) {
        console.log('Load failed');
    }
    return false;
}

setInterval(saveGame, 30000);

console.log('ちいさなドラクエ風 - 読み込み完了');
console.log('操作: 矢印/WASD/スワイプ移動, スペース/ダブルタップ調べる');
console.log('チート: boss / heal / win');