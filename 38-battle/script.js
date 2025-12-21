// 簡易BGM制御
let audioCtx;
let bgmTimer;

function ensureAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playSweep({ startF = 600, endF = 300, duration = 0.25, type = 'square', volume = 0.12 }) {
    const ctx = ensureAudioCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startF, t);
    osc.frequency.exponentialRampToValueAtTime(endF, t + duration);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.05);
}

function playShotSound(spec) {
    const pattern = spec.pattern || 'single';
    switch(pattern) {
        case 'burst': // マシンガン/フレア
            playSweep({ startF: 950, endF: 520, duration: 0.13, type: 'square', volume: 0.08 });
            break;
        case 'spread': // ショットガン/フォグ
            playSweep({ startF: 780, endF: 280, duration: 0.18, type: 'sawtooth', volume: 0.12 });
            playSweep({ startF: 520, endF: 240, duration: 0.16, type: 'triangle', volume: 0.07 });
            break;
        case 'laser': // レーザー/ハイドロ/グリッチ/ビット
            playSweep({ startF: 1400, endF: 900, duration: 0.22, type: 'triangle', volume: 0.1 });
            break;
        case 'rocket': // ロケット/クラッシュ
            playSweep({ startF: 260, endF: 90, duration: 0.32, type: 'sawtooth', volume: 0.14 });
            break;
        default: // ピストル
            playSweep({ startF: 820, endF: 420, duration: 0.16, type: 'square', volume: 0.1 });
    }
}

function startMusic() {
    ensureAudioCtx();
    const tempo = 116;
    const beat = 60 / tempo;
    const bassLine = [55, 55, 73, 55, 62, 62, 82, 62]; // A1ベースにサブメロ
    const lead = [440, 494, 523, 587, 494, 440, 392, 440];
    let step = 0;

    bgmTimer = setInterval(() => {
        const t = audioCtx.currentTime;
        const bassFreq = bassLine[step % bassLine.length];
        const leadFreq = lead[step % lead.length];

        const bassOsc = audioCtx.createOscillator();
        const bassGain = audioCtx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassFreq, t);
        bassGain.gain.setValueAtTime(0.06, t);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, t + beat * 0.8);
        bassOsc.connect(bassGain).connect(audioCtx.destination);
        bassOsc.start(t);
        bassOsc.stop(t + beat);

        const leadOsc = audioCtx.createOscillator();
        const leadGain = audioCtx.createGain();
        leadOsc.type = 'triangle';
        leadOsc.frequency.setValueAtTime(leadFreq, t);
        leadOsc.frequency.linearRampToValueAtTime(leadFreq * 1.03, t + beat * 0.5);
        leadGain.gain.setValueAtTime(0.05, t);
        leadGain.gain.exponentialRampToValueAtTime(0.0001, t + beat * 0.9);
        leadOsc.connect(leadGain).connect(audioCtx.destination);
        leadOsc.start(t);
        leadOsc.stop(t + beat);

        step++;
    }, beat * 1000);
}

function stopMusic() {
    if (bgmTimer) {
        clearInterval(bgmTimer);
        bgmTimer = null;
    }
    if (audioCtx) {
        audioCtx.suspend();
    }
}

// ゲーム状態管理
class GameState {
    constructor() {
        this.currentStage = 1;
        this.maxStage = 7;
        this.playerHP = 100;
        this.maxHP = 100;
        this.currentWeapon = 0;
        this.unlockedWeapons = ['ピストル', 'マシンガン', 'ショットガン', 'レーザーガン', 'ロケットランチャー'];
        this.gameRunning = false;
        this.gamePaused = false;
    }

    reset() {
        this.currentStage = 1;
        this.playerHP = 100;
        this.currentWeapon = 0;
        this.unlockedWeapons = ['ピストル', 'マシンガン', 'ショットガン', 'レーザーガン', 'ロケットランチャー'];
        this.gameRunning = false;
        this.gamePaused = false;
    }
}

// 武器ごとの派手な挙動設定
const defaultWeaponOrder = ['ピストル', 'マシンガン', 'ショットガン', 'レーザーガン', 'ロケットランチャー'];
const weaponSpecMap = {
    'ピストル': { pattern: 'single', speed: 15, damage: 14, color: '#ffff66', width: 6, height: 6, life: 180, pierce: 0 },
    'マシンガン': { pattern: 'burst', bullets: 3, spread: 10, speed: 17, damage: 7, color: '#55ffff', width: 5, height: 5, life: 120, pierce: 0, shake: 1 },
    'ショットガン': { pattern: 'spread', bullets: 5, spread: 18, speed: 13, damage: 6, color: '#ff8800', width: 6, height: 6, life: 60, pierce: 0, waveAmplitude: 2 },
    'レーザーガン': { pattern: 'laser', speed: 22, damage: 18, color: '#ff55ff', width: 8, height: 14, life: 90, pierce: 3, waveAmplitude: 10, waveSpeed: 8 },
    'ロケットランチャー': { pattern: 'rocket', speed: 10, damage: 28, color: '#ff4444', width: 12, height: 12, life: 140, pierce: 0, explosionRadius: 80 },
    'ビットブラスター': { pattern: 'laser', speed: 24, damage: 20, color: '#7cf2ff', width: 10, height: 16, life: 100, pierce: 4, waveAmplitude: 12, waveSpeed: 6 },
    'クラッシュランチャー': { pattern: 'rocket', speed: 11, damage: 30, color: '#c7ff6b', width: 12, height: 12, life: 140, pierce: 0, explosionRadius: 90 },
    'フォグスプレッダー': { pattern: 'spread', bullets: 7, spread: 22, speed: 12, damage: 6, color: '#e088ff', width: 6, height: 6, life: 70, pierce: 0, waveAmplitude: 6, waveSpeed: 5 },
    'フレアショット': { pattern: 'burst', bullets: 4, spread: 12, speed: 18, damage: 8, color: '#ffaa33', width: 7, height: 7, life: 120, pierce: 1 },
    'ハイドロウェーブ': { pattern: 'laser', speed: 20, damage: 16, color: '#00ffee', width: 8, height: 14, life: 110, pierce: 2, waveAmplitude: 18, waveSpeed: 4 },
    'グリッチレーザー': { pattern: 'laser', speed: 24, damage: 22, color: '#ff3366', width: 10, height: 16, life: 100, pierce: 5, waveAmplitude: 4, waveSpeed: 3 }
};

