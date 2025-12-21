// ゲームの設定
let currentStage = 1;
let foundCount = 0;
let totalMistakes = 3;
let mistakes = [];

// Three.jsのシーン設定
let sceneLeft, sceneRight;
let cameraLeft, cameraRight;
let rendererLeft, rendererRight;
let objects = { left: [], right: [] };

// アニメーション用
let animationTime = 0;

// ステージごとの設定
const stageConfig = {
    1: { name: '🏫 教室', mistakes: 3 },
    2: { name: '⚽ 校庭', mistakes: 4 },
    3: { name: '🌳 公園', mistakes: 5 },
    4: { name: '🏪 商店街', mistakes: 6 },
    5: { name: '🚶 学校帰りの道', mistakes: 8 }
};

// ステージ選択ボタンのイベント
document.querySelectorAll('.stage-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const stage = parseInt(btn.getAttribute('data-stage'));
        startStage(stage);
    });
});

// ステージ開始
function startStage(stageNumber) {
    currentStage = stageNumber;
    totalMistakes = stageConfig[stageNumber].mistakes;
    
    document.getElementById('stage-select-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('stage-title').textContent = `ステージ ${stageNumber}: ${stageConfig[stageNumber].name}`;
    document.getElementById('total-count').textContent = totalMistakes;
    
    init();
}

// ステージ選択に戻る
document.getElementById('back-btn').addEventListener('click', () => {
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('stage-select-screen').style.display = 'block';
    cleanup();
});

// ゲーム初期化
function init() {
    foundCount = 0;
    updateScore();
    mistakes = [];
    
    // キャンバスの取得
    const canvasLeft = document.getElementById('canvas-left');
    const canvasRight = document.getElementById('canvas-right');
    
    // シーンの作成
    sceneLeft = new THREE.Scene();
    sceneRight = new THREE.Scene();
    
    // カメラの作成
    const aspect = canvasLeft.clientWidth / canvasLeft.clientHeight;
    cameraLeft = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    cameraRight = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    
    // ステージに応じたカメラ位置
    if (currentStage === 1) {
        cameraLeft.position.set(0, 3, 8);
        cameraRight.position.set(0, 3, 8);
    } else if (currentStage === 2) {
        cameraLeft.position.set(0, 5, 15);
        cameraRight.position.set(0, 5, 15);
    } else if (currentStage === 3) {
        cameraLeft.position.set(0, 4, 12);
        cameraRight.position.set(0, 4, 12);
    } else if (currentStage === 4) {
        cameraLeft.position.set(0, 3, 10);
        cameraRight.position.set(0, 3, 10);
    } else {
        cameraLeft.position.set(0, 5, 15);
        cameraRight.position.set(0, 5, 15);
    }
    
    cameraLeft.lookAt(0, 0, 0);
    cameraRight.lookAt(0, 0, 0);
    
    // レンダラーの作成
    rendererLeft = new THREE.WebGLRenderer({ canvas: canvasLeft, antialias: true });
    rendererRight = new THREE.WebGLRenderer({ canvas: canvasRight, antialias: true });
    
    rendererLeft.setSize(canvasLeft.clientWidth, canvasLeft.clientHeight);
    rendererRight.setSize(canvasRight.clientWidth, canvasRight.clientHeight);
    
    // 照明の追加
    addLights(sceneLeft);
    addLights(sceneRight);
    
    // ステージに応じたシーンを作成
    createStageScene();
    
    // 間違いを配置
    createMistakes();
    
    // クリックイベント
    canvasRight.addEventListener('click', onCanvasClick);
    
    // アニメーション開始
    animate();
}

// 照明を追加
function addLights(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
}

// ステージに応じたシーンを作成
function createStageScene() {
    switch(currentStage) {
        case 1:
            createClassroom();
            break;
        case 2:
            createSchoolyard();
            break;
        case 3:
            createPark();
            break;
        case 4:
            createShoppingStreet();
            break;
        case 5:
            createStreet();
            break;
    }
}

// ステージ1: 教室
function createClassroom() {
    // 床
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xF5DEB3 });
    const floorLeft = new THREE.Mesh(floorGeometry, floorMaterial);
    const floorRight = new THREE.Mesh(floorGeometry, floorMaterial.clone());
    floorLeft.rotation.x = -Math.PI / 2;
    floorRight.rotation.x = -Math.PI / 2;
    sceneLeft.add(floorLeft);
    sceneRight.add(floorRight);
    
    // 黒板
    createBlackboard(0, 2, -8, 0x2F4F2F, 'blackboard');
    
    // 机と椅子
    createDesk(-3, -2, 0xA0522D, 'desk1');
    createDesk(0, -2, 0xA0522D, 'desk2');
    createDesk(3, -2, 0xA0522D, 'desk3');
    createDesk(-3, 2, 0xA0522D, 'desk4');
    createDesk(0, 2, 0xA0522D, 'desk5');
    createDesk(3, 2, 0xA0522D, 'desk6');
    
    // 本棚
    createBookshelf(-7, -5, 0x8B4513, 'bookshelf1');
    createBookshelf(7, -5, 0x8B4513, 'bookshelf2');
    
    // 窓
    createWindow(-7, 5, 0x87CEEB, 'window1');
    createWindow(-7, 0, 0x87CEEB, 'window2');
    
    // 時計
    createClock(0, 4, -7.9, 0xFFFFFF, 'clock');
}

