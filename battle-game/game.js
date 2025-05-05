// game.js 完全フルコード

const enemies = [
  { name: "スライム", hp: 8, exp: 3, image: "suraimu.png", dropRate: 1 / 20, drops: ["やくそう"] },
  { name: "ゴブリン", hp: 12, exp: 6, image: "goburin.png", dropRate: 1 / 20, drops: ["やくそう", "ちからのたね"] },
  { name: "おばけ", hp: 10, exp: 5, image: "ghost.png", dropRate: 1 / 20, drops: ["まほうのせいすい"] },
  { name: "ゾンビ", hp: 18, exp: 10, image: "zonbi.png", dropRate: 1 / 20, drops: ["どくけしそう"] },
  { name: "ナイト", hp: 15, exp: 8, image: "naito.png", dropRate: 1 / 20, drops: ["まもりのたね"] }
];

const summons = [
  { name: "フェニックス", image: "summon_1-removebg-preview.png", trust: 100 },
  { name: "ウルフ", image: "summon_2-removebg-preview.png", trust: 100 },
  { name: "マーメイド", image: "summon_3.png", trust: 100 },
  { name: "ゴーレム", image: "summon_4-removebg-preview.png", trust: 100 },
  { name: "ドラゴン", image: "summon_5-removebg-preview.png", trust: 100 }
];

let player = { hp: 20, maxHp: 20, mp: 5, maxMp: 5, level: 1, exp: 0, nextExp: 10, items: { "やくそう": 1 } };
let currentEnemy;
let isPlayerAlive = true;
let isItemMenuOpen = false;

const battleBGM = document.getElementById('battleBGM');
const attackSound = document.getElementById('attackSound');
const escapeSound = document.getElementById('escapeSound');
const levelUpSound = document.getElementById('levelUpSound');
const zombieVoice = document.getElementById('zombieVoice');
const slimeAttack = document.getElementById('slimeAttack');
const dropSound = new Audio('kasoru.mp3');

const commandMenu = document.getElementById('commandMenu');
const battleArea = document.getElementById('battleArea');
const itemMenuDiv = document.getElementById('itemMenu');
const summonMenuDiv = document.getElementById('summonMenu');
const reviveArea = document.getElementById('reviveArea');
const enemyImage = document.getElementById('enemyImage');

function playSound(audio) {
  audio.currentTime = 0;
  audio.play();
}

function getRandomEnemy() {
  const baseEnemy = enemies[Math.floor(Math.random() * enemies.length)];
  const enemy = { ...baseEnemy };
  const levelBonus = Math.floor(player.level / 4);
  enemy.hp += levelBonus * 3;
  enemy.exp += levelBonus * 2;
  return enemy;
}

function displayEnemy(enemy) {
  document.getElementById('enemyName').textContent = enemy.name;
  document.getElementById('enemyHP').textContent = `HP: ${enemy.hp}`;
  enemyImage.src = enemy.image;
}

function updatePlayerStatus() {
  document.getElementById('playerLevel').textContent = player.level;
  document.getElementById('playerHP').textContent = player.hp;
  document.getElementById('playerMaxHP').textContent = player.maxHp;
  document.getElementById('playerMP').textContent = player.mp;
  document.getElementById('playerMaxMP').textContent = player.maxMp;
  document.getElementById('playerEXP').textContent = player.exp;
  document.getElementById('playerNextEXP').textContent = player.nextExp;
}

function handleCommand(command) {
  if (!isPlayerAlive || isItemMenuOpen) return;
  if (battleBGM.paused) {
    battleBGM.volume = 0.3;
    battleBGM.play();
  }
  if (command === 'attack') attack();
  else if (command === 'magic') openSummonMenu();
  else if (command === 'item') openItemMenu();
  else if (command === 'escape') escapeBattle();
}

// 続きは次に書きます。
// game.js 完全フルコード 続き

function attack() {
  playSound(attackSound);
  const damage = Math.floor(Math.random() * 3) + 3;
  currentEnemy.hp -= damage;
  if (currentEnemy.hp < 0) currentEnemy.hp = 0;
  document.getElementById('enemyHP').textContent = `HP: ${currentEnemy.hp}`;
  document.getElementById('message').textContent = `タイタンの攻撃！${currentEnemy.name} に ${damage} ダメージ！`;

  if (currentEnemy.hp === 0) {
    handleEnemyDefeat();
  } else {
    setTimeout(enemyAttack, 1000);
  }
}

