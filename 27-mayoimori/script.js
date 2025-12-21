/* --- サウンド管理 (Web Audio API) --- */
class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = false;
    }
    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.enabled = true;
        } else if (this.ctx.state === 'suspended') this.ctx.resume();
    }
    playTone(freq, type, duration, vol = 0.1) {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }
    playMove() { this.playTone(200, 'sine', 0.05, 0.05); }
    playItem() { this.playTone(800, 'sine', 0.1, 0.1); setTimeout(()=>this.playTone(1200,'sine',0.1), 50); }
    playEnemyItem() { this.playTone(150, 'square', 0.1, 0.1); }
    playBad() { this.playTone(100, 'square', 0.2, 0.1); }
    playWin() { [523,659,784,1046].forEach((f,i)=>setTimeout(()=>this.playTone(f,'triangle',0.2),i*100)); }
    playGun() { // スタンガン発射音
        this.playTone(1200, 'sawtooth', 0.1, 0.2);
        setTimeout(()=>this.playTone(800, 'sawtooth', 0.3, 0.2), 100);
    }
}
const audio = new SoundManager();

/* --- ゲーム設定 & 状態 --- */
const CONFIG = {
    MAX_LEVEL: 10,
    BASE_SIZE: 7
};

let state = {
    level: 1,
    pScore: 0,
    eScore: 0,
    field: [],
    discovered: [],
    player: {x:0, y:0},
    enemy: {x:0, y:0},
    exit: {x:0, y:0},
    items: [],
    gameOver: false,
    size: 8,
    isFrozen: true,
    // 新機能用
    hasGun: false,
    gunUsed: false,
    enemyStunned: false
};

const el = {
    field: document.getElementById('gameField'),
    level: document.getElementById('levelCount'),
    pScore: document.getElementById('playerScore'),
    eScore: document.getElementById('enemyScore'),
    modal: document.getElementById('modalOverlay'),
    modalText: document.getElementById('modalText'),
    modalBtn: document.getElementById('modalBtn'),
    gunBtn: document.getElementById('gunBtn')
};

/* --- テキスト生成 --- */
const PLACES = ["迷いの森", "霧の渓谷", "沈黙の湿地", "古代樹の林", "ささやきの森", "薄暗い洞窟", "キノコ山", "忘れられた廃墟"];
const TARGETS = ["ヘンテコ星人", "謎の宇宙生命体", "イタズラ星人", "クリドロボウ", "エイリアン"];

function generateMissionText() {
    const place = PLACES[Math.floor(Math.random() * PLACES.length)];
    const target = TARGETS[Math.floor(Math.random() * TARGETS.length)];
    return `こちら本部。\n\n「${place}」にて${target}の反応あり！\n奴らは森の栗を狙っている。\n\n至急現場へ向かい、奴らより早く栗を回収せよ！`;
}

/* --- 初期化 & レベル管理 --- */
function initGame() {
    state.level = 1;
    showStory("start");
}

function startLevel() {
    state.pScore = 0;
    state.eScore = 0;
    state.gameOver = false;
    state.isFrozen = false;
    state.enemyStunned = false;
    state.gunUsed = false;
    
    // スタンガン支給ガチャ (30%の確率)
    state.hasGun = Math.random() < 0.3; 

    // レベルに応じてサイズ
    state.size = CONFIG.BASE_SIZE + Math.floor(state.level * 0.8);
    if(state.size > 15) state.size = 15;

    generateField();
    updateVision();
    updateUI(); // UI更新でボタン表示切り替え
    updateDisplay();
}

function generateField() {
    const s = state.size;
    el.field.style.gridTemplateColumns = `repeat(${s}, 1fr)`;
    
    state.field = [];
    state.discovered = [];
    state.items = [];

    const wallProb = 0.2 + (state.level * 0.015);
    const itemProb = 0.05 + (state.level * 0.005);

    for(let y=0; y<s; y++) {
        state.field[y] = [];
        state.discovered[y] = [];
        for(let x=0; x<s; x++) {
            state.discovered[y][x] = false;
            
            if(x===0||x===s-1||y===0||y===s-1) {
                state.field[y][x] = 'wall';
                continue;
            }
            const r = Math.random();
            if(r < wallProb) state.field[y][x] = 'wall';
            else if(r < wallProb + itemProb) {
                state.field[y][x] = 'item';
                state.items.push({x, y});
            }
            else if(r < wallProb + itemProb + 0.05 && state.level > 3) {
                state.field[y][x] = 'hazard';
            }
            else state.field[y][x] = 'path';
        }
    }

    // スタート地点確保
    state.player = {x:1, y:1};
    state.enemy = {x:1, y:1};
    [
        {x:1,y:1}, {x:1,y:2}, {x:2,y:1}, {x:2,y:2}
    ].forEach(p => state.field[p.y][p.x] = 'path');

    // ゴール地点確保 (★バグ修正箇所)
    state.exit = {x:s-2, y:s-2};
    state.field[s-2][s-2] = 'exit';
    
    // ゴールの周囲(上下左右)を強制的に壁以外にする
    const exitSafe = [
        {x: s-2, y: s-3}, // 上
        {x: s-2, y: s-1}, // 下 (外周だけど念のため)
        {x: s-3, y: s-2}, // 左
        {x: s-1, y: s-2}  // 右 (外周)
    ];
    exitSafe.forEach(p => {
        if(p.x > 0 && p.x < s-1 && p.y > 0 && p.y < s-1) {
            state.field[p.y][p.x] = 'path'; // 強制的に道にする
        }
    });
}