// 黒板を作成
function createBlackboard(x, y, z, color, id) {
    const geometry = new THREE.BoxGeometry(6, 3, 0.2);
    const material = new THREE.MeshLambertMaterial({ color: color });
    const left = new THREE.Mesh(geometry, material);
    const right = new THREE.Mesh(geometry, material.clone());
    left.position.set(x, y, z);
    right.position.set(x, y, z);
    sceneLeft.add(left);
    sceneRight.add(right);
    
    objects.left.push({ mesh: left, id: id });
    objects.right.push({ mesh: right, id: id });
}

// 机を作成
function createDesk(x, z, color, id) {
    const deskGeometry = new THREE.BoxGeometry(1.5, 0.1, 1);
    const deskMaterial = new THREE.MeshLambertMaterial({ color: color });
    const deskLeft = new THREE.Mesh(deskGeometry, deskMaterial);
    const deskRight = new THREE.Mesh(deskGeometry, deskMaterial.clone());
    deskLeft.position.set(x, 0.8, z);
    deskRight.position.set(x, 0.8, z);
    
    // 机の脚
    const legGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    for (let i = 0; i < 4; i++) {
        const legLeft = new THREE.Mesh(legGeometry, deskMaterial);
        const legRight = new THREE.Mesh(legGeometry, deskMaterial.clone());
        const offsetX = i % 2 === 0 ? -0.6 : 0.6;
        const offsetZ = i < 2 ? -0.4 : 0.4;
        legLeft.position.set(x + offsetX, 0.4, z + offsetZ);
        legRight.position.set(x + offsetX, 0.4, z + offsetZ);
        sceneLeft.add(legLeft);
        sceneRight.add(legRight);
    }
    
    sceneLeft.add(deskLeft);
    sceneRight.add(deskRight);
    
    objects.left.push({ mesh: deskLeft, id: id });
    objects.right.push({ mesh: deskRight, id: id });
}

// 本棚を作成
function createBookshelf(x, z, color, id) {
    const shelfGeometry = new THREE.BoxGeometry(2, 4, 0.5);
    const shelfMaterial = new THREE.MeshLambertMaterial({ color: color });
    const shelfLeft = new THREE.Mesh(shelfGeometry, shelfMaterial);
    const shelfRight = new THREE.Mesh(shelfGeometry, shelfMaterial.clone());
    shelfLeft.position.set(x, 2, z);
    shelfRight.position.set(x, 2, z);
    
    // 本
    for (let i = 0; i < 3; i++) {
        const bookGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.4);
        const bookColor = [0xFF0000, 0x0000FF, 0x00FF00][i];
        const bookMaterial = new THREE.MeshLambertMaterial({ color: bookColor });
        const bookLeft = new THREE.Mesh(bookGeometry, bookMaterial);
        const bookRight = new THREE.Mesh(bookGeometry, bookMaterial.clone());
        bookLeft.position.set(x - 0.6 + i * 0.6, 2.5, z);
        bookRight.position.set(x - 0.6 + i * 0.6, 2.5, z);
        sceneLeft.add(bookLeft);
        sceneRight.add(bookRight);
        
        if (i === 1) {
            objects.left.push({ mesh: bookLeft, id: id + '_book' });
            objects.right.push({ mesh: bookRight, id: id + '_book' });
        }
    }
    
    sceneLeft.add(shelfLeft);
    sceneRight.add(shelfRight);
    
    objects.left.push({ mesh: shelfLeft, id: id });
    objects.right.push({ mesh: shelfRight, id: id });
}

// 窓を作成
function createWindow(x, z, color, id) {
    const windowGeometry = new THREE.BoxGeometry(0.1, 2, 2);
    const windowMaterial = new THREE.MeshLambertMaterial({ color: color });
    const windowLeft = new THREE.Mesh(windowGeometry, windowMaterial);
    const windowRight = new THREE.Mesh(windowGeometry, windowMaterial.clone());
    windowLeft.position.set(x, 2, z);
    windowRight.position.set(x, 2, z);
    sceneLeft.add(windowLeft);
    sceneRight.add(windowRight);
    
    objects.left.push({ mesh: windowLeft, id: id });
    objects.right.push({ mesh: windowRight, id: id });
}

// 時計を作成
function createClock(x, y, z, color, id) {
    const clockGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
    const clockMaterial = new THREE.MeshLambertMaterial({ color: color });
    const clockLeft = new THREE.Mesh(clockGeometry, clockMaterial);
    const clockRight = new THREE.Mesh(clockGeometry, clockMaterial.clone());
    clockLeft.rotation.x = Math.PI / 2;
    clockRight.rotation.x = Math.PI / 2;
    clockLeft.position.set(x, y, z);
    clockRight.position.set(x, y, z);
    sceneLeft.add(clockLeft);
    sceneRight.add(clockRight);
    
    objects.left.push({ mesh: clockLeft, id: id });
    objects.right.push({ mesh: clockRight, id: id });
}

// ステージ2: 校庭
function createSchoolyard() {
    // 地面
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
    const groundLeft = new THREE.Mesh(groundGeometry, groundMaterial);
    const groundRight = new THREE.Mesh(groundGeometry, groundMaterial.clone());
    groundLeft.rotation.x = -Math.PI / 2;
    groundRight.rotation.x = -Math.PI / 2;
    sceneLeft.add(groundLeft);
    sceneRight.add(groundRight);
    
    // サッカーゴール
    createGoal(-10, 0, 0xFFFFFF, 'goal1');
    createGoal(10, 0, 0xFFFFFF, 'goal2');
    
    // 鉄棒
    createHorizontalBar(-5, -8, 0x808080, 'bar1');
    createHorizontalBar(0, -8, 0x808080, 'bar2');
    createHorizontalBar(5, -8, 0x808080, 'bar3');
    
    // サッカーボール
    createBall(0, 0.5, 0, 0xFFFFFF, 'ball');
    
    // 木
    createTree(-15, -10, 0x228B22, 'tree1');
    createTree(15, 10, 0x228B22, 'tree2');
    
    // 砂場
    createSandbox(8, 8, 0xF4A460, 'sandbox');
}

