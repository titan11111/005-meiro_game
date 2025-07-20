// script.js

// キャラクタークラス
class Character {
    constructor(name, maxHp, maxMp, attack, sprite, level = 1, exp = 0, nextLevelExp = 100) {
        this.name = name;
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.maxMp = maxMp;
        this.mp = maxMp;
        this.attack = attack;
        this.sprite = sprite;
        this.level = level;
        this.exp = exp;
        this.nextLevelExp = nextLevelExp;
        this.knownMagic = [];
    }

    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp < 0) this.hp = 0;
    }

    heal(amount) {
        this.hp += amount;
        if (this.hp > this.maxHp) this.hp = this.maxHp;
    }

    useMp(amount) {
        this.mp -= amount;
        if (this.mp < 0) this.mp = 0;
    }

    isAlive() {
        return this.hp > 0;
    }

    addExp(amount) {
        this.exp += amount;
        addLog(`経験値を${amount}獲得した！`);
        this.checkLevelUp();
    }

    checkLevelUp() {
        while (this.exp >= this.nextLevelExp) {
            this.level++;
            this.exp -= this.nextLevelExp;
            this.nextLevelExp = Math.floor(this.nextLevelExp * 1.5);
            this.maxHp += 15;
            this.maxMp += 10;
            this.attack += 5;
            this.hp = this.maxHp;
            this.mp = this.maxMp;
            addLog(`勇者はレベル${this.level}に上がった！`, 'heal');
            playSound(levelupSound);
            this.learnNewMagic();
        }
    }

    learnNewMagic() {
        let newMagic = null;
        switch (this.level) {
            case 3:
                newMagic = { name: 'ヒノカゲ', damage: 22, mpCost: 4, type: 'attack', element: 'fire' };
                break;
            case 6:
                newMagic = { name: 'ユキハネ', damage: 30, mpCost: 7, type: 'attack', element: 'ice' };
                break;
            case 9:
                newMagic = { name: 'ドクモリ', damage: 16, mpCost: 8, type: 'poison', element: 'dark' };
                break;
            case 12:
                newMagic = { name: 'イカヅチ', damage: 40, mpCost: 12, type: 'attack', element: 'thunder' };
                break;
            case 15:
                newMagic = { name: 'ミコモリ', healAmount: 35, mpCost: 10, type: 'heal', element: 'light' };
                break;
            case 18:
                newMagic = { name: 'チカラダマ', buff: 'attack', buffAmount: 5, buffTurns: 3, mpCost: 10, type: 'buff', element: 'none' };
                break;
            case 20:
                newMagic = { name: 'ホムラギ', damage: 65, mpCost: 20, type: 'attack', element: 'fire' };
                break;
        }
        if (newMagic) {
            this.knownMagic.push(newMagic);
            addLog(`勇者は「${newMagic.name}」を覚えた！`, 'heal');
        }
    }
}

// 敵クラス
class Enemy extends Character {
    constructor(name, maxHp, attack, sprite, expReward, isBoss = false, actions = null, element = null, weakTo = null, specialAttack = null) {
        super(name, maxHp, 0, attack, sprite);
        this.expReward = expReward;
        this.isBoss = isBoss;
        this.actions = actions;
        this.element = element;
        this.weakTo = weakTo;
        this.specialAttack = specialAttack;
        this.turnCount = 0;
    }
    getAction() {
        if (this.specialAttack && Math.random() < 0.1) {
            return 'specialAttack';
        }
        if (this.actions) {
            return this.actions[Math.floor(Math.random() * this.actions.length)];
        }
        if (this.isBoss) {
            const actions = ['attack', 'strongAttack', 'magicAttack'];
            return actions[Math.floor(Math.random() * actions.length)];
        } else {
            const actions = ['attack', 'attack', 'strongAttack'];
            return actions[Math.floor(Math.random() * actions.length)];
        }
    }
}

// ゲーム状態変数
let player;
let currentEnemy;
let gameState = 'battle';
let isPlayerTurn = true;
let actionQueue = [];
let currentLogIndex = 0;
let logMessages = [];
let logTimer = null;
let lastPlayerState = null;