function getWeaponSpec(index) {
    const name = gameState.unlockedWeapons[index];
    return weaponSpecMap[name] || weaponSpecMap[defaultWeaponOrder[index % defaultWeaponOrder.length]] || weaponSpecMap['ピストル'];
}

// プレイヤークラス
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 48;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpPower = 15;
        this.onGround = false;
        this.facing = 1; // 1: 右, -1: 左
        this.animFrame = 0;
        this.animTimer = 0;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.image = heroImage;
    }

    update() {
        // 重力適用
        this.velocityY += 0.8;
        
        // 位置更新
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // 地面判定
        if (this.y > canvas.height - 100 - this.height) {
            this.y = canvas.height - 100 - this.height;
            this.velocityY = 0;
            this.onGround = true;
        }
        
        // 画面端判定
        if (this.x < 0) this.x = 0;
        if (this.x > worldWidth - this.width) this.x = worldWidth - this.width;
        
        // 摩擦
        this.velocityX *= 0.8;
        
        // アニメーション
        this.animTimer++;
        if (this.animTimer > 10) {
            this.animFrame = (this.animFrame + 1) % 4;
            this.animTimer = 0;
        }
        
        // 無敵時間
        if (this.invulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }
    }

    moveLeft() {
        this.velocityX = -this.speed;
        this.facing = -1;
    }

    moveRight() {
        this.velocityX = this.speed;
        this.facing = 1;
    }

    jump() {
        if (this.onGround) {
            this.velocityY = -this.jumpPower;
            this.onGround = false;
        }
    }

    takeDamage(amount) {
        if (!this.invulnerable) {
            gameState.playerHP -= amount;
            this.invulnerable = true;
            this.invulnerableTimer = 60; // 1秒無敵
            updateHUD();

            if (gameState.playerHP <= 0) {
                gameState.playerHP = 0;
                gameOver();
            }
        }
    }

    shoot() {
        const bulletX = this.x + (this.facing > 0 ? this.width : 0);
        const bulletY = this.y + this.height / 2;
        const spec = getWeaponSpec(gameState.currentWeapon);
        const pattern = spec.pattern || 'single';

        const spawnBullet = (offsetY = 0, angle = 0) => {
            bullets.push(new Bullet(bulletX, bulletY + offsetY, this.facing, spec, angle));
        };

        switch(pattern) {
            case 'burst':
                for (let i = 0; i < (spec.bullets || 3); i++) {
                    const angle = ((Math.random() * 2 - 1) * (spec.spread || 8)) * Math.PI / 180;
                    spawnBullet(0, angle);
                }
                break;
            case 'spread':
                for (let i = 0; i < (spec.bullets || 5); i++) {
                    const angle = ((i - ((spec.bullets || 5) - 1) / 2) * (spec.spread || 12)) * Math.PI / 180;
                    spawnBullet(0, angle);
                }
                break;
            default: // single / laser / rocket etc.
                spawnBullet(0, 0);
        }
        playShotSound(spec);
        createMuzzleFlash(bulletX, bulletY, spec.color || '#ffffaa');
    }

    draw(ctx) {
        ctx.save();
        
        // 無敵時の点滅効果
        if (this.invulnerable && Math.floor(this.invulnerableTimer / 5) % 2) {
            ctx.globalAlpha = 0.5;
        }
        
        if (this.image && this.image.complete && this.image.naturalWidth !== 0) {
            const drawX = this.facing > 0 ? this.x : this.x + this.width;
            const scaleX = this.facing > 0 ? 1 : -1;
            ctx.translate(drawX, this.y);
            ctx.scale(scaleX, 1);
            ctx.drawImage(this.image, 0, 0, this.width, this.height);
        } else {
            // フォールバック描画
            ctx.fillStyle = '#00ff41';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = '#ffffff';
            const eyeY = this.y + 10;
            if (this.facing > 0) {
                ctx.fillRect(this.x + 20, eyeY, 4, 4);
                ctx.fillRect(this.x + 26, eyeY, 4, 4);
            } else {
                ctx.fillRect(this.x + 2, eyeY, 4, 4);
                ctx.fillRect(this.x + 8, eyeY, 4, 4);
            }
        }
        
        ctx.restore();
    }
}

