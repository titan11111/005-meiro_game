// 対称ゲーム JavaScript（Neon Ignite オーディオリアクティブ版 + 拡張機能）

// ▼▼▼ エフェクト用パーティクル（発光仕様） ▼▼▼
class Particle {
    constructor(x, y, colors, speedMultiplier = 1) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 10 + 2;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 15 * speedMultiplier;
        this.speedX = Math.cos(angle) * speed;
        this.speedY = Math.sin(angle) * speed;
        
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.life = 1.0;
        this.decay = Math.random() * 0.03 + 0.01;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedX *= 0.95;
        this.speedY *= 0.95;
        this.life -= this.decay;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class SymmetryGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        
        // 基本設定
        this.colors = ['#ff0055', '#00ffcc', '#0099ff', '#ccff00', '#ffcc00', '#ff00cc', '#ffffff'];
        this.colorEmojis = ['🔴', '🔵', '💧', '🟢', '🟡', '🟣', '⚪'];
        this.currentColorIndex = 0;
        
        this.brushSizes = [3, 8, 20]; 
        this.brushSizeNames = ['小', '中', '大'];
        this.currentSizeIndex = 1;
        
        this.symmetryModes = [2, 3, 4, 6, 8, 12]; // 3角形を作るために3を追加
        this.currentSymmetryIndex = 0;

        // ▼ 新機能：ブラシスタイルとツール ▼
        this.brushStyles = ['neon', 'spray', 'ribbon'];
        this.brushStyleNames = ['通常', 'スプレー', 'リボン'];
        this.currentStyleIndex = 0;

        this.drawTools = ['freehand', 'polygon'];
        this.drawToolNames = ['フリー', '多角形'];
        this.currentToolIndex = 0;
        
        this.drawingHistory = [];
        this.currentStrokePoints = [];
        this.startPos = {x: 0, y: 0}; // シェイプ描画の始点用
        
        this.isPlaying = false;
        this.animationId = null;
        this.playBtn = document.getElementById('playBtn');
        this.audioElement = document.getElementById('bgm');
        this.audioElement.volume = 0.6;

        this.audioCtx = null;
        this.analyser = null;
        this.dataArray = null;
        this.source = null;

        this.baseRotation = 0;
        this.beatScale = 1;
        this.particles = [];
        
        this.initCanvas();
        this.bindEvents();
        this.updateUI();
        
        this.drawAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    initCanvas() {
        const container = document.querySelector('.canvas-container');
        const maxWidth = Math.min(600, container.clientWidth - 20);
        const maxHeight = Math.min(600, window.innerHeight * 0.6);
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        if (this.drawingHistory.length > 0 && !this.isPlaying) {
             this.redrawHistory();
        }
    }
    