const enemyData = [
    { name: 'おばけ大木', hp: 60, attack: 12, sprite: '', image: 'images/bajegi.png', exp: 25, actions: ['attack', 'strongAttack', 'attack'], element: 'wood', weakTo: 'fire', specialAttack: { name: 'つるのムチ', effect: '全体攻撃＋麻痺' } },
    { name: 'ゴブリン', hp: 50, attack: 10, sprite: '', image: 'images/goburin.png', exp: 20, actions: ['attack', 'attack', 'strongAttack'], element: 'none', weakTo: null, specialAttack: { name: '盗賊の一撃', effect: '大ダメージ＋MP吸収' } },
    { name: 'ゴースト', hp: 70, attack: 14, sprite: '', image: 'images/ghost.png', exp: 28, actions: ['attack', 'attack', 'strongAttack'], element: 'dark', weakTo: 'light', specialAttack: { name: '霊体化', effect: '1ターン物理無効' } },
    { name: '魔女', hp: 80, attack: 18, sprite: '', image: 'images/majo.png', exp: 40, actions: ['attack', 'magicAttack', 'magicAttack'], element: 'dark', weakTo: 'light', specialAttack: { name: '闇の呪詛', effect: '継続ダメージ（毒）' } },
    { name: 'メジェド', hp: 65, attack: 13, sprite: '', image: 'images/mejed.png', exp: 35, actions: ['attack', 'magicAttack', 'attack'], element: 'light', weakTo: 'dark', specialAttack: { name: '目からビーム', effect: '防御無視の高威力攻撃' } },
    { name: 'ミミック', hp: 100, attack: 18, sprite: '', image: 'images/mimic.png', exp: 50, actions: ['attack', 'strongAttack', 'attack'], element: 'none', weakTo: null, specialAttack: { name: '擬態', effect: '1度だけ攻撃無効' } },
    { name: 'ナイト', hp: 120, attack: 20, sprite: '', image: 'images/naito.png', exp: 45, actions: ['attack', 'strongAttack', 'attack'], element: 'none', weakTo: null, specialAttack: { name: 'シールドバッシュ', effect: '大ダメージ＋気絶' } },
    { name: 'オーデン', hp: 90, attack: 15, sprite: '', image: 'images/oden.png', exp: 32, actions: ['attack', 'strongAttack', 'attack'], element: 'none', weakTo: null, specialAttack: { name: '雷撃', effect: '全体攻撃＋麻痺' } },
    { name: '破壊ロボ', hp: 110, attack: 22, sprite: '', image: 'images/robo.png', exp: 50, actions: ['attack', 'magicAttack', 'strongAttack'], element: 'machine', weakTo: 'thunder', specialAttack: { name: 'レーザー砲', effect: '高威力単体攻撃' } },
    { name: '逆立ち族', hp: 85, attack: 17, sprite: '', image: 'images/sakasazoku.png', exp: 36, actions: ['attack', 'strongAttack', 'attack'], element: 'none', weakTo: null, specialAttack: { name: '逆転パンチ', effect: '大ダメージ＋攻撃力UP' } },
    { name: 'スケルトン', hp: 75, attack: 13, sprite: '', image: 'images/sukeruton.png', exp: 30, actions: ['attack', 'attack', 'strongAttack'], element: 'none', weakTo: null, specialAttack: { name: '骨投げ乱舞', effect: 'ランダム2〜4回攻撃' } },
    { name: 'スライム', hp: 40, attack: 8, sprite: '', image: 'images/suraimu.png', exp: 15, actions: ['attack', 'attack', 'attack'], element: 'water', weakTo: 'fire', specialAttack: { name: '分裂', effect: 'HP半分以下で分身を呼ぶ' } },
    { name: '火の鳥', hp: 60, attack: 12, sprite: '', image: 'images/summon_1.png', exp: 30, actions: ['attack', 'magicAttack', 'attack'], element: 'fire', weakTo: 'ice', specialAttack: { name: '炎の翼', effect: '全体火属性攻撃' } },
    { name: 'ファイトウルフ', hp: 80, attack: 16, sprite: '', image: 'images/summon_2.png', exp: 35, actions: ['attack', 'strongAttack', 'attack'], element: 'beast', weakTo: 'ice', specialAttack: { name: '咆哮', effect: '敵全体の攻撃力UP' } },
    { name: '海の化身', hp: 100, attack: 20, sprite: '', image: 'images/summon_3.png', exp: 45, actions: ['attack', 'magicAttack', 'strongAttack'], element: 'water', weakTo: 'thunder', specialAttack: { name: '津波', effect: '全体水属性攻撃' } },
    { name: 'ロック', hp: 130, attack: 24, sprite: '', image: 'images/summon_4.png', exp: 55, actions: ['attack', 'strongAttack', 'attack'], element: 'rock', weakTo: 'thunder', specialAttack: { name: '岩石落とし', effect: '全体攻撃' } },
    { name: 'みにどらご', hp: 150, attack: 28, sprite: '', image: 'images/summon_5.png', exp: 60, actions: ['attack', 'magicAttack', 'strongAttack'], element: 'fire', weakTo: 'ice', specialAttack: { name: '炎のブレス', effect: '高威力火属性攻撃＋やけど' } },
    { name: 'ゾンビ', hp: 80, attack: 12, sprite: '', image: 'images/zonbi.png', exp: 25, actions: ['attack', 'attack', 'strongAttack'], element: 'dark', weakTo: 'fire', specialAttack: { name: '毒吐き', effect: '毒状態付与' } }
];