// 弾丸クラス
class Bullet {
    constructor(x, y, direction, spec, angleOffset = 0) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.weaponSpec = spec;
        this.speed = spec.speed || 12;
        this.width = spec.width || 6;
        this.height = spec.height || 6;
        this.life = spec.life || 120;
        const boostMultiplier = damageBoostTimer > 0 ? 1.6 : 1;
        this.damage = (spec.damage || 10) * boostMultiplier;
        this.pierce = spec.pierce || 0;
        this.waveAmplitude = spec.waveAmplitude || 0;
        this.waveSpeed = spec.waveSpeed || 0;
        this.explosionRadius = spec.explosionRadius || 0;
        this.age = 0;
        this.angleOffset = angleOffset;
        this.trail = [];

        this.color = spec.color || '#ffff00';
        const baseVX = Math.cos(angleOffset) * this.speed * this.direction;
        const baseVY = Math.sin(angleOffset) * this.speed;
        this.vx = baseVX;
        this.vy = baseVY;
    }

    update() {
        this.age++;
        this.x += this.vx;
        this.y += this.vy;

        if (this.waveAmplitude) {
            this.y += Math.sin((this.age + this.waveSpeed) / (this.waveSpeed || 6)) * this.waveAmplitude * 0.5;
        }

        this.trail.push({x: this.x, y: this.y, alpha: 1});
        this.trail.forEach(p => p.alpha -= 0.1);
        this.trail = this.trail.filter(p => p.alpha > 0);
        this.life--;
    }

    draw(ctx) {
        this.trail.forEach(p => {
            ctx.globalAlpha = p.alpha * 0.8;
            ctx.fillStyle = this.color;
            ctx.fillRect(p.x, p.y, this.width + 2, this.height + 2);
        });
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 16;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(this.x - 1, this.y - 1, this.width + 2, this.height + 2);
        ctx.restore();
    }

    isOffScreen() {
        const out = this.x < -50 || this.x > worldWidth + 50 || this.y < -50 || this.y > canvas.height + 50;
        return out || this.life <= 0;
    }
}

// 敵クラス
class Enemy {
    constructor(x, y, type = 'basic') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 24;
        this.height = 24;
        this.hp = 30;
        this.maxHP = 30;
        this.speed = 1;
        this.direction = -1;
        this.animFrame = 0;
        this.animTimer = 0;
        this.shootTimer = 0;
        this.jumpTimer = 0;
        this.damage = 10;
        this.velocityY = 0;
        this.color = '#3366ff';
        this.image = null;
        const stageNum = gameState.currentStage;

        if (type === 'jumper') {
            this.color = '#6699ff';
        } else if (type === 'shooter') {
            this.color = '#3355ff';
            this.speed = 0;
        } else if (type === 'runner') {
            this.color = '#33ccff';
            this.speed = 3;
        } else if (type === 'boss') {
            this.width = 64 * 1.5;
            this.height = 64 * 1.5;
            this.hp = 100;
            this.maxHP = 100;
            this.damage = 20;
            this.speed = 2;
            this.color = '#ff0000';
            const stageBossImageMap = {
                1: 'images/boss_stage1.svg',
                2: 'images/boss_stage2.svg',
                3: 'images/boss_stage3.svg',
                4: 'images/boss_stage4.svg',
                5: 'images/boss_stage5.svg',
                6: 'images/boss_stage6.svg',
                7: 'images/boss_stage7.svg'
            };
            this.image = new Image();
            this.image.src = stageBossImageMap[stageNum] || 'images/boss_default.svg';
        }

