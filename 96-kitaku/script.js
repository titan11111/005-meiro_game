// =========================================
// 🎮 ゲーム設定
// =========================================
const CONFIG = {
    HALLWAY_LENGTH: 25,    // 廊下の長さ（横方向）
    HALLWAY_WIDTH: 3,      // 廊下の幅
    PLAYER_SPEED: 0.2,     // プレイヤーの移動速度
    DOOR_POSITIONS: {      // ドアの位置（X座標、廊下の横方向）
        BEDROOM: -8,       // 寝室（左側）
        KIDS_ROOM: 0,      // 子供部屋（中央、右側）
        LDK: 8             // LDK（右側）
    },
    ROOM_SIZE: 8           // 各部屋のサイズ
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
let gameState = 'title';
let selectedCharacter = null;
let currentRoom = 'hallway';  // hallway, bedroom, kidsRoom, ldk
let playerX = 0;              // プレイヤーのX座標（廊下での位置）
let playerZ = 0;              // プレイヤーのZ座標（前進距離）
let hallwayObjects = [];      // 廊下のオブジェクト
let roomObjects = [];         // 部屋のオブジェクト
let doorObjects = [];         // ドアのオブジェクト（クリック判定用）
let doorData = {};            // ドアのデータ（位置、壁オブジェクトなど）
let lightSwitchObjects = [];  // 電気スイッチのオブジェクト
let raycaster = null;         // レイキャスター（クリック判定用）
let mouse = new THREE.Vector2(); // マウス位置
let lightsOn = true;          // 電気の状態
let roomLight = null;         // 部屋のライト

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
    
    // 初期位置
    playerX = 0;
    playerZ = 0;
    currentRoom = 'hallway';
    
    // HUD更新
    document.getElementById('playerEmoji').textContent = selectedCharacter.emoji;
    document.getElementById('playerName').textContent = selectedCharacter.name;
    document.getElementById('startLane').textContent = '廊下';
    
    // 3Dシーン初期化
    initThreeScene();
    createHallway();
    createPlayer();
    
    // クリック/タップイベント設定（renderer初期化後）
    setupClickHandlers();
    
    animate();
    
    // キー入力設定
    setupControls();
}

// =========================================
// 🌍 Three.jsシーン初期化
// =========================================
function initThreeScene() {
    console.log('🌍 3Dシーン作成中...');
    
    // シーン作成
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5); // 薄いグレー（室内用）
    
    // カメラ作成（少し高い視点から見下ろす）
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 12, 8);
    camera.lookAt(0, 0, 0);
    
    // レンダラー作成
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('threeCanvas').appendChild(renderer.domElement);
    
    // ライト設定（基本ライト）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // 部屋用のライト（初期状態はON）
    roomLight = new THREE.PointLight(0xffffff, 1.5, 50);
    roomLight.position.set(0, 8, 0);
    roomLight.visible = lightsOn;
    scene.add(roomLight);
    
    // レイキャスター初期化
    raycaster = new THREE.Raycaster();
    
    // リサイズ対応
    window.addEventListener('resize', onWindowResize);
    
    console.log('✅ 3Dシーン作成完了！');
}

