// ========================================
// グローバル変数
// ========================================
let scene, camera, renderer;
let player, ground;
let memoryFragments = [];
let collectedMemories = 0;
let timeFlow = 0;
let keys = {};
let touchStartX = 0;
let touchStartY = 0;
let moveX = 0;
let moveZ = 0;
let currentChapter = 1;
let animationId = null;

// 音楽関連
let bgMusic = null;
let synth = null;

// 各章専用の3Dオブジェクト
let stars = [];
let decorations = [];
let transformableObjects = [];

// ========================================
// 11章分の章データ
// ========================================
const chapters = [
    {
        num: "第一章",
        name: "無常の川",
        quote: "「ゆく川の流れは絶えずして…」",
        completeTitle: "第一章 完成",
        completeQuote: "「すべては流れ、すべては変わる。<br>されど、記憶だけは永遠に残る。」",
        work: "方丈記",
        author: "鴨長明",
        poems: [
            "ゆく川の流れは絶えずして",
            "しかも、もとの水にあらず",
            "よどみに浮かぶうたかたは",
            "かつ消え、かつ結びて",
            "久しくとどまりたるためしなし"
        ],
        bgColor: 0x4A6B8A,
        finalColor: 0x87CEEB,
        label1: "記憶の断片",
        label2: "世界の変容"
    },
    {
        num: "第二章",
        name: "罪と贖罪の街",
        quote: "「苦しみと悩みは、偉大な自覚への道」",
        completeTitle: "第二章 完成",
        completeQuote: "「罪は魂を重くするが、<br>贖罪は魂を自由にする。」",
        work: "罪と罰",
        author: "フョードル・ドストエフスキー",
        poems: [
            "苦しみと悩みは、偉大な自覚への道",
            "罪は懺悔によってのみ贖われる",
            "人は他者への愛を通して救済に至る",
            "良心と向き合うことで自由を得る",
            "貧しさは犯罪の理由にはならない",
            "人は自分の罪を自ら裁かなければならない"
        ],
        bgColor: 0x1A1410,
        finalColor: 0x8B7355,
        label1: "魂の断片",
        label2: "良心の声"
    },
    {
        num: "第三章",
        name: "星の王子さま",
        quote: "「大切なものは心で感じるもの」",
        completeTitle: "第三章 完成",
        completeQuote: "「本当に大切なものは、<br>心の目で見なければ見えない。」",
        work: "星の王子さま",
        author: "サン=テグジュペリ",
        poems: [
            "大切なものは心で感じるもの",
            "愛情を注いだものが特別な存在になる",
            "砂漠が美しいのは希望を秘めているから",
            "おとなもみなかつては子供だった",
            "別れは悲しいが再会を信じる気持ち",
            "星の輝きは心を照らす"
        ],
        bgColor: 0x050520,
        finalColor: 0x1A1A4E,
        label1: "星のかけら",
        label2: "星の輝き"
    },
    {
        num: "第四章",
        name: "異邦人の砂漠",
        quote: "「きょう、ママンが死んだ」",
        completeTitle: "第四章 完成",
        completeQuote: "「太陽の眩しさに我を失い、<br>世界の優しい無関心に心を開いた。」",
        work: "異邦人",
        author: "アルベール・カミュ",
        poems: [
            "きょう、ママンが死んだ",
            "太陽の眩しさに我を失った",
            "世界の優しい無関心に心を開いた",
            "自分は幸福だと思った瞬間がある",
            "不条理の中で生きることを学んだ",
            "真実は沈黙の中で浮かび上がる",
            "明日、僕は死ぬだろう"
        ],
        bgColor: 0xC19A6B,
        finalColor: 0x8FBC8F,
        label1: "砂の記憶",
        label2: "灼熱の意識"
    },
    {
        num: "第五章",
        name: "雅の宮廷",
        quote: "「いづれの御時にか…」",
        completeTitle: "第五章 完成",
        completeQuote: "「光る君の物語は、<br>千年の時を超えて今も輝く。」",
        work: "源氏物語",
        author: "紫式部",
        poems: [
            "いづれの御時にか、女御更衣あまた候ひ給ひける中に",
            "光る君とぞ人々申しける",
            "もののあはれ",
            "移ろいゆく恋",
            "宮廷の栄華と儚さ",
            "花の命は短く人の心は移ろいやすい",
            "逢えぬ恋の切なさ",
            "人の心は測り知れない"
        ],
        bgColor: 0x4A2850,
        finalColor: 0xE6B8FF,
        label1: "雅の欠片",
        label2: "宮廷の調べ"
    },
    {
        num: "第六章",
        name: "海の日記",
        quote: "「男もすなる日記といふものを…」",
        completeTitle: "第六章 完成",
        completeQuote: "「海を渡る旅は、<br>心の旅でもあった。」",
        work: "土佐日記",
        author: "紀貫之",
        poems: [
            "男もすなる日記といふものを、女もしてみむとてするなり",
            "京に向かひて船に乗る",
            "波路遥かに雲に隔たる",
            "帰る嬉しさに",
            "よき日よき時に",
            "船の道は浪にまかせて",
            "風吹けば波立ちぬ",
            "都にはやく着きにしがな"
        ],
        bgColor: 0x003855,
        finalColor: 0x4A90E2,
        label1: "航海の記憶",
        label2: "波の旋律"
    },
    {
        num: "第七章",
        name: "奥の細道",
        quote: "「月日は百代の過客にして…」",
        completeTitle: "第七章 完成",
        completeQuote: "「旅の終わりは、<br>また新たな旅の始まり。」",
        work: "奥の細道",
        author: "松尾芭蕉",
        poems: [
            "月日は百代の過客にして、行きかふ年も又旅人也",
            "古人も多く旅に死せるあり",
            "草の戸も住み替わる代ぞ雛の家",
            "閑さや岩にしみ入る蝉の声",
            "五月雨をあつめて早し最上川",
            "夏草や兵どもが夢の跡",
            "荒海や佐渡によこたふ天河",
            "旅に病んで夢は枯野をかけ廻る"
        ],
        bgColor: 0x1F2F2F,
        finalColor: 0x6B8E6B,
        label1: "旅の足跡",
        label2: "風雅の音"
    },
    {
        num: "第八章",
        name: "草枕の山",
        quote: "「智に働けば角が立つ…」",
        completeTitle: "第八章 完成",
        completeQuote: "「非人情の美の世界へ、<br>ようこそ。」",
        work: "草枕",
        author: "夏目漱石",
        poems: [
            "智に働けば角が立つ",
            "情に棹させば流される",
            "意地を通せば窮屈だ",
            "兎角に人の世は住みにくい",
            "住みにくさが高じると、安い所へ引き越したくなる",
            "人の世を作ったものは神でもなければ鬼でもない",
            "やはり向う三軒両隣にちらちらするただの人である",
            "非人情の美を求める旅"
        ],
        bgColor: 0x3A4A2F,
        finalColor: 0x8FBC8F,
        label1: "非人情の欠片",
        label2: "美の意識"
    },
    {
        num: "第九章",
        name: "蜘蛛の糸",
        quote: "「ある日の事でございます」",
        completeTitle: "第九章 完成",
        completeQuote: "「慈悲の糸は細く、<br>されど、希望の光となる。」",
        work: "蜘蛛の糸",
        author: "芥川龍之介",
        poems: [
            "ある日の事でございます",
            "お釈迦様は極楽の蓮池のふちを",
            "地獄の底を覗いて御覧になりました",
            "一筋の蜘蛛の糸が、銀の針のように光って",
            "自分ばかり地獄から抜け出そうとする",
            "糸はふつりと真中から断れて",
            "カンダタは逆さまに落ちて行きました",
            "お釈迦様は悲しそうな御顔をなさいました"
        ],
        bgColor: 0x0A0A0A,
        finalColor: 0x4A2020,
        label1: "糸の記憶",
        label2: "救済の光"
    },
    {
        num: "第十章",
        name: "人間失格の闇",
        quote: "「恥の多い生涯を送って来ました」",
        completeTitle: "第十章 完成",
        completeQuote: "「人間、失格。<br>されど、魂は消えず。」",
        work: "人間失格",
        author: "太宰治",
        poems: [
            "恥の多い生涯を送って来ました",
            "自分には、人間の生活というものが、見当つかないのです",
            "自分は、他人と対等に話が出来ません",
            "道化でした",
            "世間とは、君じゃないか",
            "生きている事、それは苦痛でした",
            "ただ、一さいは過ぎて行きます",
            "いまは自分には、幸福も不幸もありません"
        ],
        bgColor: 0x1A1A1A,
        finalColor: 0x4A4A4A,
        label1: "失格の痕跡",
        label2: "闇の深さ"
    },
    {
        num: "第十一章",
        name: "銀河鉄道の夜",
        quote: "「銀河ステーション、銀河ステーション」",
        completeTitle: "第十一章 完成 - 全章制覇",
        completeQuote: "「本当の幸いとは何か。<br>魂の旅は、永遠に続く。」",
        work: "銀河鉄道の夜",
        author: "宮沢賢治",
        poems: [
            "銀河ステーション、銀河ステーション",
            "ああ、あのひとのほんたうの幸福をさがしに行かう",
            "本当の幸せは何かを探す旅",
            "天の川がまるで二つに分かれて",
            "さくりの火が赤くうつくしく燃えて",
            "もうどこまでも行ける切符を持っているんだ",
            "カムパネルラ、また僕たち二人きりになったねえ",
            "ジョバンニはもうすっかり目がさめて"
        ],
        bgColor: 0x000022,
        finalColor: 0x1A1A5E,
        label1: "銀河の欠片",
        label2: "幸福の光"
    }
];