function handleEnemyDefeat() {
  document.getElementById('message').textContent = `タイタンは ${currentEnemy.name} を倒した！`;
  gainExp(currentEnemy.exp);
  const droppedItem = dropItem();
  setTimeout(() => {
    if (droppedItem) {
      document.getElementById('message').textContent = `タイタンは ${droppedItem} を手に入れた！`;
    } else {
      document.getElementById('message').textContent = `${currentEnemy.name} は何も落とさなかった…`;
    }
    setTimeout(() => nextEnemy(), 1500);
  }, 1500);
}

function nextEnemy() {
  currentEnemy = getRandomEnemy();
  displayEnemy(currentEnemy);
  document.getElementById('message').textContent = `${currentEnemy.name} があらわれた！`;
}

function enemyAttack() {
  if (!isPlayerAlive || isItemMenuOpen) return;
  if (currentEnemy.name === "ゾンビ") playSound(zombieVoice);
  else if (currentEnemy.name === "スライム") playSound(slimeAttack);
  else playSound(attackSound);

  let damage = Math.floor(Math.random() * 3) + 1;
  player.hp -= damage;
  if (player.hp < 0) player.hp = 0;
  updatePlayerStatus();
  document.getElementById('message').textContent = `${currentEnemy.name} のこうげき！タイタンに ${damage} ダメージ！`;

  if (player.hp === 0) {
    isPlayerAlive = false;
    document.getElementById('message').textContent = 'タイタンは死にました。';
    createReviveButton();
  }
}

function createReviveButton() {
  const reviveButton = document.createElement('button');
  reviveButton.textContent = '復活しますか？';
  reviveButton.addEventListener('click', revivePlayer);
  reviveArea.appendChild(reviveButton);
}

function revivePlayer() {
  player.hp = player.maxHp;
  player.mp = player.maxMp;
  isPlayerAlive = true;
  updatePlayerStatus();
  document.getElementById('message').textContent = 'タイタンは復活した！';
  reviveArea.innerHTML = '';
}

// 続き（経験値、召喚獣、どうぐ処理）は次に書きます。
// game.js 完全フルコード 続き

function gainExp(exp) {
  player.exp += exp;
  if (player.exp >= player.nextExp) {
    player.level++;
    player.exp -= player.nextExp;
    player.nextExp = Math.floor(player.nextExp * 1.3);
    player.maxHp += 3;
    player.maxMp += 1;
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    updatePlayerStatus();
    document.getElementById('message').textContent = `レベルアップ！ LV:${player.level}`;
    setTimeout(() => playSound(levelUpSound), 500);
  } else {
    updatePlayerStatus();
  }
}

function dropItem() {
  if (currentEnemy && currentEnemy.drops && Math.random() < currentEnemy.dropRate) {
    const droppedItem = currentEnemy.drops[Math.floor(Math.random() * currentEnemy.drops.length)];
    player.items[droppedItem] = (player.items[droppedItem] || 0) + 1;
    playSound(dropSound);
    return droppedItem;
  }
  return null;
}

function openSummonMenu() {
  summonMenuDiv.innerHTML = '<h2>召喚獣を選んでください</h2>';
  summons.forEach((s, index) => {
    const btn = document.createElement('button');
    btn.textContent = `${s.name} (信頼: ${s.trust})`;
    btn.addEventListener('click', () => summonBeast(index));
    summonMenuDiv.appendChild(btn);
  });
  const closeButton = document.createElement('button');
  closeButton.textContent = '閉じる';
  closeButton.addEventListener('click', () => {
    summonMenuDiv.style.display = 'none';
  });
  summonMenuDiv.appendChild(closeButton);
  summonMenuDiv.style.display = 'block';
}