// =========================================
// 🏠 廊下を作成
// =========================================
function createHallway() {
    console.log('🏠 廊下を作成中...');
    
    // 既存のオブジェクトをクリア
    hallwayObjects.forEach(obj => scene.remove(obj));
    hallwayObjects = [];
    
    // 床（横方向に長い）
    const floorGeometry = new THREE.PlaneGeometry(CONFIG.HALLWAY_LENGTH, CONFIG.HALLWAY_WIDTH);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xd3d3d3 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);
    hallwayObjects.push(floor);
    
    // 壁（前 - 正面）
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
    const frontWallGeometry = new THREE.PlaneGeometry(CONFIG.HALLWAY_LENGTH, 5);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, 2.5, CONFIG.HALLWAY_WIDTH / 2);
    scene.add(frontWall);
    hallwayObjects.push(frontWall);
    
    // 壁（後 - 奥）
    const backWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    backWall.rotation.y = Math.PI;
    backWall.position.set(0, 2.5, -CONFIG.HALLWAY_WIDTH / 2);
    scene.add(backWall);
    hallwayObjects.push(backWall);
    
    // 左側の壁（ドアの部分を除く）
    const wallHeight = 5;
    const doorWidth = 2.2;
    
    // 左端から寝室ドアまで
    const leftWall1Width = CONFIG.DOOR_POSITIONS.BEDROOM + CONFIG.HALLWAY_LENGTH / 2 - doorWidth / 2;
    if (leftWall1Width > 0) {
        const leftWall1Geometry = new THREE.PlaneGeometry(leftWall1Width, wallHeight);
        const leftWall1 = new THREE.Mesh(leftWall1Geometry, wallMaterial);
        leftWall1.rotation.y = Math.PI / 2;
        leftWall1.position.set(-CONFIG.HALLWAY_LENGTH / 2 + leftWall1Width / 2, wallHeight / 2, 0);
        scene.add(leftWall1);
        hallwayObjects.push(leftWall1);
    }
    
    // 寝室ドアと子供部屋ドアの間
    const leftWall2Width = CONFIG.DOOR_POSITIONS.KIDS_ROOM - CONFIG.DOOR_POSITIONS.BEDROOM - doorWidth;
    if (leftWall2Width > 0) {
        const leftWall2Geometry = new THREE.PlaneGeometry(leftWall2Width, wallHeight);
        const leftWall2 = new THREE.Mesh(leftWall2Geometry, wallMaterial);
        leftWall2.rotation.y = Math.PI / 2;
        leftWall2.position.set((CONFIG.DOOR_POSITIONS.BEDROOM + CONFIG.DOOR_POSITIONS.KIDS_ROOM) / 2, wallHeight / 2, 0);
        scene.add(leftWall2);
        hallwayObjects.push(leftWall2);
    }
    
    // 子供部屋ドアとLDKドアの間
    const leftWall3Width = CONFIG.DOOR_POSITIONS.LDK - CONFIG.DOOR_POSITIONS.KIDS_ROOM - doorWidth;
    if (leftWall3Width > 0) {
        const leftWall3Geometry = new THREE.PlaneGeometry(leftWall3Width, wallHeight);
        const leftWall3 = new THREE.Mesh(leftWall3Geometry, wallMaterial);
        leftWall3.rotation.y = Math.PI / 2;
        leftWall3.position.set((CONFIG.DOOR_POSITIONS.KIDS_ROOM + CONFIG.DOOR_POSITIONS.LDK) / 2, wallHeight / 2, 0);
        scene.add(leftWall3);
        hallwayObjects.push(leftWall3);
    }
    
    // LDKドアから右端まで
    const leftWall4Width = CONFIG.HALLWAY_LENGTH / 2 - CONFIG.DOOR_POSITIONS.LDK - doorWidth / 2;
    if (leftWall4Width > 0) {
        const leftWall4Geometry = new THREE.PlaneGeometry(leftWall4Width, wallHeight);
        const leftWall4 = new THREE.Mesh(leftWall4Geometry, wallMaterial);
        leftWall4.rotation.y = Math.PI / 2;
        leftWall4.position.set(CONFIG.DOOR_POSITIONS.LDK + doorWidth / 2 + leftWall4Width / 2, wallHeight / 2, 0);
        scene.add(leftWall4);
        hallwayObjects.push(leftWall4);
    }
    
    // 天井
    const ceilingGeometry = new THREE.PlaneGeometry(CONFIG.HALLWAY_LENGTH, CONFIG.HALLWAY_WIDTH);
    const ceilingMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 5;
    scene.add(ceiling);
    hallwayObjects.push(ceiling);
    
    // 3つのドアを作成（左側の壁に配置）
    doorObjects = []; // ドアオブジェクトをリセット
    createDoor(CONFIG.DOOR_POSITIONS.BEDROOM, '寝室', 0xffb6c1, 'left', 'bedroom');
    createDoor(CONFIG.DOOR_POSITIONS.KIDS_ROOM, '子供部屋', 0xe6e6fa, 'left', 'kidsRoom');
    createDoor(CONFIG.DOOR_POSITIONS.LDK, 'LDK', 0xf0e68c, 'left', 'ldk');
    
    console.log('✅ 廊下作成完了！');
}