// ゴールを作成
function createGoal(x, z, color, id) {
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: color });
    
    // 左の柱
    const pole1Left = new THREE.Mesh(poleGeometry, poleMaterial);
    const pole1Right = new THREE.Mesh(poleGeometry, poleMaterial.clone());
    pole1Left.position.set(x - 2, 1.5, z);
    pole1Right.position.set(x - 2, 1.5, z);
    
    // 右の柱
    const pole2Left = new THREE.Mesh(poleGeometry, poleMaterial);
    const pole2Right = new THREE.Mesh(poleGeometry, poleMaterial.clone());
    pole2Left.position.set(x + 2, 1.5, z);
    pole2Right.position.set(x + 2, 1.5, z);
    
    // 横棒
    const barGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
    const barLeft = new THREE.Mesh(barGeometry, poleMaterial);
    const barRight = new THREE.Mesh(barGeometry, poleMaterial.clone());
    barLeft.rotation.z = Math.PI / 2;
    barRight.rotation.z = Math.PI / 2;
    barLeft.position.set(x, 3, z);
    barRight.position.set(x, 3, z);
    
    sceneLeft.add(pole1Left);
    sceneLeft.add(pole2Left);
    sceneLeft.add(barLeft);
    sceneRight.add(pole1Right);
    sceneRight.add(pole2Right);
    sceneRight.add(barRight);
    
    objects.left.push({ mesh: barLeft, id: id });
    objects.right.push({ mesh: barRight, id: id });
}

// 鉄棒を作成
function createHorizontalBar(x, z, color, id) {
    const poleGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2, 8);
    const barGeometry = new THREE.CylinderGeometry(0.08, 0.08, 3, 8);
    const material = new THREE.MeshLambertMaterial({ color: color });
    
    // 左の柱
    const pole1Left = new THREE.Mesh(poleGeometry, material);
    const pole1Right = new THREE.Mesh(poleGeometry, material.clone());
    pole1Left.position.set(x - 1.5, 1, z);
    pole1Right.position.set(x - 1.5, 1, z);
    
    // 右の柱
    const pole2Left = new THREE.Mesh(poleGeometry, material);
    const pole2Right = new THREE.Mesh(poleGeometry, material.clone());
    pole2Left.position.set(x + 1.5, 1, z);
    pole2Right.position.set(x + 1.5, 1, z);
    
    // 横棒
    const barLeft = new THREE.Mesh(barGeometry, material);
    const barRight = new THREE.Mesh(barGeometry, material.clone());
    barLeft.rotation.z = Math.PI / 2;
    barRight.rotation.z = Math.PI / 2;
    barLeft.position.set(x, 2, z);
    barRight.position.set(x, 2, z);
    
    sceneLeft.add(pole1Left);
    sceneLeft.add(pole2Left);
    sceneLeft.add(barLeft);
    sceneRight.add(pole1Right);
    sceneRight.add(pole2Right);
    sceneRight.add(barRight);
    
    objects.left.push({ mesh: barLeft, id: id });
    objects.right.push({ mesh: barRight, id: id });
}

// ボールを作成
function createBall(x, y, z, color, id) {
    const ballGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const ballMaterial = new THREE.MeshLambertMaterial({ color: color });
    const ballLeft = new THREE.Mesh(ballGeometry, ballMaterial);
    const ballRight = new THREE.Mesh(ballGeometry, ballMaterial.clone());
    ballLeft.position.set(x, y, z);
    ballRight.position.set(x, y, z);
    
    // 黒い模様
    const patternGeometry = new THREE.SphereGeometry(0.52, 8, 8);
    const patternMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const patternLeft = new THREE.Mesh(patternGeometry, patternMaterial);
    const patternRight = new THREE.Mesh(patternGeometry, patternMaterial.clone());
    patternLeft.position.set(x, y, z);
    patternRight.position.set(x, y, z);
    patternLeft.scale.set(0.3, 0.3, 0.3);
    patternRight.scale.set(0.3, 0.3, 0.3);
    
    sceneLeft.add(ballLeft);
    sceneLeft.add(patternLeft);
    sceneRight.add(ballRight);
    sceneRight.add(patternRight);
    
    objects.left.push({ mesh: ballLeft, id: id });
    objects.right.push({ mesh: ballRight, id: id });
}

// 木を作成
function createTree(x, z, color, id) {
    // 幹
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunkLeft = new THREE.Mesh(trunkGeometry, trunkMaterial);
    const trunkRight = new THREE.Mesh(trunkGeometry, trunkMaterial.clone());
    trunkLeft.position.set(x, 1, z);
    trunkRight.position.set(x, 1, z);
    
    // 葉
    const leavesGeometry = new THREE.SphereGeometry(1.5, 8, 8);
    const leavesMaterial = new THREE.MeshLambertMaterial({ color: color });
    const leavesLeft = new THREE.Mesh(leavesGeometry, leavesMaterial);
    const leavesRight = new THREE.Mesh(leavesGeometry, leavesMaterial.clone());
    leavesLeft.position.set(x, 3, z);
    leavesRight.position.set(x, 3, z);
    
    sceneLeft.add(trunkLeft);
    sceneLeft.add(leavesLeft);
    sceneRight.add(trunkRight);
    sceneRight.add(leavesRight);
    
    objects.left.push({ mesh: leavesLeft, id: id });
    objects.right.push({ mesh: leavesRight, id: id });
}