// ========================================
// 初期化
// ========================================
window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("start-btn").addEventListener("click", async () => {
        await Tone.start();
        startChapter(currentChapter);
    });

    document.getElementById("message-ok").addEventListener("click", () => {
        document.getElementById("message-box").style.display = "none";
    });

    document.getElementById("continue-btn").addEventListener("click", () => {
        document.getElementById("chapter-complete").style.display = "none";

        if (currentChapter < 11) {
            currentChapter++;
            startChapter(currentChapter);
        } else {
            showMessage("全11章クリア!お疲れ様でした。魂の旅は永遠に続きます。");
        }
    });

    updateTitleScreen(1);
});

// ========================================
// タイトル画面更新
// ========================================
function updateTitleScreen(chapterNum) {
    const chapter = chapters[chapterNum - 1];
    document.getElementById('title-chapter-num').textContent = chapter.num;
    document.getElementById('title-chapter-name').textContent = chapter.name;
    document.getElementById('title-chapter-quote').textContent = chapter.quote;
}

// ========================================
// 章開始共通関数
// ========================================
function startChapter(n) {
    currentChapter = n;
    const chapter = chapters[n - 1];

    updateTitleScreen(n);

    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';

    resetScene();

    document.getElementById('status-label-1').textContent = chapter.label1;
    document.getElementById('status-label-2').textContent = chapter.label2;
    document.getElementById('memory-count').textContent = '0';
    document.getElementById('memory-total').textContent = chapter.poems.length;
    document.getElementById('time-flow').textContent = '0';

    document.getElementById('complete-title').textContent = chapter.completeTitle;
    document.getElementById('complete-quote').innerHTML = chapter.completeQuote;

    scene.background = new THREE.Color(chapter.bgColor);
    createWorld(chapter);
    createPlayer();
    createMemoryFragments(chapter);
    setupControls();
    startMusic(n);
    animate(chapter);

    showPoem(chapter.poems[0]);
    showMessage(`${chapter.num}:${chapter.label1}を${chapter.poems.length}つ集めよう`);
}