// =========================================
// 🚪 ドアを作成
// =========================================
function createDoor(x, label, color, side = 'left', roomType) {
    const doorWidth = 2;
    const doorHeight = 4;
    const wallZ = -CONFIG.HALLWAY_WIDTH / 2; // 左側の壁の位置
    
    // ドアフレーム
    const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    
    // 左フレーム（横）
    const leftFrameGeometry = new THREE.BoxGeometry(0.2, doorHeight, 0.1);
    const leftFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
    leftFrame.position.set(x - doorWidth / 2 - 0.1, doorHeight / 2, wallZ);
    scene.add(leftFrame);
    hallwayObjects.push(leftFrame);
    
    // 右フレーム（横）
    const rightFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
    rightFrame.position.set(x + doorWidth / 2 + 0.1, doorHeight / 2, wallZ);
    scene.add(rightFrame);
    hallwayObjects.push(rightFrame);
    
    // 上フレーム
    const topFrameGeometry = new THREE.BoxGeometry(doorWidth + 0.4, 0.2, 0.1);
    const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
    topFrame.position.set(x, doorHeight + 0.1, wallZ);
    scene.add(topFrame);
    hallwayObjects.push(topFrame);
    
    // ドア（色付き）- クリック可能にする（回転の基準点を左端に）
    const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, 0.05);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: color });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(x, doorHeight / 2, wallZ + 0.02);
    door.userData = { 
        type: 'door', 
        roomType: roomType, 
        label: label,
        isOpen: false,
        pivotX: x - doorWidth / 2, // 回転の軸（左端）
        pivotY: doorHeight / 2
    };
    scene.add(door);
    hallwayObjects.push(door);
    doorObjects.push(door); // クリック判定用に追加
    
    // ドアの周りの壁を保存（ドア開閉時に削除するため）
    doorData[roomType] = {
        door: door,
        frames: [leftFrame, rightFrame, topFrame],
        doorX: x,
        doorWidth: doorWidth
    };
    
    // ドアノブ
    const knobGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const knobMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    const knob = new THREE.Mesh(knobGeometry, knobMaterial);
    knob.position.set(x + doorWidth / 2 - 0.2, doorHeight / 2, wallZ + 0.05);
    knob.userData = { parentDoor: door }; // ドアと一緒に回転させるため
    scene.add(knob);
    hallwayObjects.push(knob);
    doorData[roomType].knob = knob;
    
    // ラベル表示用のテキスト（簡易的な板）
    const labelGeometry = new THREE.PlaneGeometry(1.5, 0.3);
    const labelMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    const labelPlate = new THREE.Mesh(labelGeometry, labelMaterial);
    labelPlate.position.set(x, doorHeight + 0.5, wallZ + 0.1);
    labelPlate.rotation.y = Math.PI / 2;
    scene.add(labelPlate);
    hallwayObjects.push(labelPlate);
    
    // ラベルテキスト用のキャンバス（簡易実装として、色付きの板を追加）
    const labelColorGeometry = new THREE.PlaneGeometry(1.2, 0.25);
    const labelColorMaterial = new THREE.MeshLambertMaterial({ color: color });
    const labelColor = new THREE.Mesh(labelColorGeometry, labelColorMaterial);
    labelColor.position.set(x, doorHeight + 0.5, wallZ + 0.12);
    labelColor.rotation.y = Math.PI / 2;
    scene.add(labelColor);
    hallwayObjects.push(labelColor);
}

// =========================================
// 🎯 プレイヤー作成
// =========================================
function createPlayer() {
    console.log('🎯 プレイヤー作成中...');
    
    // 既存のプレイヤーを削除
    if (player) {
        scene.remove(player);
        if (player.geometry) player.geometry.dispose();
        if (player.material) player.material.dispose();
        player = null;
    }
    
    const playerGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const playerMaterial = new THREE.MeshLambertMaterial({ 
        color: selectedCharacter.color,
        emissive: selectedCharacter.color,
        emissiveIntensity: 0.3
    });
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    
    // 位置設定（廊下か部屋かで変わる）
    if (currentRoom === 'hallway') {
        player.position.set(playerX, 0.5, playerZ);
    } else {
        player.position.set(0, 0.5, 0);
    }
    
    player.castShadow = true;
    scene.add(player);
    
    console.log(`✅ プレイヤー作成完了！位置: (${player.position.x}, ${player.position.y}, ${player.position.z})`);
}