const bossData = {
    name: '魔王', 
    hp: 300, 
    attack: 35, 
    sprite: '👑', 
    image: 'images/Gemini_Generated_Image_71sr7j71sr.png', // 修正: demonking.png -> Gemini_Generated_Image_71sr7j71sr.png
    exp: 200
};

// 音声
let bgm = null;
let levelupSound = null;
let attackPlayerSound = null;
let attackEnemySound = null;
let gameoverSound = null;
let isMuted = false;

// 初期化
function initGame() {
    if (!player) {
        player = new Character('勇者', 100, 50, 20, '🛡️');
    } else {
        // プレイヤーのHPとMPは毎戦闘開始時に全回復
        player.hp = player.maxHp;
        player.mp = player.maxMp;
    }

    // レベル20で魔王登場
    if (player.level >= 20) {
        currentEnemy = new Enemy(bossData.name, bossData.hp, bossData.attack, bossData.sprite, bossData.exp, true);
        currentEnemy.image = bossData.image;
    } else {
        const enemyTemplate = enemyData[Math.floor(Math.random() * enemyData.length)];
        currentEnemy = new Enemy(
            enemyTemplate.name,
            enemyTemplate.hp,
            enemyTemplate.attack,
            enemyTemplate.sprite,
            enemyTemplate.exp,
            false,
            enemyTemplate.actions,
            enemyTemplate.element,
            enemyTemplate.weakTo,
            enemyTemplate.specialAttack
        );
        currentEnemy.image = enemyTemplate.image;
    }

    gameState = 'battle';
    isPlayerTurn = true;
    actionQueue = [];
    logMessages = [];
    currentLogIndex = 0;
    clearLogTimer();

    updateDisplay();
    addLog(`${currentEnemy.name}が現れた！`);
}

function initAudio() {
    if (!bgm) {
        bgm = document.getElementById('bgm');
        levelupSound = document.getElementById('levelup-sound');
        attackPlayerSound = document.getElementById('attack-player-sound');
        attackEnemySound = document.getElementById('attack-enemy-sound');
        gameoverSound = document.getElementById('gameover-sound');
    }
    // ここではBGMの再生/停止は行わず、toggleMute()または startGame() で制御
    const volume = document.getElementById('volume-slider').value / 100;
    if (bgm) bgm.volume = volume * 0.3;
    if (levelupSound) levelupSound.volume = volume;
    if (attackPlayerSound) attackPlayerSound.volume = volume;
    if (attackEnemySound) attackEnemySound.volume = volume;
    if (gameoverSound) gameoverSound.volume = volume;
    if (bgm && !isMuted && gameState === 'battle') { // BGMがすでに再生中でなければ再生
        bgm.play().catch(e => console.log('BGM play failed:', e));
    }
}

function stopAllSounds() {
    if (bgm) { bgm.pause(); /* bgm.currentTime = 0; */ } // 戦闘継続のためcurrentTimeはリセットしない
    if (levelupSound) { levelupSound.pause(); levelupSound.currentTime = 0; }
    if (attackPlayerSound) { attackPlayerSound.pause(); attackPlayerSound.currentTime = 0; }
    if (attackEnemySound) { attackEnemySound.pause(); attackEnemySound.currentTime = 0; }
    if (gameoverSound) { gameoverSound.pause(); gameoverSound.currentTime = 0; }
}