// ========================================
// 音楽開始
// ========================================
function startMusic(chapterNum) {
    if (bgMusic) {
        bgMusic.dispose();
    }

    const melodies = [
        ['C4', 'E4', 'G4', 'A4', 'G4', 'E4', 'C4', 'D4'],
        ['D3', 'F3', 'A3', 'C4', 'A3', 'F3', 'D3', 'E3'],
        ['G4', 'B4', 'D5', 'G5', 'D5', 'B4', 'G4', 'A4'],
        ['E4', 'G4', 'B4', 'E5', 'B4', 'G4', 'E4', 'F#4'],
        ['A3', 'C4', 'E4', 'A4', 'E4', 'C4', 'A3', 'B3'],
        ['F3', 'A3', 'C4', 'F4', 'C4', 'A3', 'F3', 'G3'],
        ['D4', 'F4', 'A4', 'D5', 'A4', 'F4', 'D4', 'E4'],
        ['G3', 'B3', 'D4', 'G4', 'D4', 'B3', 'G3', 'A3'],
        ['C3', 'E3', 'G3', 'C4', 'G3', 'E3', 'C3', 'D3'],
        ['A2', 'C3', 'E3', 'A3', 'E3', 'C3', 'A2', 'B2'],
        ['E3', 'G3', 'B3', 'E4', 'B3', 'G3', 'E3', 'F#3']
    ];

    synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
            attack: 0.5,
            decay: 0.3,
            sustain: 0.4,
            release: 1
        }
    }).toDestination();

    synth.volume.value = -15;

    const melody = melodies[chapterNum - 1];
    const pattern = new Tone.Pattern((time, note) => {
        synth.triggerAttackRelease(note, '4n', time);
    }, melody, 'up');

    pattern.start(0);
    Tone.Transport.bpm.value = 60;
    Tone.Transport.start();

    bgMusic = pattern;
}

// ========================================
// Three.js 初期化
// ========================================
function initThreeJS() {
    const canvas = document.getElementById("game-canvas");
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 15);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(ambientLight, directionalLight);

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ========================================
// 世界生成(章ごとに異なる3D環境)
// ========================================
function createWorld(chapter) {
    decorations = [];
    transformableObjects = [];

    if (currentChapter === 1) {
        createRiverWorld(chapter);
    } else if (currentChapter === 2) {
        createCityWorld(chapter);
    } else if (currentChapter === 3) {
        createPlanetWorld(chapter);
    } else if (currentChapter === 4) {
        createDesertWorld(chapter);
    } else if (currentChapter === 5) {
        createPalaceWorld(chapter);
    } else if (currentChapter === 6) {
        createOceanWorld(chapter);
    } else if (currentChapter === 7) {
        createMountainWorld(chapter);
    } else if (currentChapter === 8) {
        createMistyWorld(chapter);
    } else if (currentChapter === 9) {
        createHellWorld(chapter);
    } else if (currentChapter === 10) {
        createDarkWorld(chapter);
    } else if (currentChapter === 11) {
        createGalaxyWorld(chapter);
    }
}