/* --- ゲームロジック --- */
function movePlayer(dx, dy) {
    if(state.gameOver || state.isFrozen) return;
    
    audio.init();

    const nx = state.player.x + dx;
    const ny = state.player.y + dy;
    
    if(!isValidMove(nx, ny)) {
        audio.playBad();
        triggerShake();
        return;
    }

    state.player.x = nx;
    state.player.y = ny;
    
    handleCellEvent(nx, ny, true);
    updateVision();
    
    if(nx === state.exit.x && ny === state.exit.y) {
        levelClear();
        return;
    }

    // 敵のターン (スタン中は動かない)
    if (!state.enemyStunned) {
        moveEnemy();
    }

    updateDisplay();
    updateUI();
}

function useGun() {
    if(!state.hasGun || state.gunUsed) return;
    
    state.gunUsed = true;
    state.enemyStunned = true;
    audio.playGun();
    triggerShake(); // 画面を揺らす
    
    // ボタンの見た目更新
    updateUI();
    updateDisplay(); // 敵の見た目を更新

    // 3秒後に解除
    setTimeout(() => {
        if(!state.gameOver) {
            state.enemyStunned = false;
            updateDisplay();
        }
    }, 3000);
}

function moveEnemy() {
    let target = null;
    let minDist = 999;

    state.items.forEach(item => {
        if(state.field[item.y][item.x] === 'item') {
            const d = Math.abs(item.x - state.enemy.x) + Math.abs(item.y - state.enemy.y);
            if(d < minDist) {
                minDist = d;
                target = item;
            }
        }
    });

    if(!target) target = state.exit;

    const ex = state.enemy.x;
    const ey = state.enemy.y;
    const candidates = [
        {x:ex, y:ey-1}, {x:ex, y:ey+1}, {x:ex-1, y:ey}, {x:ex+1, y:ey}
    ].filter(p => isValidMove(p.x, p.y));

    if(candidates.length === 0) return;

    let nextPos = candidates[Math.floor(Math.random() * candidates.length)];
    let bestScore = -1;

    candidates.forEach(p => {
        const dist = Math.abs(p.x - target.x) + Math.abs(p.y - target.y);
        const score = 100 - dist + Math.random() * 2;
        if(score > bestScore) {
            bestScore = score;
            nextPos = p;
        }
    });

    state.enemy = nextPos;
    handleCellEvent(nextPos.x, nextPos.y, false);
}

function isValidMove(x, y) {
    if(x<0 || x>=state.size || y<0 || y>=state.size) return false;
    return state.field[y][x] !== 'wall';
}

function handleCellEvent(x, y, isPlayer) {
    const type = state.field[y][x];
    if(type === 'item') {
        state.field[y][x] = 'path';
        if(isPlayer) {
            state.pScore++;
            audio.playItem();
        } else {
            state.eScore++;
            audio.playEnemyItem();
        }
    } else if(type === 'hazard' && isPlayer) {
        audio.playBad();
        triggerShake();
    } else if(isPlayer) {
        audio.playMove();
    }
}

function updateVision() {
    const r = 2; 
    for(let y = state.player.y-r; y <= state.player.y+r; y++) {
        for(let x = state.player.x-r; x <= state.player.x+r; x++) {
            if(x>=0 && x<state.size && y>=0 && y<state.size) {
                state.discovered[y][x] = true;
            }
        }
    }
}

function updateDisplay() {
    el.field.innerHTML = '';
    const frag = document.createDocumentFragment();

    for(let y=0; y<state.size; y++) {
        for(let x=0; x<state.size; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            const isP = (x===state.player.x && y===state.player.y);
            const isE = (x===state.enemy.x && y===state.enemy.y);

            if(!state.discovered[y][x]) {
                cell.classList.add('unknown');
                cell.textContent = '☁️';
            } else {
                const type = state.field[y][x];
                if(isP) {
                    cell.classList.add('player');
                    cell.textContent = '🧑';
                } else if(isE) {
                    cell.classList.add('enemy');
                    cell.textContent = '👾';
                    if(state.enemyStunned) cell.classList.add('frozen'); // 凍結エフェクト
                } else if(type === 'exit') {
                    cell.classList.add('exit');
                    cell.textContent = '🚪';
                } else if(type === 'item') {
                    cell.classList.add('item-score');
                    cell.textContent = '🌰';
                } else if(type === 'hazard') {
                    cell.classList.add('hazard');
                    cell.textContent = '💧';
                } else if(type === 'wall') {
                    cell.classList.add('wall');
                    cell.textContent = '🌳';
                }
            }
            cell.onclick = () => {
                const dx = x - state.player.x;
                const dy = y - state.player.y;
                if(Math.abs(dx) + Math.abs(dy) === 1) movePlayer(dx, dy);
            };
            frag.appendChild(cell);
        }
    }
    el.field.appendChild(frag);
}

