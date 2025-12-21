// グローバル変数
let scene, camera, renderer, player, star;
let currentStage = 1;
let isGameRunning = false;
let isPaused = false;
let clock = new THREE.Clock();

// ゲーム状態
const gameData = {
    clearedStages: [],
    totalStars: 0
};

// プレイヤー状態
let playerHealth = 100;
let maxHealth = 100;
let isInvincible = false;
let invincibleTimer = 0;

// アイテム
let inventory = {
    flashlight: 0,
    potion: 0,
    key: 0
};
let flashlightActive = false;
let flashlightDuration = 0;

// プレイヤー移動
const moveSpeed = 8;
const keys = {};
let joystickActive = false;
let joystickDirection = { x: 0, y: 0 };

// カメラ制御
let mouseX = 0, mouseY = 0;
let targetRotationY = 0, targetRotationX = 0;
let isTouching = false;
let touchStartX = 0, touchStartY = 0;

// ゲームオブジェクト
let enemies = [];
let items = [];
let fearObjects = [];
let walls = [];

// 恐怖演出用
let fearTimer = 0;
let fearEventInterval = 10000;

// アイテムピックアップ
let nearbyItem = null;

// オーディオコンテキスト
let audioContext;

// ミニマップ
let minimapCtx;

// マップサイズ
const mapSize = 200;
const mapBoundary = mapSize / 2;

// 画面要素の取得
const loadingScreen = document.getElementById('loading-screen');
const loadingProgress = document.getElementById('loading-progress');
const loadingText = document.getElementById('loading-text');
const titleScreen = document.getElementById('title-screen');
const stageSelectScreen = document.getElementById('stage-select-screen');
const gameScreen = document.getElementById('game-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const clearScreen = document.getElementById('clear-screen');
const endingScreen = document.getElementById('ending-screen');
const gameContainer = document.getElementById('game-container');
const fearOverlay = document.getElementById('fear-overlay');
const damageOverlay = document.getElementById('damage-overlay');
const jumpscareEl = document.getElementById('jumpscare');
const messageDisplay = document.getElementById('message-display');
const pickupPrompt = document.getElementById('pickup-prompt');
const pauseMenu = document.getElementById('pause-menu');

// UI要素
const hpFill = document.getElementById('hp-fill');
const hpValue = document.getElementById('hp-value');
const flashlightCount = document.getElementById('flashlight-count');
const potionCount = document.getElementById('potion-count');
const keyCount = document.getElementById('key-count');
const totalStarsDisplay = document.getElementById('total-stars');

// ボタン
const startBtn = document.getElementById('start-btn');
const stageBtns = document.querySelectorAll('.stage-btn');
const backToTitleBtn = document.getElementById('back-to-title-btn');
const resumeBtn = document.getElementById('resume-btn');
const restartStageBtn = document.getElementById('restart-stage-btn');
const quitToSelectBtn = document.getElementById('quit-to-select-btn');
const retryBtn = document.getElementById('retry-btn');
const gameoverSelectBtn = document.getElementById('gameover-select-btn');
const nextStageBtn = document.getElementById('next-stage-btn');
const backToSelectBtn = document.getElementById('back-to-select-btn');
const endingBackBtn = document.getElementById('ending-back-btn');
const useFlashlightBtn = document.getElementById('use-flashlight-btn');
const usePotionBtn = document.getElementById('use-potion-btn');

// 初期化
window.addEventListener('load', () => {
    initAudio();
    loadGameData();
    initMinimap();
    simulateLoading();
});

function simulateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                switchScreen(loadingScreen, titleScreen);
            }, 500);
        }
        loadingProgress.style.width = progress + '%';
        loadingText.textContent = `読み込み中... ${Math.floor(progress)}%`;
    }, 200);
}

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function loadGameData() {
    const saved = localStorage.getItem('horrorGameDataV2');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            gameData.clearedStages = data.clearedStages || [];
            gameData.totalStars = data.totalStars || 0;
        } catch (e) {
            console.log('セーブデータの読み込みに失敗');
        }
    }
    updateStageSelectUI();
}

function saveGameData() {
    localStorage.setItem('horrorGameDataV2', JSON.stringify(gameData));
}

function initMinimap() {
    const canvas = document.getElementById('minimap-canvas');
    minimapCtx = canvas.getContext('2d');
}

// イベントリスナー
startBtn.addEventListener('click', () => {
    switchScreen(titleScreen, stageSelectScreen);
});

stageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const stage = parseInt(btn.getAttribute('data-stage'));
        startGame(stage);
    });
});

backToTitleBtn.addEventListener('click', () => {
    switchScreen(stageSelectScreen, titleScreen);
});

resumeBtn.addEventListener('click', () => {
    resumeGame();
});

restartStageBtn.addEventListener('click', () => {
    pauseMenu.classList.remove('active');
    isPaused = false;
    restartStage();
});

quitToSelectBtn.addEventListener('click', () => {
    pauseMenu.classList.remove('active');
    isPaused = false;
    stopGame();
    switchScreen(gameScreen, stageSelectScreen);
});

retryBtn.addEventListener('click', () => {
    switchScreen(gameoverScreen, gameScreen);
    restartStage();
});

gameoverSelectBtn.addEventListener('click', () => {
    switchScreen(gameoverScreen, stageSelectScreen);
});

nextStageBtn.addEventListener('click', () => {
    if (currentStage < 4) {
        startGame(currentStage + 1);
        switchScreen(clearScreen, gameScreen);
    } else {
        switchScreen(clearScreen, endingScreen);
    }
});

backToSelectBtn.addEventListener('click', () => {
    switchScreen(clearScreen, stageSelectScreen);
});

endingBackBtn.addEventListener('click', () => {
    switchScreen(endingScreen, titleScreen);
});

useFlashlightBtn.addEventListener('click', () => useItem('flashlight'));
usePotionBtn.addEventListener('click', () => useItem('potion'));