// ========================================
// 第1章: 無常の川
// ========================================
function createRiverWorld(chapter) {
    const groundGeometry = new THREE.PlaneGeometry(80, 80, 40, 40);
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = Math.sin(vertices[i] * 0.1) * 0.3;
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();
    
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: chapter.bgColor,
        roughness: 0.3,
        metalness: 0.2
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    transformableObjects.push({ obj: ground, material: groundMaterial, targetColor: chapter.finalColor });

    for (let i = 0; i < 20; i++) {
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

        const leavesGeometry = new THREE.SphereGeometry(1.5, 8, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x556B2F,
            transparent: true,
            opacity: 0.5
        });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 3;

        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);

        const x = (Math.random() - 0.5) * 70;
        const z = (Math.random() - 0.5) * 70;
        tree.position.set(x, 1.5, z);
        tree.castShadow = true;

        decorations.push(tree);
        transformableObjects.push({ obj: leaves, material: leavesMaterial, targetOpacity: 1, targetColor: 0x228B22 });
        scene.add(tree);
    }
}

// ========================================
// 第2章: 罪と贖罪の街
// ========================================
function createCityWorld(chapter) {
    const groundGeometry = new THREE.PlaneGeometry(80, 80);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: chapter.bgColor,
        roughness: 0.8 
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    transformableObjects.push({ obj: ground, material: groundMaterial, targetColor: chapter.finalColor });

    for (let i = 0; i < 12; i++) {
        const width = 4 + Math.random() * 3;
        const height = 5 + Math.random() * 4;
        const depth = 4 + Math.random() * 3;
        
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: 0x2A1810,
            roughness: 0.8
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        
        const angle = (Math.PI * 2 / 12) * i;
        const radius = 25 + Math.random() * 15;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        building.position.set(x, height / 2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        
        decorations.push(building);
        transformableObjects.push({ obj: building, material: buildingMaterial, targetColor: 0x8B7355 });
        scene.add(building);

        const lampGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
        const lampMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
        lamp.position.set(x + 3, 1.5, z + 3);
        
        const lightGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const lightMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFAA00,
            emissive: 0xFFAA00,
            emissiveIntensity: 0
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(x + 3, 3, z + 3);
        
        decorations.push(lamp, light);
        transformableObjects.push({ obj: light, material: lightMaterial, targetEmissive: 0.8 });
        scene.add(lamp, light);
    }
}

// ========================================
// 第3章: 星の王子さまの惑星
// ========================================
function createPlanetWorld(chapter) {
    const planetGeometry = new THREE.SphereGeometry(10, 32, 32);
    const planetMaterial = new THREE.MeshStandardMaterial({
        color: 0x4A5D23,
        roughness: 0.9
    });
    ground = new THREE.Mesh(planetGeometry, planetMaterial);
    ground.position.y = -8;
    ground.receiveShadow = true;
    scene.add(ground);
    
    transformableObjects.push({ obj: ground, material: planetMaterial, targetColor: 0x6B8E23 });

    stars = [];
    for (let i = 0; i < 300; i++) {
        const starSize = 0.05 + Math.random() * 0.15;
        const starGeometry = new THREE.SphereGeometry(starSize, 8, 8);
        const starMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.1
        });
        
        const star = new THREE.Mesh(starGeometry, starMaterial);
        
        const radius = 40 + Math.random() * 60;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        star.position.x = radius * Math.sin(phi) * Math.cos(theta);
        star.position.y = radius * Math.sin(phi) * Math.sin(theta);
        star.position.z = radius * Math.cos(phi);
        
        star.userData.baseOpacity = 0.1;
        star.userData.targetOpacity = Math.random() * 0.8 + 0.2;
        star.userData.twinkleSpeed = 0.5 + Math.random() * 1.5;
        
        stars.push(star);
        transformableObjects.push({ obj: star, material: starMaterial, targetOpacity: star.userData.targetOpacity });
        scene.add(star);
    }

    const roseGroup = new THREE.Group();
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.08, 2, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x2D5016 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 1;
    roseGroup.add(stem);
    
    for (let i = 0; i < 5; i++) {
        const petalGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const petalMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B0000,
            emissive: 0xFF3366,
            emissiveIntensity: 0
        });
        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
        
        const angle = (Math.PI * 2 / 5) * i;
        petal.position.x = Math.cos(angle) * 0.25;
        petal.position.z = Math.sin(angle) * 0.25;
        petal.position.y = 2;
        petal.scale.set(1, 0.5, 0.8);
        
        transformableObjects.push({ obj: petal, material: petalMaterial, targetEmissive: 0.5, targetColor: 0xFF3366 });
        roseGroup.add(petal);
    }
    
    roseGroup.position.set(0, 0.5, 0);
    decorations.push(roseGroup);
    scene.add(roseGroup);
}