// 砂場を作成
function createSandbox(x, z, color, id) {
    const sandGeometry = new THREE.BoxGeometry(4, 0.3, 4);
    const sandMaterial = new THREE.MeshLambertMaterial({ color: color });
    const sandLeft = new THREE.Mesh(sandGeometry, sandMaterial);
    const sandRight = new THREE.Mesh(sandGeometry, sandMaterial.clone());
    sandLeft.position.set(x, 0.15, z);
    sandRight.position.set(x, 0.15, z);
    sceneLeft.add(sandLeft);
    sceneRight.add(sandRight);
    
    objects.left.push({ mesh: sandLeft, id: id });
    objects.right.push({ mesh: sandRight, id: id });
}

// ステージ3: 公園
function createPark() {
    // 地面
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
    const groundLeft = new THREE.Mesh(groundGeometry, groundMaterial);
    const groundRight = new THREE.Mesh(groundGeometry, groundMaterial.clone());
    groundLeft.rotation.x = -Math.PI / 2;
    groundRight.rotation.x = -Math.PI / 2;
    sceneLeft.add(groundLeft);
    sceneRight.add(groundRight);
    
    // 滑り台
    createSlide(-5, 0, 0xFF6347, 'slide');
    
    // ブランコ
    createSwing(5, 0, 0x8B4513, 'swing1');
    createSwing(8, 0, 0x8B4513, 'swing2');
    
    // ベンチ
    createBench(-10, 5, 0x8B4513, 'bench1');
    createBench(10, -5, 0x8B4513, 'bench2');
    
    // 木
    createTree(-12, -8, 0x228B22, 'tree1');
    createTree(0, -10, 0x228B22, 'tree2');
    createTree(12, 8, 0x228B22, 'tree3');
    
    // 花壇
    createFlowerbed(-8, -5, 0xFF69B4, 'flower1');
    createFlowerbed(8, 5, 0xFFFF00, 'flower2');
}

// 滑り台を作成
function createSlide(x, z, color, id) {
    // 階段部分
    const stairGeometry = new THREE.BoxGeometry(1, 3, 2);
    const stairMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const stairLeft = new THREE.Mesh(stairGeometry, stairMaterial);
    const stairRight = new THREE.Mesh(stairGeometry, stairMaterial.clone());
    stairLeft.position.set(x - 1.5, 1.5, z);
    stairRight.position.set(x - 1.5, 1.5, z);
    
    // 滑り台部分
    const slideGeometry = new THREE.BoxGeometry(4, 0.3, 1.5);
    const slideMaterial = new THREE.MeshLambertMaterial({ color: color });
    const slideLeft = new THREE.Mesh(slideGeometry, slideMaterial);
    const slideRight = new THREE.Mesh(slideGeometry, slideMaterial.clone());
    slideLeft.position.set(x + 1, 1.5, z);
    slideRight.position.set(x + 1, 1.5, z);
    slideLeft.rotation.z = -Math.PI / 6;
    slideRight.rotation.z = -Math.PI / 6;
    
    sceneLeft.add(stairLeft);
    sceneLeft.add(slideLeft);
    sceneRight.add(stairRight);
    sceneRight.add(slideRight);
    
    objects.left.push({ mesh: slideLeft, id: id });
    objects.right.push({ mesh: slideRight, id: id });
}

// ブランコを作成
function createSwing(x, z, color, id) {
    // 支柱
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    
    const pole1Left = new THREE.Mesh(poleGeometry, poleMaterial);
    const pole1Right = new THREE.Mesh(poleGeometry, poleMaterial.clone());
    pole1Left.position.set(x - 1, 2, z);
    pole1Right.position.set(x - 1, 2, z);
    
    const pole2Left = new THREE.Mesh(poleGeometry, poleMaterial);
    const pole2Right = new THREE.Mesh(poleGeometry, poleMaterial.clone());
    pole2Left.position.set(x + 1, 2, z);
    pole2Right.position.set(x + 1, 2, z);
    
    // 横棒
    const barGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2, 8);
    const barLeft = new THREE.Mesh(barGeometry, poleMaterial);
    const barRight = new THREE.Mesh(barGeometry, poleMaterial.clone());
    barLeft.rotation.z = Math.PI / 2;
    barRight.rotation.z = Math.PI / 2;
    barLeft.position.set(x, 4, z);
    barRight.position.set(x, 4, z);
    
    // 座席
    const seatGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.4);
    const seatMaterial = new THREE.MeshLambertMaterial({ color: color });
    const seatLeft = new THREE.Mesh(seatGeometry, seatMaterial);
    const seatRight = new THREE.Mesh(seatGeometry, seatMaterial.clone());
    seatLeft.position.set(x, 1, z);
    seatRight.position.set(x, 1, z);
    
    sceneLeft.add(pole1Left);
    sceneLeft.add(pole2Left);
    sceneLeft.add(barLeft);
    sceneLeft.add(seatLeft);
    sceneRight.add(pole1Right);
    sceneRight.add(pole2Right);
    sceneRight.add(barRight);
    sceneRight.add(seatRight);
    
    objects.left.push({ mesh: seatLeft, id: id });
    objects.right.push({ mesh: seatRight, id: id });
}