// =========================================
// 🏡 部屋を作成
// =========================================
function createRoom(roomType) {
    console.log(`🏡 ${roomType}を作成中...`);
    
    // 既存の部屋オブジェクトをクリア
    roomObjects.forEach(obj => {
        scene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => mat.dispose());
            } else {
                obj.material.dispose();
            }
        }
    });
    roomObjects = [];
    
    // 床
    const floorSize = 10;
    const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
    let floorColor;
    let roomObjects_data = [];
    
    if (roomType === 'bedroom') {
        floorColor = 0xfff8dc; // ベージュ
        // ベッド
        const bedGeometry = new THREE.BoxGeometry(3, 1, 4);
        const bedMaterial = new THREE.MeshLambertMaterial({ color: 0xff69b4 });
        const bed = new THREE.Mesh(bedGeometry, bedMaterial);
        bed.position.set(3, 0.5, -2);
        scene.add(bed);
        roomObjects.push(bed);
        
        // 窓
        const windowGeometry = new THREE.PlaneGeometry(2, 2);
        const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87ceeb });
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(-4.5, 2, 0);
        scene.add(window);
        roomObjects.push(window);
        
    } else if (roomType === 'kidsRoom') {
        floorColor = 0xe6e6fa; // ラベンダー
        // おもちゃ箱
        const toyBoxGeometry = new THREE.BoxGeometry(2, 1.5, 2);
        const toyBoxMaterial = new THREE.MeshLambertMaterial({ color: 0xff6347 });
        const toyBox = new THREE.Mesh(toyBoxGeometry, toyBoxMaterial);
        toyBox.position.set(3, 0.75, -2);
        scene.add(toyBox);
        roomObjects.push(toyBox);
        
        // テーブル
        const tableTopGeometry = new THREE.BoxGeometry(2, 0.1, 1.5);
        const tableTopMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const tableTop = new THREE.Mesh(tableTopGeometry, tableTopMaterial);
        tableTop.position.set(-2, 0.5, -2);
        scene.add(tableTop);
        roomObjects.push(tableTop);
        
    } else if (roomType === 'ldk') {
        floorColor = 0xf0e68c; // カーキー
        // テーブル
        const tableGeometry = new THREE.BoxGeometry(3, 0.1, 2);
        const tableMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.set(0, 0.5, -2);
        scene.add(table);
        roomObjects.push(table);
        
        // ソファ（左）
        const sofaGeometry = new THREE.BoxGeometry(2, 1, 1);
        const sofaMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const sofaLeft = new THREE.Mesh(sofaGeometry, sofaMaterial);
        sofaLeft.position.set(-3, 0.5, -2);
        scene.add(sofaLeft);
        roomObjects.push(sofaLeft);
        
        // ソファ（右）
        const sofaRight = new THREE.Mesh(sofaGeometry, sofaMaterial);
        sofaRight.position.set(3, 0.5, -2);
        scene.add(sofaRight);
        roomObjects.push(sofaRight);
    }
    
    const floorMaterial = new THREE.MeshLambertMaterial({ color: floorColor });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);
    roomObjects.push(floor);
    
    // 壁
    const wallHeight = 5;
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
    
    // 前壁
    const frontWallGeometry = new THREE.PlaneGeometry(floorSize, wallHeight);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, wallHeight / 2, floorSize / 2);
    scene.add(frontWall);
    roomObjects.push(frontWall);
    
    // 左壁
    const leftWallGeometry = new THREE.PlaneGeometry(floorSize, wallHeight);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-floorSize / 2, wallHeight / 2, 0);
    scene.add(leftWall);
    roomObjects.push(leftWall);
    
    // 右壁
    const rightWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(floorSize / 2, wallHeight / 2, 0);
    scene.add(rightWall);
    roomObjects.push(rightWall);
    
    // 天井
    const ceilingGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
    const ceilingMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = wallHeight;
    scene.add(ceiling);
    roomObjects.push(ceiling);
    
    // 電気スイッチを作成
    createLightSwitch();
    
    console.log(`✅ ${roomType}作成完了！`);
}