// ========================================
// 第4章: 異邦人の砂漠
// ========================================
function createDesertWorld(chapter) {
    const groundGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = Math.sin(vertices[i] * 0.1) * Math.cos(vertices[i + 1] * 0.1) * 0.5;
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();
    
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: chapter.bgColor,
        roughness: 0.95 
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    transformableObjects.push({ obj: ground, material: groundMaterial, targetColor: chapter.finalColor });

    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFF00,
        emissive: 0xFFFF00,
        emissiveIntensity: 1
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(30, 40, -30);
    decorations.push(sun);
    scene.add(sun);

    for (let i = 0; i < 5; i++) {
        const cactusGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
        const cactusMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2F4F2F,
            transparent: true,
            opacity: 0
        });
        const cactus = new THREE.Mesh(cactusGeometry, cactusMaterial);
        
        const x = (Math.random() - 0.5) * 60;
        const z = (Math.random() - 0.5) * 60;
        cactus.position.set(x, 1, z);
        
        decorations.push(cactus);
        transformableObjects.push({ obj: cactus, material: cactusMaterial, targetOpacity: 1 });
        scene.add(cactus);
    }
}

// ========================================
// 第5章: 雅の宮廷
// ========================================
function createPalaceWorld(chapter) {
    const groundGeometry = new THREE.PlaneGeometry(90, 90);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: chapter.bgColor,
        roughness: 0.7 
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    transformableObjects.push({ obj: ground, material: groundMaterial, targetColor: chapter.finalColor });

    for (let i = 0; i < 15; i++) {
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4A2511 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

        const leavesGeometry = new THREE.SphereGeometry(2, 8, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B6B6B,
            emissive: 0xFFB7C5,
            emissiveIntensity: 0,
            transparent: true,
            opacity: 0.3
        });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 4;

        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);

        const x = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 80;
        tree.position.set(x, 2, z);
        
        decorations.push(tree);
        transformableObjects.push({ 
            obj: leaves, 
            material: leavesMaterial, 
            targetOpacity: 1, 
            targetEmissive: 0.3,
            targetColor: 0xFFB7C5
        });
        scene.add(tree);
    }

    const moonGeometry = new THREE.SphereGeometry(4, 32, 32);
    const moonMaterial = new THREE.MeshBasicMaterial({
        color: 0x666666,
        emissive: 0xF0E68C,
        emissiveIntensity: 0
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(-20, 30, -20);
    decorations.push(moon);
    transformableObjects.push({ obj: moon, material: moonMaterial, targetEmissive: 0.5 });
    scene.add(moon);
}

// ========================================
// 第6章: 海の日記
// ========================================
function createOceanWorld(chapter) {
    const groundGeometry = new THREE.PlaneGeometry(120, 120, 60, 60);
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = Math.sin(vertices[i] * 0.05) * Math.cos(vertices[i + 1] * 0.05) * 0.5;
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();
    
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: chapter.bgColor,
        roughness: 0.1,
        metalness: 0.5
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    transformableObjects.push({ obj: ground, material: groundMaterial, targetColor: chapter.finalColor });

    for (let i = 0; i < 4; i++) {
        const boatGroup = new THREE.Group();
        
        const hullGeometry = new THREE.BoxGeometry(4, 1, 2);
        const hullMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
        const hull = new THREE.Mesh(hullGeometry, hullMaterial);
        hull.position.y = 0.5;
        boatGroup.add(hull);
        
        const mastGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
        const mastMaterial = new THREE.MeshStandardMaterial({ color: 0x4A3C2A });
        const mast = new THREE.Mesh(mastGeometry, mastMaterial);
        mast.position.y = 2.5;
        boatGroup.add(mast);
        
        const sailGeometry = new THREE.PlaneGeometry(2, 2);
        const sailMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xCCCCCC,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
        const sail = new THREE.Mesh(sailGeometry, sailMaterial);
        sail.position.set(1, 2.5, 0);
        boatGroup.add(sail);
        
        const angle = (Math.PI * 2 / 4) * i;
        const radius = 30;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        boatGroup.position.set(x, 0.5, z);
        
        boatGroup.userData.angle = angle;
        
        decorations.push(boatGroup);
        transformableObjects.push({ obj: sail, material: sailMaterial, targetOpacity: 1, targetColor: 0xFFFFFF });
        scene.add(boatGroup);
    }
}

// ========================================
// 第7章: 奥の細道
// ========================================
function createMountainWorld(chapter) {
    const groundGeometry = new THREE.PlaneGeometry(90, 90, 45, 45);
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = Math.random() * 2.5;
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();
    
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: chapter.bgColor,
        roughness: 0.9 
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    transformableObjects.push({ obj: ground, material: groundMaterial, targetColor: chapter.finalColor });

    for (let i = 0; i < 18; i++) {
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 5, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

        const leavesGeometry = new THREE.ConeGeometry(2, 4, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x0D2010,
            transparent: true,
            opacity: 0.5
        });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 5;

        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);

        const x = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 80;
        tree.position.set(x, 2.5, z);
        tree.castShadow = true;

        decorations.push(tree);
        transformableObjects.push({ obj: leaves, material: leavesMaterial, targetOpacity: 1, targetColor: 0x1B5E20 });
        scene.add(tree);
    }
}