// ベンチを作成
function createBench(x, z, color, id) {
    // 座面
    const seatGeometry = new THREE.BoxGeometry(2, 0.2, 0.8);
    const seatMaterial = new THREE.MeshLambertMaterial({ color: color });
    const seatLeft = new THREE.Mesh(seatGeometry, seatMaterial);
    const seatRight = new THREE.Mesh(seatGeometry, seatMaterial.clone());
    seatLeft.position.set(x, 0.5, z);
    seatRight.position.set(x, 0.5, z);
    
    // 背もたれ
    const backGeometry = new THREE.BoxGeometry(2, 0.8, 0.1);
    const backLeft = new THREE.Mesh(backGeometry, seatMaterial);
    const backRight = new THREE.Mesh(backGeometry, seatMaterial.clone());
    backLeft.position.set(x, 0.9, z - 0.4);
    backRight.position.set(x, 0.9, z - 0.4);
    
    sceneLeft.add(seatLeft);
    sceneLeft.add(backLeft);
    sceneRight.add(seatRight);
    sceneRight.add(backRight);
    
    objects.left.push({ mesh: seatLeft, id: id });
    objects.right.push({ mesh: seatRight, id: id });
}

// 花壇を作成
function createFlowerbed(x, z, color, id) {
    // 花壇の枠
    const borderGeometry = new THREE.BoxGeometry(2, 0.3, 2);
    const borderMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const borderLeft = new THREE.Mesh(borderGeometry, borderMaterial);
    const borderRight = new THREE.Mesh(borderGeometry, borderMaterial.clone());
    borderLeft.position.set(x, 0.15, z);
    borderRight.position.set(x, 0.15, z);
    
    // 花
    for (let i = 0; i < 5; i++) {
        const flowerGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const flowerMaterial = new THREE.MeshLambertMaterial({ color: color });
        const flowerLeft = new THREE.Mesh(flowerGeometry, flowerMaterial);
        const flowerRight = new THREE.Mesh(flowerGeometry, flowerMaterial.clone());
        const offsetX = (Math.random() - 0.5) * 1.5;
        const offsetZ = (Math.random() - 0.5) * 1.5;
        flowerLeft.position.set(x + offsetX, 0.5, z + offsetZ);
        flowerRight.position.set(x + offsetX, 0.5, z + offsetZ);
        sceneLeft.add(flowerLeft);
        sceneRight.add(flowerRight);
        
        if (i === 2) {
            objects.left.push({ mesh: flowerLeft, id: id });
            objects.right.push({ mesh: flowerRight, id: id });
        }
    }
    
    sceneLeft.add(borderLeft);
    sceneRight.add(borderRight);
}

// ステージ4: 商店街
function createShoppingStreet() {
    // 地面
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const groundLeft = new THREE.Mesh(groundGeometry, groundMaterial);
    const groundRight = new THREE.Mesh(groundGeometry, groundMaterial.clone());
    groundLeft.rotation.x = -Math.PI / 2;
    groundRight.rotation.x = -Math.PI / 2;
    sceneLeft.add(groundLeft);
    sceneRight.add(groundRight);
    
    // お店
    createShop(-10, -5, 0xFF6347, 'shop1');
    createShop(-10, 5, 0x4169E1, 'shop2');
    createShop(10, -5, 0xFFD700, 'shop3');
    createShop(10, 5, 0x32CD32, 'shop4');
    
    // 看板
    createShopSign(-8, -5, 0xFF1493, 'sign1');
    createShopSign(-8, 5, 0x00CED1, 'sign2');
    createShopSign(8, -5, 0xFF8C00, 'sign3');
    
    // 自動販売機
    createVendingMachine(-2, 0, 0x0000FF, 'vending1');
    createVendingMachine(2, 0, 0xFF0000, 'vending2');
    
    // 街灯
    createStreetLight(-5, -10, 4, 'light1');
    createStreetLight(5, 10, 4, 'light2');
}

// お店を作成
function createShop(x, z, color, id) {
    const shopGeometry = new THREE.BoxGeometry(4, 5, 4);
    const shopMaterial = new THREE.MeshLambertMaterial({ color: color });
    const shopLeft = new THREE.Mesh(shopGeometry, shopMaterial);
    const shopRight = new THREE.Mesh(shopGeometry, shopMaterial.clone());
    shopLeft.position.set(x, 2.5, z);
    shopRight.position.set(x, 2.5, z);
    
    // 窓
    const windowGeometry = new THREE.BoxGeometry(0.8, 1, 0.1);
    const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB });
    const windowLeft = new THREE.Mesh(windowGeometry, windowMaterial);
    const windowRight = new THREE.Mesh(windowGeometry, windowMaterial.clone());
    windowLeft.position.set(x, 3, z + 2.05);
    windowRight.position.set(x, 3, z + 2.05);
    
    // ドア
    const doorGeometry = new THREE.BoxGeometry(0.8, 2, 0.1);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const doorLeft = new THREE.Mesh(doorGeometry, doorMaterial);
    const doorRight = new THREE.Mesh(doorGeometry, doorMaterial.clone());
    doorLeft.position.set(x, 1, z + 2.05);
    doorRight.position.set(x, 1, z + 2.05);
    
    sceneLeft.add(shopLeft);
    sceneLeft.add(windowLeft);
    sceneLeft.add(doorLeft);
    sceneRight.add(shopRight);
    sceneRight.add(windowRight);
    sceneRight.add(doorRight);
    
    objects.left.push({ mesh: shopLeft, id: id });
    objects.right.push({ mesh: shopRight, id: id });
}

