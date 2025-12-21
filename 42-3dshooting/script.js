// ※ import は不要（three.min.js を index.html で読み込み済み）

// ====== 機体データ ======
const TYPES = {
  laser: {
    key:'laser', name:'TYPE-A：レーザー', color:0x7ee0ff,
    spec:'連続レーザー（押している間だけ発射）。エネルギー消費あり。機動力：中、耐久：中。',
    hp:100, speed:20, hasEnergy:true, energyMax:100, energyRegen:14, energyDrain:25, laserDPS:55
  },
  bullet: {
    key:'bullet', name:'TYPE-B：一方向弾', color:0x9cff89,
    spec:'前方に高速連射。扱いやすい。機動力：高、耐久：中。',
    hp:105, speed:24, hasEnergy:false, rof:12, dmg:1.0
  },
  scatter: {
    key:'scatter', name:'TYPE-C：拡散弾', color:0xffda7b,
    spec:'3方向ショット。制圧向き。機動力：やや低、耐久：高。',
    hp:120, speed:18, hasEnergy:false, rof:6, dmg:0.8, spread:true
  }
};

// ====== UI 参照 ======
const choicesEl = document.getElementById('choices');
const descEl = document.getElementById('desc');
const startBtn = document.getElementById('startBtn');
const menuEl = document.getElementById('menu');
const hudEl = document.getElementById('hud');
const overEl = document.getElementById('overlay');
const overTitle = document.getElementById('overTitle');
const finalScore = document.getElementById('finalScore');

const hpBar = document.getElementById('hpbar');
const hpText = document.getElementById('hptext');
const enBar = document.getElementById('enbar');
const enText = document.getElementById('entext');
const energyRow = document.getElementById('energyRow');
const scoreEl = document.getElementById('score');