        if (type !== 'boss') {
            const stageInfo = stageData[gameState.currentStage - 1] || {};
            this.color = stageInfo.enemyColor || '#3366ff';

            const stageSizeMultiplier = {
                1: 1.0,
                2: 1.1,
                3: 0.9,
                4: 1.2,
                5: 1.0,
                6: 1.3,
                7: 1.5
            };

            const scale = stageSizeMultiplier[gameState.currentStage] || 1.0;
            this.width *= scale;
            this.height *= scale;

            const stageEnemyImageMap = {
                1: 'images/enemy_stage1.svg',
                2: 'images/enemy_stage2.svg',
                3: 'images/enemy_stage3.svg',
                4: 'images/enemy_stage4.svg',
                5: 'images/enemy_stage5.svg',
                6: 'images/enemy_stage6.svg',
                7: 'images/enemy_stage7.svg'
            };

            this.image = new Image();
            this.image.src = stageEnemyImageMap[gameState.currentStage] || 'images/enemy_default.svg';
        }
    }

    update() {
        // 重力
        this.velocityY += 0.8;
        this.y += this.velocityY;
        if (this.y > canvas.height - 100 - this.height) {
            this.y = canvas.height - 100 - this.height;
            this.velocityY = 0;
        }

        switch(this.type) {
            case 'jumper':
                this.jumpTimer++;
                if (this.jumpTimer > 120) {
                    this.velocityY = -15;
                    this.jumpTimer = 0;
                }
                this.x += this.speed * this.direction;
                if (this.x <= 0 || this.x >= worldWidth - this.width) {
                    this.direction *= -1;
                }
                break;
            case 'shooter':
                this.shootTimer++;
                if (this.shootTimer > 90) {
                    this.shoot();
                    this.shootTimer = 0;
                }
                break;
            case 'runner':
                this.direction = player.x < this.x ? -1 : 1;
                this.x += this.speed * this.direction;
                this.x = Math.max(0, Math.min(this.x, worldWidth - this.width));
                break;
            case 'boss':
                this.bossBehavior();
                break;
            default:
                this.x += this.speed * this.direction;
                if (this.x <= 0 || this.x >= worldWidth - this.width) {
                    this.direction *= -1;
                }
        }

        if (this.checkCollision(player)) {
            player.takeDamage(this.damage);
        }

        // アニメーション
        this.animTimer++;
        if (this.animTimer > 20) {
            this.animFrame = (this.animFrame + 1) % 2;
            this.animTimer = 0;
        }
    }

    shoot(offsetAngle = 0) {
        // プレイヤーに向かって弾を撃つ
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const vx = (dx / distance) * 5;
        const vy = (dy / distance) * 5;
        
        enemyBullets.push(new EnemyBullet(
            this.x + this.width / 2,
            this.y + this.height / 2,
            vx * Math.cos(offsetAngle) - vy * Math.sin(offsetAngle),
            vx * Math.sin(offsetAngle) + vy * Math.cos(offsetAngle)
        ));
    }

    takeDamage(amount) {
        this.hp -= amount;
        return this.hp <= 0;
    }

    checkCollision(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }

    draw(ctx) {
        if (this.image && this.image.complete && this.image.naturalWidth !== 0) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.save();
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        }

        if (this.type === 'boss') {
            const barWidth = this.width;
            const barHeight = 4;
            const hpRatio = this.hp / this.maxHP;

            ctx.fillStyle = '#333333';
            ctx.fillRect(this.x, this.y - 8, barWidth, barHeight);

            ctx.fillStyle = hpRatio > 0.5 ? '#00ff00' : hpRatio > 0.25 ? '#ffff00' : '#ff0000';
            ctx.fillRect(this.x, this.y - 8, barWidth * hpRatio, barHeight);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + 4, this.y + 6, 3, 3);
            ctx.fillRect(this.x + this.width - 7, this.y + 6, 3, 3);
        }
    }

    bossBehavior() {
        const stageNum = gameState.currentStage;
        this.shootTimer++;
        this.jumpTimer++;

        // 共通左右往復（広い世界幅対応）
        this.x += this.speed * this.direction;
        if (this.x <= 0 || this.x >= worldWidth - this.width) {
            this.direction *= -1;
        }

        // ステージ別ペルソナ挙動
        switch(stageNum) {
            case 1: // ゆっくり浮遊しつつ射撃
                if (this.shootTimer > 80) {
                    this.shoot();
                    this.shootTimer = 0;
                }
                if (this.jumpTimer > 120) {
                    this.velocityY = -8;
                    this.jumpTimer = 0;
                }
                break;
            case 2: // ダッシュ接近
                if (this.shootTimer > 110) {
                    this.shoot();
                    this.shootTimer = 0;
                }
                if (Math.abs(player.x - this.x) > 200) {
                    this.direction = player.x < this.x ? -1 : 1;
                    this.x += this.direction * 3.5;
                }
                break;
            case 3: // 高跳び＆拡散射撃
                if (this.jumpTimer > 90) {
                    this.velocityY = -14;
                    this.jumpTimer = 0;
                }
                if (this.shootTimer > 70) {
                    for (let i = -1; i <= 1; i++) {
                        this.shoot(i * 0.25);
                    }
                    this.shootTimer = 0;
                }
                break;
            case 4: // ジグザグ突進
                this.x += Math.sin(this.shootTimer * 0.1) * 4;
                if (this.shootTimer > 85) {
                    this.shoot();
                    this.shootTimer = 0;
                }
                break;
            case 5: // 連続ジャンプ＋連射
                if (this.jumpTimer > 60) {
                    this.velocityY = -11;
                    this.jumpTimer = 0;
                }
                if (this.shootTimer > 50) {
                    this.shoot();
                    this.shoot();
                    this.shootTimer = 0;
                }
                break;
            case 6: // 小さなテレポート風移動
                if (this.jumpTimer > 120) {
                    const shift = (Math.random() * 2 - 1) * 200;
                    this.x = Math.max(100, Math.min(worldWidth - this.width - 100, this.x + shift));
                    this.jumpTimer = 0;
                }
                if (this.shootTimer > 65) {
                    for (let i = -1; i <= 1; i++) this.shoot(i * 0.15);
                    this.shootTimer = 0;
                }
                break;
            case 7: // 怒りモード：高速左右＆連射
                this.speed = 3.5;
                if (this.shootTimer > 45) {
                    for (let i = -1; i <= 1; i++) this.shoot(i * 0.2);
                    this.shootTimer = 0;
                }
                break;
            default:
                if (this.shootTimer > 90) {
                    this.shoot();
                    this.shootTimer = 0;
                }
        }
    }
}

// 敵の弾丸クラス
class EnemyBullet {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = 6;
        this.height = 6;
        this.damage = 15;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }

    isOffScreen() {
        return this.x < -50 || this.x > worldWidth + 50 ||
               this.y < -50 || this.y > canvas.height + 50;
    }

    checkCollision(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}