// 看板を作成
function createShopSign(x, z, color, id) {
    const signGeometry = new THREE.BoxGeometry(2, 1, 0.2);
    const signMaterial = new THREE.MeshLambertMaterial({ color: color });
    const signLeft = new THREE.Mesh(signGeometry, signMaterial);
    const signRight = new THREE.Mesh(signGeometry, signMaterial.clone());
    signLeft.position.set(x, 5.5, z);
    signRight.position.set(x, 5.5, z);
    sceneLeft.add(signLeft);
    sceneRight.add(signRight);
    
    objects.left.push({ mesh: signLeft, id: id });
    objects.right.push({ mesh: signRight, id: id });
}

// 自動販売機を作成
function createVendingMachine(x, z, color, id) {
    const machineGeometry = new THREE.BoxGeometry(1, 2, 0.6);
    const machineMaterial = new THREE.MeshLambertMaterial({ color: color });
    const machineLeft = new THREE.Mesh(machineGeometry, machineMaterial);
    const machineRight = new THREE.Mesh(machineGeometry, machineMaterial.clone());
    machineLeft.position.set(x, 1, z);
    machineRight.position.set(x, 1, z);
    
    // ボタン
    for (let i = 0; i < 4; i++) {
        const buttonGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8);
        const buttonMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const buttonLeft = new THREE.Mesh(buttonGeometry, buttonMaterial);
        const buttonRight = new THREE.Mesh(buttonGeometry, buttonMaterial.clone());
        buttonLeft.rotation.x = Math.PI / 2;
        buttonRight.rotation.x = Math.PI / 2;
        const row = Math.floor(i / 2);
        const col = i % 2;
        buttonLeft.position.set(x - 0.2 + col * 0.4, 1.2 - row * 0.4, z + 0.35);
        buttonRight.position.set(x - 0.2 + col * 0.4, 1.2 - row * 0.4, z + 0.35);
        sceneLeft.add(buttonLeft);
        sceneRight.add(buttonRight);
    }
    
    sceneLeft.add(machineLeft);
    sceneRight.add(machineRight);
    
    objects.left.push({ mesh: machineLeft, id: id });
    objects.right.push({ mesh: machineRight, id: id });
}

// 街灯を作成
function createStreetLight(x, z, height, id) {
    // ポール
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, height, 8);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const poleLeft = new THREE.Mesh(poleGeometry, poleMaterial);
    const poleRight = new THREE.Mesh(poleGeometry, poleMaterial.clone());
    poleLeft.position.set(x, height / 2, z);
    poleRight.position.set(x, height / 2, z);
    
    // ライト
    const lightGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const lightMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
    const lightLeft = new THREE.Mesh(lightGeometry, lightMaterial);
    const lightRight = new THREE.Mesh(lightGeometry, lightMaterial.clone());
    lightLeft.position.set(x, height, z);
    lightRight.position.set(x, height, z);
    
    sceneLeft.add(poleLeft);
    sceneLeft.add(lightLeft);
    sceneRight.add(poleRight);
    sceneRight.add(lightRight);
    
    objects.left.push({ mesh: poleLeft, id: id });
    objects.right.push({ mesh: poleRight, id: id });
}

// ステージ5: 学校帰りの道
function createStreet() {
    // 地面
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
    const groundLeft = new THREE.Mesh(groundGeometry, groundMaterial);
    const groundRight = new THREE.Mesh(groundGeometry, groundMaterial.clone());
    groundLeft.rotation.x = -Math.PI / 2;
    groundRight.rotation.x = -Math.PI / 2;
    sceneLeft.add(groundLeft);
    sceneRight.add(groundRight);
    
    // 道路
    const roadGeometry = new THREE.PlaneGeometry(6, 50);
    const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
    const roadLeft = new THREE.Mesh(roadGeometry, roadMaterial);
    const roadRight = new THREE.Mesh(roadGeometry, roadMaterial.clone());
    roadLeft.rotation.x = -Math.PI / 2;
    roadRight.rotation.x = -Math.PI / 2;
    roadLeft.position.y = 0.01;
    roadRight.position.y = 0.01;
    sceneLeft.add(roadLeft);
    sceneRight.add(roadRight);
    
    // 木を追加
    createTree(-8, -5, 0x228B22, 'tree1');
    createTree(-10, 5, 0x228B22, 'tree2');
    createTree(8, -3, 0x228B22, 'tree3');
    createTree(-12, -10, 0x228B22, 'tree4');
    createTree(10, 10, 0x228B22, 'tree5');
    createTree(-9, 0, 0x228B22, 'tree6');
    createTree(9, -8, 0x228B22, 'tree7');
    createTree(-11, 8, 0x228B22, 'tree8');
    
    // 建物を追加
    createBuilding(-15, -10, 0xD2691E, 'building1');
    createBuilding(12, 8, 0xCD853F, 'building2');
    createBuilding(-14, 5, 0xDEB887, 'building3');
    createBuilding(13, -5, 0xF4A460, 'building4');
    
    // 街灯を追加
    createStreetLight(-4, -8, 4, 'light1');
    createStreetLight(4, 6, 4, 'light2');
    createStreetLight(-4, 2, 4, 'light3');
    
    // 看板を追加
    createSign(-6, 10, 0xFF6347, 'sign1');
    createSign(6, -10, 0x4169E1, 'sign2');
    
    // ベンチを追加
    createBench(8, -8, 0x8B4513, 'bench1');
    createBench(-8, 8, 0x8B4513, 'bench2');
}

