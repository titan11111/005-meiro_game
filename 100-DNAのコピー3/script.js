// =========================================
// 🎮 ゲーム設定
// =========================================
const CONFIG = {
    LANES: 5,              // あみだくじのレーン数（5本）
    LANE_WIDTH: 3,         // レーンの幅
    DEPTH: 30,             // あみだくじの長さ（奥行き）
    BRIDGES: 15,           // 横棒の数
    PLAYER_SPEED: 0.15     // プレイヤーの速度
};

// =========================================
// 🌟 キャラクターデータ
// =========================================
const CHARACTERS = [
    {
        id: 1,
        emoji: '🐰',
        name: 'ホップ',
        color: 0xffb6c1,      // ピンク
        age: '7さい',
        personality: '元気いっぱい',
        hobby: 'とぶこと',
        favorite: 'にんじん',
        skill: 'ジャンプ',
        phrase: 'ぴょんぴょん！',
        goalComment: '🎉 やったー！ぴょんぴょん！'
    },
    {
        id: 2,
        emoji: '🐱',
        name: 'ミャウ',
        color: 0xffd700,      // ゴールド
        age: '8さい',
        personality: 'のんびり屋',
        hobby: 'おひるね',
        favorite: 'おさかな',
        skill: 'ごろごろ',
        phrase: 'にゃーん♪',
        goalComment: '😺 ふわぁ～着いたにゃ～'
    },
    {
        id: 3,
        emoji: '🐶',
        name: 'ワンワン',
        color: 0x87ceeb,      // スカイブルー
        age: '6さい',
        personality: 'やさしい',
        hobby: 'さんぽ',
        favorite: 'ボール',
        skill: 'しっぽふり',
        phrase: 'わんわん！',
        goalComment: '🐕 わ〜い！たのしかったワン！'
    },
    {
        id: 4,
        emoji: '🐼',
        name: 'パンダ',
        color: 0x90ee90,      // ライトグリーン
        age: '9さい',
        personality: 'マイペース',
        hobby: 'たべること',
        favorite: 'ささのは',
        skill: 'ごろごろ',
        phrase: 'もぐもぐ〜',
        goalComment: '🐼 おなかすいたよ〜'
    },
    {
        id: 5,
        emoji: '🐸',
        name: 'ケロケロ',
        color: 0x98fb98,      // ペールグリーン
        age: '5さい',
        personality: 'げんき',
        hobby: 'およぐこと',
        favorite: 'いけ',
        skill: 'ジャンプ',
        phrase: 'ケロケロ！',
        goalComment: '🐸 ケロケロ〜！たのしいな〜！'
    }
];

// =========================================
// 💾 グローバル変数
// =========================================
let scene, camera, renderer;
let player;
let bridges = [];
let gameState = 'title';
let selectedCharacter = null;
let startLane = 0;
let currentLane = 0;
let currentZ = 0;

// =========================================
// 🚀 初期化
// =========================================
function init() {
    console.log('🎮 ゲーム初期化開始！');
    
    // イベントリスナー設定
    document.getElementById('startButton').addEventListener('click', showCharacterSelect);
    document.getElementById('replayButton').addEventListener('click', resetGame);
    
    // キャラクターカードを生成
    createCharacterCards();
    
    console.log('✅ ゲーム初期化完了！');
}

// =========================================
// 🎨 キャラクターカード生成
// =========================================
function createCharacterCards() {
    const container = document.getElementById('characterCards');
    container.innerHTML = '';
    
    CHARACTERS.forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `
            <span class="character-emoji">${char.emoji}</span>
            <span class="character-name">${char.name}</span>
            <div class="character-info">
                <p><strong>年れい:</strong> ${char.age}</p>
                <p><strong>せいかく:</strong> ${char.personality}</p>
                <p><strong>しゅみ:</strong> ${char.hobby}</p>
                <p><strong>すきなもの:</strong> ${char.favorite}</p>
                <p><strong>とくぎ:</strong> ${char.skill}</p>
                <p><strong>口ぐせ:</strong> ${char.phrase}</p>
            </div>
        `;
        card.addEventListener('click', () => selectCharacter(char.id));
        container.appendChild(card);
    });
    
    console.log('🎨 キャラクターカード生成完了！');
}

// =========================================
// 🎬 キャラクター選択画面表示
// =========================================
function showCharacterSelect() {
    console.log('🎬 キャラクター選択画面へ！');
    document.getElementById('titleScreen').style.display = 'none';
    document.getElementById('characterScreen').style.display = 'flex';
    gameState = 'character';
}