// 戦略アイテム
class StrategyItem {
    constructor(x, y, type = 'power') {
        this.x = x;
        this.y = y;
        this.type = type; // power:攻撃強化, heal:回復
        this.width = 20;
        this.height = 20;
        this.life = 1200;
    }

    update() {
        this.life--;
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowColor = this.type === 'power' ? '#00ffcc' : '#ffcc00';
        ctx.shadowBlur = 12;
        ctx.fillStyle = this.type === 'power' ? '#00ffcc' : '#ffcc00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#000';
        ctx.font = '12px monospace';
        ctx.fillText(this.type === 'power' ? 'P' : 'H', this.x + 5, this.y + 14);
        ctx.restore();
    }
}

// ゲーム変数
let canvas, ctx;
let gameState;
let player;
let enemies = [];
let bullets = [];
let enemyBullets = [];
let explosions = [];
let muzzleFlashes = [];
let strategyItems = [];
let keys = {};
let lastTime = 0;
let fireInterval;
let hudHpFill, enemyCountEl, bulletCountEl;
const activeTouches = new Set();
let nextStageTimeout; // 次ステージへの自動移行用タイマー
let endingParticles = [];
let endingAnimationId = null;
let heroImage = null;
let worldWidth = 2200;
let cameraX = 0;
let damageBoostTimer = 0;

// ステージ情報
const stageData = [
    { name: "ステージ1: バイナリー街道", boss: "ビットマスター", weapon: "ビットブラスター", enemyColor: '#3366ff', background: ['#001122', '#003366'] },
    { name: "ステージ2: データ地下道", boss: "クラッシュワーム", weapon: "クラッシュランチャー", enemyColor: '#00cc88', background: ['#001f00', '#003300'] },
    { name: "ステージ3: クラウドタワー", boss: "フォグキーパー", weapon: "フォグスプレッダー", enemyColor: '#ff55cc', background: ['#110011', '#330033'] },
    { name: "ステージ4: ファイアウォール工場", boss: "フレアマシーン", weapon: "フレアショット", enemyColor: '#ffaa00', background: ['#331100', '#663300'] },
    { name: "ステージ5: サイバー海峡", boss: "ハイドロコード", weapon: "ハイドロウェーブ", enemyColor: '#00ffee', background: ['#001133', '#004477'] },
    { name: "ステージ6: バグ廃墟", boss: "グリッチキング", weapon: "グリッチレーザー", enemyColor: '#ff3333', background: ['#220000', '#440000'] },
    { name: "ステージ7: 中央制御塔", boss: "エラーオメガ", weapon: null, enemyColor: '#ffffff', background: ['#000000', '#333333'] }
];

// 初期化
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // アセット読み込み（主人公）
    if (!heroImage) {
        heroImage = new Image();
        heroImage.src = 'images/hero.svg';
    }

    // キャンバスサイズ設定
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        for (let touch of e.touches) {
            activeTouches.add(touch.identifier);
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        for (let touch of e.changedTouches) {
            activeTouches.delete(touch.identifier);
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
    
    // ゲーム状態初期化
    gameState = new GameState();

    // イベントリスナー設定
    setupEventListeners();

    hudHpFill = document.getElementById('hudHpFill');
    enemyCountEl = document.getElementById('enemyCount');
    bulletCountEl = document.getElementById('bulletCount');

    // タイトル画面表示
    showScreen('titleScreen');
}

function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    worldWidth = Math.max(2200, canvas.width * 2);
}

function setupEventListeners() {
    // キーボード操作
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        keys[key] = true;

        if (!gameState.gameRunning) return;

        if (key === 'c') {
            switchWeapon();
            return;
        }

        if (gameState.gamePaused) return;

        switch(key) {
            case ' ':
                e.preventDefault();
                player.jump();
                break;
            case 'z':
            case 'x':
                player.shoot();
                break;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });
    
    // ボタン操作
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', startGame);
    document.getElementById('titleButton').addEventListener('click', () => {
        stopMusic();
        showScreen('titleScreen');
    });
    document.getElementById('nextStageButton').addEventListener('click', nextStage);
    document.getElementById('playAgainButton').addEventListener('click', () => {
        gameState.reset();
        setupWeaponSelect();
        updateWeaponDisplay();
        stopEndingShow();
        stopMusic();
        showScreen('titleScreen');
    });
    
    // タッチコントロール
    setupTouchControls();

    // 武器選択メニュー
    setupWeaponSelect();
}

function setupWeaponSelect() {
    const menu = document.getElementById('weaponSelect');
    if (!menu) return;
    menu.innerHTML = '';
    gameState.unlockedWeapons.forEach((weapon, index) => {
        const btn = document.createElement('button');
        btn.textContent = weapon;
        btn.dataset.weapon = index;
        btn.addEventListener('click', () => changeWeapon(index));
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            changeWeapon(index);
        });
        menu.appendChild(btn);
    });
}

function setupTouchControls() {
    const leftBtn = document.getElementById('btn-left');
    const rightBtn = document.getElementById('btn-right');
    const fireBtn = document.getElementById('btn-fire');
    const switchBtn = document.getElementById('btn-switch');
    const jumpBtn = document.getElementById('btn-jump');

    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveLeft();
    });
    leftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        stopMoveLeft();
    });

    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveRight();
    });
    rightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        stopMoveRight();
    });

    switchBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.gameRunning) switchWeapon();
    });
    switchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (gameState.gameRunning) switchWeapon();
    });

    fireBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        fire();
        fireInterval = setInterval(fire, 200);
    });
    fireBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        clearInterval(fireInterval);
    });

    jumpBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        jump();
    });
}