// 建物を作成
function createBuilding(x, z, color, id) {
    const buildingGeometry = new THREE.BoxGeometry(4, 6, 4);
    const buildingMaterial = new THREE.MeshLambertMaterial({ color: color });
    const buildingLeft = new THREE.Mesh(buildingGeometry, buildingMaterial);
    const buildingRight = new THREE.Mesh(buildingGeometry, buildingMaterial.clone());
    buildingLeft.position.set(x, 3, z);
    buildingRight.position.set(x, 3, z);
    
    // 窓
    const windowGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
    const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB });
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
            const windowLeft = new THREE.Mesh(windowGeometry, windowMaterial);
            const windowRight = new THREE.Mesh(windowGeometry, windowMaterial.clone());
            windowLeft.position.set(x - 1.5 + j * 1.5, 2 + i * 1.5, z + 2.1);
            windowRight.position.set(x - 1.5 + j * 1.5, 2 + i * 1.5, z + 2.1);
            sceneLeft.add(windowLeft);
            sceneRight.add(windowRight);
            
            if (i === 1 && j === 0) {
                objects.left.push({ mesh: windowLeft, id: id + '_window' });
                objects.right.push({ mesh: windowRight, id: id + '_window' });
            }
        }
    }
    
    sceneLeft.add(buildingLeft);
    sceneRight.add(buildingRight);
    
    objects.left.push({ mesh: buildingLeft, id: id });
    objects.right.push({ mesh: buildingRight, id: id });
}

// 看板を作成
function createSign(x, z, color, id) {
    // ポール
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const poleLeft = new THREE.Mesh(poleGeometry, poleMaterial);
    const poleRight = new THREE.Mesh(poleGeometry, poleMaterial.clone());
    poleLeft.position.set(x, 1.5, z);
    poleRight.position.set(x, 1.5, z);
    
    // 看板
    const signGeometry = new THREE.BoxGeometry(2, 1, 0.1);
    const signMaterial = new THREE.MeshLambertMaterial({ color: color });
    const signLeft = new THREE.Mesh(signGeometry, signMaterial);
    const signRight = new THREE.Mesh(signGeometry, signMaterial.clone());
    signLeft.position.set(x, 3.5, z);
    signRight.position.set(x, 3.5, z);
    
    sceneLeft.add(poleLeft);
    sceneLeft.add(signLeft);
    sceneRight.add(poleRight);
    sceneRight.add(signRight);
    
    objects.left.push({ mesh: signLeft, id: id });
    objects.right.push({ mesh: signRight, id: id });
}

// 間違いを作成
function createMistakes() {
    let mistakeList = [];
    
    // ステージごとに異なる間違いリスト
    switch(currentStage) {
        case 1: // 教室
            mistakeList = [
                { id: 'blackboard', color: 0x8B0000 },
                { id: 'desk2', color: 0x0000FF },
                { id: 'bookshelf1_book', color: 0xFFFF00 }
            ];
            break;
        case 2: // 校庭
            mistakeList = [
                { id: 'goal1', color: 0xFF0000 },
                { id: 'bar2', scale: 1.5 },
                { id: 'ball', color: 0xFF6347 },
                { id: 'tree1', color: 0xFF1493 }
            ];
            break;
        case 3: // 公園
            mistakeList = [
                { id: 'slide', color: 0x0000FF },
                { id: 'swing1', color: 0xFF0000 },
                { id: 'bench1', color: 0x00FF00 },
                { id: 'tree2', color: 0xFFD700 },
                { id: 'flower1', color: 0x00FFFF }
            ];
            break;
        case 4: // 商店街
            mistakeList = [
                { id: 'shop1', color: 0x0000FF },
                { id: 'shop3', color: 0xFF1493 },
                { id: 'sign1', color: 0x00FF00 },
                { id: 'sign3', color: 0xFF0000 },
                { id: 'vending1', color: 0xFFFF00 },
                { id: 'light1', scale: 1.5 }
            ];
            break;
        case 5: // 学校帰りの道
            mistakeList = [
                { id: 'tree1', color: 0xFF6347 },
                { id: 'building1_window', color: 0xFF1493 },
                { id: 'light1', scale: 1.5 },
                { id: 'sign1', color: 0x00FF00 },
                { id: 'bench1', color: 0x0000FF },
                { id: 'tree2', color: 0xFFD700 },
                { id: 'building2', color: 0xFF69B4 },
                { id: 'tree3', color: 0xFF4500 }
            ];
            break;
    }
    
    // 現在のステージの間違い数分だけ間違いを設定
    for (let i = 0; i < totalMistakes && i < mistakeList.length; i++) {
        const mistakeData = mistakeList[i];
        const rightObject = objects.right.find(obj => obj.id === mistakeData.id);
        
        if (rightObject) {
            if (mistakeData.color) {
                rightObject.mesh.material.color.setHex(mistakeData.color);
            }
            if (mistakeData.scale) {
                rightObject.mesh.scale.y = mistakeData.scale;
            }
            mistakes.push({ id: mistakeData.id, found: false });
        }
    }
}