// キーボード入力
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === 'Escape' && isGameRunning) {
        if (isPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    }
    
    if (e.key === '1') useItem('flashlight');
    if (e.key === '2') useItem('potion');
    
    if (e.key.toLowerCase() === 'e' && nearbyItem) {
        pickupItem(nearbyItem);
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// マウス移動
document.addEventListener('mousemove', (e) => {
    if (isGameRunning && !isPaused) {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    }
});

// タッチ操作
let touchId = null;
const joystickBase = document.getElementById('joystick-base');
const joystickStick = document.getElementById('joystick-stick');

document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchmove', handleTouchMove, { passive: false });
document.addEventListener('touchend', handleTouchEnd, { passive: false });

function handleTouchStart(e) {
    if (!isGameRunning || isPaused) return;
    
    for (let touch of e.touches) {
        const rect = joystickBase.getBoundingClientRect();
        const x = touch.clientX;
        const y = touch.clientY;
        
        if (x >= rect.left - 50 && x <= rect.right + 50 &&
            y >= rect.top - 50 && y <= rect.bottom + 50) {
            touchId = touch.identifier;
            joystickActive = true;
            updateJoystick(touch.clientX, touch.clientY);
        } else {
            if (x > window.innerWidth / 2) {
                isTouching = true;
                touchStartX = x;
                touchStartY = y;
            }
        }
    }
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!isGameRunning || isPaused) return;
    
    for (let touch of e.touches) {
        if (touch.identifier === touchId) {
            updateJoystick(touch.clientX, touch.clientY);
        } else if (isTouching) {
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            mouseX = deltaX / window.innerWidth * 2;
            mouseY = -deltaY / window.innerHeight * 2;
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }
    }
    e.preventDefault();
}

function handleTouchEnd(e) {
    for (let touch of e.changedTouches) {
        if (touch.identifier === touchId) {
            joystickActive = false;
            touchId = null;
            joystickDirection = { x: 0, y: 0 };
            joystickStick.style.transform = 'translate(-50%, -50%)';
        }
    }
    if (e.touches.length === 0) {
        isTouching = false;
    }
    e.preventDefault();
}

function updateJoystick(touchX, touchY) {
    const rect = joystickBase.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let deltaX = touchX - centerX;
    let deltaY = touchY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = rect.width / 2;
    
    if (distance > maxDistance) {
        deltaX = deltaX / distance * maxDistance;
        deltaY = deltaY / distance * maxDistance;
    }
    
    joystickDirection.x = deltaX / maxDistance;
    joystickDirection.y = deltaY / maxDistance;
    
    joystickStick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
}

// ゲーム開始・停止
function startGame(stage) {
    currentStage = stage;
    switchScreen(stageSelectScreen, gameScreen);
    
    document.getElementById('current-stage-name').textContent = 
        `ステージ ${stage}: ${getStageName(stage)}`;
    
    playerHealth = maxHealth;
    inventory = { flashlight: 2, potion: 1, key: 0 };
    flashlightActive = false;
    flashlightDuration = 0;
    isInvincible = false;
    
    updateUI();
    
    initThreeJS();
    createStage(stage);
    isGameRunning = true;
    isPaused = false;
    fearTimer = 0;
    
    animate();
    
    setTimeout(() => {
        showMessage(`ステージ ${stage} スタート！星を目指せ！`);
    }, 500);
}

function stopGame() {
    isGameRunning = false;
    if (renderer) {
        gameContainer.removeChild(renderer.domElement);
        renderer.dispose();
    }
    
    enemies.forEach(enemy => {
        if (enemy.mesh) {
            scene.remove(enemy.mesh);
        }
    });
    items.forEach(item => {
        if (item.mesh) {
            scene.remove(item.mesh);
        }
    });
    
    scene = null;
    camera = null;
    renderer = null;
    player = null;
    star = null;
    enemies = [];
    items = [];
    fearObjects = [];
    walls = [];
}

function restartStage() {
    stopGame();
    setTimeout(() => {
        startGame(currentStage);
    }, 100);
}

function pauseGame() {
    isPaused = true;
    pauseMenu.classList.add('active');
    updatePauseMenu();
}

function resumeGame() {
    isPaused = false;
    pauseMenu.classList.remove('active');
}

function updatePauseMenu() {
    document.getElementById('pause-hp').textContent = playerHealth;
    document.getElementById('pause-flashlight').textContent = inventory.flashlight;
    document.getElementById('pause-potion').textContent = inventory.potion;
    document.getElementById('pause-key').textContent = inventory.key;
}

function getStageName(stage) {
    const names = ['墓地', '廃校', '廃ホテル', '廃病院'];
    return names[stage - 1];
}

// Three.js初期化
function initThreeJS() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 20, mapBoundary * 1.5);
    
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    gameContainer.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ステージ作成
function createStage(stageNum) {
    enemies = [];
    items = [];
    fearObjects = [];
    walls = [];
    
    createPlayer();
    
    switch(stageNum) {
        case 1:
            createGraveyardStage();
            break;
        case 2:
            createSchoolStage();
            break;
        case 3:
            createHotelStage();
            break;
        case 4:
            createHospitalStage();
            break;
    }
    
    createStar();
    spawnItems();
    spawnEnemies(stageNum);
}