function updateUI() {
    el.level.textContent = state.level;
    el.pScore.textContent = state.pScore;
    el.eScore.textContent = state.eScore;

    // 麻酔銃ボタンの制御
    if (state.hasGun && !state.gunUsed) {
        el.gunBtn.classList.remove('hidden');
        el.gunBtn.disabled = false;
        el.gunBtn.textContent = "🔫 麻酔銃を使用！";
    } else if (state.gunUsed) {
        el.gunBtn.classList.remove('hidden');
        el.gunBtn.disabled = true;
        el.gunBtn.textContent = "🔋 チャージ切れ";
    } else {
        el.gunBtn.classList.add('hidden');
    }
}

function levelClear() {
    state.gameOver = true;
    audio.playWin();
    showStory("clear");
}

/* --- ストーリー管理 --- */
function showStory(type) {
    state.isFrozen = true;
    let content = {};
    
    if(type === "start") {
        content.text = generateMissionText(); // ランダムメッセージ
        content.btn = "了解！";
        if(state.hasGun) content.text += "\n\n★本部より特別支給：\n「麻酔銃(1回分)」を転送した。";
        
        el.modalBtn.onclick = () => {
            el.modal.classList.add('hidden');
            audio.init();
            startLevel();
        };
    } else if (type === "clear") {
        const diff = state.pScore - state.eScore;
        let rank = diff >= 3 ? "S" : diff > 0 ? "A" : diff === 0 ? "B" : "C";
        let msg = diff > 0 ? "よくやった。" : "次はもっと拾え！";

        if(state.level >= CONFIG.MAX_LEVEL) {
            content.text = `全任務完了！\n最終評価: ${rank}\nお疲れ様でした！`;
            content.btn = "タイトルへ";
            el.modalBtn.onclick = () => location.reload();
        } else {
            content.text = `ステージクリア！\n評価: ${rank}\n\n次のエリアへ進め。`;
            content.btn = "次へ";
            el.modalBtn.onclick = () => {
                el.modal.classList.add('hidden');
                state.level++;
                // 次のステージの銃支給抽選などのために一度startLevelを呼ぶ前準備
                showStory("start"); // 次のミッション説明へ
            };
        }
    }

    el.modalText.textContent = "";
    el.modalBtn.textContent = content.btn;
    el.modal.classList.remove('hidden');
    
    let i = 0;
    const txt = content.text;
    const timer = setInterval(() => {
        el.modalText.textContent += txt.charAt(i);
        i++;
        if(i >= txt.length) clearInterval(timer);
    }, 20);
}

function triggerShake() {
    if(navigator.vibrate) navigator.vibrate(100);
    document.body.classList.add('shake');
    setTimeout(()=>document.body.classList.remove('shake'), 300);
}

/* --- 入力制御 --- */
const dirs = {'upBtn':[0,-1], 'downBtn':[0,1], 'leftBtn':[-1,0], 'rightBtn':[1,0]};
Object.keys(dirs).forEach(id => {
    const btn = document.getElementById(id);
    const [dx, dy] = dirs[id];
    const action = (e) => {
        if(e.cancelable) e.preventDefault();
        btn.classList.add('active');
        movePlayer(dx, dy);
        setTimeout(()=>btn.classList.remove('active'), 100);
    };
    btn.addEventListener('touchstart', action, {passive:false});
    btn.addEventListener('click', action);
});

// 麻酔銃ボタン
el.gunBtn.addEventListener('click', (e) => {
    e.preventDefault();
    useGun();
});
el.gunBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    useGun();
}, {passive:false});

document.addEventListener('keydown', (e) => {
    if(state.isFrozen) return;
    if(e.key==='ArrowUp') movePlayer(0,-1);
    if(e.key==='ArrowDown') movePlayer(0,1);
    if(e.key==='ArrowLeft') movePlayer(-1,0);
    if(e.key==='ArrowRight') movePlayer(1,0);
    if(e.key===' ' && state.hasGun) useGun(); // スペースキーで発射
});

document.getElementById('restartBtn').onclick = () => {
    if(confirm("最初に戻りますか？")) location.reload();
};

initGame();