function moveLeft() {
    if (!gameState.gamePaused) keys['arrowleft'] = true;
}

function stopMoveLeft() {
    keys['arrowleft'] = false;
}

function moveRight() {
    if (!gameState.gamePaused) keys['arrowright'] = true;
}

function stopMoveRight() {
    keys['arrowright'] = false;
}

function fire() {
    if (gameState.gameRunning && !gameState.gamePaused) player.shoot();
}

function jump() {
    if (gameState.gameRunning && !gameState.gamePaused) player.jump();
}

function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function startGame() {
    stopMusic();
    stopEndingShow();
    gameState.reset();
    setupWeaponSelect();
    gameState.gameRunning = true;
    
    // プレイヤー初期化
    player = new Player(100, canvas.height * 0.5);
    
    // ステージ初期化
    initStage(gameState.currentStage);
    
    // UI更新
    updateUI();
    
    // ゲーム画面表示
    showScreen('gameScreen');

    // BGM 再生
    startMusic();

    // ゲームループ開始
    gameLoop();
}

function initStage(stageNum) {
    enemies = [];
    bullets = [];
    enemyBullets = [];
    muzzleFlashes = [];
    strategyItems = [];
    
    // ステージ情報更新
    document.getElementById('stageName').textContent = stageData[stageNum - 1].name;
    
    // プレイヤー初期配置（左端）
    if (player) {
        player.x = 40;
        player.y = canvas.height - 100 - player.height;
        player.velocityX = 0;
        player.velocityY = 0;
    }

    // ボス配置（右端）
    const bossX = worldWidth - 180;
    const bossHeight = 64 * 1.5;
    const bossY = canvas.height - 100 - bossHeight;
    enemies.push(new Enemy(bossX, bossY, 'boss'));

    // 敵配置
    const types = ['jumper', 'shooter', 'runner'];
    for (let i = 0; i < 3 + stageNum; i++) {
        const x = Math.max(120, bossX - 160 - i * 110);
        const y = canvas.height - 100 - 32;
        const type = types[Math.floor(Math.random() * types.length)];
        enemies.push(new Enemy(x, y, type));
    }

    // 戦略アイテム配置（攻撃バフ・回復）
    const laneY = canvas.height - 140;
    strategyItems.push(new StrategyItem(220, laneY, 'power'));
    strategyItems.push(new StrategyItem(bossX - 320, laneY, 'heal'));
}

function updateUI() {
    updateHUD();
    updateWeaponDisplay();
}

function updateWeaponDisplay() {
    const weaponName = gameState.unlockedWeapons[gameState.currentWeapon];
    document.getElementById('currentWeapon').textContent = `武器: ${weaponName}`;
}

function reloadWeapon() {
    // TODO: implement reloading
}

function switchWeapon() {
    const menu = document.getElementById('weaponSelect');
    menu.classList.toggle('hidden');
    gameState.gamePaused = !menu.classList.contains('hidden');
}

function changeWeapon(index) {
    gameState.currentWeapon = index;
    updateWeaponDisplay();
    document.getElementById('weaponSelect').classList.add('hidden');
    gameState.gamePaused = false;
}

function updateHUD() {
    const hpPercent = (gameState.playerHP / gameState.maxHP) * 100;
    const hpFill = document.getElementById('hpFill');
    if (hpFill) hpFill.style.width = hpPercent + '%';
    if (hudHpFill) hudHpFill.style.width = hpPercent + '%';
    if (enemyCountEl) enemyCountEl.textContent = enemies.length;
    if (bulletCountEl) bulletCountEl.textContent = bullets.length;
}

function gameLoop(currentTime = 0) {
    if (!gameState.gameRunning) return;
    
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    update();
    draw();
    
    requestAnimationFrame(gameLoop);
}

function update() {
    if (gameState.gamePaused) return;
    
    // カメラ追従
    cameraX = Math.max(0, Math.min(player.x - canvas.width * 0.35, worldWidth - canvas.width));
    
    // プレイヤー操作
    if (keys['arrowleft'] || keys['a']) {
        player.moveLeft();
    }
    if (keys['arrowright'] || keys['d']) {
        player.moveRight();
    }
    
    // プレイヤー更新
    player.update();
    
    // 敵更新
    enemies.forEach(enemy => enemy.update());
    
    // 弾丸更新
    bullets.forEach(bullet => bullet.update());
    enemyBullets.forEach(bullet => bullet.update());
    updateExplosions();
    updateMuzzleFlashes();
    strategyItems.forEach(item => item.update());
    strategyItems = strategyItems.filter(item => item.life > 0);
    if (damageBoostTimer > 0) damageBoostTimer--;
    
    // 衝突判定
    checkCollisions();

    // 不要オブジェクト削除
    bullets = bullets.filter(bullet => !bullet.isOffScreen());
    enemyBullets = enemyBullets.filter(bullet => !bullet.isOffScreen());
    enemies = enemies.filter(enemy => enemy.hp > 0);

    updateHUD();

    // ステージクリア判定（ボス撃破でクリア）
    if (!enemies.some(enemy => enemy.type === 'boss')) {
        stageClear();
    }
}

