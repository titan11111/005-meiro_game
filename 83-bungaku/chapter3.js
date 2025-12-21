// ========================================
// 第3章: 星の王子さま
// サン=テグジュペリ『星の王子さま』
// ========================================

const chapter3Poems = [
    "大切なものは目に見えない",
    "心で見なくちゃ、ものごとはよく見えない",
    "きみのバラをかけがえのないものにしたのは、きみが費やした時間なんだよ",
    "砂漠が美しいのは、どこかに井戸を隠しているからだよ",
    "おとなは、だれも、はじめは子どもだった",
    "さよならを言わなきゃね。でも、ぼくは必ず戻ってくるから"
];

let stars = [];
let starFragments = [];
let rose = null;
let roseLight = null;
let fox = null;
let starBrightness = 0;

// ========================================
// 第3章開始
// ========================================
window.startChapter3 = function() {
    currentChapter = 3;
    
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('title-screen').style.display = 'flex';
    
    document.getElementById('title-chapter-num').textContent = '第三章';
    document.getElementById('title-chapter-name').textContent = '星の王子さま';
    document.getElementById('title-chapter-quote').textContent = '「大切なものは目に見えない」';
    
    document.getElementById('complete-title').textContent = '第三章 完成';
    document.getElementById('complete-quote').innerHTML = '「本当に大切なものは、<br>心の目で見なければ見えない。」';
    
    document.getElementById('status-label-1').textContent = '星のかけら';
    document.getElementById('status-label-2').textContent = '星の輝き';
    
    const startBtn = document.getElementById('start-btn');
    startBtn.onclick = () => {
        document.getElementById('title-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        
        resetScene();
        collectedMemories = 0;
        starBrightness = 0;
        initChapter3();
    };
}

// ========================================
// 第3章の世界を初期化
// ========================================
function initChapter3() {
    scene.background = new THREE.Color(0x0A0A2E);
    scene.fog = new THREE.Fog(0x0A0A2E, 15, 100);
    
    document.getElementById('memory-total').textContent = '6';
    
    createPlanetGround();
    createStarField();
    createRose();
    createFox();
    createPlayer();
    createStarFragments();
    
    document.getElementById('memory-count').textContent = '0';
    document.getElementById('time-flow').textContent = '0';
    
    animateChapter3();
    
    showPoem(chapter3Poems[0]);
    showMessage('星のかけらを6つ集めよう。集めるほど星空が輝く…');
}

// ========================================
// 惑星の地面生成
// ========================================
function createPlanetGround() {
    const planetGeometry = new THREE.SphereGeometry(8, 32, 32);
    const planetMaterial = new THREE.MeshStandardMaterial({
        color: 0x6B8E23,
        roughness: 0.9,
        metalness: 0.1
    });
    ground = new THREE.Mesh(planetGeometry, planetMaterial);
    ground.position.y = -6;
    ground.receiveShadow = true;
    scene.add(ground);
    
    const soilGeometry = new THREE.SphereGeometry(8.1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const soilMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.95
    });
    const soil = new THREE.Mesh(soilGeometry, soilMaterial);
    soil.position.y = -6;
    soil.rotation.x = Math.PI;
    scene.add(soil);
}

// ========================================
// 星空の生成
// ========================================
function createStarField() {
    stars = [];
    
    for (let i = 0; i < 200; i++) {
        const starSize = 0.05 + Math.random() * 0.15;
        const starGeometry = new THREE.SphereGeometry(starSize, 8, 8);
        const starMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: Math.random() * 0.6 + 0.2
        });
        
        const star = new THREE.Mesh(starGeometry, starMaterial);
        
        const radius = 40 + Math.random() * 60;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        star.position.x = radius * Math.sin(phi) * Math.cos(theta);
        star.position.y = radius * Math.sin(phi) * Math.sin(theta);
        star.position.z = radius * Math.cos(phi);
        
        star.userData.baseOpacity = star.material.opacity;
        star.userData.twinkleSpeed = 0.5 + Math.random() * 1.5;
        
        stars.push(star);
        scene.add(star);
    }
}

// ========================================
// バラの生成
// ========================================
function createRose() {
    const roseGroup = new THREE.Group();
    
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.08, 2, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x2D5016 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 1;
    roseGroup.add(stem);
    
    for (let i = 0; i < 5; i++) {
        const petalGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const petalMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF3366,
            emissive: 0xFF3366,
            emissiveIntensity: 0.3
        });
        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
        
        const angle = (Math.PI * 2 / 5) * i;
        petal.position.x = Math.cos(angle) * 0.25;
        petal.position.z = Math.sin(angle) * 0.25;
        petal.position.y = 2;
        petal.scale.set(1, 0.5, 0.8);
        
        roseGroup.add(petal);
    }
    
    const centerGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const centerMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        emissive: 0xFFD700,
        emissiveIntensity: 0.5
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.y = 2;
    roseGroup.add(center);
    
    roseGroup.position.set(0, 0.5, 0);
    rose = roseGroup;
    scene.add(roseGroup);
    
    roseLight = new THREE.PointLight(0xFF3366, 1, 15);
    roseLight.position.set(0, 3, 0);
    scene.add(roseLight);
}