// キャンバスクリック時の処理
function onCanvasClick(event) {
    const canvas = document.getElementById('canvas-right');
    const rect = canvas.getBoundingClientRect();
    
    // マウス座標を正規化
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // レイキャスト
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRight);
    
    // オブジェクトとの交差判定
    const meshes = objects.right.map(obj => obj.mesh);
    const intersects = raycaster.intersectObjects(meshes);
    
    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const clickedObject = objects.right.find(obj => obj.mesh === clickedMesh);
        
        if (clickedObject) {
            checkMistake(clickedObject.id);
        }
    }
}

// 間違いチェック
function checkMistake(id) {
    const mistake = mistakes.find(m => m.id === id);
    
    if (mistake && !mistake.found) {
        mistake.found = true;
        foundCount++;
        updateScore();
        showMessage('✔ 見つけた！', '#4CAF50');
        
        // 見つけたオブジェクトを光らせる
        const rightObject = objects.right.find(obj => obj.id === id);
        if (rightObject) {
            rightObject.mesh.material.emissive = new THREE.Color(0xFFFF00);
            rightObject.mesh.material.emissiveIntensity = 0.5;
        }
        
        // 全部見つけたかチェック
        if (foundCount === totalMistakes) {
            setTimeout(() => {
                showVictoryModal();
            }, 500);
        }
    } else if (mistake && mistake.found) {
        showMessage('もう見つけたよ！', '#FF9800');
    }
}

// スコア更新
function updateScore() {
    document.getElementById('found-count').textContent = foundCount;
    document.getElementById('remaining-count').textContent = totalMistakes - foundCount;
}

// メッセージ表示
function showMessage(text, color) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.style.color = color;
    setTimeout(() => {
        messageDiv.textContent = '';
    }, 2000);
}

// 勝利モーダル表示
function showVictoryModal() {
    const modal = document.getElementById('victory-modal');
    modal.style.display = 'flex';
    
    // 最終ステージならボタンを変更
    const nextBtn = document.getElementById('next-stage-btn');
    if (currentStage >= 5) {
        nextBtn.textContent = 'エンディングを見る 🎊';
    } else {
        nextBtn.textContent = '次のステージへ →';
    }
}

// モーダルを閉じる
function closeModal() {
    document.getElementById('victory-modal').style.display = 'none';
    document.getElementById('ending-modal').style.display = 'none';
}

// エンディングモーダル表示
function showEndingModal() {
    document.getElementById('victory-modal').style.display = 'none';
    const endingModal = document.getElementById('ending-modal');
    endingModal.style.display = 'flex';
    
    // 動画を最初から再生
    const video = document.getElementById('ending-video');
    video.currentTime = 0;
    video.play();
}

// アニメーション
function animate() {
    requestAnimationFrame(animate);
    
    animationTime += 0.01;
    
    // カメラを少し揺らす
    cameraLeft.position.x = Math.sin(animationTime * 0.3) * 0.5;
    cameraRight.position.x = Math.sin(animationTime * 0.3) * 0.5;
    
    // オブジェクトを少し動かす
    objects.left.forEach(obj => {
        if (obj.id.includes('tree')) {
            obj.mesh.rotation.y = Math.sin(animationTime) * 0.1;
        }
    });
    
    objects.right.forEach(obj => {
        if (obj.id.includes('tree')) {
            obj.mesh.rotation.y = Math.sin(animationTime) * 0.1;
        }
    });
    
    rendererLeft.render(sceneLeft, cameraLeft);
    rendererRight.render(sceneRight, cameraRight);
}

// クリーンアップ
function cleanup() {
    // シーンをクリア
    if (sceneLeft) {
        while(sceneLeft.children.length > 0) { 
            sceneLeft.remove(sceneLeft.children[0]); 
        }
    }
    if (sceneRight) {
        while(sceneRight.children.length > 0) { 
            sceneRight.remove(sceneRight.children[0]); 
        }
    }
    
    objects.left = [];
    objects.right = [];
}

// リスタート
function restart() {
    cleanup();
    closeModal();
    startStage(currentStage);
}

// イベントリスナー
document.getElementById('restart-btn').addEventListener('click', restart);
document.getElementById('retry-btn').addEventListener('click', restart);

document.getElementById('next-stage-btn').addEventListener('click', () => {
    if (currentStage >= 5) {
        // 最終ステージクリア後はエンディング
        showEndingModal();
    } else {
        // 次のステージへ
        cleanup();
        closeModal();
        startStage(currentStage + 1);
    }
});

document.getElementById('to-select-btn').addEventListener('click', () => {
    cleanup();
    closeModal();
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('stage-select-screen').style.display = 'block';
});

document.getElementById('ending-to-select-btn').addEventListener('click', () => {
    // 動画を停止
    const video = document.getElementById('ending-video');
    video.pause();
    
    closeModal();
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('stage-select-screen').style.display = 'block';
});

// ウィンドウリサイズ対応
window.addEventListener('resize', () => {
    const canvasLeft = document.getElementById('canvas-left');
    const canvasRight = document.getElementById('canvas-right');
    
    if (canvasLeft && canvasRight && cameraLeft && cameraRight) {
        const aspect = canvasLeft.clientWidth / canvasLeft.clientHeight;
        
        cameraLeft.aspect = aspect;
        cameraRight.aspect = aspect;
        cameraLeft.updateProjectionMatrix();
        cameraRight.updateProjectionMatrix();
        
        rendererLeft.setSize(canvasLeft.clientWidth, canvasLeft.clientHeight);
        rendererRight.setSize(canvasRight.clientWidth, canvasRight.clientHeight);
    }
});