function createPlayer() {
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x3498db,
        transparent: true,
        opacity: 0.8
    });
    player = new THREE.Mesh(geometry, material);
    player.position.set(0, 1, 0);
    player.castShadow = true;
    scene.add(player);
    
    camera.position.set(0, 5, 10);
    camera.lookAt(player.position);
    
    const playerLight = new THREE.PointLight(0xffffff, 0.5, 15);
    playerLight.position.copy(player.position);
    scene.add(playerLight);
    player.userData.light = playerLight;
}
// ステージ1: 墓地
function createGraveyardStage() {
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x1a1a1a, 10, 120);
    
    const groundGeo = new THREE.PlaneGeometry(mapSize * 2, mapSize * 2);
    const groundMat = new THREE.MeshPhongMaterial({ 
        color: 0x2a2a2a,
        side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    const moonLight = new THREE.DirectionalLight(0x6666aa, 0.4);
    moonLight.position.set(20, 40, 20);
    moonLight.castShadow = true;
    scene.add(moonLight);
    
    for (let i = 0; i < 80; i++) {
        const tomb = createTombstone();
        const angle = Math.random() * Math.PI * 2;
        const distance = 15 + Math.random() * 80;
        tomb.position.x = Math.cos(angle) * distance;
        tomb.position.z = Math.sin(angle) * distance;
        tomb.position.y = 0;
        scene.add(tomb);
        fearObjects.push(tomb);
    }
    
    for (let i = 0; i < 30; i++) {
        const tree = createDeadTree();
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 70;
        tree.position.x = Math.cos(angle) * distance;
        tree.position.z = Math.sin(angle) * distance;
        scene.add(tree);
    }
    
    createFogParticles();
}

function createTombstone() {
    const group = new THREE.Group();
    
    const stoneGeo = new THREE.BoxGeometry(2, 3, 0.5);
    const stoneMat = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const stone = new THREE.Mesh(stoneGeo, stoneMat);
    stone.position.y = 1.5;
    stone.castShadow = true;
    stone.receiveShadow = true;
    group.add(stone);
    
    const baseGeo = new THREE.BoxGeometry(2.5, 0.5, 1);
    const base = new THREE.Mesh(baseGeo, stoneMat);
    base.position.y = 0.25;
    base.receiveShadow = true;
    group.add(base);
    
    return group;
}

function createDeadTree() {
    const group = new THREE.Group();
    
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 5, 8);
    const trunkMat = new THREE.MeshPhongMaterial({ color: 0x2a1a0a });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2.5;
    trunk.castShadow = true;
    group.add(trunk);
    
    for (let i = 0; i < 3; i++) {
        const branchGeo = new THREE.CylinderGeometry(0.1, 0.15, 2, 6);
        const branch = new THREE.Mesh(branchGeo, trunkMat);
        branch.position.y = 3 + i * 0.5;
        branch.position.x = (Math.random() - 0.5) * 2;
        branch.rotation.z = (Math.random() - 0.5) * 0.5;
        branch.castShadow = true;
        group.add(branch);
    }
    
    return group;
}

// ステージ2: 廃校
function createSchoolStage() {
    scene.background = new THREE.Color(0x1a1a2a);
    scene.fog = new THREE.Fog(0x0a0a1a, 10, 130);
    
    const floorGeo = new THREE.PlaneGeometry(mapSize * 2, mapSize * 2);
    const floorMat = new THREE.MeshPhongMaterial({ 
        color: 0x3a3a4a,
        side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    const light = new THREE.PointLight(0x6688aa, 0.5, 100);
    light.position.set(0, 20, 0);
    light.castShadow = true;
    scene.add(light);
    
    createWall(-30, 0, 0, mapSize * 2, 0);
    createWall(30, 0, 0, mapSize * 2, 0);
    
    for (let i = 0; i < 25; i++) {
        const door = createDoor();
        door.position.x = (i % 2 === 0) ? -30 : 30;
        door.position.z = -80 + i * 7;
        if (i % 2 === 0) {
            door.rotation.y = Math.PI / 2;
        } else {
            door.rotation.y = -Math.PI / 2;
        }
        scene.add(door);
        fearObjects.push(door);
    }
    
    for (let i = 0; i < 40; i++) {
        const desk = createDesk();
        desk.position.x = (Math.random() - 0.5) * 50;
        desk.position.z = (Math.random() - 0.5) * 150;
        desk.rotation.y = Math.random() * Math.PI;
        scene.add(desk);
    }
    
    for (let i = 0; i < 5; i++) {
        const blackboard = createBlackboard();
        blackboard.position.set((Math.random() - 0.5) * 40, 3, -70 - i * 20);
        scene.add(blackboard);
    }
}

function createWall(x, y, z, length, rotationY) {
    const wallGeo = new THREE.BoxGeometry(1, 8, length);
    const wallMat = new THREE.MeshPhongMaterial({ color: 0x4a4a5a });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(x, y + 4, z);
    wall.rotation.y = rotationY;
    wall.receiveShadow = true;
    wall.castShadow = true;
    scene.add(wall);
    walls.push(wall);
}

function createDoor() {
    const group = new THREE.Group();
    
    const doorGeo = new THREE.BoxGeometry(3, 6, 0.2);
    const doorMat = new THREE.MeshPhongMaterial({ color: 0x6a4a3a });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.y = 3;
    door.castShadow = true;
    group.add(door);
    
    const knobGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const knobMat = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.position.set(1, 3, 0.2);
    group.add(knob);
    
    return group;
}

function createDesk() {
    const group = new THREE.Group();
    
    const topGeo = new THREE.BoxGeometry(2, 0.1, 1.5);
    const woodMat = new THREE.MeshPhongMaterial({ color: 0x8b6f47 });
    const top = new THREE.Mesh(topGeo, woodMat);
    top.position.y = 1.5;
    top.castShadow = true;
    group.add(top);
    
    const legGeo = new THREE.BoxGeometry(0.1, 1.5, 0.1);
    const positions = [
        [-0.9, 0.75, -0.65],
        [0.9, 0.75, -0.65],
        [-0.9, 0.75, 0.65],
        [0.9, 0.75, 0.65]
    ];
    
    positions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, woodMat);
        leg.position.set(...pos);
        leg.castShadow = true;
        group.add(leg);
    });
    
    return group;
}

function createBlackboard() {
    const boardGeo = new THREE.BoxGeometry(10, 4, 0.2);
    const boardMat = new THREE.MeshPhongMaterial({ color: 0x1a3a1a });
    const board = new THREE.Mesh(boardGeo, boardMat);
    return board;
}