// ====== 選択カード生成 ======
let selectedType = null;
for (const t of Object.values(TYPES)) {
  const c = document.createElement('div');
  c.className = 'card';
  c.dataset.type = t.key;
  c.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px;">
      <div style="width:16px; height:16px; border-radius:50%; background:#fff; box-shadow:0 0 10px #fff; filter: drop-shadow(0 0 4px #fff);"></div>
      <div style="font-weight:700">${t.name}</div>
    </div>
    <div class="muted" style="margin-top:6px">${t.spec}</div>
  `;
  c.addEventListener('click', () => {
    document.querySelectorAll('.card').forEach(x=>x.classList.remove('selected'));
    c.classList.add('selected');
    selectedType = t.key;
    descEl.textContent = t.spec;
    startBtn.disabled = false;
  });
  choicesEl.appendChild(c);
}

document.getElementById('how').addEventListener('click', () => {
  alert("操作：WASD / 方向キーで移動。\nTYPE-Aはスペースまたはクリックでレーザー（押している間）。\nTYPE-B/Cは自動射撃。\n敵や弾に当たるとダメージ。スコアは撃破数。");
});
startBtn.addEventListener('click', () => {
  if (!selectedType) return;
  menuEl.style.display = 'none';
  hudEl.hidden = false;
  startGame(selectedType);
});
document.getElementById('restart').addEventListener('click', ()=> location.reload());

// ====== three.js / ゲーム本体 ======
let scene, camera, renderer, clock;
let player, playerCore, playerStats, keys = {}, mouseDown = false;
let bullets = [], enemies = [], fx = [];
let bossSpawned = false;
let lastShot = 0, score = 0, running = true;
let starField;
let laserLine = null, raycaster = new THREE.Raycaster();

// ステージ計算関数（スコアベース）
function getStage() {
  // ステージ1: 0-99点, ステージ2: 100-199点, ステージ3: 200点以上
  return Math.floor(score / 100) + 1;
}

function startGame(typeKey){
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x02050f, 50, 340);
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1200);
  camera.position.set(0, 0, 60);
  camera.lookAt(0,0,0);

  renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x02050f, 1);
  document.getElementById('game').appendChild(renderer.domElement);

  clock = new THREE.Clock();

  const amb = new THREE.AmbientLight(0xffffff, 0.6); scene.add(amb);
  const dir = new THREE.DirectionalLight(0xffffff, 0.7); dir.position.set(2,3,1); scene.add(dir);

  makeStars();
  createPlayer(TYPES[typeKey]);
  addEvents();

  running = true;
  setTimeout(() => { if (running && !bossSpawned) spawnBoss(); }, 60000);
  animate();
}

function makeStars(){
  const starCount = 1200;
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount*3);
  for (let i=0;i<starCount;i++){
    positions[i*3]   = (Math.random()*2-1)*90;
    positions[i*3+1] = (Math.random()*2-1)*55;
    positions[i*3+2] = -Math.random()*350 - 10;
  }
  geom.setAttribute('position', new THREE.BufferAttribute(positions,3));
  const mat = new THREE.PointsMaterial({ size: 0.8, color: 0x9cc7ff });
  starField = new THREE.Points(geom, mat);
  starField.userData = { speed: 22 };
  scene.add(starField);
}

function createPlayer(type){
  player = new THREE.Group();
  const body = new THREE.ConeGeometry(2.2, 6, 12);
  const mat  = new THREE.MeshStandardMaterial({
    color:type.color, metalness:.5, roughness:.35,
    emissive: type.key==='laser'?0x083b53:0x3a2a06, emissiveIntensity:.6
  });
  const mesh = new THREE.Mesh(body, mat);
  mesh.rotation.x = Math.PI/2;
  playerCore = mesh;
  player.add(mesh);

  const wingGeo = new THREE.BoxGeometry(6.0, .2, 1.6);
  const wing = new THREE.Mesh(
    wingGeo,
    new THREE.MeshStandardMaterial({ color:0xabcdef, metalness:.5, roughness:.2, emissive:0x111111, emissiveIntensity:.4 })
  );
  wing.position.set(0, -1.2, 0.6);
  player.add(wing);

  player.position.set(0, 0, 20);
  scene.add(player);

  playerStats = {
    type: type.key,
    hp: type.hp, hpMax: type.hp,
    speed: type.speed,
    hasEnergy: !!type.hasEnergy,
    energy: type.hasEnergy ? type.energyMax : 0,
    energyMax: type.energyMax || 0,
    energyRegen: type.energyRegen || 0,
    energyDrain: type.energyDrain || 0,
    laserDPS: type.laserDPS || 0,
    rof: type.rof || 0,
    dmg: type.dmg || 1,
    spread: !!type.spread,
    bounds: { x: 36, y: 22 }
  };

  if (playerStats.type === 'laser') {
    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-260)
    ]);
    const laserMat = new THREE.LineBasicMaterial({ color: 0x77e6ff, transparent:true, opacity:0.0 });
    laserLine = new THREE.Line(laserGeo, laserMat);
    player.add(laserLine);
    energyRow.style.display = '';
  } else {
    energyRow.style.display = 'none';
  }

  scheduleSpawn();
  updateHUD();
}

function scheduleSpawn(){
  const base = 900;
  let t = Math.max(350, base - score*4);
  setTimeout(()=>{ if(running){ spawnEnemy(); scheduleSpawn(); } }, t);
}

// ====== 敵タイプ定義 ======
const ENEMY_TYPES = {
  basic: { // 既存の基本敵
    name: 'basic',
    hp: 3,
    speed: 26,
    color: 0xff6b6b,
    createMesh: () => {
      const geo = new THREE.IcosahedronGeometry( Math.random()*1.3 + 1.4, 0 );
      const mat = new THREE.MeshStandardMaterial({ color: 0xff6b6b, metalness:.2, roughness:.8, emissive:0x220000, emissiveIntensity:.5 });
      return new THREE.Mesh(geo, mat);
    }
  },
  spear: { // 高速突進型（スピア型）
    name: 'spear',
    hp: 4,
    speed: 35,
    color: 0xff4444,
    createMesh: () => {
      const group = new THREE.Group();
      // 槍の先端（円錐）
      const tip = new THREE.ConeGeometry(0.8, 2.5, 8);
      const tipMat = new THREE.MeshStandardMaterial({ color: 0xff4444, metalness:.4, roughness:.6, emissive:0x440000, emissiveIntensity:.7 });
      const tipMesh = new THREE.Mesh(tip, tipMat);
      tipMesh.rotation.x = Math.PI;
      tipMesh.position.z = 1.25;
      group.add(tipMesh);
      // 槍の柄（円柱）
      const shaft = new THREE.CylinderGeometry(0.3, 0.3, 2, 8);
      const shaftMat = new THREE.MeshStandardMaterial({ color: 0xcc3333, metalness:.3, roughness:.7 });
      const shaftMesh = new THREE.Mesh(shaft, shaftMat);
      shaftMesh.position.z = -0.5;
      group.add(shaftMesh);
      return group;
    }
  },
  orb: { // 円形軌道型（オーブ型）
    name: 'orb',
    hp: 5,
    speed: 18,
    color: 0x44ff44,
    createMesh: () => {
      const group = new THREE.Group();
      // 外側のリング
      const ring = new THREE.TorusGeometry(1.2, 0.3, 8, 16);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x44ff44, metalness:.5, roughness:.5, emissive:0x004400, emissiveIntensity:.6 });
      const ringMesh = new THREE.Mesh(ring, ringMat);
      group.add(ringMesh);
      // 中心のコア
      const core = new THREE.SphereGeometry(0.6, 12, 12);
      const coreMat = new THREE.MeshStandardMaterial({ color: 0x66ff66, metalness:.6, roughness:.4, emissive:0x006600, emissiveIntensity:.8 });
      const coreMesh = new THREE.Mesh(core, coreMat);
      group.add(coreMesh);
      return group;
    }
  },
  diamond: { // ジグザグ型（ダイヤ型）
    name: 'diamond',
    hp: 4,
    speed: 22,
    color: 0x4444ff,
    createMesh: () => {
      const group = new THREE.Group();
      // 八面体（ダイヤモンド形状）
      const geo = new THREE.OctahedronGeometry(1.5, 0);
      const mat = new THREE.MeshStandardMaterial({ color: 0x4444ff, metalness:.4, roughness:.6, emissive:0x000044, emissiveIntensity:.7 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = Math.PI / 4;
      mesh.rotation.y = Math.PI / 4;
      group.add(mesh);
      // 周囲の小さなダイヤ
      for (let i = 0; i < 4; i++) {
        const small = new THREE.OctahedronGeometry(0.4, 0);
        const smallMat = new THREE.MeshStandardMaterial({ color: 0x6666ff, metalness:.3, roughness:.7 });
        const smallMesh = new THREE.Mesh(small, smallMat);
        const angle = (i / 4) * Math.PI * 2;
        smallMesh.position.set(Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0);
        group.add(smallMesh);
      }
      return group;
    }
  },
  spike: { // 追尾型（スパイク型）
    name: 'spike',
    hp: 6,
    speed: 20,
    color: 0xff44ff,
    createMesh: () => {
      const group = new THREE.Group();
      // 中心の球
      const center = new THREE.SphereGeometry(0.8, 12, 12);
      const centerMat = new THREE.MeshStandardMaterial({ color: 0xff44ff, metalness:.5, roughness:.5, emissive:0x440044, emissiveIntensity:.7 });
      const centerMesh = new THREE.Mesh(center, centerMat);
      group.add(centerMesh);
      // 周囲のスパイク（6本）
      const spikeGeo = new THREE.ConeGeometry(0.2, 1.2, 6);
      const spikeMat = new THREE.MeshStandardMaterial({ color: 0xff66ff, metalness:.4, roughness:.6 });
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const spike = new THREE.Mesh(spikeGeo, spikeMat);
        spike.position.set(Math.cos(angle) * 1.0, Math.sin(angle) * 1.0, 0);
        spike.rotation.z = angle + Math.PI / 2;
        group.add(spike);
      }
      return group;
    }
  }
};

function spawnEnemy(){
  // 敵タイプをランダムに選択（基本敵は30%、新敵は各17.5%）
  const rand = Math.random();
  let type;
  if (rand < 0.3) type = ENEMY_TYPES.basic;
  else if (rand < 0.475) type = ENEMY_TYPES.spear;
  else if (rand < 0.65) type = ENEMY_TYPES.orb;
  else if (rand < 0.825) type = ENEMY_TYPES.diamond;
  else type = ENEMY_TYPES.spike;

  const m = type.createMesh();
  m.position.set( (Math.random()*2-1)*36, (Math.random()*2-1)*22, -220 - Math.random()*80 );
  
  const baseSpeed = type.speed + Math.random() * 8;
  const baseHp = type.hp + Math.floor(Math.random() * 2);
  
  m.userData = {
    type: type.name,
    hp: baseHp,
    hpMax: baseHp,
    speed: baseSpeed,
    sinX: Math.random()*Math.PI*2,
    sinY: Math.random()*Math.PI*2,
    r: type.name === 'orb' ? 1.8 : (type.name === 'diamond' ? 2.2 : 1.6),
    // タイプ別の追加データ
    angle: 0, // 円形軌道用
    radius: 8 + Math.random() * 4, // 円形軌道の半径
    zigzagPhase: 0, // ジグザグ用
    lastShot: 0, // 攻撃タイミング用
    chargePhase: 0 // 突進型用
  };
  
  enemies.push(m);
  scene.add(m);
}

function spawnBoss(){
  bossSpawned = true;
  const mat = new THREE.MeshStandardMaterial({ color: 0xff4444, metalness:.3, roughness:.7, emissive:0x220000, emissiveIntensity:.6 });
  const boss = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 1), mat);
  boss.add(body);
  const legGeo = new THREE.BoxGeometry(0.8, 0.2, 0.2);
  for (let i=0;i<4;i++) {
    const y = (i-1.5)*0.6;
    const legL = new THREE.Mesh(legGeo, mat);
    legL.position.set(-1.6, y, -0.5);
    boss.add(legL);
    const legR = legL.clone();
    legR.position.x = 1.6;
    boss.add(legR);
  }
  const clawGeo = new THREE.BoxGeometry(1,0.6,0.6);
  const clawL = new THREE.Mesh(clawGeo, mat);
  clawL.position.set(-2.2, 1.2, 0);
  boss.add(clawL);
  const clawR = clawL.clone();
  clawR.position.x = 2.2;
  boss.add(clawR);
  boss.position.set(0, 0, -260);
  boss.userData = { hp:100, speed:10, r:1.8, isBoss:true };
  enemies.push(boss);
  scene.add(boss);
}

function addEvents(){
  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; if(e.code==='Space') keys['space']=true; });
  window.addEventListener('keyup',   e => { keys[e.key.toLowerCase()] = false; if(e.code==='Space') keys['space']=false; });
  window.addEventListener('mousedown', ()=>{ mouseDown = true; });
  window.addEventListener('mouseup',   ()=>{ mouseDown = false; });

  // タッチ簡易対応
  window.addEventListener('touchstart', (e)=>{
    if (playerStats?.type==='laser') mouseDown=true;
    e.preventDefault();
  }, {passive:false});
  window.addEventListener('touchend',   (e)=>{
    mouseDown=false;
    e.preventDefault();
  }, {passive:false});
  window.addEventListener('touchmove', (e)=>{
    if (!running) return;
    const t = e.touches[0]; if (!t) return;
    const dx = (t.clientX / window.innerWidth - 0.5) * 2;
    const dy = (t.clientY / window.innerHeight - 0.5) * -2;
    player.position.x = dx * playerStats.bounds.x;
    player.position.y = dy * playerStats.bounds.y;
    e.preventDefault();
  }, {passive:false});
}

function onResize(){
  if (!renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(){
  const dt = Math.min(.05, clock.getDelta());
  if (!running) return;

  updateStars(dt);
  updatePlayer(dt);
  updateEnemies(dt);
  updateBullets(dt);
  updateFX(dt);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function updateStars(dt){
  const pos = starField.geometry.attributes.position;
  const n = pos.count, spd = starField.userData.speed;
  for (let i=0;i<n;i++){
    let z = pos.getZ(i) + spd * dt;
    if (z > 60) z = -320 - Math.random()*40;
    pos.setZ(i, z);
  }
  pos.needsUpdate = true;
}

function updatePlayer(dt){
  let vx=0, vy=0;
  if (keys['arrowleft']||keys['a'])  vx -= 1;
  if (keys['arrowright']||keys['d']) vx += 1;
  if (keys['arrowup']||keys['w'])    vy += 1;
  if (keys['arrowdown']||keys['s'])  vy -= 1;

  const sp = playerStats.speed;
  player.position.x = THREE.MathUtils.clamp(player.position.x + vx*sp*dt, -playerStats.bounds.x, playerStats.bounds.x);
  player.position.y = THREE.MathUtils.clamp(player.position.y + vy*sp*dt, -playerStats.bounds.y, playerStats.bounds.y);
  player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, -vx*0.25, 0.15);

  if (playerStats.type === 'laser') handleLaser(dt);
  else autoFire(dt);

  updateHUD();
}

function handleLaser(dt){
  if (mouseDown || keys['space']) {
    if (playerStats.energy > 0) {
      playerStats.energy = Math.max(0, playerStats.energy - playerStats.energyDrain*dt);
      if (laserLine) laserLine.material.opacity = 0.9;
      laserHit(dt);
    } else {
      if (laserLine) laserLine.material.opacity = 0.0;
    }
  } else {
    if (laserLine) laserLine.material.opacity = 0.0;
    playerStats.energy = Math.min(playerStats.energyMax, playerStats.energy + playerStats.energyRegen*dt);
  }
}

function laserHit(dt){
  const origin = new THREE.Vector3().setFromMatrixPosition(player.matrixWorld);
  const dir = new THREE.Vector3(0,0,-1).applyQuaternion(player.quaternion);
  raycaster.set(origin, dir);
  raycaster.far = 320;
  const intersects = raycaster.intersectObjects(enemies, false);
  if (intersects.length>0) {
    const obj = intersects[0].object;
    obj.userData.hp -= playerStats.laserDPS * dt;
    spawnSpark(intersects[0].point);
    if (obj.userData.hp <= 0) destroyEnemy(obj, true);
  }
}

function autoFire(dt){
  const now = performance.now()/1000;
  const rate = 1 / (playerStats.rof || 8);
  if (now - lastShot >= rate) { lastShot = now; shootBullet(); }
}

function shootBullet(){
  const make = (angleOffset=0)=>{
    const g = new THREE.SphereGeometry(0.5, 8, 8);
    const m = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive:0x4477ff, emissiveIntensity:1 });
    const b = new THREE.Mesh(g, m);
    b.position.copy(player.position);
    b.userData = { dmg: playerStats.dmg || 1, life: 4 };
    scene.add(b);
    bullets.push(b);
  };
  if (playerStats.spread) { make(0); make(+0.18); make(-0.18); }
  else { make(0); }
}

function updateBullets(dt){
  const currentStage = getStage();
  
  for (let i=bullets.length-1;i>=0;i--){
    const b = bullets[i];
    
    // 弾の移動（プレイヤーの弾は前方、敵の弾は方向ベクトルに従う）
    if (b.userData.dir) {
      // 敵の弾：ステージ3以降のみプレイヤーに向かって追尾
      if (currentStage >= 3) {
        const toPlayer = new THREE.Vector3().subVectors(player.position, b.position);
        const distance = toPlayer.length();
        if (distance > 0.1) {
          toPlayer.normalize();
          // 現在の方向とプレイヤーへの方向を補間（追尾強度: 0.15 = 15%）
          b.userData.dir.lerp(toPlayer, 0.15 * dt * 8);
          b.userData.dir.normalize();
        }
      }
      // 方向ベクトルに従って移動
      b.position.add(b.userData.dir.clone().multiplyScalar(b.userData.speed * dt));
    } else {
      // プレイヤーの弾：わずかに敵に向かって追尾
      // 最も近い敵を探す
      let nearestEnemy = null;
      let nearestDist = Infinity;
      for (let j = 0; j < enemies.length; j++) {
        const e = enemies[j];
        const dist = b.position.distanceTo(e.position);
        // 前方（z方向）の敵のみを対象にする
        if (e.position.z < b.position.z && dist < nearestDist && dist < 100) {
          nearestDist = dist;
          nearestEnemy = e;
        }
      }
      
      if (nearestEnemy) {
        // 敵への方向を計算
        const toEnemy = new THREE.Vector3().subVectors(nearestEnemy.position, b.position);
        toEnemy.normalize();
        // 現在の進行方向（前方）と敵への方向を補間（追尾強度: 0.12 = 12%）
        const currentDir = new THREE.Vector3(0, 0, -1);
        currentDir.lerp(toEnemy, 0.12 * dt * 10);
        currentDir.normalize();
        // 前方への移動と追尾を組み合わせ
        b.position.add(currentDir.clone().multiplyScalar(80 * dt));
      } else {
        // 敵がいない場合は前方に移動
        b.position.z -= 80*dt;
      }
    }
    
    b.userData.life -= dt;
    if (b.userData.life <= 0 || b.position.z < -340 || b.position.z > 100 || 
        Math.abs(b.position.x) > 50 || Math.abs(b.position.y) > 35) {
      scene.remove(b); bullets.splice(i,1); continue;
    }
    
    // プレイヤーの弾が敵に当たる処理
    if (!b.userData.dir) {
      for (let j=enemies.length-1;j>=0;j--){
        const e = enemies[j];
        const dist = b.position.distanceTo(e.position);
        if (dist < (e.userData.r + 0.7)) {
          e.userData.hp -= e.userData.isBoss ? 1 : b.userData.dmg;
          spawnSpark(b.position);
          scene.remove(b); bullets.splice(i,1);
          if (e.userData.hp <= 0) destroyEnemy(e, true);
          break;
        }
      }
    } else {
      // 敵の弾がプレイヤーに当たる処理
      const dist = b.position.distanceTo(player.position);
      if (dist < 2.0) {
        damagePlayer(12);
        spawnSpark(b.position);
        scene.remove(b); bullets.splice(i,1);
      }
    }
  }
}

function updateEnemies(dt){
  const now = performance.now() / 1000;
  for (let i=enemies.length-1;i>=0;i--){
    const e = enemies[i];
    const type = e.userData.type || 'basic';
    
    if (e.userData.isBoss) {
      e.position.z += e.userData.speed * dt;
    } else {
      // タイプ別の動き
      switch(type) {
        case 'spear': // 高速突進型
          e.userData.chargePhase += dt * 3;
          if (e.userData.chargePhase < 1.5) {
            // 準備フェーズ：ゆっくり前進しながら回転
            e.position.z += e.userData.speed * 0.3 * dt;
            e.rotation.z += dt * 2;
            e.rotation.y += dt * 1.5;
            // 準備中は光る
            if (e.children[0] && e.children[0].material) {
              e.children[0].material.emissiveIntensity = 0.7 + Math.sin(now * 8) * 0.3;
            }
          } else {
            // 突進フェーズ：高速で直進
            e.position.z += e.userData.speed * 2.5 * dt;
            e.rotation.z += dt * 5;
            // 突進中に弾を発射
            if (now - e.userData.lastShot > 0.15) {
              e.userData.lastShot = now;
              spawnEnemyBullet(e.position, new THREE.Vector3(0, 0, 1), 0xff4444, 50);
            }
          }
          break;
          
        case 'orb': // 円形軌道型
          e.userData.angle += dt * 1.5;
          e.position.z += e.userData.speed * dt;
          e.position.x += Math.cos(e.userData.angle) * e.userData.radius * dt;
          e.position.y += Math.sin(e.userData.angle) * e.userData.radius * dt;
          e.rotation.z += dt * 2;
          // リングとコアを別々に回転
          if (e.children[0]) e.children[0].rotation.z += dt * 3;
          if (e.children[1]) e.children[1].rotation.y += dt * 2;
          // 円形に弾を発射
          if (now - e.userData.lastShot > 1.2) {
            e.userData.lastShot = now;
            for (let j = 0; j < 8; j++) {
              const angle = (j / 8) * Math.PI * 2;
              const dir = new THREE.Vector3(Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 1).normalize();
              spawnEnemyBullet(e.position, dir, 0x44ff44, 35);
            }
          }
          break;
          
        case 'diamond': // ジグザグ型
          e.userData.zigzagPhase += dt * 4;
          e.position.z += e.userData.speed * dt;
          e.position.x += Math.sin(e.userData.zigzagPhase) * 12 * dt;
          e.position.y += Math.cos(e.userData.zigzagPhase * 0.7) * 8 * dt;
          e.rotation.x += dt * 2;
          e.rotation.y += dt * 1.5;
          e.rotation.z += dt * 1;
          // 小さなダイヤを回転
          for (let j = 1; j < e.children.length; j++) {
            e.children[j].rotation.x += dt * 3;
            e.children[j].rotation.y += dt * 2;
          }
          // 連続で弾を発射
          if (now - e.userData.lastShot > 0.4) {
            e.userData.lastShot = now;
            const dir = new THREE.Vector3(
              Math.sin(e.userData.zigzagPhase) * 0.2,
              Math.cos(e.userData.zigzagPhase * 0.7) * 0.2,
              1
            ).normalize();
            spawnEnemyBullet(e.position, dir, 0x4444ff, 40);
          }
          break;
          
        case 'spike': // 追尾型
          e.position.z += e.userData.speed * dt;
          // プレイヤーに向かって移動
          const toPlayer = new THREE.Vector3().subVectors(player.position, e.position);
          toPlayer.normalize();
          e.position.x += toPlayer.x * 8 * dt;
          e.position.y += toPlayer.y * 8 * dt;
          e.rotation.z += dt * 3;
          // スパイクを動かす
          if (e.children.length > 1) {
            for (let j = 1; j < e.children.length; j++) {
              const spike = e.children[j];
              const baseAngle = ((j - 1) / 6) * Math.PI * 2;
              const pulse = Math.sin(now * 4 + baseAngle) * 0.3;
              spike.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
            }
          }
          // プレイヤーに向かって弾を発射
          if (now - e.userData.lastShot > 0.8) {
            e.userData.lastShot = now;
            const shootDir = new THREE.Vector3().subVectors(player.position, e.position).normalize();
            spawnEnemyBullet(e.position, shootDir, 0xff44ff, 45);
          }
          break;
          
        default: // 基本敵
          e.userData.sinX += dt*2;
          e.userData.sinY += dt*2.3;
          e.position.z += e.userData.speed * dt;
          e.position.x += Math.sin(e.userData.sinX)*8*dt;
          e.position.y += Math.sin(e.userData.sinY)*6*dt;
          e.rotation.x += dt*1.2;
          e.rotation.y += dt*0.8;
          break;
      }
    }

    const dToPlayer = e.position.distanceTo(player.position);
    if (dToPlayer < (e.userData.r + 1.8)) { damagePlayer(18); destroyEnemy(e, false); continue; }
    if (e.position.z > camera.position.z + 4) { destroyEnemy(e, false); }
  }
}

// 敵の弾を生成する関数
function spawnEnemyBullet(pos, dir, color, speed){
  const g = new THREE.SphereGeometry(0.4, 8, 8);
  const m = new THREE.MeshStandardMaterial({ 
    color: color, 
    emissive: color, 
    emissiveIntensity: 0.9,
    metalness: 0.3,
    roughness: 0.4
  });
  const b = new THREE.Mesh(g, m);
  b.position.copy(pos);
  b.userData = { 
    dmg: 1, 
    life: 5,
    dir: dir.clone(),
    speed: speed || 40
  };
  bullets.push(b);
  scene.add(b);
}

function destroyEnemy(e, byPlayer){
  if (byPlayer) { 
    // 敵タイプごとにスコアを変える
    const type = e.userData.type || 'basic';
    let points = 10;
    if (type === 'spear') points = 15;
    else if (type === 'orb') points = 20;
    else if (type === 'diamond') points = 18;
    else if (type === 'spike') points = 25;
    score += points; 
    scoreEl.textContent = score; 
  }
  spawnBoom(e.position);
  scene.remove(e);
  const idx = enemies.indexOf(e);
  if (idx>=0) enemies.splice(idx,1);
}

function spawnSpark(pos){
  const g = new THREE.SphereGeometry(0.5, 6, 6);
  const m = new THREE.MeshBasicMaterial({ color: 0x8fd3ff });
  const s = new THREE.Mesh(g, m);
  s.position.copy(pos);
  s.userData = { life: .15 };
  fx.push(s); scene.add(s);
}
function spawnBoom(pos){
  const g = new THREE.SphereGeometry(1.2, 10, 10);
  const m = new THREE.MeshBasicMaterial({ color: 0xffaa66 });
  const s = new THREE.Mesh(g, m);
  s.position.copy(pos);
  s.userData = { life: .5 };
  fx.push(s); scene.add(s);
}
function updateFX(dt){
  for (let i=fx.length-1;i>=0;i--){
    const s = fx[i];
    s.scale.addScalar(3*dt);
    s.userData.life -= dt;
    if (s.userData.life <= 0) { scene.remove(s); fx.splice(i,1); }
  }
}

function damagePlayer(v){
  playerStats.hp = Math.max(0, playerStats.hp - v);
  playerCore.material.emissiveIntensity = 1.1;
  setTimeout(()=>{ if(playerCore) playerCore.material.emissiveIntensity=.6; }, 120);
  if (playerStats.hp <= 0) gameOver();
}
function updateHUD(){
  hpBar.style.width = (playerStats.hp/playerStats.hpMax*100).toFixed(1)+'%';
  hpText.textContent = `${Math.ceil(playerStats.hp)}/${playerStats.hpMax}`;
  if (playerStats.hasEnergy) {
    const p = playerStats.energy/playerStats.energyMax*100;
    enBar.style.width = p.toFixed(1)+'%';
    enText.textContent = `${Math.ceil(playerStats.energy)}/${playerStats.energyMax}`;
  }
}
function gameOver(){
  running = false;
  overTitle.textContent = 'GAME OVER';
  finalScore.textContent = `SCORE：${score}`;
  overEl.style.display = 'grid';
}