// ========================================
// キツネの生成
// ========================================
function createFox() {
    const foxGroup = new THREE.Group();
    
    const bodyGeometry = new THREE.ConeGeometry(0.4, 0.8, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFF8C00 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI;
    body.position.y = 0.4;
    foxGroup.add(body);
    
    const headGeometry = new THREE.SphereGeometry(0.35, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFF8C00 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.9;
    foxGroup.add(head);
    
    for (let i = 0; i < 2; i++) {
        const earGeometry = new THREE.ConeGeometry(0.1, 0.3, 6);
        const ear = new THREE.Mesh(earGeometry, bodyMaterial);
        ear.position.x = i === 0 ? -0.2 : 0.2;
        ear.position.y = 1.2;
        foxGroup.add(ear);
    }
    
    const tailGeometry = new THREE.ConeGeometry(0.15, 0.6, 8);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.rotation.x = Math.PI / 3;
    tail.position.set(0, 0.3, -0.5);
    foxGroup.add(tail);
    
    foxGroup.position.set(3, 0.5, -2);
    fox = foxGroup;
    scene.add(foxGroup);
}

// ========================================
// 星のかけら生成
// ========================================
function createStarFragments() {
    const positions = [
        [5, 1.5, 3],
        [-4, 1.5, 5],
        [6, 1.5, -4],
        [-5, 1.5, -3],
        [0, 1.5, -6],
        [4, 1.5, 0]
    ];
    
    memoryFragments = [];
    
    positions.forEach((pos, index) => {
        const fragmentGeometry = new THREE.OctahedronGeometry(0.6);
        const fragmentMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            emissive: 0xFFD700,
            emissiveIntensity: 0.8,
            metalness: 0.3
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
// 第3章専用アニメーションループ
// ========================================
function animateChapter3() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    animationId = requestAnimationFrame(animateChapter3);
    
    updatePlayer();
    checkStarCollection();
    updateStarField();
    
    memoryFragments.forEach((fragment) => {
        if (!fragment.userData.collected) {
            fragment.rotation.y += 0.03;
            fragment.rotation.x += 0.02;
            fragment.position.y = 1.5 + Math.sin(Date.now() * 0.003 + fragment.userData.index) * 0.3;
        }
    });
    
    if (ground) {
        ground.rotation.y += 0.001;
    }
    
    if (roseLight) {
        const pulse = Math.sin(Date.now() * 0.002) * 0.3 + 1.2;
        roseLight.intensity = pulse * (1 + starBrightness * 0.5);
    }
    
    if (fox) {
        fox.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
    }
    
    renderer.render(scene, camera);
}

// ========================================
// 星のかけら収集判定
// ========================================
function checkStarCollection() {
    memoryFragments.forEach((fragment) => {
        if (fragment.userData.collected) return;
        
        const distance = player.position.distanceTo(fragment.position);
        if (distance < 2.5) {
            fragment.userData.collected = true;
            scene.remove(fragment);
            collectedMemories++;
            
            starBrightness += 15;
            
            document.getElementById('memory-count').textContent = collectedMemories;
            
            updateStarBrightness();
            
            showPoem(chapter3Poems[collectedMemories - 1]);
            
            if (collectedMemories >= 6) {
                setTimeout(() => {
                    updateLiteratureInfo(
                        '星の王子さま',
                        'サン=テグジュペリ',
                        chapter3Poems
                    );
                    
                    document.getElementById('chapter-complete').style.display = 'flex';
                }, 2000);
            }
        }
    });
}

// ========================================
// 星空の輝き更新
// ========================================
function updateStarField() {
    const currentBrightness = Math.min(90, starBrightness);
    document.getElementById('time-flow').textContent = Math.floor(currentBrightness);
    
    stars.forEach((star, index) => {
        const twinkle = Math.sin(Date.now() * 0.001 * star.userData.twinkleSpeed + index) * 0.3 + 0.7;
        const brightnessFactor = 1 + (starBrightness / 100);
        star.material.opacity = star.userData.baseOpacity * twinkle * brightnessFactor;
    });
}

// ========================================
// 星の輝き即座更新
// ========================================
function updateStarBrightness() {
    const progress = collectedMemories / 6;
    
    const startColor = new THREE.Color(0x0A0A2E);
    const endColor = new THREE.Color(0x1A1A4E);
    scene.background.copy(startColor).lerp(endColor, progress);
    
    if (rose) {
        rose.children.forEach(child => {
            if (child.material.emissive) {
                child.material.emissiveIntensity = 0.3 + progress * 0.7;
            }
        });
    }
}