// =========================================
// ✨ キャラクター選択
// =========================================
function selectCharacter(characterId) {
    selectedCharacter = CHARACTERS.find(char => char.id === characterId);
    console.log(`✨ ${selectedCharacter.name}を選んだよ！`);
    
    // 少し待ってからゲーム開始（ワクワク感演出）
    setTimeout(() => {
        startGame();
    }, 300);
}

// =========================================
// 🎮 ゲーム開始
// =========================================
function startGame() {
    console.log('🎮 ゲームスタート！');
    
    // 画面切り替え
    document.getElementById('characterScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    gameState = 'playing';
    
    // スタート位置をランダムに決定
    startLane = Math.floor(Math.random() * CONFIG.LANES);
    currentLane = startLane;
    currentZ = 0;
    
    console.log(`🎯 スタート位置: ${startLane + 1}番`);
    
    // HUD更新
    document.getElementById('playerEmoji').textContent = selectedCharacter.emoji;
    document.getElementById('playerName').textContent = selectedCharacter.name;
    document.getElementById('startLane').textContent = (startLane + 1);
    
    // 3Dシーン初期化
    initThreeScene();
    generateAmida();
    createPlayer();
    animate();
}

// =========================================
// 🌍 Three.jsシーン初期化
// =========================================
function initThreeScene() {
    console.log('🌍 3Dシーン作成中...');
    
    // シーン作成
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // 空色
    scene.fog = new THREE.Fog(0x87ceeb, 20, 50);
    
    // カメラ作成（俯瞰視点）
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 25, 10);
    camera.lookAt(0, 0, -CONFIG.DEPTH / 2);
    
    // レンダラー作成
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('threeCanvas').appendChild(renderer.domElement);
    
    // ライト設定
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // 地面
    const groundGeometry = new THREE.PlaneGeometry(60, 60);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90ee90 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // 山（遠景装飾）
    for (let i = 0; i < 5; i++) {
        const mountainGeometry = new THREE.ConeGeometry(3 + Math.random() * 2, 6 + Math.random() * 3, 8);
        const mountainMaterial = new THREE.MeshLambertMaterial({ color: 0x8b7355 });
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.position.set(
            (Math.random() - 0.5) * 40,
            2,
            -CONFIG.DEPTH - Math.random() * 10 - 5
        );
        mountain.castShadow = true;
        scene.add(mountain);
    }
    
    // 雲（装飾）
    for (let i = 0; i < 10; i++) {
        const cloudGeometry = new THREE.SphereGeometry(2, 8, 8);
        const cloudMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.7 
        });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(
            (Math.random() - 0.5) * 50,
            10 + Math.random() * 5,
            (Math.random() - 0.5) * 50
        );
        scene.add(cloud);
    }
    
    // 木（装飾）
    for (let i = 0; i < 8; i++) {
        const tree = createTree();
        tree.position.set(
            (Math.random() - 0.5) * 35 + (Math.random() > 0.5 ? 15 : -15),
            0,
            Math.random() * -CONFIG.DEPTH
        );
        scene.add(tree);
    }
    
    // 花（装飾）
    for (let i = 0; i < 20; i++) {
        const flower = createFlower();
        flower.position.set(
            (Math.random() - 0.5) * 40,
            0,
            Math.random() * -CONFIG.DEPTH
        );
        scene.add(flower);
    }
    
    // リサイズ対応
    window.addEventListener('resize', onWindowResize);
    
    console.log('✅ 3Dシーン作成完了！');
}

// =========================================
// 🌳 木を作成
// =========================================
function createTree() {
    const tree = new THREE.Group();
    
    // 幹
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    trunk.castShadow = true;
    tree.add(trunk);
    
    // 葉
    const leavesGeometry = new THREE.SphereGeometry(1.5, 8, 8);
    const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 3;
    leaves.castShadow = true;
    tree.add(leaves);
    
    return tree;
}

// =========================================
// 🌸 花を作成
// =========================================
function createFlower() {
    const flower = new THREE.Group();
    
    // 茎
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.25;
    flower.add(stem);
    
    // 花びら
    const petalColors = [0xff69b4, 0xffd700, 0xff6347, 0x9370db, 0x00bfff];
    const petalGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const petalMaterial = new THREE.MeshLambertMaterial({ 
        color: petalColors[Math.floor(Math.random() * petalColors.length)]
    });
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    petal.position.y = 0.6;
    flower.add(petal);
    
    return flower;
}