// UI更新
function updateDisplay() {
    document.getElementById('player-hp').textContent = player.hp;
    document.getElementById('player-mp').textContent = player.mp;
    document.getElementById('player-level').textContent = player.level;
    document.getElementById('player-exp').textContent = player.exp;
    document.getElementById('player-next-exp').textContent = player.nextLevelExp;

    document.querySelector('.player-hp-fill').style.width = (player.hp / player.maxHp * 100) + '%';
    document.querySelector('.player-mp-fill').style.width = (player.mp / player.maxMp * 100) + '%';
    document.querySelector('.player-exp-fill').style.width = (player.exp / player.nextLevelExp * 100) + '%';

    document.getElementById('enemy-name').textContent = currentEnemy.name;
    document.getElementById('enemy-hp').textContent = currentEnemy.hp;
    document.getElementById('enemy-max-hp').textContent = currentEnemy.maxHp;

    const enemyImage = document.getElementById('enemy-image');
    const enemySprite = document.getElementById('enemy-sprite');
    if (currentEnemy.image) {
        enemyImage.src = currentEnemy.image;
        enemyImage.alt = currentEnemy.name;
        enemyImage.style.display = 'inline';
        enemySprite.style.display = 'none';
    } else {
        enemyImage.style.display = 'none';
        enemySprite.style.display = 'inline';
        enemySprite.textContent = currentEnemy.sprite;
    }

    document.querySelector('.enemy-hp-fill').style.width = (currentEnemy.hp / currentEnemy.maxHp * 100) + '%';

    const btns = document.querySelectorAll('.command-btn');
    btns.forEach(btn => btn.disabled = !isPlayerTurn || gameState !== 'battle');

    const magicBtn = btns[1];
    const healBtn = btns[2];
    
    if (player.knownMagic.length > 0) {
        const latestMagic = player.knownMagic[player.knownMagic.length - 1];
        magicBtn.disabled = player.mp < latestMagic.mpCost || !isPlayerTurn || gameState !== 'battle';
        magicBtn.textContent = latestMagic.name;
    } else {
        magicBtn.disabled = true;
        magicBtn.textContent = 'まほう';
    }
    
    healBtn.disabled = player.mp < 5 || !isPlayerTurn || gameState !== 'battle';

    // ゲームオーバーまたは勝利時の表示制御
    if (gameState !== 'battle') {
        document.getElementById('battle-commands').style.display = 'none';
        document.getElementById('game-over').style.display = 'block';
        let gameOverText = '';
        if (gameState === 'win') {
            if (currentEnemy.isBoss) {
                gameOverText = '魔王を倒した！世界に平和が戻った！';
            } else {
                // 通常の敵を倒した場合は、この画面は表示せず直接次の戦闘へ
                // ここには到達しないはずだが、念のため
                gameOverText = `${currentEnemy.name}を倒した！勝利！`; 
            }
            // BGMは止めない
        } else { // gameState === 'lose' (プレイヤー敗北時)
            gameOverText = 'あなたは倒れた...';
            if (bgm) bgm.pause(); // プレイヤー敗北時はBGMを停止
        }
        document.getElementById('game-over-text').textContent = gameOverText;

        // 勝利時の「最初から」ボタンは、魔王戦の勝利時のみ表示されるようにする
        // または、特定の条件で非表示にするなどの調整が可能
        // 現在のロジックでは、win/loseどちらでもボタンが表示されるので、
        // winの場合は「続ける」などに変更するか、この表示自体をスキップする
        if (gameState === 'win' && !currentEnemy.isBoss) {
            document.getElementById('game-over').style.display = 'none'; // 通常の勝利時は非表示
        }
    } else { // gameState === 'battle'
        document.getElementById('battle-commands').style.display = 'grid';
        document.getElementById('game-over').style.display = 'none';
        if (bgm && !isMuted && bgm.paused) { // 戦闘中にBGMが停止していたら再生を試みる
            bgm.play().catch(e => console.log('BGM play failed on updateDisplay:', e));
        }
    }
}

// ログ関係の改良
function addLog(message, className = '') {
    logMessages.push({ message, className });
    if (!logTimer) {
        displayNextLog();
    }
}

function displayNextLog() {
    if (currentLogIndex >= logMessages.length) {
        clearLogTimer();
        checkBattleEnd();
        return;
    }

    const logContainer = document.getElementById('log-messages');
    const currentLog = logMessages[currentLogIndex];
    
    // 古いログを削除（最大3つまで表示）
    while (logContainer.children.length >= 3) {
        logContainer.removeChild(logContainer.firstChild);
    }
    
    const p = document.createElement('p');
    if (currentLog.className) p.classList.add(currentLog.className);
    p.textContent = currentLog.message;
    logContainer.appendChild(p);
    
    currentLogIndex++;
    
    // 次のログを1.5秒後に表示
    logTimer = setTimeout(() => {
        displayNextLog();
    }, 1500);
}