// =========================================
// 💡 電気スイッチを作成
// =========================================
function createLightSwitch() {
    // 既存のスイッチをクリア
    lightSwitchObjects.forEach(obj => {
        scene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    });
    lightSwitchObjects = [];
    
    // スイッチのベース（壁に付ける）
    const switchBaseGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.1);
    const switchBaseMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const switchBase = new THREE.Mesh(switchBaseGeometry, switchBaseMaterial);
    switchBase.position.set(-4, 1.5, 4.9); // 右壁の内側、適度な高さ
    switchBase.userData = { type: 'lightSwitch' };
    scene.add(switchBase);
    lightSwitchObjects.push(switchBase);
    
    // スイッチのボタン（クリック可能）
    const switchButtonGeometry = new THREE.BoxGeometry(0.2, 0.3, 0.05);
    const switchButtonMaterial = new THREE.MeshLambertMaterial({ 
        color: lightsOn ? 0xffff00 : 0x888888 // オンなら黄色、オフならグレー
    });
    const switchButton = new THREE.Mesh(switchButtonGeometry, switchButtonMaterial);
    switchButton.position.set(-4, 1.5, 4.95);
    switchButton.userData = { type: 'lightSwitch', button: true };
    scene.add(switchButton);
    lightSwitchObjects.push(switchButton);
}

// =========================================
// 💡 電気をオン/オフ
// =========================================
function toggleLight() {
    lightsOn = !lightsOn;
    
    // ライトの状態を変更
    if (roomLight) {
        roomLight.visible = lightsOn;
        roomLight.intensity = lightsOn ? 1.5 : 0;
    }
    
    // スイッチボタンの色を変更
    lightSwitchObjects.forEach(obj => {
        if (obj.userData && obj.userData.button) {
            obj.material.color.setHex(lightsOn ? 0xffff00 : 0x888888);
        }
    });
    
    console.log(`💡 電気: ${lightsOn ? 'ON' : 'OFF'}`);
}

// =========================================
// 🏃 プレイヤー更新
// =========================================
function updatePlayer() {
    if (gameState !== 'playing' || !player) return;
    
    if (currentRoom === 'hallway') {
        // 廊下での移動（横方向に移動）
        player.position.x = playerX; // X軸方向（横方向）に移動
        player.position.z = 0; // Z軸は中央固定
        player.position.y = 0.5 + Math.sin(Date.now() * 0.005) * 0.1;
        
        // ドアの近くでスペースキーを押したら部屋に入る（setupControlsで処理）
    } else {
        // 部屋の中での位置
        player.position.set(0, 0.5, 0);
    }
}

// =========================================
// 🚪 ドアを開く
// =========================================
function openDoor(roomType) {
    const doorInfo = doorData[roomType];
    if (!doorInfo || doorInfo.door.userData.isOpen) {
        return; // すでに開いている
    }
    
    const door = doorInfo.door;
    const knob = doorInfo.knob;
    door.userData.isOpen = true;
    
    // ドアを回転させて開く（Y軸を中心に-90度回転、左端を軸とする）
    const openAngle = -Math.PI / 2; // -90度
    const pivotX = doorInfo.doorX - doorInfo.doorWidth / 2; // 左端のX座標
    
    // アニメーションでドアを開く
    let currentAngle = 0;
    const targetAngle = openAngle;
    const animationDuration = 500; // 500ms
    const startTime = Date.now();
    
    // ドアの初期位置を保存
    const initialDoorX = door.position.x;
    const initialDoorZ = door.position.z;
    
    function animateDoor() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        // イージング関数（ease-out）
        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentAngle = targetAngle * easeOut;
        
        // ドアを左端を軸として回転
        const offsetX = doorInfo.doorWidth / 2;
        door.position.x = pivotX + Math.cos(currentAngle) * offsetX;
        door.position.z = initialDoorZ + Math.sin(currentAngle) * offsetX;
        door.rotation.y = currentAngle;
        
        // ノブもドアと一緒に回転・移動
        if (knob) {
            const knobOffset = doorInfo.doorWidth / 2 - 0.2;
            knob.position.x = pivotX + Math.cos(currentAngle) * knobOffset;
            knob.position.z = initialDoorZ + Math.sin(currentAngle) * knobOffset;
            knob.rotation.y = currentAngle;
        }
        
        if (progress < 1) {
            requestAnimationFrame(animateDoor);
        } else {
            // アニメーション完了後、ドアがあった部分の壁を削除
            removeWallForDoor(roomType);
        }
    }
    
    animateDoor();
}