// =========================================
// 🎪 あみだくじ生成
// =========================================
function generateAmida() {
    console.log('🎪 あみだくじ生成中...');
    bridges = [];
    
    // 縦線を作成
    for (let i = 0; i < CONFIG.LANES; i++) {
        const x = (i - CONFIG.LANES / 2 + 0.5) * CONFIG.LANE_WIDTH;
        
        // 縦線（青色）
        const lineGeometry = new THREE.CylinderGeometry(0.12, 0.12, CONFIG.DEPTH, 8);
        const lineMaterial = new THREE.MeshLambertMaterial({ color: 0x4169e1 });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(x, 0, -CONFIG.DEPTH / 2);
        line.castShadow = true;
        scene.add(line);
        
        // スタートマーカー（金色）
        const startMarkerGeometry = new THREE.BoxGeometry(1, 1, 1);
        const startMarkerMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffd700,
            emissive: 0xffd700,
            emissiveIntensity: 0.3
        });
        const startMarker = new THREE.Mesh(startMarkerGeometry, startMarkerMaterial);
        startMarker.position.set(x, 0.5, 1);
        startMarker.castShadow = true;
        scene.add(startMarker);
        
        // スタート番号表示（白い球）
        const numberGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const numberMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const numberSphere = new THREE.Mesh(numberGeometry, numberMaterial);
        numberSphere.position.set(x, 1.8, 1);
        scene.add(numberSphere);
        
        // ゴールマーカー（緑色）
        const goalMarkerGeometry = new THREE.BoxGeometry(1, 1, 1);
        const goalMarkerMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x32cd32,
            emissive: 0x32cd32,
            emissiveIntensity: 0.3
        });
        const goalMarker = new THREE.Mesh(goalMarkerGeometry, goalMarkerMaterial);
        goalMarker.position.set(x, 0.5, -CONFIG.DEPTH - 1);
        goalMarker.castShadow = true;
        scene.add(goalMarker);
        
        // ゴール番号表示（白い球）
        const goalNumberGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const goalNumberMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const goalNumberSphere = new THREE.Mesh(goalNumberGeometry, goalNumberMaterial);
        goalNumberSphere.position.set(x, 1.8, -CONFIG.DEPTH - 1);
        scene.add(goalNumberSphere);
    }
    
    // 横棒（橋）を作成
    const usedPositions = [];
    let successfulBridges = 0;
    
    for (let i = 0; i < CONFIG.BRIDGES; i++) {
        let lane, z;
        let attempts = 0;
        
        // 重複しない位置を探す
        do {
            lane = Math.floor(Math.random() * (CONFIG.LANES - 1));
            z = -Math.random() * (CONFIG.DEPTH - 2) - 1;
            attempts++;
        } while (
            usedPositions.some(pos => 
                Math.abs(pos.z - z) < 2.5 && pos.lane === lane
            ) && attempts < 100
        );
        
        if (attempts < 100) {
            usedPositions.push({ lane, z });
            
            const x1 = (lane - CONFIG.LANES / 2 + 0.5) * CONFIG.LANE_WIDTH;
            const x2 = (lane + 1 - CONFIG.LANES / 2 + 0.5) * CONFIG.LANE_WIDTH;
            const bridgeX = (x1 + x2) / 2;
            
            // 橋（赤色→通過時に黄色に変化）
            const bridgeGeometry = new THREE.CylinderGeometry(0.18, 0.18, CONFIG.LANE_WIDTH, 8);
            const bridgeMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xff6347,
                emissive: 0xff6347,
                emissiveIntensity: 0.2
            });
            const bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
            bridge.rotation.z = Math.PI / 2;
            bridge.position.set(bridgeX, 0, z);
            bridge.castShadow = true;
            scene.add(bridge);
            
            bridges.push({
                lane: lane,
                z: z,
                mesh: bridge,
                used: false
            });
            
            successfulBridges++;
        }
    }
    
    console.log(`✅ あみだくじ生成完了！橋の数: ${successfulBridges}`);
}

// =========================================
// 🎯 プレイヤー作成
// =========================================
function createPlayer() {
    console.log('🎯 プレイヤー作成中...');
    
    const playerGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const playerMaterial = new THREE.MeshLambertMaterial({ 
        color: selectedCharacter.color,
        emissive: selectedCharacter.color,
        emissiveIntensity: 0.3
    });
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    
    const startX = (startLane - CONFIG.LANES / 2 + 0.5) * CONFIG.LANE_WIDTH;
    player.position.set(startX, 1.5, 0);
    player.castShadow = true;
    scene.add(player);
    
    console.log(`✅ プレイヤー作成完了！位置: (${startX}, 1.5, 0)`);
}