function clearLogTimer() {
    if (logTimer) {
        clearTimeout(logTimer);
        logTimer = null;
    }
}

const enemyDeathPoems = {
    'ゴブリン': [
        'ぐぬぬ…これが人間の力か…',
        'オレの宝物…誰にも渡さない…',
        'また…いつか…会おうぜ…'
    ],
    'オーク': [
        '肉…もっと食べたかった…',
        'オークの誇り…ここに散る…',
        '兄弟たちよ…後は頼んだ…'
    ],
    'スケルトン': [
        '骨まで砕かれるとは…無念…',
        '風に…還る時が来たか…',
        'カラカラ…静かに眠ろう…'
    ],
    'ミミック': [
        '宝箱の中で…夢を見たかった…',
        '次は…もっと大きな獲物を…',
        'ふふ…油断は禁物だぞ…'
    ],
    'リトルドラゴン': [
        'まだ…空を飛びたかった…',
        '炎が…消えていく…',
        '兄さん…また会おう…'
    ],
    'ファングウルフ': [
        '群れの仲間たちよ…さようなら…',
        '月夜に…遠吠えを…',
        '牙が…折れたか…'
    ],
    'ロックゴーレム': [
        '岩の眠りに…戻る時…',
        '砕け散る…我が身よ…',
        '大地と共に…永遠に…'
    ],
    'ゾンビ': [
        'もう一度…生きたかった…',
        '腐った体も…これまでか…',
        'うぅ…静かに…眠る…'
    ],
    'ゴースト': [
        'この世に…未練はない…',
        '霧のように…消えていく…',
        'ありがとう…さようなら…'
    ],
    '魔女': [
        'これが…勇者の力か…',
        '世界は…お前に託そう…',
        '闇は…また蘇る…'
    ],
    'メジェド': [
        'これが…勇者の力か…',
        '世界は…お前に託そう…',
        '闇は…また蘇る…'
    ],
    '破壊ロボ': [
        'これが…勇者の力か…',
        '世界は…お前に託そう…',
        '闇は…また蘇る…'
    ],
    '火の鳥': [
        'これが…勇者の力か…',
        '世界は…お前に託そう…',
        '闇は…また蘇る…'
    ],
    '海の化身': [
        'これが…勇者の力か…',
        '世界は…お前に託そう…',
        '闇は…また蘇る…'
    ],
    'みにどらご': [
        'これが…勇者の力か…',
        '世界は…お前に託そう…',
        '闇は…また蘇る…'
    ]
};

function checkBattleEnd() {
    if (!currentEnemy.isAlive() && gameState === 'battle') {
        gameState = 'win';
        player.addExp(currentEnemy.expReward);
        addLog(`${currentEnemy.name}を倒した！`);
        // // 辞世の句を表示
        // const poems = enemyDeathPoems[currentEnemy.name];
        // if (poems && poems.length > 0) {
        //     const poem = poems[Math.floor(Math.random() * poems.length)];
        //     addLog(`「${poem}」`, 'death-poem');
        // }
        
        // 魔王を倒した場合は特別処理
        if (currentEnemy.isBoss) {
            updateDisplay(); // 「魔王を倒した！」メッセージを表示
            setTimeout(() => {
                alert('おめでとうございます！魔王を倒して世界を救いました！');
                // 魔王撃破後は自動でゲームを終了するか、タイトルに戻すかなど
                // 現在は「最初から」ボタンで再開
            }, 2000);
        } else {
            // 通常の敵の場合は3秒後に次の戦闘へ
            setTimeout(() => {
                startNextBattle(); // ここで次の戦闘を開始
            }, 3000);
        }
    } else if (!player.isAlive() && gameState === 'battle') {
        gameState = 'lose';
        addLog('あなたは倒れた...');
        playSound(gameoverSound);
        // 死んだ時の状態を保存
        lastPlayerState = {
            level: player.level,
            exp: player.exp,
            nextLevelExp: player.nextLevelExp,
            maxHp: player.maxHp,
            maxMp: player.maxMp,
            attack: player.attack,
            knownMagic: JSON.parse(JSON.stringify(player.knownMagic))
        };
        updateDisplay();
    } else {
        // 戦闘継続の場合
        if (!isPlayerTurn && gameState === 'battle') {
            setTimeout(() => {
                enemyTurn();
            }, 1000);
        } else if (isPlayerTurn && gameState === 'battle') {
            updateDisplay();
        }
    }
}