// ========================================
// 第8章: 草枕の山
// ========================================
function createMistyWorld(chapter) {
    const groundGeometry = new THREE.PlaneGeometry(80, 80, 40, 40);
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = Math.sin(vertices[i] * 0.2) * 1.5;
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();
    
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: chapter.bgColor,
        roughness: 0.8 
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    transformableObjects.push({ obj: ground, material: groundMaterial, targetColor: chapter.finalColor });

    const innGeometry = new THREE.BoxGeometry(6, 3, 4);
    const innMaterial = new THREE.MeshStandardMaterial({ color: 0x5A4A3A });
    const inn = new THREE.Mesh(innGeometry, innMaterial);
    inn.position.set(0, 1.5, -20);
    inn.castShadow = true;
    inn.receiveShadow = true;
    decorations.push(inn);
    transformableObjects.push({ obj: inn, material: innMaterial, targetColor: 0x8B7355 });
    scene.add(inn);
    
    const roofGeometry = new THREE.ConeGeometry(4, 2, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x2A2A2A });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, 4, -20);
    roof.rotation.y = Math.PI / 4;
    decorations.push(roof);
    scene.add(roof);
}

// ========================================
// 第9章: 蜘蛛の糸(地獄)
// ========================================
function createHellWorld(chapter) {
    const groundGeometry = new THREE.PlaneGeometry(80, 80);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: chapter.bgColor,
        roughness: 0.9,
        emissive: 0x8B0000,
        emissiveIntensity: 0
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    transformableObjects.push({ obj: ground, material: groundMaterial, targetColor: chapter.finalColor, targetEmissive: 0.2 });

    const threadGeometry = new THREE.CylinderGeometry(0.02, 0.02, 40, 8);
    const threadMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x666666,
        emissive: 0xC0C0C0,
        emissiveIntensity: 0,
        transparent: true,
        opacity: 0.3
    });
    const thread = new THREE.Mesh(threadGeometry, threadMaterial);
    thread.position.set(0, 20, 0);
    decorations.push(thread);
    transformableObjects.push({ obj: thread, material: threadMaterial, targetOpacity: 0.7, targetEmissive: 0.5 });
    scene.add(thread);
    
    const lotusGeometry = new THREE.SphereGeometry(3, 16, 16);
    const lotusMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x660033,
        emissive: 0xFF69B4,
        emissiveIntensity: 0
    });
    const lotus = new THREE.Mesh(lotusGeometry, lotusMaterial);
    lotus.position.set(0, 40, 0);
    decorations.push(lotus);
    transformableObjects.push({ obj: lotus, material: lotusMaterial, targetEmissive: 0.4 });
    scene.add(lotus);
}

// ========================================
// 第10章: 人間失格の闇
// ========================================
function createDarkWorld(chapter) {
    const groundGeometry = new THREE.PlaneGeometry(80, 80);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: chapter.bgColor,
        roughness: 0.95 
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    transformableObjects.push({ obj: ground, material: groundMaterial, targetColor: chapter.finalColor });

    for (let i = 0; i < 8; i++) {
        const width = 2 + Math.random() * 2;
        const height = 2 + Math.random() * 2;
        const depth = 2 + Math.random() * 2;
        
        const ruinGeometry = new THREE.BoxGeometry(width, height, depth);
        const ruinMaterial = new THREE.MeshStandardMaterial({
            color: 0x2A2A2A,
            roughness: 0.9
        });
        const ruin = new THREE.Mesh(ruinGeometry, ruinMaterial);
        
        const x = (Math.random() - 0.5) * 60;
        const z = (Math.random() - 0.5) * 60;
        ruin.position.set(x, height / 2, z);
        ruin.rotation.y = Math.random() * Math.PI;
        ruin.castShadow = true;
        
        decorations.push(ruin);
        transformableObjects.push({ obj: ruin, material: ruinMaterial, targetColor: 0x5A5A5A });
        scene.add(ruin);
    }

    const lightGeometry = new THREE.SphereGeometry(1, 16, 16);
    const lightMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0
    });
    const light = new THREE.Mesh(lightGeometry, lightMaterial);
    light.position.set(0, 15, 0);
    decorations.push(light);
    transformableObjects.push({ obj: light, material: lightMaterial, targetEmissive: 0.6 });
    scene.add(light);
}