function checkCollisions() {
    // プレイヤー弾と敵の衝突（逆順で確実に削除）
    for (let bIndex = bullets.length - 1; bIndex >= 0; bIndex--) {
        const bullet = bullets[bIndex];
        let bulletRemoved = false;

        for (let eIndex = enemies.length - 1; eIndex >= 0; eIndex--) {
            const enemy = enemies[eIndex];
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {

                if (enemy.takeDamage(bullet.damage)) {
                    enemies.splice(eIndex, 1);
                }

                if (bullet.explosionRadius) {
                    createExplosion(bullet.x, bullet.y, bullet.explosionRadius, bullet.damage);
                    bulletRemoved = true;
                } else if (bullet.pierce > 0) {
                    bullet.pierce--;
                    bulletRemoved = bullet.pierce < 0;
                } else {
                    bulletRemoved = true;
                }
            }
            if (bulletRemoved) break;
        }

        if (bulletRemoved) {
            bullets.splice(bIndex, 1);
        }
    }
    
    // 敵弾とプレイヤーの衝突
    for (let bulletIndex = enemyBullets.length - 1; bulletIndex >= 0; bulletIndex--) {
        const bullet = enemyBullets[bulletIndex];
        if (bullet.checkCollision(player)) {
            player.takeDamage(bullet.damage);
            enemyBullets.splice(bulletIndex, 1);
        }
    }

    // 戦略アイテム取得
    for (let i = strategyItems.length - 1; i >= 0; i--) {
        const item = strategyItems[i];
        const collide = player.x < item.x + item.width &&
                        player.x + player.width > item.x &&
                        player.y < item.y + item.height &&
                        player.y + player.height > item.y;
        if (collide) {
            if (item.type === 'power') {
                damageBoostTimer = 600; // 10秒強化
            } else if (item.type === 'heal') {
                gameState.playerHP = Math.min(gameState.maxHP, gameState.playerHP + 40);
                updateHUD();
            }
            strategyItems.splice(i, 1);
        }
    }
}

function createExplosion(x, y, radius, damage) {
    const splashDamage = Math.max(5, Math.floor(damage * 0.8));
    explosions.push({ x, y, radius, life: 20, maxLife: 20 });

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dx = enemy.x + enemy.width / 2 - x;
        const dy = enemy.y + enemy.height / 2 - y;
        if (Math.hypot(dx, dy) <= radius) {
            if (enemy.takeDamage(splashDamage)) {
                enemies.splice(i, 1);
            }
        }
    }
}

function updateExplosions() {
    explosions.forEach(exp => exp.life--);
    explosions = explosions.filter(exp => exp.life > 0);
}