function startNextBattle() {
    gameState = 'battle';
    document.getElementById('battle-commands').style.display = 'grid';
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('log-messages').innerHTML = ''; // ログをクリア
    logMessages = []; // ログメッセージ配列をリセット
    currentLogIndex = 0; // ログインデックスをリセット
    clearLogTimer(); // ログタイマーをクリア
    initGame(); // 新しい敵でゲームを初期化
    initAudio(); // BGMが止まっている場合に再開を試みる
}

// 魔法エフェクト
function showMagicEffectByName(name) {
    const effect = document.getElementById('magic-effect');
    if (!effect) return;
    effect.className = 'magic-effect';
    effect.style.display = 'block';
    if (name.includes('ファイアー')) effect.classList.add('fire-effect');
    else if (name.includes('アイスボルト')) effect.classList.add('ice-effect');
    else if (name.includes('サンダーストーム')) effect.classList.add('thunder-effect');
    else if (name.includes('ホーリーライト')) effect.classList.add('holy-effect');
    setTimeout(() => effect.style.display = 'none', 500);
}

// プレイヤー行動
function playerAttack() {
    if (!isPlayerTurn || gameState !== 'battle') return;
    playSound(attackPlayerSound); // 効果音再設定
    const damage = player.attack + Math.floor(Math.random() * 10);
    currentEnemy.takeDamage(damage);
    addLog(`勇者の攻撃！${currentEnemy.name}に${damage}のダメージ！`, 'damage');
    isPlayerTurn = false;
    updateDisplay();
}

function playerMagic() {
    if (!isPlayerTurn || gameState !== 'battle' || player.knownMagic.length === 0) return;
    const magic = player.knownMagic[player.knownMagic.length - 1];
    if (player.mp < magic.mpCost) {
        addLog('MPが足りない！');
        return;
    }
    player.useMp(magic.mpCost);
    showMagicEffectByName(magic.name);
    
    if (magic.type === 'attack') {
        let dmg = magic.damage + Math.floor(Math.random() * 10);
        // 弱点判定
        if (magic.element && currentEnemy.weakTo === magic.element) {
            dmg = Math.floor(dmg * 1.5);
            addLog('弱点を突いた！', 'damage');
        }
        currentEnemy.takeDamage(dmg);
        addLog(`勇者は${magic.name}を唱えた！${currentEnemy.name}に${dmg}のダメージ！`, 'damage');
    } else if (magic.type === 'heal') {
        player.heal(magic.healAmount);
        addLog(`勇者は${magic.name}を唱えた！HPが${magic.healAmount}回復！`, 'heal');
    } else if (magic.type === 'poison') {
        const poisonDamage = Math.floor(magic.damage * 0.5);
        if (magic.element && currentEnemy.weakTo === magic.element) {
            poisonDamage = Math.floor(poisonDamage * 1.5);
            addLog('弱点を突いた！', 'damage');
        }
        currentEnemy.takeDamage(poisonDamage);
        addLog(`${currentEnemy.name}は${magic.name}によって毒をうつ！${poisonDamage}のダメージ！`, 'damage');
    } else if (magic.type === 'buff') {
        currentEnemy.attack += magic.buffAmount;
        addLog(`${currentEnemy.name}の攻撃力が${magic.buffAmount}上がった！`, 'buff');
        setTimeout(() => {
            currentEnemy.attack -= magic.buffAmount;
            addLog(`${currentEnemy.name}の攻撃力が元に戻った！`, 'buff');
        }, magic.buffTurns * 1000);
    }
    isPlayerTurn = false;
    updateDisplay();
}

function playerHeal() {
    if (!isPlayerTurn || gameState !== 'battle' || player.mp < 5) return;
    player.useMp(5);
    const heal = 20 + Math.floor(Math.random() * 10);
    player.heal(heal);
    addLog(`勇者は回復した！HPが${heal}回復！`, 'heal');
    isPlayerTurn = false;
    updateDisplay();
}