    bindEvents() {
        document.getElementById('clearBtn').addEventListener('click', () => this.clearCanvas());
        document.getElementById('colorBtn').addEventListener('click', () => this.changeColor());
        document.getElementById('modeBtn').addEventListener('click', () => this.changeSymmetryMode());
        document.getElementById('sizeBtn').addEventListener('click', () => this.changeBrushSize());
        
        // 新しいボタンイベント
        document.getElementById('styleBtn').addEventListener('click', () => this.changeBrushStyle());
        document.getElementById('toolBtn').addEventListener('click', () => this.changeDrawTool());
        
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.startDrawing(e.touches[0]); });
        this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.draw(e.touches[0]); });
        this.canvas.addEventListener('touchend', (e) => { e.preventDefault(); this.stopDrawing(); });
        
        window.addEventListener('resize', () => { setTimeout(() => this.initCanvas(), 100); });

        this.playBtn.addEventListener('click', () => this.toggleAnimation());
        this.audioElement.addEventListener('ended', () => { if (this.isPlaying) this.toggleAnimation(); });
    }

    setupAudioAnalyzer() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 256;
            this.source = this.audioCtx.createMediaElementSource(this.audioElement);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioCtx.destination);
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    toggleAnimation() {
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            this.setupAudioAnalyzer();
            this.playBtn.textContent = '■ STOP';
            this.playBtn.classList.add('playing');
            document.body.classList.add('neon-mode');
            
            this.audioElement.currentTime = 0;
            this.audioElement.play().catch(e => console.log("Audio play failed:", e));
            this.animate();
        } else {
            this.playBtn.textContent = '▶ MUSIC START';
            this.playBtn.classList.remove('playing');
            document.body.classList.remove('neon-mode');
            this.canvas.classList.remove('beat-hit');
            this.audioElement.pause();
            cancelAnimationFrame(this.animationId);
            
            this.baseRotation = 0;
            this.beatScale = 1;
            this.particles = [];
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.redrawHistory();
        }
    }

    animate() {
        if (!this.isPlaying) return;
        this.analyser.getByteFrequencyData(this.dataArray);
        
        let bassSum = 0;
        for(let i=0; i<10; i++) bassSum += this.dataArray[i];
        const bassLevel = bassSum / 10;
        
        let midSum = 0;
        for(let i=20; i<100; i++) midSum += this.dataArray[i];
        const midLevel = midSum / 80;

        const scaleEffect = (bassLevel / 255) * 0.4; 
        this.beatScale = 1.0 + scaleEffect;
        this.baseRotation += 0.002 + (midLevel / 255) * 0.02;

        if (bassLevel > 200) {
            document.body.style.background = `radial-gradient(circle, #4a00e0, #000)`;
            this.canvas.classList.add('beat-hit');
        } else {
            this.canvas.classList.remove('beat-hit');
        }

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawStoredPaths(bassLevel, midLevel);

        if (midLevel > 150 || Math.random() < 0.1) {
             const pCount = Math.floor(midLevel / 40);
             for(let i=0; i<pCount; i++) {
                 this.particles.push(new Particle(this.centerX, this.centerY, this.colors, 1 + (bassLevel/100)));
             }
        }
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            this.particles[i].draw(this.ctx);
            if (this.particles[i].life <= 0) this.particles.splice(i, 1);
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawStoredPaths(bassLevel, midLevel) {
        this.ctx.shadowBlur = 15 + (bassLevel / 10);
        
        this.drawingHistory.forEach((stroke) => {
            const symmetryCount = stroke.symmetryCount;
            const angleStep = (2 * Math.PI) / symmetryCount;
            
            const colorShift = Math.floor(midLevel / 30);
            const originalColorIndex = this.colors.indexOf(stroke.color);
            const dynamicColor = this.colors[(originalColorIndex + colorShift) % this.colors.length];
            
            this.ctx.strokeStyle = dynamicColor;
            this.ctx.fillStyle = dynamicColor; // スプレー用
            this.ctx.shadowColor = dynamicColor;
            this.ctx.lineWidth = stroke.size * (1 + bassLevel/300);

            // スタイル適用
            this.ctx.lineCap = stroke.style === 'ribbon' ? 'butt' : 'round';
            if (stroke.style === 'ribbon') this.ctx.lineWidth = stroke.size * (1 + bassLevel/300) * 0.5;

            // スプレーの場合はアニメーション中は点線のように描画して処理落ちを防ぐ
            if (stroke.style === 'spray') {
                this.ctx.setLineDash([1, stroke.size * 2]);
            } else {
                this.ctx.setLineDash([]);
            }

            for (let i = 0; i < symmetryCount; i++) {
                const angle = i * angleStep + this.baseRotation;
                
                this.ctx.save();
                this.ctx.translate(this.centerX, this.centerY);
                this.ctx.rotate(angle);
                this.ctx.scale(this.beatScale, this.beatScale);
                this.ctx.translate(-this.centerX, -this.centerY);

                if (stroke.points.length > 1) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
                    for (let j = 1; j < stroke.points.length; j++) {
                        this.ctx.lineTo(stroke.points[j].x, stroke.points[j].y);
                    }
                    this.ctx.stroke();

                    // ミラー
                    if (symmetryCount > 2) {
                         this.ctx.beginPath();
                         let startRefX = this.centerX - (stroke.points[0].x - this.centerX);
                         this.ctx.moveTo(startRefX, stroke.points[0].y);
                         for (let j = 1; j < stroke.points.length; j++) {
                             let refX = this.centerX - (stroke.points[j].x - this.centerX);
                             this.ctx.lineTo(refX, stroke.points[j].y);
                         }
                         this.ctx.stroke();
                    }
                }
                this.ctx.restore();
            }
        });
        
        this.ctx.shadowBlur = 0;
        this.ctx.setLineDash([]); // リセット
    }

    // ▼▼▼ 描画ロジック（拡張版） ▼▼▼
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }
    
    startDrawing(e) {
        if (this.isPlaying) return;
        if (this.drawAudioCtx.state === 'suspended') this.drawAudioCtx.resume();
        
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
        this.startPos = { x: pos.x, y: pos.y }; // 多角形用
        
        if (this.drawTools[this.currentToolIndex] === 'freehand') {
            this.currentStrokePoints = [{x: pos.x, y: pos.y}];
            // クリックした瞬間も点を打つ
            this.drawSymmetric(pos.x, pos.y, pos.x, pos.y);
        } else {
            // 多角形モード開始
            this.currentStrokePoints = []; 
        }
    }
    
    draw(e) {
        if (!this.isDrawing || this.isPlaying) return;
        const pos = this.getMousePos(e);

        if (this.drawTools[this.currentToolIndex] === 'freehand') {
            // フリーハンド描画
            this.drawSymmetric(this.lastX, this.lastY, pos.x, pos.y);
            this.currentStrokePoints.push({x: pos.x, y: pos.y});
            this.lastX = pos.x;
            this.lastY = pos.y;
            this.playDrawSound(pos.x, pos.y);
        } else {
            // 多角形プレビュー描画（一度消して再描画することでアニメーションさせる）
            // 注意: 重くなりすぎないように履歴が多すぎる場合は制限が必要だが、今回は簡易実装
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.redrawHistory(); // 確定済みの線を描画
            
            // 現在の多角形プレビューを計算して描画
            const polygonPoints = this.calculatePolygonPoints(this.startPos, pos);
            this.drawSymmetricPolyPreview(polygonPoints);
        }
    }

    // 正多角形の頂点を計算（中心は startPos, 半径はマウス距離）
    calculatePolygonPoints(center, mousePos) {
        const radius = Math.hypot(mousePos.x - center.x, mousePos.y - center.y);
        const startAngle = Math.atan2(mousePos.y - center.y, mousePos.x - center.x);
        const sides = this.symmetryModes[this.currentSymmetryIndex];
        const points = [];
        
        for (let i = 0; i <= sides; i++) { // 閉じるために一周する
            const angle = startAngle + (i * 2 * Math.PI / sides);
            points.push({
                x: center.x + Math.cos(angle) * radius,
                y: center.y + Math.sin(angle) * radius
            });
        }
        return points;
    }
    
    playDrawSound(x, y) {
        // 音声処理（省略）
    }
    
    stopDrawing() {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        
        const currentTool = this.drawTools[this.currentToolIndex];
        
        if (currentTool === 'polygon') {
            // マウスアップ時点で多角形を確定
            // 最後のマウス位置を取得する必要があるが、mousemoveの最後の状態を使う
            // 簡易的に：mousemoveが一度も発火してない場合は何もしない
             // 多角形モードの場合、currentStrokePoints は空なので、ここで生成して保存する
             // ただし、draw内で計算していないため、イベントオブジェクトがない...
             // 修正: draw内で保存しておくか、ここでもう一度計算するか。
             // 簡易ハック: 直前のプレビューが残っているので、それを確定させたいが、
             // ここでは「startPos」と「lastX/Y」を使って計算し直す。
             const points = this.calculatePolygonPoints(this.startPos, {x: this.lastX, y: this.lastY});
             // 半径が小さすぎる場合は無視
             if (Math.hypot(this.lastX - this.startPos.x, this.lastY - this.startPos.y) > 5) {
                 this.drawingHistory.push({
                    points: points,
                    color: this.colors[this.currentColorIndex],
                    size: this.brushSizes[this.currentSizeIndex],
                    symmetryCount: this.symmetryModes[this.currentSymmetryIndex],
                    style: this.brushStyles[this.currentStyleIndex] // スタイル保存
                });
             }
             this.redrawHistory(); // プレビュー用の線を確定線として再描画
        } else {
            // フリーハンド
            if (this.currentStrokePoints.length > 0) {
                this.drawingHistory.push({
                    points: this.currentStrokePoints,
                    color: this.colors[this.currentColorIndex],
                    size: this.brushSizes[this.currentSizeIndex],
                    symmetryCount: this.symmetryModes[this.currentSymmetryIndex],
                    style: this.brushStyles[this.currentStyleIndex] // スタイル保存
                });
            }
        }
        this.currentStrokePoints = [];
    }

    clearCanvas() {
        if (this.isPlaying) return;
        this.drawingHistory = [];
        this.particles = [];
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    redrawHistory() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawingHistory.forEach(stroke => {
            this.renderStroke(stroke);
        });
    }

    // 保存されたストロークを描画する共通関数（静止画用）
    renderStroke(stroke) {
        const symmetryCount = stroke.symmetryCount;
        const angleStep = (2 * Math.PI) / symmetryCount;
        this.ctx.strokeStyle = stroke.color;
        this.ctx.fillStyle = stroke.color; // スプレー用
        this.ctx.lineWidth = stroke.size;
        this.ctx.shadowBlur = 0;
        
        // ブラシスタイル設定
        const style = stroke.style || 'neon'; // 古いデータ互換
        this.ctx.lineCap = style === 'ribbon' ? 'butt' : 'round';
        this.ctx.lineJoin = style === 'ribbon' ? 'bevel' : 'round';

        for (let i = 0; i < symmetryCount; i++) {
            const angle = i * angleStep;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            const drawPath = (points, isRef) => {
                if (style === 'spray') {
                    // スプレー描画（点の集合として描画）
                    points.forEach(pt => {
                        let rx = pt.x - this.centerX;
                        let ry = pt.y - this.centerY;
                        if(isRef) rx = -rx;
                        const finalX = rx * cos - ry * sin + this.centerX;
                        const finalY = rx * sin + ry * cos + this.centerY;
                        
                        // 1ポイントにつき数個のドットを散らす
                        for(let k=0; k<3; k++) {
                            const offsetX = (Math.random() - 0.5) * stroke.size * 2;
                            const offsetY = (Math.random() - 0.5) * stroke.size * 2;
                            this.ctx.fillRect(finalX + offsetX, finalY + offsetY, 1, 1);
                        }
                    });
                } else {
                    // 通常線 or リボン
                    this.ctx.beginPath();
                    points.forEach((pt, idx) => {
                        let rx = pt.x - this.centerX;
                        let ry = pt.y - this.centerY;
                        if(isRef) rx = -rx;
                        const finalX = rx * cos - ry * sin + this.centerX;
                        const finalY = rx * sin + ry * cos + this.centerY;
                        if(idx===0) this.ctx.moveTo(finalX, finalY);
                        else this.ctx.lineTo(finalX, finalY);
                    });
                    this.ctx.stroke();
                }
            };
            drawPath(stroke.points, false);
            if (symmetryCount > 2) drawPath(stroke.points, true);
        }
    }

    // フリーハンド描画時のリアルタイムレンダリング
    drawSymmetric(x1, y1, x2, y2) {
        const symmetryCount = this.symmetryModes[this.currentSymmetryIndex];
        const angleStep = (2 * Math.PI) / symmetryCount;
        const style = this.brushStyles[this.currentStyleIndex];
        const size = this.brushSizes[this.currentSizeIndex];

        this.ctx.strokeStyle = this.colors[this.currentColorIndex];
        this.ctx.fillStyle = this.colors[this.currentColorIndex];
        this.ctx.lineWidth = size;
        this.ctx.lineCap = style === 'ribbon' ? 'butt' : 'round';
        
        for (let i = 0; i < symmetryCount; i++) {
            const angle = i * angleStep;
            const cos = Math.cos(angle), sin = Math.sin(angle);
            
            // 座標変換関数
            const transform = (x, y, mirror) => {
                let rx = x - this.centerX;
                let ry = y - this.centerY;
                if (mirror) rx = -rx;
                return {
                    x: rx * cos - ry * sin + this.centerX,
                    y: rx * sin + ry * cos + this.centerY
                };
            };

            const drawSegment = (p1, p2) => {
                if (style === 'spray') {
                    // スプレー: 線を引く代わりに点を散らす
                    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
                    const steps = Math.max(1, Math.floor(dist / 2));
                    for (let s = 0; s < steps; s++) {
                        const t = s / steps;
                        const tx = p1.x + (p2.x - p1.x) * t;
                        const ty = p1.y + (p2.y - p1.y) * t;
                        
                        for (let d = 0; d < 5; d++) { // 密度
                            const r = Math.random() * size;
                            const a = Math.random() * Math.PI * 2;
                            this.ctx.fillRect(tx + Math.cos(a)*r, ty + Math.sin(a)*r, 1.5, 1.5);
                        }
                    }
                } else {
                    // 通常・リボン
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            };

            // 通常描画
            drawSegment(transform(x1, y1, false), transform(x2, y2, false));

            // ミラー描画
            if (symmetryCount > 2) {
                drawSegment(transform(x1, y1, true), transform(x2, y2, true));
            }
        }
    }

    // 多角形プレビュー用の描画（履歴に残す前の表示用）
    drawSymmetricPolyPreview(points) {
        // 現在の設定で仮のストロークデータを作成して renderStroke を使う
        const tempStroke = {
            points: points,
            color: this.colors[this.currentColorIndex],
            size: this.brushSizes[this.currentSizeIndex],
            symmetryCount: this.symmetryModes[this.currentSymmetryIndex],
            style: this.brushStyles[this.currentStyleIndex]
        };
        this.renderStroke(tempStroke);
    }

    changeColor() {
        this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length;
        this.updateUI();
    }
    changeSymmetryMode() {
        this.currentSymmetryIndex = (this.currentSymmetryIndex + 1) % this.symmetryModes.length;
        this.updateUI();
    }
    changeBrushSize() {
        this.currentSizeIndex = (this.currentSizeIndex + 1) % this.brushSizes.length;
        this.updateUI();
    }
    // 新機能用UI更新
    changeBrushStyle() {
        this.currentStyleIndex = (this.currentStyleIndex + 1) % this.brushStyles.length;
        this.updateUI();
    }
    changeDrawTool() {
        this.currentToolIndex = (this.currentToolIndex + 1) % this.drawTools.length;
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('currentColor').textContent = this.colorEmojis[this.currentColorIndex];
        document.getElementById('symmetryCount').textContent = this.symmetryModes[this.currentSymmetryIndex];
        document.getElementById('modeBtn').textContent = `対称モード: ${this.symmetryModes[this.currentSymmetryIndex]}方向`;
        document.getElementById('sizeBtn').textContent = `筆のサイズ: ${this.brushSizeNames[this.currentSizeIndex]}`;
        
        // 新しいボタンの表示更新
        document.getElementById('styleBtn').textContent = `ペン: ${this.brushStyleNames[this.currentStyleIndex]}`;
        document.getElementById('toolBtn').textContent = `ツール: ${this.drawToolNames[this.currentToolIndex]}`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new SymmetryGame();
});