// =========================================
// 🧱 ドアの部分の壁を削除
// =========================================
function removeWallForDoor(roomType) {
    const doorInfo = doorData[roomType];
    if (!doorInfo) return;
    
    const doorX = doorInfo.doorX;
    const doorWidth = doorInfo.doorWidth;
    
    // ドアフレームは残し、ドアとノブ以外の壁オブジェクトで、ドアの位置と重なっているものを削除
    const objectsToRemove = [];
    
    hallwayObjects.forEach((obj) => {
        // ドア、ノブ、フレーム、ラベル以外で、ドアの位置と重なっている壁を探す
        if (obj !== doorInfo.door && obj !== doorInfo.knob && 
            !doorInfo.frames.includes(obj) &&
            obj.position && Math.abs(obj.position.z - (-CONFIG.HALLWAY_WIDTH / 2)) < 0.5) {
            // ドアのX座標範囲と重なっているかチェック
            if (Math.abs(obj.position.x - doorX) < doorWidth / 2 + 1) {
                objectsToRemove.push(obj);
            }
        }
    });
    
    // 見つかった壁オブジェクトを削除
    objectsToRemove.forEach(obj => {
        scene.remove(obj);
        const index = hallwayObjects.indexOf(obj);
        if (index > -1) {
            hallwayObjects.splice(index, 1);
        }
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => mat.dispose());
            } else {
                obj.material.dispose();
            }
        }
    });
}

// =========================================
// 🚪 部屋に入る
// =========================================
function enterRoom(roomType) {
    if (!roomType) {
        console.log('🚪 部屋タイプが指定されていません');
        return;
    }
    
    console.log(`🚪 ${roomType}に入ります...`);
    
    // ドアを開く
    openDoor(roomType);
    
    // 少し待ってから部屋に入る（ドアのアニメーション完了後）
    setTimeout(() => {
        currentRoom = roomType;
        
        // 廊下のオブジェクトを完全に削除
        hallwayObjects.forEach(obj => {
        // シーンから削除
        if (obj.parent) {
            obj.parent.remove(obj);
        } else {
            scene.remove(obj);
        }
        // メモリ解放
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => mat.dispose());
            } else {
                obj.material.dispose();
            }
        }
    });
    hallwayObjects = [];
    doorObjects = []; // ドアオブジェクトもクリア
    
    // プレイヤーも一旦削除（部屋で再作成）
    if (player) {
        scene.remove(player);
        if (player.geometry) player.geometry.dispose();
        if (player.material) player.material.dispose();
        player = null;
    }
    
        // 部屋を作成
        createRoom(roomType);
        
        // ライトの位置を部屋の中央に設定
        if (roomLight) {
            roomLight.position.set(0, 8, 0);
            roomLight.visible = lightsOn;
        }
        
        // プレイヤーを再作成（部屋の中）
        createPlayer();
        
        // カメラ位置を調整
        camera.position.set(0, 12, 12);
        camera.lookAt(0, 0, 0);
        
        // 3秒後に結果画面へ
        setTimeout(() => {
            showResult(roomType);
        }, 3000);
    }, 600); // ドアアニメーション（500ms）より少し長く待つ
}

