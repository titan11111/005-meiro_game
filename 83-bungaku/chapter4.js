// ========================================
// グローバル変数
// ========================================
let scene, camera, renderer;
let player, ground, river;
let memoryFragments = [];
let collectedMemories = 0;
let timeFlow = 0;
let keys = {};
let touchStartX = 0;
let touchStartY = 0;
let moveX = 0;
let moveZ = 0;
let currentChapter = 1; // 現在の章

// 方丈記の詩句
const poems = [
    "ゆく川の流れは絶えずして",
    "しかも、もとの水にあらず",
    "よどみに浮かぶうたかたは",
    "かつ消え、かつ結びて",
    "久しくとどまりたるためしなし"
];

// ========================================
// 初期化
// ========================================
window.addEventListener('DOMContentLoaded', () => {
    // スタートボタン
    document.getElementById('start-btn').addEventListener('click', startGame);
    
    // メッセージOKボタン
    document.getElementById('message-ok').addEventListener('click', () => {
        document.getElementById('message-box').style.display = 'none';
    });
    
    // 次の章へボタン
    document.getElementById('continue-btn').addEventListener('click', () => {
        if (currentChapter === 1) {
            // 第2章へ進む
            startChapter2();
        } else {
            showMessage('第三章以降は開発中です。ありがとうございました!');
        }
    });
});

// ========================================
// ゲーム開始
// ========================================
function startGame() {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    currentChapter = 1;
    initThreeJS();
    createWorld();
    createPlayer();
    createMemoryFragments();
    setupControls();
    animate();
    
    showPoem(poems[0]);
    showMessage('記憶の断片を5つ集めて、章を完成させよう!');
}

// ========================================
// Three.js 初期化
// ========================================
function initThreeJS() {
    const canvas = document.getElementById('game-canvas');
    
    // シーン
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
    
    // カメラ
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);
    
    // レンダラー
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    
    // ライト
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // リサイズ対応
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ========================================
// 世界生成
// ========================================
function createWorld() {
    // 地面(動的に崩れる)
    const groundGeometry = new THREE.PlaneGeometry(50, 50, 20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B7355,
        roughness: 0.8
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // 川の生成
    createRiver();
    
    // 橋(崩れる)
    createBridges();
    
    // 草木
    createNature();
}

// ========================================
// 川の生成
// ========================================
function createRiver() {
    const riverGeometry = new THREE.PlaneGeometry(5, 50, 10, 50);
    const riverMaterial = new THREE.MeshStandardMaterial({
        color: 0x4A90E2,
        transparent: true,
        opacity: 0.7,
        roughness: 0.1
    });
    river = new THREE.Mesh(riverGeometry, riverMaterial);
    river.rotation.x = -Math.PI / 2;
    river.position.y = 0.1;
    scene.add(river);
    
    // 川の流れアニメーション用
    river.userData.time = 0;
}

// ========================================
// 橋の生成
// ========================================
function createBridges() {
    for (let i = 0; i < 3; i++) {
        const bridgeGeometry = new THREE.BoxGeometry(6, 0.3, 2);
        const bridgeMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513
        });
        const bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
        bridge.position.set(0, 0.5, -10 + i * 10);
        bridge.castShadow = true;
        bridge.receiveShadow = true;
        bridge.userData.decayTime = 0;
        scene.add(bridge);
    }
}

// ========================================
// 自然物(木・草)
// ========================================
function createNature() {
    // 木
    for (let i = 0; i < 10; i++) {
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4A2511 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        
        const leavesGeometry = new THREE.SphereGeometry(1.5, 8, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 2;
        
        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);
        
        const x = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        tree.position.set(x, 1.5, z);
        tree.castShadow = true;
        scene.add(tree);
    }
}

// ========================================
// プレイヤー生成(CapsuleGeometry非対応のため代替)
// ========================================
function createPlayer() {
    // CapsuleGeometryの代わりに円柱+球で作成
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFF6B6B });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    const headGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFF6B6B });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1;
    
    player = new THREE.Group();
    player.add(body);
    player.add(head);
    player.position.set(0, 1.5, 5);
    player.castShadow = true;
    scene.add(player);
}

// ========================================
// 記憶の断片生成
// ========================================
function createMemoryFragments() {
    const positions = [
        [8, 1, -5],
        [-10, 1, -10],
        [12, 1, 0],
        [-8, 1, 10],
        [0, 1, -20]
    ];
    
    positions.forEach((pos, index) => {
        const fragmentGeometry = new THREE.OctahedronGeometry(0.8);
        const fragmentMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            emissive: 0xFFD700,
            emissiveIntensity: 0.5
        });
        const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);
        fragment.position.set(pos[0], pos[1], pos[2]);
        fragment.userData.index = index;
        fragment.userData.collected = false;
        memoryFragments.push(fragment);
        scene.add(fragment);
    });
}