function summonBeast(index) {
  const s = summons[index];
  s.trust -= 10;
  summonMenuDiv.style.display = 'none';
  document.getElementById('message').textContent = `${s.name} が出撃！`;

  // 敵の位置を取得して召喚獣の bottom を計算
  const enemyRect = enemyImage.getBoundingClientRect();
  const battleRect = battleArea.getBoundingClientRect();
  const enemyCenterY = enemyRect.top + enemyRect.height / 2;
  const battleBottomY = battleRect.bottom;
  const targetBottom = battleBottomY - enemyCenterY - 50; // 中央に-50px調整

  const summonSprite = document.createElement('img');
  summonSprite.src = s.image;
  summonSprite.className = 'summon-sprite';
  summonSprite.style.left = '-300px';
  summonSprite.style.bottom = `${targetBottom}px`;
  summonSprite.style.height = '280px';
  summonSprite.style.position = 'absolute';
  summonSprite.style.zIndex = 10;
  battleArea.appendChild(summonSprite);

  let pos = -300;
  const interval = setInterval(() => {
    pos += 20;
    summonSprite.style.left = pos + 'px';
    if (pos >= 250) {
      clearInterval(interval);
      let message = '';
      if (s.trust <= 30 && Math.random() < 0.5) {
        const damage = Math.floor(Math.random() * 5) + 5;
        player.hp = Math.max(0, player.hp - damage);
        updatePlayerStatus();
        message = `${s.name} は暴走し、タイタンに ${damage} ダメージ！`;
      } else {
        const damage = Math.floor(Math.random() * 10) + 10;
        currentEnemy.hp = Math.max(0, currentEnemy.hp - damage);
        document.getElementById('enemyHP').textContent = `HP: ${currentEnemy.hp}`;
        message = `${s.name} の体当たり！${currentEnemy.name} に ${damage} ダメージ！`;
      }
      document.getElementById('message').textContent = message;

      if (currentEnemy.hp === 0) {
        handleEnemyDefeat();
      } else {
        setTimeout(enemyAttack, 1000);
      }

      setTimeout(() => {
        if (battleArea.contains(summonSprite)) {
          battleArea.removeChild(summonSprite);
        }
      }, 800);
    }
  }, 30);
}
// 続き（どうぐ、逃走処理、初期化）は次に書きます。
// game.js 完全フルコード 続き（どうぐ、逃走、初期化）

function openItemMenu() {
  isItemMenuOpen = true;
  commandMenu.style.display = 'none';
  itemMenuDiv.innerHTML = '<h2>どうぐ</h2>';
  const itemKeys = Object.keys(player.items).filter(item => player.items[item] > 0);
  if (itemKeys.length === 0) {
    itemMenuDiv.innerHTML += '<p>タイタンはどうぐを持っていない。</p>';
  } else {
    itemKeys.forEach(itemName => {
      const itemButton = document.createElement('button');
      itemButton.classList.add('itemButton');
      itemButton.textContent = `${itemName} ×${player.items[itemName]}`;
      itemButton.dataset.item = itemName;
      itemButton.addEventListener('click', useItem);
      itemMenuDiv.appendChild(itemButton);
    });
  }
  const closeButton = document.createElement('button');
  closeButton.classList.add('closeButton');
  closeButton.textContent = '閉じる';
  closeButton.addEventListener('click', closeItemMenu);
  itemMenuDiv.appendChild(closeButton);
  itemMenuDiv.style.display = 'block';
}

function closeItemMenu() {
  isItemMenuOpen = false;
  commandMenu.style.display = 'grid';
  itemMenuDiv.style.display = 'none';
  itemMenuDiv.innerHTML = '';
}

function useItem(event) {
  const itemName = event.target.dataset.item;
  if (itemName === 'やくそう') {
    const healed = Math.min(20, player.maxHp - player.hp);
    if (healed > 0) {
      player.hp += healed;
      player.items[itemName]--;
      updatePlayerStatus();
      document.getElementById('message').textContent = `やくそうを使った！HPが${healed}回復した。`;
    } else {
      document.getElementById('message').textContent = 'HPはすでに満タンです。';
    }
    closeItemMenu();
  } else {
    document.getElementById('message').textContent = 'そのアイテムは使えないか、持っていません。';
    closeItemMenu();
  }
}

function escapeBattle() {
  playSound(escapeSound);
  document.getElementById('message').textContent = 'タイタンは逃げ出した！';
  setTimeout(() => {
    nextEnemy();
  }, 1000);
}

document.querySelectorAll('.command').forEach(btn => {
  btn.addEventListener('click', () => {
    handleCommand(btn.dataset.command);
  });
});

function startGame() {
  updatePlayerStatus();
  nextEnemy();
  isPlayerAlive = true;
}

startGame();