// =========================================
// 🖱️ クリック/タップハンドラー設定
// =========================================
function setupClickHandlers() {
    const canvas = renderer.domElement;
    
    // マウスクリック（左クリック）
    canvas.addEventListener('click', onPointerClick);
    
    // 右クリック
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault(); // コンテキストメニューを防ぐ
        onPointerClick(e);
    });
    
    // タッチ（スマホ対応）
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        // touchendイベントではchangedTouchesを使用
        const touch = e.changedTouches[0];
        if (touch) {
            const syntheticEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            };
            onPointerClick(syntheticEvent);
        }
    });
}

// =========================================
// 👆 ポインタークリック処理
// =========================================
function onPointerClick(event) {
    if (gameState !== 'playing') {
        return;
    }
    
    // マウス/タッチ位置を正規化
    const rect = renderer.domElement.getBoundingClientRect();
    const clientX = event.clientX;
    const clientY = event.clientY;
    
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    
    // レイキャスターでクリックしたオブジェクトを検出
    raycaster.setFromCamera(mouse, camera);
    
    // 廊下にいる場合：ドアをクリック
    if (currentRoom === 'hallway' && doorObjects.length > 0) {
        const intersects = raycaster.intersectObjects(doorObjects);
        
        if (intersects.length > 0) {
            const clickedDoor = intersects[0].object;
            if (clickedDoor.userData && clickedDoor.userData.type === 'door') {
                const roomType = clickedDoor.userData.roomType;
                console.log(`🚪 ${clickedDoor.userData.label}をクリックしました！`);
                enterRoom(roomType);
                return;
            }
        }
    }
    
    // 部屋にいる場合：電気スイッチをクリック
    if (currentRoom !== 'hallway' && lightSwitchObjects.length > 0) {
        const intersects = raycaster.intersectObjects(lightSwitchObjects);
        
        if (intersects.length > 0) {
            const clickedObj = intersects[0].object;
            if (clickedObj.userData && clickedObj.userData.type === 'lightSwitch') {
                console.log('💡 電気スイッチをクリックしました！');
                toggleLight();
                return;
            }
        }
    }
}

// =========================================
// ⌨️ キー入力設定
// =========================================
function setupControls() {
    const keys = {};
    
    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });
    
    // 移動処理
    function handleInput() {
        if (gameState !== 'playing' || currentRoom !== 'hallway') return;
        
        // 横方向（X軸）への移動
        if (keys['ArrowLeft'] || keys['KeyA']) {
            playerX = Math.max(-CONFIG.HALLWAY_LENGTH / 2 + 1, playerX - CONFIG.PLAYER_SPEED);
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            playerX = Math.min(CONFIG.HALLWAY_LENGTH / 2 - 1, playerX + CONFIG.PLAYER_SPEED);
        }
        
        // スペースキーは削除（クリック/タップのみ）
    }
    
    // 60FPSで入力処理
    setInterval(handleInput, 16);
}

// =========================================
// 🎉 結果表示
// =========================================
function showResult(roomType) {
    gameState = 'result';
    
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'flex';
    
    const roomNames = {
        'bedroom': '寝室',
        'kidsRoom': '子供部屋',
        'ldk': 'LDK'
    };
    
    document.getElementById('resultEmoji').textContent = selectedCharacter.emoji;
    document.getElementById('resultStart').textContent = '廊下';
    document.getElementById('resultGoal').textContent = roomNames[roomType] || '部屋';
    document.getElementById('resultComment').textContent = `${roomNames[roomType]}に到着しました！${selectedCharacter.goalComment}`;
    
    console.log(`🎊 結果: 廊下 → ${roomNames[roomType]}`);
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
    hallwayObjects = [];
    roomObjects = [];
    selectedCharacter = null;
    scene = null;
    camera = null;
    renderer = null;
    playerX = 0;
    playerZ = 0;
    currentRoom = 'hallway';
    
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
    requestAnimationFrame(animate);
    
    if (gameState === 'playing') {
    updatePlayer();
    }
    
    if (renderer && scene && camera) {
    renderer.render(scene, camera);
    }
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
   3D間取り図ゲーム - ワクワク統合版！
🎮========================================🎮
✨ キャラクター数: ${CHARACTERS.length}体
🏠 廊下の長さ: ${CONFIG.HALLWAY_LENGTH}m
🚪 部屋の数: 3つ（寝室、子供部屋、LDK）
🎮========================================🎮
`);