// =========================================
// 🏃 プレイヤー更新
// =========================================
function updatePlayer() {
    if (gameState !== 'playing') return;
    
    // Z軸方向に前進
    currentZ -= CONFIG.PLAYER_SPEED;
    player.position.z = currentZ;
    
    // プレイヤーを少し揺らす（動いてる感）
    player.position.y = 1.5 + Math.sin(Date.now() * 0.005) * 0.2;
    
    // 橋との衝突判定
    bridges.forEach(bridge => {
        if (!bridge.used && Math.abs(currentZ - bridge.z) < 0.4) {
            if (currentLane === bridge.lane) {
                // 右に移動
                currentLane++;
                bridge.used = true;
                bridge.mesh.material.color.setHex(0xffff00);
                bridge.mesh.material.emissive.setHex(0xffff00);
                bridge.mesh.material.emissiveIntensity = 0.5;
                console.log(`➡️ 右に移動！新しいレーン: ${currentLane + 1}`);
            } else if (currentLane === bridge.lane + 1) {
                // 左に移動
                currentLane--;
                bridge.used = true;
                bridge.mesh.material.color.setHex(0xffff00);
                bridge.mesh.material.emissive.setHex(0xffff00);
                bridge.mesh.material.emissiveIntensity = 0.5;
                console.log(`⬅️ 左に移動！新しいレーン: ${currentLane + 1}`);
            }
            
            // プレイヤーのX座標を滑らかに更新
            const newX = (currentLane - CONFIG.LANES / 2 + 0.5) * CONFIG.LANE_WIDTH;
            player.position.x = newX;
        }
    });
    
    // ゴール判定
    if (currentZ < -CONFIG.DEPTH) {
        console.log('🎉 ゴール到達！');
        showResult();
    }
}

// =========================================
// 🎉 結果表示
// =========================================
function showResult() {
    gameState = 'result';
    
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'flex';
    
    document.getElementById('resultEmoji').textContent = selectedCharacter.emoji;
    document.getElementById('resultStart').textContent = (startLane + 1);
    document.getElementById('resultGoal').textContent = (currentLane + 1);
    document.getElementById('resultComment').textContent = selectedCharacter.goalComment;
    
    console.log(`🎊 結果: スタート${startLane + 1}番 → ゴール${currentLane + 1}番`);
}

// =========================================
// 🔄 リセット
// =========================================
function resetGame() {
    console.log('🔄 ゲームをリセット中...');
    
    // 3Dシーンをクリア
    if (scene) {
        while (scene.children.length > 0) {
            const object = scene.children[0];
            if (object.geometry) object.geometry.dispose();
            if (object.material) object.material.dispose();
            scene.remove(object);
        }
    }
    if (renderer) {
        renderer.dispose();
        document.getElementById('threeCanvas').innerHTML = '';
    }
    
    // 変数リセット
    player = null;
    bridges = [];
    selectedCharacter = null;
    scene = null;
    camera = null;
    renderer = null;
    
    // タイトルに戻る
    document.getElementById('resultScreen').style.display = 'none';
    document.getElementById('titleScreen').style.display = 'flex';
    gameState = 'title';
    
    console.log('✅ リセット完了！タイトルに戻りました');
}

// =========================================
// 🎬 アニメーションループ
// =========================================
function animate() {
    if (gameState !== 'playing') return;
    
    requestAnimationFrame(animate);
    updatePlayer();
    renderer.render(scene, camera);
}

// =========================================
// 📱 ウィンドウリサイズ対応
// =========================================
function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        console.log('📱 画面サイズ調整完了');
    }
}

// =========================================
// 🚀 起動
// =========================================
window.addEventListener('load', () => {
    console.log('🚀 ゲームを起動します！');
    init();
});

// =========================================
// 🎮 おまけ: デバッグ用ログ
// =========================================
console.log(`
🎮========================================🎮
   3Dあみだくじ - ワクワク統合版！
🎮========================================🎮
✨ キャラクター数: ${CHARACTERS.length}体
🎪 レーン数: ${CONFIG.LANES}本
🌉 橋の数: ${CONFIG.BRIDGES}個
📏 あみだくじの長さ: ${CONFIG.DEPTH}m
🎮========================================🎮
`);