// ステージ3: 廃ホテル
function createHotelStage() {
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x1a0a0a, 10, 140);
    
    const floorGeo = new THREE.PlaneGeometry(mapSize * 2, mapSize * 2);
    const floorMat = new THREE.MeshPhongMaterial({ 
        color: 0x2a2a3a,
        side: THREE.DoubleSide,
        shininess: 50
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    const chandelier = new THREE.PointLight(0xffaa66, 0.6, 120);
    chandelier.position.set(0, 25, 0);
    chandelier.castShadow = true;
    scene.add(chandelier);
    
    const carpetGeo = new THREE.PlaneGeometry(10, mapSize * 1.8);
    const carpetMat = new THREE.MeshPhongMaterial({ 
        color: 0x8b0000,
        side: THREE.DoubleSide
    });
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.y = 0.01;
    scene.add(carpet);
    
    createWall(-40, 0, 0, mapSize * 2, 0);
    createWall(40, 0, 0, mapSize * 2, 0);
    
    for (let i = 0; i < 30; i++) {
        const door = createHotelDoor(101 + i);
        door.position.x = (i % 2 === 0) ? -40 : 40;
        door.position.z = -90 + i * 6;
        if (i % 2 === 0) {
            door.rotation.y = Math.PI / 2;
        } else {
            door.rotation.y = -Math.PI / 2;
        }
        scene.add(door);
        fearObjects.push(door);
    }
    
    for (let i = 0; i < 20; i++) {
        const chair = createLuxuryChair();
        chair.position.x = (i % 2 === 0) ? -25 : 25;
        chair.position.z = -85 + i * 9;
        chair.rotation.y = (i % 2 === 0) ? Math.PI / 2 : -Math.PI / 2;
        scene.add(chair);
    }
    
    for (let i = 0; i < 15; i++) {
        const painting = createPainting();
        painting.position.x = (i % 2 === 0) ? -39.5 : 39.5;
        painting.position.y = 4;
        painting.position.z = -80 + i * 11;
        painting.rotation.y = (i % 2 === 0) ? Math.PI / 2 : -Math.PI / 2;
        scene.add(painting);
    }
}

function createHotelDoor(roomNumber) {
    const group = new THREE.Group();
    
    const doorGeo = new THREE.BoxGeometry(3, 6, 0.3);
    const doorMat = new THREE.MeshPhongMaterial({ color: 0x4a2a1a });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.y = 3;
    door.castShadow = true;
    group.add(door);
    
    const plateGeo = new THREE.BoxGeometry(0.8, 0.4, 0.1);
    const plateMat = new THREE.MeshPhongMaterial({ color: 0xffd700 });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(0, 4, 0.2);
    group.add(plate);
    
    return group;
}

function createLuxuryChair() {
    const group = new THREE.Group();
    
    const seatGeo = new THREE.BoxGeometry(1.5, 0.3, 1.5);
    const velvetMat = new THREE.MeshPhongMaterial({ color: 0x8b0000 });
    const seat = new THREE.Mesh(seatGeo, velvetMat);
    seat.position.y = 1;
    seat.castShadow = true;
    group.add(seat);
    
    const backGeo = new THREE.BoxGeometry(1.5, 2, 0.3);
    const back = new THREE.Mesh(backGeo, velvetMat);
    back.position.y = 2;
    back.position.z = -0.6;
    back.castShadow = true;
    group.add(back);
    
    const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    const legMat = new THREE.MeshPhongMaterial({ color: 0x4a3a2a });
    const positions = [
        [-0.6, 0.5, -0.6],
        [0.6, 0.5, -0.6],
        [-0.6, 0.5, 0.6],
        [0.6, 0.5, 0.6]
    ];
    
    positions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(...pos);
        leg.castShadow = true;
        group.add(leg);
    });
    
    return group;
}