function drawExplosions(ctx) {
    explosions.forEach(exp => {
        const alpha = exp.life / exp.maxLife;
        const gradient = ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, exp.radius);
        gradient.addColorStop(0, `rgba(255,200,120,${alpha})`);
        gradient.addColorStop(0.5, `rgba(255,120,80,${alpha * 0.8})`);
        gradient.addColorStop(1, `rgba(255,80,80,0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function createMuzzleFlash(x, y, color) {
    muzzleFlashes.push({
        x,
        y,
        radius: 14,
        life: 10,
        color: color || '#ffffaa'
    });
}

function updateMuzzleFlashes() {
    muzzleFlashes.forEach(f => {
        f.radius += 2;
        f.life--;
    });
    muzzleFlashes = muzzleFlashes.filter(f => f.life > 0);
}

function drawMuzzleFlashes(ctx) {
    muzzleFlashes.forEach(f => {
        const alpha = f.life / 10;
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius);
        grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grad.addColorStop(0.4, `${hexToRgba(f.color, alpha * 0.9)}`);
        grad.addColorStop(1, `rgba(0,0,0,0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function hexToRgba(hex, alpha) {
    const c = hex.replace('#', '');
    const bigint = parseInt(c, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
}

function draw() {
    // ステージごとのグラデーション背景
    const stageInfo = stageData[gameState.currentStage - 1] || {};
    const colors = stageInfo.background || ['#001122', '#003366'];
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 星空エフェクト
    drawStars();
    
    ctx.save();
    ctx.translate(-cameraX, 0);

    // 地面
    ctx.fillStyle = '#444444';
    ctx.fillRect(0, canvas.height - 100, worldWidth, 100);
    
    ctx.fillStyle = '#666666';
    for (let i = 0; i < worldWidth; i += 50) {
        ctx.fillRect(i, canvas.height - 100, 2, 100);
    }
    
    // ゲームオブジェクト描画
    player.draw(ctx);
    enemies.forEach(enemy => enemy.draw(ctx));
    bullets.forEach(bullet => bullet.draw(ctx));
    enemyBullets.forEach(bullet => bullet.draw(ctx));
    drawExplosions(ctx);
    drawMuzzleFlashes(ctx);
    strategyItems.forEach(item => item.draw(ctx));

    ctx.restore();

    // drawDebugInfo();
}

function drawStars() {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
        const x = (i * 37) % canvas.width;
        const y = (i * 23) % (canvas.height - 100);
        const size = (i % 3) + 1;
        ctx.fillRect(x, y, size, size);
    }
}

function drawDebugInfo() {
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText(`ステージ: ${gameState.currentStage}`, 10, canvas.height - 80);
    ctx.fillText(`敵の数: ${enemies.length}`, 10, canvas.height - 60);
    ctx.fillText(`弾丸: ${bullets.length}`, 10, canvas.height - 40);
    ctx.fillText(`HP: ${gameState.playerHP}/${gameState.maxHP}`, 10, canvas.height - 20);
}

function stageClear() {
    gameState.gameRunning = false;
    
    const stageInfo = stageData[gameState.currentStage - 1];
    
    // クリアメッセージ設定
    document.getElementById('clearMessage').textContent = `${stageInfo.boss}を倒した！`;
    
    // 武器獲得処理
    if (stageInfo.weapon && !gameState.unlockedWeapons.includes(stageInfo.weapon)) {
        gameState.unlockedWeapons.push(stageInfo.weapon);
        if (gameState.unlockedWeapons.length > 5) {
            gameState.unlockedWeapons.shift();
            if (gameState.currentWeapon > 0) {
                gameState.currentWeapon--;
            }
        }
        setupWeaponSelect();
        updateWeaponDisplay();
        document.getElementById('weaponGet').textContent = `新武器：${stageInfo.weapon}を獲得！`;
        document.getElementById('weaponGet').style.display = 'block';
    } else {
        document.getElementById('weaponGet').style.display = 'none';
    }
    
    // 最終ステージチェック
    if (gameState.currentStage >= gameState.maxStage) {
        // ゲームクリア
        showScreen('gameCompleteScreen');
        updateEndingWeapons();
        startEndingShow();
    } else {
        // ステージクリア画面
        showScreen('stageClearScreen');
        // 一定時間後に自動で次のステージへ
        nextStageTimeout = setTimeout(nextStage, 2000);
    }
}

function nextStage() {
    // 自動移行用タイマーがある場合はクリア
    if (nextStageTimeout) {
        clearTimeout(nextStageTimeout);
        nextStageTimeout = null;
    }

    gameState.currentStage++;
    gameState.playerHP = gameState.maxHP; // HP全回復
    
    // プレイヤー位置リセット
    player.x = 40;
    player.y = canvas.height - 100 - player.height;
    player.velocityX = 0;
    player.velocityY = 0;
    
    // 新ステージ初期化
    initStage(gameState.currentStage);
    updateUI();
    
    // ゲーム再開
    gameState.gameRunning = true;
    showScreen('gameScreen');
    gameLoop();
}

function gameOver() {
    gameState.gameRunning = false;
    stopMusic();
    showScreen('gameOverScreen');
}

function updateEndingWeapons() {
    const container = document.getElementById('endingWeapons');
    const summary = document.getElementById('endingSummary');
    if (!container) return;
    container.innerHTML = '';

    const title = document.createElement('p');
    title.textContent = '獲得した兵装';
    title.className = 'ending-label';
    container.appendChild(title);

    gameState.unlockedWeapons.forEach((name, idx) => {
        const chip = document.createElement('span');
        chip.className = 'weapon-chip';
        chip.textContent = `${idx + 1}. ${name}`;
        container.appendChild(chip);
    });

    if (summary) {
        summary.textContent = `全${gameState.maxStage}ステージ制覇。バグフォースはコードに還元され、街のアクセス権は完全に解放された。`;
    }
}

function startEndingShow() {
    stopEndingShow();
    const canvas = document.getElementById('endingCanvas');
    if (!canvas) return;
    const parent = canvas.parentElement || document.body;
    canvas.width = parent.clientWidth;
    canvas.height = 220;
    const ctx2 = canvas.getContext('2d');
    endingParticles = [];

    const spawnFirework = () => {
        const colors = ['#00ffcc', '#ff66ff', '#ff4444', '#ffff66'];
        const particleCount = 24;
        const baseX = Math.random() * canvas.width;
        const baseY = 40 + Math.random() * (canvas.height * 0.4);
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 2.5;
            endingParticles.push({
                x: baseX,
                y: baseY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 80 + Math.random() * 40,
                color: colors[i % colors.length]
            });
        }
    };

    let spawnTimer = 0;
    const loop = () => {
        ctx2.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx2.fillRect(0, 0, canvas.width, canvas.height);

        if (spawnTimer <= 0) {
            spawnFirework();
            spawnTimer = 30 + Math.random() * 20;
        } else {
            spawnTimer--;
        }

        endingParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.02;
            p.life--;
        });
        endingParticles = endingParticles.filter(p => p.life > 0);

        endingParticles.forEach(p => {
            ctx2.save();
            ctx2.globalAlpha = Math.max(0, p.life / 120);
            ctx2.fillStyle = p.color;
            ctx2.shadowColor = p.color;
            ctx2.shadowBlur = 10;
            ctx2.beginPath();
            ctx2.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx2.fill();
            ctx2.restore();
        });

        endingAnimationId = requestAnimationFrame(loop);
    };

    loop();
}

function stopEndingShow() {
    if (endingAnimationId) {
        cancelAnimationFrame(endingAnimationId);
        endingAnimationId = null;
    }
    const canvas = document.getElementById('endingCanvas');
    if (canvas) {
        const ctx2 = canvas.getContext('2d');
        ctx2.clearRect(0, 0, canvas.width, canvas.height);
    }
    endingParticles = [];
}

// ゲーム開始
window.addEventListener('load', init);
