// ========================================
// 第2章: 罪と贖罪の街
// ドストエフスキー『罪と罰』『カラマーゾフの兄弟』
// ========================================

const chapter2Poems = [
    "人間は不幸に慣れることができる",
    "苦しみと悲しみは偉大な自覚への道",
    "神が存在しないなら全てが許される",
    "愛とは、行動である",
    "真理は血によって証明される",
    "自由とは、責任を引き受けることだ"
];

let sinLevel = 0;
let redemptionLevel = 0;
let buildings = [];
let cityLights = [];

// ========================================
// 第2章開始
// ========================================
window.startChapter2 = function() {
    currentChapter = 2;
    
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('title-screen').style.display = 'flex';
    
    document.getElementById('title-chapter-num').textContent = '第二章';
    document.getElementById('title-chapter-name').textContent = '罪と贖罪の街';
    document.getElementById('title-chapter-quote').textContent = '「人間は不幸に慣れることができる生きものだ」';
    
    document.getElementById('complete-title').textContent = '第二章 完成';
    document.getElementById('complete-quote').innerHTML = '「罪は魂を重くするが、<br>贖罪は魂を自由にする。」';
    
    document.getElementById('status-label-1').textContent = '魂の断片';
    document.getElementById('status-label-2').textContent = '良心の声';
    
    const startBtn = document.getElementById('start-btn');
    startBtn.onclick = () => {
        document.getElementById('title-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        
        resetScene();
        collectedMemories = 0;
        sinLevel = 0;
        redemptionLevel = 0;
        initChapter2();
    };
}

// ========================================
// 第2章の世界を初期化
// ========================================
function initChapter2() {
    scene.background = new THREE.Color(0x2C1810);
    scene.fog = new THREE.Fog(0x2C1810, 10, 80);
    
    document.getElementById('memory-total').textContent = '6';
    
    createCityGround();
    createBuildings();
    createStreetLights();
    createPlayer();
    createSoulFragments();
    
    document.getElementById('memory-count').textContent = '0';
    document.getElementById('time-flow').textContent = '0';
    
    animateChapter2();
    
    showPoem(chapter2Poems[0]);
    showMessage('魂の断片を6つ集めよう。集めるほど街が光に包まれる…');
}

// ========================================
// 石畳の地面生成
// ========================================
function createCityGround() {
    const groundGeometry = new THREE.PlaneGeometry(60, 60, 30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x4A4A4A,
        roughness: 0.9
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
}

// ========================================
// 建物生成
// ========================================
function createBuildings() {
    buildings = [];
    
    for (let i = 0; i < 8; i++) {
        const width = 3 + Math.random() * 2;
        const height = 4 + Math.random() * 3;
        const depth = 3 + Math.random() * 2;
        
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: 0x5A3A2A,
            roughness: 0.8
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        
        const x = (Math.random() - 0.5) * 50;
        const z = 10 + Math.random() * 20;
        building.position.set(x, height / 2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        building.userData.layer = 'lower';
        
        buildings.push(building);
        scene.add(building);
    }
    
    for (let i = 0; i < 6; i++) {
        const width = 4 + Math.random() * 2;
        const height = 6 + Math.random() * 4;
        const depth = 4 + Math.random() * 2;
        
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: 0x6B4A3A,
            roughness: 0.7
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        
        const x = (Math.random() - 0.5) * 40;
        const z = -5 + Math.random() * 15;
        building.position.set(x, height / 2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        building.userData.layer = 'middle';
        
        buildings.push(building);
        scene.add(building);
    }
    
    for (let i = 0; i < 4; i++) {
        const width = 5 + Math.random() * 2;
        const height = 10 + Math.random() * 5;
        const depth = 5 + Math.random() * 2;
        
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B7355,
            roughness: 0.6
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        
        const x = (Math.random() - 0.5) * 30;
        const z = -20 + Math.random() * 10;
        building.position.set(x, height / 2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        building.userData.layer = 'upper';
        
        buildings.push(building);
        scene.add(building);
    }
}

// ========================================
// 街灯の配置
// ========================================
function createStreetLights() {
    cityLights = [];
    
    for (let i = 0; i < 10; i++) {
        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.15, 4, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x2C2C2C });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        
        const lightGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const lightMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFAA00,
            emissive: 0xFFAA00,
            emissiveIntensity: 1
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.y = 2.5;
        
        const streetLight = new THREE.Group();
        streetLight.add(pole);
        streetLight.add(light);
        
        const x = (Math.random() - 0.5) * 50;
        const z = (Math.random() - 0.5) * 50;
        streetLight.position.set(x, 2, z);
        
        cityLights.push(streetLight);
        scene.add(streetLight);
    }
}

// ========================================
// 魂の断片生成
// ========================================
function createSoulFragments() {
    const positions = [
        [10, 1.5, 15],
        [-12, 1.5, 8],
        [15, 1.5, -5],
        [-10, 1.5, -12],
        [0, 1.5, -18],
        [8, 1.5, 5]
    ];
    
    memoryFragments = [];
    
    positions.forEach((pos, index) => {
        const fragmentGeometry = new THREE.OctahedronGeometry(0.8);
        const fragmentMaterial = new THREE.MeshStandardMaterial({
            color: 0x9B30FF,
            emissive: 0x9B30FF,
            emissiveIntensity: 0.6
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
// 第2章専用アニメーションループ
// ========================================
function animateChapter2() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    animationId = requestAnimationFrame(animateChapter2);
    
    updatePlayer();
    checkSoulCollection();
    updateCityMorality();
    
    memoryFragments.forEach((fragment) => {
        if (!fragment.userData.collected) {
            fragment.rotation.y += 0.03;
            fragment.rotation.x += 0.01;
            fragment.position.y = 1.5 + Math.sin(Date.now() * 0.003 + fragment.userData.index) * 0.4;
        }
    });
    
    cityLights.forEach((light, index) => {
        const flicker = Math.sin(Date.now() * 0.002 + index) * 0.2 + 0.8;
        light.children[1].material.emissiveIntensity = flicker;
    });
    
    renderer.render(scene, camera);
}

// ========================================
// 魂の断片収集判定
// ========================================
function checkSoulCollection() {
    memoryFragments.forEach((fragment) => {
        if (fragment.userData.collected) return;
        
        const distance = player.position.distanceTo(fragment.position);
        if (distance < 2.5) {
            fragment.userData.collected = true;
            scene.remove(fragment);
            collectedMemories++;
            
            redemptionLevel += 30;
            
            document.getElementById('memory-count').textContent = collectedMemories;
            
            updateCityColorImmediately();
            
            showPoem(chapter2Poems[collectedMemories - 1]);
            
            if (collectedMemories >= 6) {
                setTimeout(() => {
                    updateLiteratureInfo(
                        '罪と罰 / カラマーゾフの兄弟',
                        'フョードル・ドストエフスキー',
                        chapter2Poems
                    );
                    
                    document.getElementById('chapter-complete').style.display = 'flex';
                }, 2000);
            }
        }
    });
}

// ========================================
// 街の色を即座に変化
// ========================================
function updateCityColorImmediately() {
    const progress = collectedMemories / 6;
    
    const startColor = new THREE.Color(0x2C1810);
    const endColor = new THREE.Color(0x4A6FA5);
    scene.background.copy(startColor).lerp(endColor, progress);
    
    buildings.forEach(building => {
        const buildingStart = new THREE.Color(0x3A1A1A);
        const buildingEnd = new THREE.Color(0xA0826D);
        building.material.color.copy(buildingStart).lerp(buildingEnd, progress);
    });
    
    scene.fog.color.copy(startColor).lerp(endColor, progress);
}

// ========================================
// 街の道徳性更新
// ========================================
function updateCityMorality() {
    const moralityLevel = Math.max(0, Math.min(99, redemptionLevel - sinLevel));
    document.getElementById('time-flow').textContent = Math.floor(moralityLevel);
    
    sinLevel += 0.02;
}