function runAway() {
    if (!isPlayerTurn || gameState !== 'battle') return;
    
    // 魔王からは逃げられない
    if (currentEnemy.isBoss) {
        addLog('魔王からは逃げられない！');
        isPlayerTurn = false;
        updateDisplay();
        return;
    }
    
    if (Math.random() > 0.3) {
        addLog('逃げることに成功した！');
        setTimeout(() => {
            startNextBattle(); // 逃走成功時も次の戦闘へ
        }, 2000);
    } else {
        addLog('逃げることができなかった！');
        isPlayerTurn = false;
        updateDisplay();
    }
}

// 敵のターン
function enemyTurn() {
    if (gameState !== 'battle' || isPlayerTurn) return;
    
    const action = currentEnemy.getAction();
    let damage = 0;
    let actionName = '';
    
    switch (action) {
        case 'attack':
            damage = currentEnemy.attack + Math.floor(Math.random() * 5);
            actionName = '攻撃';
            break;
        case 'strongAttack':
            damage = Math.floor(currentEnemy.attack * 1.5) + Math.floor(Math.random() * 8);
            actionName = '強攻撃';
            break;
        case 'magicAttack':
            damage = Math.floor(currentEnemy.attack * 1.3) + Math.floor(Math.random() * 10);
            actionName = '魔法攻撃';
            break;
        case 'specialAttack':
            // 特殊攻撃の演出・ダメージ例
            if (currentEnemy.specialAttack) {
                actionName = currentEnemy.specialAttack.name;
                // 特殊攻撃のダメージは攻撃力の2倍＋α
                damage = Math.floor(currentEnemy.attack * 2) + Math.floor(Math.random() * 20);
                addLog(`【${currentEnemy.name}の必殺技！】${actionName}！`, 'special');
                addLog(`効果: ${currentEnemy.specialAttack.effect}`, 'special');
            } else {
                actionName = '必殺技';
                damage = Math.floor(currentEnemy.attack * 2) + Math.floor(Math.random() * 20);
            }
            break;
    }
    playSound(attackEnemySound); // 効果音再設定
    player.takeDamage(damage);
    addLog(`${currentEnemy.name}の${actionName}！勇者に${damage}のダメージ！`, 'damage');
    isPlayerTurn = true;
}

// ゲーム開始・再開
function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-content').style.display = 'block';
    initGame();
    initAudio(); // ゲーム開始時にBGMを再生
}

function restartGame() {
    document.getElementById('battle-commands').style.display = 'grid';
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('log-messages').innerHTML = '';
    logMessages = [];
    currentLogIndex = 0;
    clearLogTimer();
    // プレイヤーをリセット
    if (lastPlayerState) {
        player = new Character('勇者', lastPlayerState.maxHp, lastPlayerState.maxMp, lastPlayerState.attack, '🛡️', lastPlayerState.level, lastPlayerState.exp, lastPlayerState.nextLevelExp);
        player.knownMagic = JSON.parse(JSON.stringify(lastPlayerState.knownMagic));
        player.hp = player.maxHp;
        player.mp = player.maxMp;
    } else {
        player = new Character('勇者', 100, 50, 20, '🛡️');
    }
    if (bgm) bgm.pause();
    initGame();
    initAudio();
}

// 起動処理
window.addEventListener('load', () => {
    document.getElementById('start-button').addEventListener('click', startGame);
    // ページロード時にオーディオ初期化を呼ぶことで、ユーザーインタラクションなしでBGM再生を試みるのを避ける
    // BGMの再生は startGame() でユーザーインタラクション後に開始する
});

// 音関係
function playSound(audio) {
    if (audio && !isMuted) {
        audio.currentTime = 0; // 短い効果音は毎回最初から再生
        audio.play().catch(() => {});
    }
}

function toggleMute() {
    isMuted = !isMuted;
    const muteBtn = document.getElementById('mute-btn');
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
    if (isMuted) {
        stopAllSounds();
    } else {
        if (gameState === 'battle' && bgm) {
            bgm.play().catch(() => {}); // ミュート解除時、戦闘中ならBGMを再生
        }
    }
}

function changeVolume() {
    const volume = document.getElementById('volume-slider').value / 100;
    if (bgm) bgm.volume = volume * 0.3;
    if (levelupSound) levelupSound.volume = volume;
    if (attackPlayerSound) attackPlayerSound.volume = volume;
    if (attackEnemySound) attackEnemySound.volume = volume;
    if (gameoverSound) gameoverSound.volume = volume;
}