function createPainting() {
    const group = new THREE.Group();
    
    const frameGeo = new THREE.BoxGeometry(3, 4, 0.2);
    const frameMat = new THREE.MeshPhongMaterial({ color: 0x8b6f47 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    group.add(frame);
    
    const artGeo = new THREE.BoxGeometry(2.5, 3.5, 0.1);
    const artMat = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
    const art = new THREE.Mesh(artGeo, artMat);
    art.position.z = 0.1;
    group.add(art);
    
    return group;
}

// ステージ4: 廃病院
function createHospitalStage() {
    scene.background = new THREE.Color(0x0a1a0a);
    scene.fog = new THREE.Fog(0x0a1a0a, 10, 150);
    
    const floorGeo = new THREE.PlaneGeometry(mapSize * 2, mapSize * 2);
    const floorMat = new THREE.MeshPhongMaterial({ 
        color: 0x3a4a3a,
        side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    const hospitalLight = new THREE.PointLight(0x66aa66, 0.5, 130);
    hospitalLight.position.set(0, 25, 0);
    hospitalLight.castShadow = true;
    scene.add(hospitalLight);
    
    createWall(-35, 0, 0, mapSize * 2, 0);
    createWall(35, 0, 0, mapSize * 2, 0);
    
    for (let i = 0; i < 35; i++) {
        const door = createHospitalDoor(i + 1);
        door.position.x = (i % 2 === 0) ? -35 : 35;
        door.position.z = -95 + i * 5.5;
        if (i % 2 === 0) {
            door.rotation.y = Math.PI / 2;
        } else {
            door.rotation.y = -Math.PI / 2;
        }
        scene.add(door);
        fearObjects.push(door);
    }
    
    for (let i = 0; i < 25; i++) {
        const bed = createHospitalBed();
        bed.position.x = (Math.random() - 0.5) * 60;
        bed.position.z = (Math.random() - 0.5) * 170;
        bed.rotation.y = Math.random() * Math.PI;
        scene.add(bed);
    }
    
    for (let i = 0; i < 15; i++) {
        const machine = createMedicalMachine();
        machine.position.x = (Math.random() - 0.5) * 60;
        machine.position.z = (Math.random() - 0.5) * 170;
        scene.add(machine);
    }
}

function createHospitalDoor(roomNumber) {
    const group = new THREE.Group();
    
    const doorGeo = new THREE.BoxGeometry(3, 6, 0.2);
    const doorMat = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.y = 3;
    door.castShadow = true;
    group.add(door);
    
    const windowGeo = new THREE.BoxGeometry(1.5, 1.5, 0.1);
    const windowMat = new THREE.MeshPhongMaterial({ 
        color: 0x88aaaa,
        transparent: true,
        opacity: 0.5
    });
    const window = new THREE.Mesh(windowGeo, windowMat);
    window.position.set(0, 4, 0.15);
    group.add(window);
    
    return group;
}

function createHospitalBed() {
    const group = new THREE.Group();
    
    const mattressGeo = new THREE.BoxGeometry(2, 0.3, 3);
    const mattressMat = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
    const mattress = new THREE.Mesh(mattressGeo, mattressMat);
    mattress.position.y = 1;
    mattress.castShadow = true;
    group.add(mattress);
    
    const frameGeo = new THREE.BoxGeometry(2.2, 0.8, 3.2);
    const frameMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 0.5;
    frame.castShadow = true;
    group.add(frame);
    
    return group;
}

function createMedicalMachine() {
    const group = new THREE.Group();
    
    const bodyGeo = new THREE.BoxGeometry(1, 2, 1);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1;
    body.castShadow = true;
    group.add(body);
    
    const screenGeo = new THREE.BoxGeometry(0.8, 0.6, 0.1);
    const screenMat = new THREE.MeshPhongMaterial({ 
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 0.3
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 1.5, 0.5);
    group.add(screen);
    
    return group;
}

function createFogParticles() {
    const particleCount = 150;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * mapSize * 1.5;
        positions[i + 1] = Math.random() * 15;
        positions[i + 2] = (Math.random() - 0.5) * mapSize * 1.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0x888888,
        size: 0.5,
        transparent: true,
        opacity: 0.3
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
}
// 星（ゴール）
function createStar() {
    const starGeo = new THREE.SphereGeometry(1, 16, 16);
    const starMat = new THREE.MeshPhongMaterial({ 
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 0.8
    });
    star = new THREE.Mesh(starGeo, starMat);
    
    switch(currentStage) {
        case 1:
            star.position.set(0, 2, -80);
            break;
        case 2:
            star.position.set(0, 3, -90);
            break;
        case 3:
            star.position.set(0, 3, -100);
            break;
        case 4:
            star.position.set(0, 3, -110);
            break;
    }
    
    scene.add(star);
    
    const starLight = new THREE.PointLight(0xffff00, 1.5, 30);
    starLight.position.copy(star.position);
    scene.add(starLight);
}

// アイテムスポーン
function spawnItems() {
    const itemTypes = ['flashlight', 'potion', 'flashlight', 'potion', 'key'];
    
    itemTypes.forEach(type => {
        const item = {
            type: type,
            mesh: null,
            collected: false
        };
        
        let geometry, material;
        switch(type) {
            case 'flashlight':
                geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0xffff00,
                    emissive: 0xffaa00,
                    emissiveIntensity: 0.5
                });
                break;
            case 'potion':
                geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 8);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0xff0000,
                    transparent: true,
                    opacity: 0.8
                });
                break;
            case 'key':
                geometry = new THREE.BoxGeometry(0.5, 0.2, 0.1);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0xffd700,
                    emissive: 0xffd700,
                    emissiveIntensity: 0.3
                });
                break;
        }
        
        item.mesh = new THREE.Mesh(geometry, material);
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 60;
        item.mesh.position.x = Math.cos(angle) * distance;
        item.mesh.position.y = 1;
        item.mesh.position.z = Math.sin(angle) * distance;
        
        scene.add(item.mesh);
        items.push(item);
    });
}

// 敵スポーン
function spawnEnemies(stageNum) {
    const enemyCount = 2 + stageNum * 2;
    
    for (let i = 0; i < enemyCount; i++) {
        let enemyType;
        if (stageNum === 1) {
            enemyType = 'wandering';
        } else if (stageNum === 2) {
            enemyType = (i % 2 === 0) ? 'wandering' : 'chasing';
        } else if (stageNum === 3) {
            enemyType = (i % 3 === 0) ? 'teleport' : (i % 2 === 0) ? 'wandering' : 'chasing';
        } else {
            enemyType = (i % 3 === 0) ? 'teleport' : (i % 2 === 0) ? 'wandering' : 'chasing';
        }
        
        const enemy = createEnemy(enemyType);
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 50;
        enemy.mesh.position.x = Math.cos(angle) * distance;
        enemy.mesh.position.y = 2;
        enemy.mesh.position.z = Math.sin(angle) * distance;
        
        enemy.targetPosition = enemy.mesh.position.clone();
        
        scene.add(enemy.mesh);
        enemies.push(enemy);
    }
}

function createEnemy(type) {
    const enemy = {
        type: type,
        mesh: null,
        targetPosition: new THREE.Vector3(),
        speed: 0,
        detectionRange: 0,
        damageAmount: 0,
        isChasing: false,
        teleportTimer: 0
    };
    
    let geometry, material;
    
    switch(type) {
        case 'wandering':
            geometry = new THREE.SphereGeometry(1, 8, 8);
            material = new THREE.MeshPhongMaterial({ 
                color: 0x00ff00,
                transparent: true,
                opacity: 0.6,
                emissive: 0x00ff00,
                emissiveIntensity: 0.4
            });
            enemy.speed = 2;
            enemy.detectionRange = 0;
            enemy.damageAmount = 10;
            break;
            
        case 'chasing':
            geometry = new THREE.SphereGeometry(1.2, 8, 8);
            material = new THREE.MeshPhongMaterial({ 
                color: 0xff0000,
                transparent: true,
                opacity: 0.7,
                emissive: 0xff0000,
                emissiveIntensity: 0.5
            });
            enemy.speed = 4;
            enemy.detectionRange = 30;
            enemy.damageAmount = 20;
            break;
            
        case 'teleport':
            geometry = new THREE.SphereGeometry(1.3, 8, 8);
            material = new THREE.MeshPhongMaterial({ 
                color: 0xff00ff,
                transparent: true,
                opacity: 0.5,
                emissive: 0xff00ff,
                emissiveIntensity: 0.6
            });
            enemy.speed = 1;
            enemy.detectionRange = 40;
            enemy.damageAmount = 30;
            enemy.teleportTimer = 0;
            break;
    }
    
    enemy.mesh = new THREE.Mesh(geometry, material);
    enemy.mesh.castShadow = true;
    
    const enemyLight = new THREE.PointLight(
        material.color.getHex(),
        0.5,
        10
    );
    enemyLight.position.copy(enemy.mesh.position);
    scene.add(enemyLight);
    enemy.mesh.userData.light = enemyLight;
    
    return enemy;
}