// ========================================
// 操作設定
// ========================================
function setupControls() {
    // キーボード
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    // タッチ
    const canvas = document.getElementById('game-canvas');
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchX - touchStartX;
        const deltaY = touchY - touchStartY;
        
        moveX = deltaX / window.innerWidth * 2;
        moveZ = deltaY / window.innerHeight * 2;
    });
    
    canvas.addEventListener('touchend', () => {
        moveX = 0;
        moveZ = 0;
    });
}

// ========================================
// プレイヤー移動
// ========================================
function updatePlayer() {
    const speed = 0.15;
    
    // キーボード操作
    if (keys['ArrowUp'] || keys['w']) player.position.z -= speed;
    if (keys['ArrowDown'] || keys['s']) player.position.z += speed;
    if (keys['ArrowLeft'] || keys['a']) player.position.x -= speed;
    if (keys['ArrowRight'] || keys['d']) player.position.x += speed;
    
    // タッチ操作
    player.position.x += moveX * speed;
    player.position.z += moveZ * speed;
    
    // 移動制限
    player.position.x = Math.max(-20, Math.min(20, player.position.x));
    player.position.z = Math.max(-20, Math.min(20, player.position.z));
    
    // カメラ追従
    camera.position.x = player.position.x;
    camera.position.z = player.position.z + 8;
    camera.lookAt(player.position);
}

// ========================================
// 記憶の断片収集判定
// ========================================
function checkMemoryCollection() {
    memoryFragments.forEach((fragment) => {
        if (fragment.userData.collected) return;
        
        const distance = player.position.distanceTo(fragment.position);
        if (distance < 2) {
            fragment.userData.collected = true;
            scene.remove(fragment);
            collectedMemories++;
            
            document.getElementById('memory-count').textContent = collectedMemories;
            
            showPoem(poems[collectedMemories % poems.length]);
            
            if (collectedMemories >= 5) {
                setTimeout(() => {
                    document.getElementById('chapter-complete').style.display = 'flex';
                }, 2000);
            }
        }
    });
}

// ========================================
// 地形崩壊エフェクト
// ========================================
function updateDecay() {
    timeFlow += 0.1;
    if (timeFlow > 100) timeFlow = 100;
    
    document.getElementById('time-flow').textContent = Math.floor(timeFlow);
    
    // 地面の変形
    if (ground.geometry.attributes.position) {
        const positions = ground.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 2] += Math.sin(Date.now() * 0.001 + i) * 0.001;
        }
        ground.geometry.attributes.position.needsUpdate = true;
    }
    
    // 川の流れ
    if (river.userData) {
        river.userData.time += 0.01;
        river.position.z = Math.sin(river.userData.time) * 0.5;
    }
}

// ========================================
// 詩句表示
// ========================================
function showPoem(text) {
    const poemDisplay = document.getElementById('poem-display');
    poemDisplay.textContent = text;
    poemDisplay.style.animation = 'none';
    setTimeout(() => {
        poemDisplay.style.animation = 'poemFade 3s ease-in-out';
    }, 10);
}

// ========================================
// メッセージ表示
// ========================================
function showMessage(text) {
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    messageText.textContent = text;
    messageBox.style.display = 'block';
}

// ========================================
// アニメーションループ
// ========================================
function animate() {
    requestAnimationFrame(animate);
    
    updatePlayer();
    checkMemoryCollection();
    updateDecay();
    
    // 記憶の断片を回転・浮遊
    memoryFragments.forEach((fragment) => {
        if (!fragment.userData.collected) {
            fragment.rotation.y += 0.02;
            fragment.position.y = 1 + Math.sin(Date.now() * 0.002 + fragment.userData.index) * 0.3;
        }
    });
    
    renderer.render(scene, camera);
}

// ========================================
// シーンリセット(章切り替え用)
// ========================================
function resetScene() {
    // すべてのオブジェクトを削除
    while(scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    
    // 変数リセット
    memoryFragments = [];
    collectedMemories = 0;
    timeFlow = 0;
    
    // UIリセット
    document.getElementById('memory-count').textContent = '0';
    document.getElementById('time-flow').textContent = '0';
    document.getElementById('chapter-complete').style.display = 'none';
    
    // プレイヤー位置リセット
    if (player) {
        player.position.set(0, 1.5, 5);
    }
    
    // ライト再追加
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}

// ========================================
// デバッグ情報(開発時のみ)
// ========================================
// コンソールで位置確認したい場合はコメントを外す
// setInterval(() => {
//     console.log('プレイヤー位置:', player.position);
//     console.log('記憶の断片収集数:', collectedMemories);
//     console.log('現在の章:', currentChapter);
// }, 1000);