// ========================================
// 第11章: 銀河鉄道の夜
// ========================================
function createGalaxyWorld(chapter) {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: chapter.bgColor,
        roughness: 0.3,
        metalness: 0.5,
        emissive: 0x191970,
        emissiveIntensity: 0
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    transformableObjects.push({ obj: ground, material: groundMaterial, targetColor: chapter.finalColor, targetEmissive: 0.3 });

    stars = [];
    for (let i = 0; i < 400; i++) {
        const starSize = 0.05 + Math.random() * 0.2;
        const starGeometry = new THREE.SphereGeometry(starSize, 8, 8);
        const starMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.1
        });
        
        const star = new THREE.Mesh(starGeometry, starMaterial);
        
        const radius = 30 + Math.random() * 70;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        star.position.x = radius * Math.sin(phi) * Math.cos(theta);
        star.position.y = radius * Math.sin(phi) * Math.sin(theta);
        star.position.z = radius * Math.cos(phi);
        
        star.userData.baseOpacity = 0.1;
        star.userData.targetOpacity = Math.random() * 0.8 + 0.2;
        star.userData.twinkleSpeed = 0.3 + Math.random() * 1.2;
        
        stars.push(star);
        transformableObjects.push({ obj: star, material: starMaterial, targetOpacity: star.userData.targetOpacity });
        scene.add(star);
    }

    const trainGroup = new THREE.Group();
    const bodyGeometry = new THREE.BoxGeometry(3, 2, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1A3A5A,
        metalness: 0.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    trainGroup.add(body);
    
    const roofGeometry = new THREE.BoxGeometry(3.2, 0.3, 8.2);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x0F2F4F });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 2.15;
    trainGroup.add(roof);
    
    for (let i = 0; i < 4; i++) {
        const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x1C1C1C });
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        
        const x = i < 2 ? -1.6 : 1.6;
        const z = i % 2 === 0 ? -2.5 : 2.5;
        wheel.position.set(x, 0.3, z);
        trainGroup.add(wheel);
    }
    
    trainGroup.position.set(15, 0, 0);
    decorations.push(trainGroup);
    transformableObjects.push({ obj: body, material: bodyMaterial, targetColor: 0x4169E1 });
    scene.add(trainGroup);
}

// ========================================
// プレイヤー生成(円柱型キャラクター)
// ========================================
function createPlayer() {
    player = new THREE.Group();

    const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 8);
    const legMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0.5
    });
    const legLeft = new THREE.Mesh(legGeometry, legMaterial);
    legLeft.position.set(-0.15, 0.2, 0);
    const legRight = new THREE.Mesh(legGeometry, legMaterial.clone());
    legRight.position.set(0.15, 0.2, 0);

    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.8;

    const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0.5
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;

    player.add(legLeft);
    player.add(legRight);
    player.add(body);
    player.add(head);

    player.position.set(0, 0, 0);
    player.castShadow = true;
    
    const playerLight = new THREE.PointLight(0xFFFFFF, 1, 10);
    playerLight.position.set(0, 2, 0);
    player.add(playerLight);

    scene.add(player);

    camera.position.set(0, 8, 15);
    camera.lookAt(player.position);
}

// ========================================
// 記憶の断片生成(広範囲に分散配置)
// ========================================
function createMemoryFragments(chapter) {
    const count = chapter.poems.length;
    let positions = [];

    if (count === 5) {
        positions = [
            [20, 1.5, 25],
            [-25, 1.5, 15],
            [30, 1.5, -10],
            [-20, 1.5, -25],
            [0, 1.5, -35]
        ];
    } else if (count === 6) {
        positions = [
            [18, 1.5, 22],
            [-22, 1.5, 18],
            [28, 1.5, 0],
            [-28, 1.5, -5],
            [15, 1.5, -25],
            [-18, 1.5, -28]
        ];
    } else if (count === 7) {
        positions = [
            [25, 1.5, 20],
            [-20, 1.5, 25],
            [30, 1.5, 5],
            [-30, 1.5, 0],
            [20, 1.5, -20],
            [-25, 1.5, -20],
            [0, 1.5, -35]
        ];
    } else {
        positions = [
            [25, 1.5, 25],
            [-25, 1.5, 25],
            [30, 1.5, 10],
            [-30, 1.5, 10],
            [30, 1.5, -10],
            [-30, 1.5, -10],
            [25, 1.5, -25],
            [-25, 1.5, -25]
        ];
    }

    memoryFragments = [];

    positions.forEach((pos, index) => {
        const fragmentGeometry = new THREE.OctahedronGeometry(0.8);
        const fragmentMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            emissive: 0xFFD700,
            emissiveIntensity: 0.6,
            metalness: 0.5
        });
        const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);
        fragment.position.set(pos[0], pos[1], pos[2]);
        fragment.userData.index = index;
        fragment.userData.collected = false;
        fragment.castShadow = true;
        memoryFragments.push(fragment);
        scene.add(fragment);
    });
}

// ========================================
// 操作設定
// ========================================
function setupControls() {
    window.addEventListener("keydown", (e) => {
        keys[e.key] = true;
    });

    window.addEventListener("keyup", (e) => {
        keys[e.key] = false;
    });

    const canvas = document.getElementById("game-canvas");
    
    canvas.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;

        const deltaX = touchX - touchStartX;
        const deltaY = touchY - touchStartY;

        moveX = deltaX * 0.01;
        moveZ = deltaY * 0.01;

        touchStartX = touchX;
        touchStartY = touchY;
    });

    canvas.addEventListener("touchend", () => {
        moveX = 0;
        moveZ = 0;
    });
}

// ========================================
// プレイヤー移動更新
// ========================================
function updatePlayer() {
    const speed = 0.2;

    if (keys["ArrowUp"] || keys["w"]) player.position.z -= speed;
    if (keys["ArrowDown"] || keys["s"]) player.position.z += speed;
    if (keys["ArrowLeft"] || keys["a"]) player.position.x -= speed;
    if (keys["ArrowRight"] || keys["d"]) player.position.x += speed;

    player.position.x += moveX;
    player.position.z += moveZ;

    player.position.x = Math.max(-45, Math.min(45, player.position.x));
    player.position.z = Math.max(-45, Math.min(45, player.position.z));

    camera.position.x = player.position.x;
    camera.position.z = player.position.z + 15;
    camera.lookAt(player.position);
}