// UI更新
function updateUI() {
    hpFill.style.width = (playerHealth / maxHealth * 100) + '%';
    hpValue.textContent = Math.max(0, Math.floor(playerHealth));
    
    flashlightCount.textContent = inventory.flashlight;
    potionCount.textContent = inventory.potion;
    keyCount.textContent = inventory.key;
    
    useFlashlightBtn.disabled = inventory.flashlight === 0 || flashlightActive;
    usePotionBtn.disabled = inventory.potion === 0 || playerHealth >= maxHealth;
    
    totalStarsDisplay.textContent = gameData.totalStars;
}

// アイテム使用
function useItem(itemType) {
    if (itemType === 'flashlight' && inventory.flashlight > 0 && !flashlightActive) {
        inventory.flashlight--;
        flashlightActive = true;
        flashlightDuration = 15000;
        
        if (player.userData.light) {
            player.userData.light.intensity = 2;
            player.userData.light.distance = 40;
        }
        
        showMessage('🔦 懐中電灯を使用！視界が明るくなった！');
        updateUI();
    } else if (itemType === 'potion' && inventory.potion > 0 && playerHealth < maxHealth) {
        inventory.potion--;
        playerHealth = Math.min(maxHealth, playerHealth + 50);
        
        showMessage('💊 回復薬を使用！HP +50');
        playHealSound();
        updateUI();
    }
}

function pickupItem(item) {
    if (item.collected) return;
    
    item.collected = true;
    inventory[item.type]++;
    
    scene.remove(item.mesh);
    
    let message = '';
    switch(item.type) {
        case 'flashlight':
            message = '🔦 懐中電灯を手に入れた！';
            break;
        case 'potion':
            message = '💊 回復薬を手に入れた！';
            break;
        case 'key':
            message = '🔑 鍵を手に入れた！';
            break;
    }
    
    showMessage(message);
    playPickupSound();
    updateUI();
    
    nearbyItem = null;
    pickupPrompt.classList.remove('show');
}

// ゲームループ
function animate() {
    if (!isGameRunning) return;
    
    requestAnimationFrame(animate);
    
    if (isPaused) return;
    
    const delta = clock.getDelta();
    
    updatePlayerMovement(delta);
    updateCamera();
    updateEnemies(delta);
    updateItems(delta);
    updateFlashlight(delta);
    checkCollisions();
    
    if (star) {
        star.rotation.y += 0.02;
        star.position.y += Math.sin(Date.now() * 0.002) * 0.01;
    }
    
    fearTimer += delta * 1000;
    if (fearTimer >= fearEventInterval) {
        triggerFearEvent();
        fearTimer = 0;
        fearEventInterval = 8000 + Math.random() * 10000;
    }
    
    if (isInvincible) {
        invincibleTimer -= delta;
        if (invincibleTimer <= 0) {
            isInvincible = false;
            player.material.opacity = 0.8;
        } else {
            player.material.opacity = (Math.sin(Date.now() * 0.02) + 1) / 4 + 0.3;
        }
    }
    
    updateMinimap();
    checkStarCollision();
    
    renderer.render(scene, camera);
}

function updatePlayerMovement(delta) {
    if (!player) return;
    
    const speed = moveSpeed * delta;
    let moveX = 0;
    let moveZ = 0;
    
    if (keys['w'] || keys['arrowup']) moveZ -= 1;
    if (keys['s'] || keys['arrowdown']) moveZ += 1;
    if (keys['a'] || keys['arrowleft']) moveX -= 1;
    if (keys['d'] || keys['arrowright']) moveX += 1;
    
    if (joystickActive) {
        moveX += joystickDirection.x;
        moveZ += joystickDirection.y;
    }
    
    const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (length > 0) {
        moveX = moveX / length * speed;
        moveZ = moveZ / length * speed;
    }
    
    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);
    
    forward.applyQuaternion(camera.quaternion);
    right.applyQuaternion(camera.quaternion);
    
    forward.y = 0;
    right.y = 0;
    forward.normalize();
    right.normalize();
    
    const movement = new THREE.Vector3();
    movement.addScaledVector(forward, -moveZ);
    movement.addScaledVector(right, moveX);
    
    player.position.add(movement);
    
    player.position.x = Math.max(-mapBoundary + 5, Math.min(mapBoundary - 5, player.position.x));
    player.position.z = Math.max(-mapBoundary + 5, Math.min(mapBoundary - 5, player.position.z));
    
    if (player.userData.light) {
        player.userData.light.position.copy(player.position);
    }
}

function updateCamera() {
    if (!player || !camera) return;
    
    targetRotationY += mouseX * 0.02;
    targetRotationX += mouseY * 0.01;
    targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationX));
    
    const cameraDistance = 10;
    const cameraHeight = 5;
    
    camera.position.x = player.position.x + Math.sin(targetRotationY) * cameraDistance;
    camera.position.y = player.position.y + cameraHeight + targetRotationX * 5;
    camera.position.z = player.position.z + Math.cos(targetRotationY) * cameraDistance;
    
    camera.lookAt(player.position);
    
    mouseX *= 0.95;
    mouseY *= 0.95;
}

function updateEnemies(delta) {
    enemies.forEach(enemy => {
        if (!enemy.mesh) return;
        
        const distanceToPlayer = enemy.mesh.position.distanceTo(player.position);
        
        switch(enemy.type) {
            case 'wandering':
                if (enemy.mesh.position.distanceTo(enemy.targetPosition) < 2) {
                    enemy.targetPosition.x = (Math.random() - 0.5) * mapSize;
                    enemy.targetPosition.z = (Math.random() - 0.5) * mapSize;
                }
                
                const dirWander = new THREE.Vector3()
                    .subVectors(enemy.targetPosition, enemy.mesh.position)
                    .normalize();
                
                enemy.mesh.position.add(dirWander.multiplyScalar(enemy.speed * delta));
                break;
                
            case 'chasing':
                if (distanceToPlayer < enemy.detectionRange) {
                    enemy.isChasing = true;
                    const dirChase = new THREE.Vector3()
                        .subVectors(player.position, enemy.mesh.position)
                        .normalize();
                    
                    enemy.mesh.position.add(dirChase.multiplyScalar(enemy.speed * delta));
                } else {
                    enemy.isChasing = false;
                    if (enemy.mesh.position.distanceTo(enemy.targetPosition) < 2) {
                        enemy.targetPosition.x = (Math.random() - 0.5) * mapSize;
                        enemy.targetPosition.z = (Math.random() - 0.5) * mapSize;
                    }
                    const dirWander2 = new THREE.Vector3()
                        .subVectors(enemy.targetPosition, enemy.mesh.position)
                        .normalize();
                    
                    enemy.mesh.position.add(dirWander2.multiplyScalar(enemy.speed * delta));
                }
                break;
                
            case 'teleport':
                enemy.teleportTimer += delta;
                
                if (distanceToPlayer < enemy.detectionRange && enemy.teleportTimer > 3) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 5 + Math.random() * 10;
                    enemy.mesh.position.x = player.position.x + Math.cos(angle) * distance;
                    enemy.mesh.position.z = player.position.z + Math.sin(angle) * distance;
                    
                    playTeleportSound();
                    enemy.teleportTimer = 0;
                }
                break;
        }
        
        if (enemy.mesh.userData.light) {
            enemy.mesh.userData.light.position.copy(enemy.mesh.position);
        }
        
        enemy.mesh.position.y = 2 + Math.sin(Date.now() * 0.003 + enemy.mesh.position.x) * 0.3;
        enemy.mesh.rotation.y += delta;
    });
}

function updateItems(delta) {
    nearbyItem = null;
    
    items.forEach(item => {
        if (item.collected || !item.mesh) return;
        
        item.mesh.rotation.y += delta * 2;
        item.mesh.position.y = 1 + Math.sin(Date.now() * 0.003 + item.mesh.position.x) * 0.2;
        
        const distance = item.mesh.position.distanceTo(player.position);
        if (distance < 3) {
            nearbyItem = item;
        }
    });
    
    if (nearbyItem) {
        pickupPrompt.classList.add('show');
    } else {
        pickupPrompt.classList.remove('show');
    }
}

function updateFlashlight(delta) {
    if (flashlightActive) {
        flashlightDuration -= delta * 1000;
        
        if (flashlightDuration <= 0) {
            flashlightActive = false;
            if (player.userData.light) {
                player.userData.light.intensity = 0.5;
                player.userData.light.distance = 15;
            }
            showMessage('🔦 懐中電灯が切れた');
        }
    }
}

function checkCollisions() {
    if (isInvincible) return;
    
    enemies.forEach(enemy => {
        if (!enemy.mesh) return;
        
        const distance = enemy.mesh.position.distanceTo(player.position);
        if (distance < 2) {
            takeDamage(enemy.damageAmount);
        }
    });
}

function takeDamage(amount) {
    playerHealth -= amount;
    isInvincible = true;
    invincibleTimer = 1;
    
    damageOverlay.classList.add('hit');
    setTimeout(() => damageOverlay.classList.remove('hit'), 300);
    
    playDamageSound();
    updateUI();
    
    if (playerHealth <= 0) {
        gameOver();
    } else {
        showMessage(`-${amount} ダメージ！`);
    }
}

function checkStarCollision() {
    if (!player || !star) return;
    
    const distance = player.position.distanceTo(star.position);
    
    if (distance < 3) {
        playStarSound();
        showMessage('⭐ 星を手に入れた！');
        
        setTimeout(() => {
            stageClear();
        }, 1500);
    }
}

function gameOver() {
    isGameRunning = false;
    switchScreen(gameScreen, gameoverScreen);
}

function stageClear() {
    isGameRunning = false;
    
    if (!gameData.clearedStages.includes(currentStage)) {
        gameData.clearedStages.push(currentStage);
        gameData.totalStars++;
        saveGameData();
    }
    
    const clearMessage = document.getElementById('clear-message');
    clearMessage.textContent = `ステージ ${currentStage}: ${getStageName(currentStage)} をクリア！`;
    
    document.getElementById('clear-hp').textContent = Math.floor(playerHealth);
    document.getElementById('clear-items').textContent = 
        inventory.flashlight + inventory.potion + inventory.key;
    
    if (currentStage < 4) {
        nextStageBtn.style.display = 'block';
    } else {
        nextStageBtn.style.display = 'none';
    }
    
    switchScreen(gameScreen, clearScreen);
    updateStageSelectUI();
}
// ミニマップ更新
function updateMinimap() {
    if (!minimapCtx || !player) return;
    
    const canvas = minimapCtx.canvas;
    const w = canvas.width;
    const h = canvas.height;
    const scale = w / mapSize;
    
    minimapCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    minimapCtx.fillRect(0, 0, w, h);
    
    if (star) {
        const starX = (star.position.x + mapBoundary) * scale;
        const starY = (star.position.z + mapBoundary) * scale;
        minimapCtx.fillStyle = '#ffff00';
        minimapCtx.beginPath();
        minimapCtx.arc(starX, starY, 5, 0, Math.PI * 2);
        minimapCtx.fill();
    }
    
    enemies.forEach(enemy => {
        if (!enemy.mesh) return;
        const ex = (enemy.mesh.position.x + mapBoundary) * scale;
        const ey = (enemy.mesh.position.z + mapBoundary) * scale;
        
        let color;
        switch(enemy.type) {
            case 'wandering': color = '#00ff00'; break;
            case 'chasing': color = '#ff0000'; break;
            case 'teleport': color = '#ff00ff'; break;
        }
        
        minimapCtx.fillStyle = color;
        minimapCtx.beginPath();
        minimapCtx.arc(ex, ey, 3, 0, Math.PI * 2);
        minimapCtx.fill();
    });
    
    items.forEach(item => {
        if (item.collected || !item.mesh) return;
        const ix = (item.mesh.position.x + mapBoundary) * scale;
        const iy = (item.mesh.position.z + mapBoundary) * scale;
        minimapCtx.fillStyle = '#00ffff';
        minimapCtx.fillRect(ix - 2, iy - 2, 4, 4);
    });
    
    const px = (player.position.x + mapBoundary) * scale;
    const py = (player.position.z + mapBoundary) * scale;
    minimapCtx.fillStyle = '#3498db';
    minimapCtx.beginPath();
    minimapCtx.arc(px, py, 4, 0, Math.PI * 2);
    minimapCtx.fill();
    
    minimapCtx.strokeStyle = '#3498db';
    minimapCtx.lineWidth = 2;
    minimapCtx.beginPath();
    minimapCtx.moveTo(px, py);
    minimapCtx.lineTo(
        px + Math.sin(targetRotationY) * 10,
        py + Math.cos(targetRotationY) * 10
    );
    minimapCtx.stroke();
}