// ========================================
// 記憶の断片収集判定 & 世界変容
// ========================================
function checkMemoryCollection(chapter) {
    memoryFragments.forEach((fragment) => {
        if (fragment.userData.collected) return;

        const distance = player.position.distanceTo(fragment.position);
        if (distance < 3) {
            fragment.userData.collected = true;
            scene.remove(fragment);
            collectedMemories++;

            playSoundEffect();

            document.getElementById("memory-count").textContent = collectedMemories;

            if (collectedMemories <= chapter.poems.length) {
                showPoem(chapter.poems[collectedMemories - 1]);
            }

            const progress = collectedMemories / chapter.poems.length;
            timeFlow = Math.floor(progress * 100);
            document.getElementById("time-flow").textContent = timeFlow;

            transformWorld(progress);

            if (collectedMemories >= chapter.poems.length) {
                setTimeout(() => {
                    updateLiteratureInfo(chapter.work, chapter.author, chapter.poems);
                    document.getElementById("chapter-complete").style.display = "flex";
                }, 2000);
            }
        }
    });
}

// ========================================
// 世界変容処理
// ========================================
function transformWorld(progress) {
    transformableObjects.forEach((item) => {
        const material = item.material;
        
        if (item.targetColor !== undefined) {
            const currentColor = new THREE.Color(material.color);
            const targetColor = new THREE.Color(item.targetColor);
            material.color.lerp(targetColor, progress * 0.3);
        }
        
        if (item.targetOpacity !== undefined) {
            material.opacity = THREE.MathUtils.lerp(
                material.opacity,
                item.targetOpacity,
                progress * 0.2
            );
        }
        
        if (item.targetEmissive !== undefined) {
            material.emissiveIntensity = THREE.MathUtils.lerp(
                material.emissiveIntensity,
                item.targetEmissive,
                progress * 0.2
            );
        }
    });
}

// ========================================
// 効果音再生
// ========================================
function playSoundEffect() {
    const note = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: {
            attack: 0.01,
            decay: 0.2,
            sustain: 0,
            release: 0.3
        }
    }).toDestination();
    
    note.volume.value = -10;
    note.triggerAttackRelease('C5', '8n');
}

// ========================================
// アニメーションループ
// ========================================
function animate(chapter) {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    animationId = requestAnimationFrame(() => animate(chapter));

    updatePlayer();
    checkMemoryCollection(chapter);

    memoryFragments.forEach((fragment) => {
        if (!fragment.userData.collected) {
            fragment.rotation.y += 0.03;
            fragment.rotation.x += 0.02;
            fragment.position.y = 1.5 + Math.sin(Date.now() * 0.003 + fragment.userData.index) * 0.4;
        }
    });

    if (stars.length > 0) {
        stars.forEach((star) => {
            const time = Date.now() * 0.001;
            const baseOpacity = star.userData.baseOpacity || 0.1;
            star.material.opacity = baseOpacity + 
                Math.sin(time * star.userData.twinkleSpeed) * 0.2;
        });
    }

    decorations.forEach((obj) => {
        if (obj.userData.angle !== undefined) {
            obj.position.y = 0.5 + Math.sin(Date.now() * 0.001 + obj.userData.angle) * 0.2;
            obj.rotation.z = Math.sin(Date.now() * 0.001 + obj.userData.angle) * 0.05;
        }
    });

    renderer.render(scene, camera);
}

// ========================================
// 詩句表示
// ========================================
function showPoem(text) {
    const poemDisplay = document.getElementById("poem-display");
    poemDisplay.textContent = text;
    poemDisplay.style.animation = "none";
    
    setTimeout(() => {
        poemDisplay.style.animation = "poemFade 3s ease-in-out";
    }, 10);
}

// ========================================
// メッセージ表示
// ========================================
function showMessage(text) {
    document.getElementById("message-text").textContent = text;
    document.getElementById("message-box").style.display = "block";
}

// ========================================
// 文学情報更新
// ========================================
function updateLiteratureInfo(work, author, poems) {
    document.getElementById("lit-title").textContent = `『${work}』`;
    document.getElementById("lit-author").textContent = author;

    const quotesList = document.getElementById("quotes-list");
    quotesList.innerHTML = "";
    poems.forEach(poem => {
        const li = document.createElement("li");
        li.textContent = poem;
        quotesList.appendChild(li);
    });
}

// ========================================
// シーンリセット
// ========================================
function resetScene() {
    if (!scene) {
        initThreeJS();
    }

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(ambientLight, directionalLight);

    memoryFragments = [];
    collectedMemories = 0;
    timeFlow = 0;
    moveX = 0;
    moveZ = 0;
    
    stars = [];
    decorations = [];
    transformableObjects = [];
}