// 恐怖演出
function triggerFearEvent() {
    const random = Math.random();
    
    if (random < 0.4) {
        spawnGhost();
    } else if (random < 0.7) {
        spawnCat();
    } else if (random < 0.9) {
        dropObject();
    } else {
        triggerJumpscare();
    }
}

function spawnGhost() {
    const ghostGeo = new THREE.SphereGeometry(1, 8, 8);
    const ghostMat = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
        emissive: 0xaaaaaa
    });
    const ghost = new THREE.Mesh(ghostGeo, ghostMat);
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 10 + Math.random() * 15;
    ghost.position.x = player.position.x + Math.cos(angle) * distance;
    ghost.position.y = 2;
    ghost.position.z = player.position.z + Math.sin(angle) * distance;
    
    scene.add(ghost);
    
    playScarySound();
    
    fearOverlay.classList.add('flash-red');
    setTimeout(() => fearOverlay.classList.remove('flash-red'), 500);
    
    setTimeout(() => {
        scene.remove(ghost);
        ghostGeo.dispose();
        ghostMat.dispose();
    }, 3000);
    
    showMessage('何かが現れた...！');
}

function spawnCat() {
    const catGeo = new THREE.BoxGeometry(0.6, 0.4, 0.8);
    const catMat = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const cat = new THREE.Mesh(catGeo, catMat);
    
    cat.position.x = player.position.x - 20;
    cat.position.y = 0.2;
    cat.position.z = player.position.z + (Math.random() - 0.5) * 10;
    
    scene.add(cat);
    
    playMeowSound();
    
    let catSpeed = 10;
    const catInterval = setInterval(() => {
        cat.position.x += catSpeed * 0.016;
        
        if (cat.position.x > player.position.x + 20) {
            scene.remove(cat);
            catGeo.dispose();
            catMat.dispose();
            clearInterval(catInterval);
        }
    }, 16);
    
    showMessage('黒猫が横切った！');
}

function dropObject() {
    const objGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const objMat = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const obj = new THREE.Mesh(objGeo, objMat);
    
    obj.position.x = player.position.x + (Math.random() - 0.5) * 10;
    obj.position.y = 10;
    obj.position.z = player.position.z + (Math.random() - 0.5) * 10;
    
    scene.add(obj);
    
    const fallInterval = setInterval(() => {
        obj.position.y -= 0.3;
        obj.rotation.x += 0.1;
        obj.rotation.z += 0.1;
        
        if (obj.position.y <= 0) {
            playDropSound();
            
            fearOverlay.classList.add('shake');
            setTimeout(() => fearOverlay.classList.remove('shake'), 500);
            
            setTimeout(() => {
                scene.remove(obj);
                objGeo.dispose();
                objMat.dispose();
            }, 2000);
            
            clearInterval(fallInterval);
        }
    }, 16);
    
    showMessage('何かが落ちた！');
}

function triggerJumpscare() {
    const scares = ['👻', '😱', '💀', '👁️'];
    const randomScare = scares[Math.floor(Math.random() * scares.length)];
    
    jumpscareEl.textContent = randomScare;
    jumpscareEl.classList.add('active');
    
    playJumpscareSound();
    
    setTimeout(() => {
        jumpscareEl.classList.remove('active');
    }, 500);
}

// 音響効果
function playScarySound() {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 200;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
}

function playMeowSound() {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playDropSound() {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 100;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

function playJumpscareSound() {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 1000;
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playStarSound() {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function playDamageSound() {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 150;
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

function playPickupSound() {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.1);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

function playHealSound() {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playTeleportSound() {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// メッセージ表示
function showMessage(text) {
    messageDisplay.textContent = text;
    messageDisplay.classList.add('show');
    
    setTimeout(() => {
        messageDisplay.classList.remove('show');
    }, 3000);
}

// ステージ選択UI更新
function updateStageSelectUI() {
    for (let i = 1; i <= 4; i++) {
        const status = document.getElementById(`stage${i}-status`);
        if (gameData.clearedStages.includes(i)) {
            status.classList.add('cleared');
        } else {
            status.classList.remove('cleared');
        }
    }
    totalStarsDisplay.textContent = gameData.totalStars;
}

// 画面切り替え
function switchScreen(fromScreen, toScreen) {
    fromScreen.style.opacity = '0';
    setTimeout(() => {
        fromScreen.classList.remove('active');
        toScreen.classList.add('active');
        setTimeout(() => {
            toScreen.style.opacity = '1';
        }, 50);
    }, 500);
}
